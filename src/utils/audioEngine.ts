/**
 * Audio Engine for "أقرأها صح"
 * Supports high-fidelity Gemini 3.8 Flash TTS via backend endpoint
 * with seamless offline fallback to browser Web Speech API (SpeechSynthesis)
 * and procedural sound effects (chimes, clicks, celebratory fanfare).
 */

class AudioEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private geminiTTSFallbackMode: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Stop any ongoing speech or audio playback
   */
  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Speaks Arabic text using Gemini 3.8 Flash TTS, falling back to browser SpeechSynthesis.
   */
  public async speak(
    text: string,
    options: {
      voice?: string;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): Promise<void> {
    this.stop();
    options.onStart?.();

    const cleanText = text.trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    // If fallback mode was previously triggered (e.g. quota limit reached), use Web Speech directly
    if (this.geminiTTSFallbackMode) {
      this.speakWithWebSpeech(cleanText, options);
      return;
    }

    // Try Gemini 3.8 Flash TTS via server endpoint
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: options.voice || 'Kore',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fallback) {
          this.geminiTTSFallbackMode = true;
          this.speakWithWebSpeech(cleanText, options);
          return;
        }

        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          this.currentAudio = audio;
          audio.playbackRate = options.rate || 1.0;

          audio.onended = () => {
            this.currentAudio = null;
            options.onEnd?.();
          };
          audio.onerror = () => {
            this.speakWithWebSpeech(cleanText, options);
          };

          await audio.play();
          return;
        }
      } else {
        this.geminiTTSFallbackMode = true;
      }
    } catch {
      this.geminiTTSFallbackMode = true;
    }

    // Fallback: Web Speech API (100% offline support)
    this.speakWithWebSpeech(cleanText, options);
  }

  /**
   * Offline Web Speech Synthesis fallback
   */
  public speakWithWebSpeech(
    text: string,
    options: {
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = options.rate || 0.85; // Slightly slower for primary kids
    utterance.pitch = 1.05;

    // Pick an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) => v.lang.startsWith('ar') || v.name.includes('Arabic') || v.name.includes('Maged') || v.name.includes('Laila')
    );
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = (err) => {
      console.error('Web Speech error:', err);
      options.onError?.(err);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Sound effect: Success chime
   */
  public playSuccessSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      // AudioContext could be blocked until user gesture
    }
  }

  /**
   * Sound effect: Celebration Fanfare (100% score)
   */
  public playFanfare() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.15 },
        { f: 523.25, d: 0.15 },
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.4 },
        { f: 783.99, d: 0.25 },
        { f: 1046.5, d: 0.7 },
      ];

      let t = now;
      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + n.d + 0.05);

        t += n.d * 0.85;
      });
    } catch (e) {
      // AudioContext could be blocked
    }
  }

  /**
   * Sound effect: Subtle tap/click
   */
  public playClickSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Sound effect: Soft error buzz
   */
  public playErrorSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Play cheerful encouraging voice praise for children upon completing a lesson, quiz, or game.
   */
  public playEncouragement(
    context: 'lesson' | 'game' | 'quiz' | 'activity' = 'lesson',
    customText?: string
  ) {
    if (customText) {
      setTimeout(() => {
        this.speak(customText);
      }, 350);
      return;
    }

    const phrasesByContext = {
      lesson: [
        'أَحْسَنْتَ يَا بَطَلَ الْقِرَاءَةِ! لَقَدْ أَتْمَمْتَ الدَّرْسَ بِنَجَاحٍ بَاهِرٍ وَاسْتَحْقَقْتَ الثَّنَاءَ!',
        'مَا شَاءَ اللهُ عَلَيْكَ! إِتْقَانٌ مُتَمَيِّزٌ لِلدَّرْسِ وَفَصَاحَةٌ تَسْتَحِقُّ أَعْلَى الْأَوْسِمَةِ!',
        'عَبْقَرِيٌّ وَمُثَابِرٌ! أَكْمَلْتَ وَحْدَتَكَ التَّعْلِيمِيَّةَ بِكُلِّ تَفَوُّقٍ وَإِبْدَاعٍ!',
        'بَارَكَ اللهُ فِي عِلْمِكَ يَا قَارِئَ الْغَدِ النَّابِغَ! دَرْسٌ مُكْتَمَلٌ وَإِنْجَازٌ يَسُرُّ الْقُلُوبَ!',
      ],
      game: [
        'فَوْزٌ رَائِعٌ وَمُسْتَحَقٌّ! لَقَدْ حَلَلْتَ اللُّعْبَةَ بِذَكَاءٍ وَسُرْعَةٍ فَائِقَةٍ!',
        'أَحْسَنْتَ صُنْعاً يَا نَجْمَ التَّحَدِّي! نَتِيجَةٌ مُمْتَازَةٌ وَذَكَاءٌ لُغَوِيٌّ بَاهِرٌ!',
        'مُبَارَكٌ لَكَ الْفَوْزُ بِاللُّعْبَةِ! أَنْتَ بَطَلٌ حَقِيقِيٌّ فِي عَالَمِ الْحُرُوفِ وَالْكَلِمَاتِ!',
        'مَا شَاءَ اللهُ! تَفَوُّقٌ وَسُرْعَةُ بَدِيهَةٍ أَدَّتَا إِلَى هَذَا الْفَوْزِ الْجَمِيلِ!',
      ],
      quiz: [
        'إِنْجَازٌ مُمْتَازٌ! لَقَدْ حَصَلْتَ عَلَى الدَّرَجَةِ الْكَامِلَةِ فِي الِاخْتِبَارِ بِجَدَارَةٍ!',
        'أَلْفُ مَبْرُوكٍ! إِجَابَاتٌ صَحِيحَةٌ مِئَةً بِالْمِئَةِ وَفَهْمٌ اسْتِيعَابِيٌّ فَائِقٌ!',
        'رَائِعٌ جِدّاً! حَقَّقْتَ الْعَلَامَةَ الْكَامِلَةَ وَاسْتَحْقَقْتَ الْوِسَامَ الذَّهَبِيَّ!',
      ],
      activity: [
        'أَحْسَنْتَ! خَطْوَةٌ رَائِعَةٌ نَحْوَ الْإِتْقَانِ وَالْفَصَاحَةِ!',
        'مُمْتَازٌ! وَاصِلِ التَّأَلُّقَ فِي هَذَا النَّشَاطِ التَّفَاعُلِيِّ!',
        'بَارَكَ اللهُ فِيكَ! نُطْقٌ صَحِيحٌ وَقِرَاءَةٌ جَمِيلَةٌ!',
      ],
    };

    const list = phrasesByContext[context] || phrasesByContext.lesson;
    const randomPhrase = list[Math.floor(Math.random() * list.length)];

    setTimeout(() => {
      this.speak(randomPhrase);
    }, 350);
  }
}

export const audioEngine = new AudioEngine();
