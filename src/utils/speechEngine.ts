/**
 * Speech Synthesis & Audio Reaction Engine for BHAPUMA
 * Strictly calibrated for a 17-year-old teenage boy (केटाको प्राकृतिक र स्पष्ट आवाज)
 * Strictly prioritizes natural male voices, filters out female voices completely,
 * and sets an authentic young male acoustic profile.
 */

export interface VoiceSettings {
  pitch: number; // 0.7 - 1.2 (Default 0.90 for authentic natural teenage male timbre)
  rate: number;  // 0.8 - 1.3 (Default 1.02 for clear, lively boy cadence)
  volume: number; // 0.0 - 1.0
  voiceStyle: 'teen_boy' | 'energetic_male' | 'deep_male';
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
    pitch: 0.90, // Calibrated strictly for an authentic, resonant, youthful male voice (केटाको आवाज)
    rate: 1.02,  // Natural lively cadence
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
      // Non-blocking catch for autoplay restrictions
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

      // 1. Comprehensive Female Voice Blacklist (Must NEVER pick a female voice)
      const femaleKeywords = [
        'female', 'woman', 'girl', 'zira', 'kavya', 'priya', 'kalpana', 'sangeeta', 'veena',
        'ananya', 'lekhika', 'siri female', 'heera', 'swara', 'neha', 'pooja', 'aditi',
        'kavitha', 'shreya', 'vani', 'samantha', 'victoria', 'karen', 'moira', 'tessa',
        'fiona', 'monica', 'paulina', 'luciana', 'carmit', 'yuna', 'kyoko', 'sin-ji',
        'ting-ting', 'mei-jia', 'ya-ling', 'damayanti', 'alva', 'ellen', 'sara', 'amelie',
        'audrey', 'aurelie', 'celine', 'marie', 'clara', 'eva', 'petra', 'federica',
        'alice', 'milena', 'anna', 'marta', 'helena', 'ioana', 'laura', 'alisa', 'olga',
        'yolanda', 'marina', 'kanya', 'yelda', 'hi-in-x-hic-local', 'hi-in-x-hid-local'
      ];

      const isFemale = (v: SpeechSynthesisVoice) => {
        const lower = `${v.name} ${v.voiceURI || ''}`.toLowerCase();
        return femaleKeywords.some((kw) => lower.includes(kw));
      };

      // 2. Comprehensive Male Voice Identifiers (Strictly prioritize boy/male voice)
      const maleKeywords = [
        'male', 'man', 'boy', 'guy', 'david', 'george', 'ravi', 'madhav', 'neil', 'ajay',
        'rahul', 'amit', 'tarun', 'pradeep', 'suresh', 'rohit', 'vikram', 'kishore',
        'manoj', 'deepak', 'anand', 'arjun', 'rajesh', 'prakash', 'ramesh', 'sunil',
        'anil', 'hemant', 'ashok', 'vijay', 'sanjay', 'satish', 'vinod', 'mahesh',
        'naresh', 'dinesh', 'kamal', 'santosh', 'harish', 'gopal', 'brijesh', 'mohan',
        'krishna', 'govind', 'shyam', 'shankar', 'vishnu', 'brahma', 'ganesh', 'narayan',
        'bhupendra', 'bharat', 'hi-in-x-hia', 'hi-in-x-hie', 'en-in-x-end', 'en-in-x-ene',
        'ne-np-x-nem', 'standard-b', 'wavenet-b', 'neural2-b', 'standard-d', 'wavenet-d', 'neural2-d'
      ];

      const isMale = (v: SpeechSynthesisVoice) => {
        const lower = `${v.name} ${v.voiceURI || ''}`.toLowerCase();
        return maleKeywords.some((kw) => lower.includes(kw)) && !isFemale(v);
      };

      // Filter non-female voices
      const allNonFemaleVoices = this.voices.filter((v) => !isFemale(v));

      // Prioritized Selection for Male / Boy Voice:
      // Priority 1: Nepali Male Voice
      const nepaliMale = allNonFemaleVoices.filter(
        (v) => (v.lang.startsWith('ne') || v.name.toLowerCase().includes('nepali')) && isMale(v)
      );
      const nepaliAnyNonFemale = allNonFemaleVoices.filter(
        (v) => v.lang.startsWith('ne') || v.name.toLowerCase().includes('nepali')
      );

      // Priority 2: Hindi/Regional Male Voice (Super natural for Nepali pronunciation on Android)
      const hindiMale = allNonFemaleVoices.filter(
        (v) => (v.lang.startsWith('hi') || v.lang.startsWith('mr') || v.lang.startsWith('bn')) && isMale(v)
      );
      const hindiAnyNonFemale = allNonFemaleVoices.filter(
        (v) => v.lang.startsWith('hi') || v.lang.startsWith('mr')
      );

      // Priority 3: Indian English Male Voice
      const indianEnglishMale = allNonFemaleVoices.filter(
        (v) => v.lang.includes('IN') && isMale(v)
      );

      // Priority 4: Any system Male voice
      const generalMale = allNonFemaleVoices.filter((v) => isMale(v));

      let chosenVoice: SpeechSynthesisVoice | null = null;

      if (nepaliMale.length > 0) {
        chosenVoice = nepaliMale[0];
        utterance.lang = 'ne-NP';
      } else if (hindiMale.length > 0) {
        chosenVoice = hindiMale[0];
        utterance.lang = 'hi-IN';
      } else if (nepaliAnyNonFemale.length > 0) {
        chosenVoice = nepaliAnyNonFemale[0];
        utterance.lang = 'ne-NP';
      } else if (hindiAnyNonFemale.length > 0) {
        chosenVoice = hindiAnyNonFemale[0];
        utterance.lang = 'hi-IN';
      } else if (indianEnglishMale.length > 0) {
        chosenVoice = indianEnglishMale[0];
        utterance.lang = chosenVoice.lang;
      } else if (generalMale.length > 0) {
        chosenVoice = generalMale[0];
        utterance.lang = chosenVoice.lang || 'ne-NP';
      } else if (allNonFemaleVoices.length > 0) {
        chosenVoice = allNonFemaleVoices[0];
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Exact acoustic calibration for a natural 17yo male teenager (केटाको स्पष्ट आवाज)
      // Pitch: 0.88 - 0.92 gives authentic male resonance and avoids squeakiness or female pitch
      const activePitch = Math.min(1.05, Math.max(0.75, this.settings.pitch));
      utterance.pitch = activePitch;
      utterance.rate = this.settings.rate;
      utterance.volume = this.settings.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.playTone(460, 0.04);
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
