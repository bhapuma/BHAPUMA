/**
 * Speech Synthesis & Audio Reaction Engine for BHAPUMA
 * Provides energetic teenage male Nepali voice and real-time audio analysis.
 */

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isSpeaking = false;
  private onSpeakingStateChange: ((speaking: boolean) => void) | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public initAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setSpeakingListener(cb: (speaking: boolean) => void) {
    this.onSpeakingStateChange = cb;
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(false);
    }
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.stopSpeaking();

      if (!this.synth) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Select teenage male voice (Nepali or Hindi fallback with youth modulation)
      const voices = this.synth.getVoices();
      const nepaliVoice = voices.find((v) => v.lang.startsWith('ne') || v.name.toLowerCase().includes('nepali'));
      const hindiMaleVoice = voices.find(
        (v) => (v.lang.startsWith('hi') || v.lang.startsWith('mr')) && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google'))
      );
      const generalMale = voices.find(
        (v) => (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('natural')) && !v.name.toLowerCase().includes('female')
      );

      if (nepaliVoice) {
        utterance.voice = nepaliVoice;
        utterance.lang = 'ne-NP';
      } else if (hindiMaleVoice) {
        utterance.voice = hindiMaleVoice;
        utterance.lang = 'hi-IN';
      } else if (generalMale) {
        utterance.voice = generalMale;
      }

      // Teenage energetic male acoustic parameters
      utterance.pitch = 1.15; // slightly higher teenager youthful tone
      utterance.rate = 1.05; // brisk, energetic tempo
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(true);
        }
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false);
        }
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false);
        }
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechEngine = new SpeechEngine();
