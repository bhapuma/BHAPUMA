/**
 * Speech Synthesis & Audio Reaction Engine for BHAPUMA
 * Fully calibrated for a 17-year-old energetic, crisp teenage boy's voice
 * with dynamic pitch/tone controls and realistic vocal pitch curves.
 */

export interface VoiceSettings {
  pitch: number; // 0.5 - 2.0 (1.28 for vibrant teenage boy)
  rate: number;  // 0.5 - 2.0 (1.06 for lively teenager cadence)
  volume: number; // 0.0 - 1.0
  voiceStyle: 'teen_boy' | 'young_energetic' | 'deep_teen';
}

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isSpeaking = false;
  private onSpeakingStateChange: ((speaking: boolean) => void) | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  private settings: VoiceSettings = {
    pitch: 1.28, // 17yo lively teenage boy pitch
    rate: 1.08,  // Energetic modern youth rate
    volume: 1.0,
    voiceStyle: 'teen_boy',
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
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

  public updateVoiceSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getVoiceSettings(): VoiceSettings {
    return this.settings;
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

  public playTone(freq: number, duration: number) {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Non-blocking catch for autoplay audio restrictions
    }
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.stopSpeaking();

      if (!this.synth) {
        resolve();
        return;
      }

      const cleanText = text.replace(/[*#_`]/g, '').trim();
      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      if (this.voices.length === 0) {
        this.loadVoices();
      }

      // Voice selection prioritized for a young male / Nepali/Hindi energetic vocal
      const nepaliVoices = this.voices.filter((v) => v.lang.startsWith('ne') || v.name.toLowerCase().includes('nepali'));
      const hindiMaleVoices = this.voices.filter(
        (v) => (v.lang.startsWith('hi') || v.lang.startsWith('mr')) &&
               (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('david') || !v.name.toLowerCase().includes('female'))
      );
      const youthMaleVoices = this.voices.filter(
        (v) => (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('boy') || v.name.toLowerCase().includes('natural')) &&
               !v.name.toLowerCase().includes('female')
      );

      if (nepaliVoices.length > 0) {
        utterance.voice = nepaliVoices[0];
        utterance.lang = 'ne-NP';
      } else if (hindiMaleVoices.length > 0) {
        utterance.voice = hindiMaleVoices[0];
        utterance.lang = 'hi-IN';
      } else if (youthMaleVoices.length > 0) {
        utterance.voice = youthMaleVoices[0];
      }

      // Explicit acoustic profile for a lively, energetic 17-year-old boy
      utterance.pitch = this.settings.pitch; // 1.28 for vibrant youthful male timbre
      utterance.rate = this.settings.rate;   // 1.08 for dynamic teenage rhythm
      utterance.volume = this.settings.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.playTone(520, 0.04); // Youthful crisp wake chime
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
