/**
 * Wake Word and Speech Recognition Manager for BHAPUMA (भपुम)
 * Crash-resistant audio & speech capture optimized for Android WebView and Browsers.
 */

type WakeWordCallback = (triggerWord: string) => void;
type SpeechTranscriptCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

class WakeWordDetector {
  private recognition: any = null;
  private isListening = false;
  private restartTimeout: any = null;
  private wakeWordCallbacks: WakeWordCallback[] = [];
  private transcriptCallbacks: SpeechTranscriptCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private hasPermissionError = false;
  private interimTimer: any = null;
  private currentInterim = '';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ne-NP'; // Primary Nepali

        this.recognition.onresult = (event: any) => {
          try {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            const currentText = (finalTranscript || interimTranscript).trim().toLowerCase();

            // Check for Wake words: भरत, भपुम, ह्याकर, कम्प्युटर, गुरु, सर, शिक्षक
            const wakePhrases = [
              'भरत', 'हे भरत', 'भरत सुन', 'सुन भरत', 'ओई भरत', 'नमस्ते भरत', 'भरत भाइ', 'भरत भाई',
              'bharat', 'hey bharat', 'bharat sun', 'oi bharat', 'bharat pun', 'bharat pun magar',
              'भपुम', 'भपुमा', 'हे भपुम', 'भपुम सुन', 'सुन भपुम', 'ओई भपुम', 'नमस्ते भपुम',
              'bhapuma', 'bhapumaa', 'bhapum', 'bha puma', 'hey bhapuma', 'hey bhapum',
              'ह्याकर', 'हे ह्याकर', 'ह्याकर सुन', 'सुन ह्याकर', 'ओई ह्याकर', 'नमस्ते ह्याकर',
              'hacker', 'hey hacker', 'hyakar', 'hacker sun',
              'कम्प्युटर', 'हे कम्प्युटर', 'कम्प्युटर सुन', 'सुन कम्प्युटर', 'ओई कम्प्युटर', 'नमस्ते कम्प्युटर',
              'computer', 'hey computer', 'kampyutar', 'computer sun',
              'गुरु', 'हे गुरु', 'गुरुजी', 'सर', 'हे सर', 'शिक्षक', 'मास्टर', 'teacher', 'hey teacher', 'master',
              'साथी', 'हे साथी', 'एआई', 'ai', 'hey ai',
              'zoya', 'जोया',
            ];

            const detected = wakePhrases.some((phrase) => currentText.includes(phrase));
            if (detected) {
              this.wakeWordCallbacks.forEach((cb) => {
                try { cb(currentText); } catch (e) { console.warn(e); }
              });
            }

            if (finalTranscript) {
              if (this.interimTimer) clearTimeout(this.interimTimer);
              this.currentInterim = '';
              this.transcriptCallbacks.forEach((cb) => {
                try { cb(finalTranscript, true); } catch (e) { console.warn(e); }
              });
            } else if (interimTranscript) {
              this.currentInterim = interimTranscript;
              this.transcriptCallbacks.forEach((cb) => {
                try { cb(interimTranscript, false); } catch (e) { console.warn(e); }
              });

              // Fast Real-Time Human-Like Turn Taking (600ms natural pause detection)
              if (this.interimTimer) clearTimeout(this.interimTimer);
              this.interimTimer = setTimeout(() => {
                if (this.currentInterim && this.currentInterim.trim().length > 1) {
                  const speechSnapshot = this.currentInterim.trim();
                  this.currentInterim = '';
                  this.transcriptCallbacks.forEach((cb) => {
                    try { cb(speechSnapshot, true); } catch (e) { console.warn(e); }
                  });
                }
              }, 600);
            }
          } catch (err) {
            console.warn('onresult parsing error:', err);
          }
        };

        this.recognition.onerror = (event: any) => {
          const err = event.error || 'unknown_speech_error';
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            this.hasPermissionError = true;
          }
          if (err !== 'no-speech') {
            console.warn('Speech recognition warning:', err);
            this.errorCallbacks.forEach((cb) => {
              try { cb(err); } catch (e) {}
            });
          }
        };

        this.recognition.onend = () => {
          // Prevent infinite rapid restart crash loop with a safe 800ms debounce
          if (this.isListening && !this.hasPermissionError) {
            if (this.restartTimeout) clearTimeout(this.restartTimeout);
            this.restartTimeout = setTimeout(() => {
              if (this.isListening && this.recognition) {
                try {
                  this.recognition.start();
                } catch (e) {
                  // Ignore already started error
                }
              }
            }, 800);
          }
        };
      }
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
    }
  }

  public async startMicrophoneCapture(): Promise<AnalyserNode | null> {
    try {
      if (this.micAnalyser && this.micStream) {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        return this.micAnalyser;
      }

      if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass && !this.audioContext) {
          this.audioContext = new AudioCtxClass();
        }
        
        if (this.audioContext) {
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          const source = this.audioContext.createMediaStreamSource(this.micStream);
          this.micAnalyser = this.audioContext.createAnalyser();
          this.micAnalyser.fftSize = 128;
          source.connect(this.micAnalyser);
        }
      }
      return this.micAnalyser;
    } catch (e) {
      console.warn('Microphone permission / capture error (safe fallback applied):', e);
      return null;
    }
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }

  public startListening() {
    this.isListening = true;
    this.hasPermissionError = false;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Recognition might already be running
      }
    }
    this.startMicrophoneCapture().catch((e) => {
      console.warn('startMicrophoneCapture catch:', e);
    });
  }

  public stopListening() {
    this.isListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  public onWakeWord(cb: WakeWordCallback) {
    this.wakeWordCallbacks.push(cb);
  }

  public onTranscript(cb: SpeechTranscriptCallback) {
    this.transcriptCallbacks.push(cb);
  }

  public onError(cb: ErrorCallback) {
    this.errorCallbacks.push(cb);
  }
}

export const wakeWordDetector = new WakeWordDetector();
