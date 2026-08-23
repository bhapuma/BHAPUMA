/**
 * Wake Word and Speech Recognition Manager for BHAPUMA (भपुम)
 * Handles wake-word detection ("BHAPUMA", "भपुम", "Zoya") and voice streaming.
 */

type WakeWordCallback = (triggerWord: string) => void;
type SpeechTranscriptCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

class WakeWordDetector {
  private recognition: any = null;
  private isListening = false;
  private wakeWordCallbacks: WakeWordCallback[] = [];
  private transcriptCallbacks: SpeechTranscriptCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ne-NP'; // Primary Nepali, fallback handles phonetic matches

      this.recognition.onresult = (event: any) => {
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

        // Check for Wake words: भरत, भपुम, ह्याकर, कम्प्युटर
        const wakePhrases = [
          // 1. भरत (Bharat)
          'भरत',
          'भरत सुन',
          'हे भरत',
          'सुन भरत',
          'ओई भरत',
          'नमस्ते भरत',
          'bharat',
          'hey bharat',
          'bharat sun',
          'oi bharat',
          'bharat pun',
          'bharat pun magar',
          
          // 2. भपुम (BHAPUMA)
          'भपुम',
          'भपुमा',
          'हे भपुम',
          'भपुम सुन',
          'सुन भपुम',
          'ओई भपुम',
          'नमस्ते भपुम',
          'bhapuma',
          'bhapumaa',
          'bhapum',
          'bha puma',
          'hey bhapuma',
          'hey bhapum',

          // 3. ह्याकर (Hacker)
          'ह्याकर',
          'हे ह्याकर',
          'ह्याकर सुन',
          'सुन ह्याकर',
          'ओई ह्याकर',
          'नमस्ते ह्याकर',
          'hacker',
          'hey hacker',
          'hyakar',
          'hacker sun',

          // 4. कम्प्युटर (Computer)
          'कम्प्युटर',
          'हे कम्प्युटर',
          'कम्प्युटर सुन',
          'सुन कम्प्युटर',
          'ओई कम्प्युटर',
          'नमस्ते कम्प्युटर',
          'computer',
          'hey computer',
          'kampyutar',
          'computer sun',

          // Legacy / Extras
          'zoya',
          'जोया',
        ];

        const detected = wakePhrases.some((phrase) => currentText.includes(phrase));
        if (detected) {
          this.wakeWordCallbacks.forEach((cb) => cb(currentText));
        }

        if (finalTranscript) {
          this.transcriptCallbacks.forEach((cb) => cb(finalTranscript, true));
        } else if (interimTranscript) {
          this.transcriptCallbacks.forEach((cb) => cb(interimTranscript, false));
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
          this.errorCallbacks.forEach((cb) => cb(event.error));
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (err) {
            // Already started or restarting
          }
        }
      };
    }
  }

  public async startMicrophoneCapture(): Promise<AnalyserNode | null> {
    try {
      if (!this.micStream && navigator.mediaDevices?.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtxClass();
        const source = this.audioContext.createMediaStreamSource(this.micStream);
        this.micAnalyser = this.audioContext.createAnalyser();
        this.micAnalyser.fftSize = 128;
        source.connect(this.micAnalyser);
      }
      return this.micAnalyser;
    } catch (e) {
      console.warn('Microphone permission / access issue:', e);
      return null;
    }
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }

  public startListening() {
    this.isListening = true;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Recognition already active
      }
    }
    this.startMicrophoneCapture();
  }

  public stopListening() {
    this.isListening = false;
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
