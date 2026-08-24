/**
 * Speech Synthesis & Audio Reaction Engine for BHAPUMA
 * Strictly calibrated for an energetic, crisp, 17-year-old teenage boy (केटाको आवाज)
 * Prioritizes natural male voices, filters out female voices, and sets authentic youth pitch.
 */

export interface VoiceSettings {
  pitch: number; // 0.8 - 1.4 (Default 0.96 for natural energetic teenage boy)
  rate: number;  // 0.8 - 1.4 (Default 1.05 for natural teenage cadence)
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
    pitch: 0.96, // Realistic natural 17yo male teenager tone (crisp, not robotic or high-pitched girl)
    rate: 1.05,  // Natural young boy speed
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

      // Filter specifically for MALE / TEENAGER voices and filter OUT female voice keywords
      const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'kavya', 'priya', 'kalpana', 'sangeeta', 'veena', 'ananya', 'lekhika', 'siri female', 'heera'];
      const isFemale = (v: SpeechSynthesisVoice) => {
        const lowerName = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
        return femaleKeywords.some(kw => lowerName.includes(kw));
      };

      const maleKeywords = ['male', 'man', 'boy', 'guy', 'david', 'george', 'ravi', 'madhav', 'neil', 'ajay', 'rahul', 'amit', 'google हिन्दी', 'google nepali', 'natural'];
      const isMale = (v: SpeechSynthesisVoice) => {
        const lowerName = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
        return maleKeywords.some(kw => lowerName.includes(kw)) && !isFemale(v);
      };

      // 1. Explicit Nepali Male voices if present
      const nepaliMaleVoices = this.voices.filter(v => (v.lang.startsWith('ne') || v.name.toLowerCase().includes('nepali')) && !isFemale(v));
      
      // 2. Hindi/Regional Male voices (very natural in Nepali accent on Android/Chrome)
      const hindiMaleVoices = this.voices.filter(v => (v.lang.startsWith('hi') || v.lang.startsWith('mr') || v.lang.startsWith('bn')) && isMale(v));
      const hindiAnyNonFemale = this.voices.filter(v => (v.lang.startsWith('hi') || v.lang.startsWith('mr')) && !isFemale(v));

      // 3. System-wide Young Male voices
      const generalMaleVoices = this.voices.filter(v => isMale(v));

      let chosenVoice: SpeechSynthesisVoice | null = null;

      if (nepaliMaleVoices.length > 0) {
        chosenVoice = nepaliMaleVoices[0];
        utterance.lang = 'ne-NP';
      } else if (hindiMaleVoices.length > 0) {
        chosenVoice = hindiMaleVoices[0];
        utterance.lang = 'hi-IN';
      } else if (hindiAnyNonFemale.length > 0) {
        chosenVoice = hindiAnyNonFemale[0];
        utterance.lang = 'hi-IN';
      } else if (generalMaleVoices.length > 0) {
        chosenVoice = generalMaleVoices[0];
        utterance.lang = chosenVoice.lang || 'ne-NP';
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Exact acoustic profile for a lively, authentic 17-year-old teenage boy
      utterance.pitch = this.settings.pitch; // 0.96 for natural crisp boy timbre (not squeaky/female)
      utterance.rate = this.settings.rate;   // 1.05 for energetic youthful pace
      utterance.volume = this.settings.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.playTone(480, 0.04); // Youthful crisp wake chime
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
        console.warn('Speech synthesis notice:', e);
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false);
        }
        resolve();
      };

      if (this.synth) {
        this.synth.speak(utterance);
      }
    });
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechEngine = new SpeechEngine();
