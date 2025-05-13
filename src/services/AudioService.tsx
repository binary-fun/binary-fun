/**
 * 音声サービスのインターフェース
 * インターフェース分離の原則：クライアントが必要としないメソッドへの依存を強制しない
 */
export interface IAudioService {
  playBackgroundMusic(): void;
  stopBackgroundMusic(): void;
  playWinSound(): void;
  playLoseSound(): void;
  playCountdownSound(): void;
  playClickSound(): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
}

/**
 * 音声の種類を表す型
 */
export type AudioType = 'bgm' | 'win' | 'lose' | 'countdown' | 'click';

/**
 * 音声ファイルの情報を表すインターフェース
 */
interface AudioInfo {
  url: string;
  volume: number;
  loop: boolean;
}

/**
 * 音声を管理するサービス
 * 単一責任の原則：音声の管理のみを担当
 */
export class AudioService implements IAudioService {
  private _audioElements: Map<AudioType, HTMLAudioElement>;
  private _audioInfo: Map<AudioType, AudioInfo>;
  private _isMuted: boolean;
  private _volume: number;

  constructor() {
    this._audioElements = new Map();
    this._audioInfo = new Map();
    this._isMuted = false;
    this._volume = 1.0;

    // 音声ファイルの情報を設定
    this._audioInfo.set('bgm', {
      url: '/audio/background.mp3',
      volume: 0.5,
      loop: true,
    });
    this._audioInfo.set('win', {
      url: '/audio/win.mp3',
      volume: 0.7,
      loop: false,
    });
    this._audioInfo.set('lose', {
      url: '/audio/lose.mp3',
      volume: 0.7,
      loop: false,
    });
    this._audioInfo.set('countdown', {
      url: '/audio/countdown.mp3',
      volume: 0.6,
      loop: false,
    });
    this._audioInfo.set('click', {
      url: '/audio/click.mp3',
      volume: 0.5,
      loop: false,
    });

    // 音声ファイルを事前に読み込む
    this.preloadAudio();
  }

  /**
   * 音声ファイルを事前に読み込む
   */
  private preloadAudio(): void {
    this._audioInfo.forEach((info, type) => {
      const audio = new Audio(info.url);
      audio.volume = info.volume * this._volume;
      audio.loop = info.loop;
      this._audioElements.set(type, audio);
    });
  }

  /**
   * 指定された種類の音声を再生
   */
  private playAudio(type: AudioType): void {
    if (this._isMuted) return;

    const audio = this._audioElements.get(type);
    if (!audio) return;

    // 再生中の場合は一度停止してから再生
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(error => {
      console.error(`音声の再生に失敗しました: ${error}`);
    });
  }

  /**
   * 指定された種類の音声を停止
   */
  private stopAudio(type: AudioType): void {
    const audio = this._audioElements.get(type);
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }

  /**
   * BGMを再生
   */
  playBackgroundMusic(): void {
    this.playAudio('bgm');
  }

  /**
   * BGMを停止
   */
  stopBackgroundMusic(): void {
    this.stopAudio('bgm');
  }

  /**
   * 勝利音を再生
   */
  playWinSound(): void {
    this.playAudio('win');
  }

  /**
   * 敗北音を再生
   */
  playLoseSound(): void {
    this.playAudio('lose');
  }

  /**
   * カウントダウン音を再生
   */
  playCountdownSound(): void {
    this.playAudio('countdown');
  }

  /**
   * クリック音を再生
   */
  playClickSound(): void {
    this.playAudio('click');
  }

  /**
   * 音量を設定
   */
  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));

    // 各音声の音量を更新
    this._audioElements.forEach((audio, type) => {
      const info = this._audioInfo.get(type);
      if (info) {
        audio.volume = info.volume * this._volume;
      }
    });
  }

  /**
   * ミュート
   */
  mute(): void {
    this._isMuted = true;
    this._audioElements.forEach(audio => {
      audio.volume = 0;
    });
  }

  /**
   * ミュート解除
   */
  unmute(): void {
    this._isMuted = false;
    this._audioElements.forEach((audio, type) => {
      const info = this._audioInfo.get(type);
      if (info) {
        audio.volume = info.volume * this._volume;
      }
    });
  }

  /**
   * ミュート状態を取得
   */
  isMuted(): boolean {
    return this._isMuted;
  }

  /**
   * 音量を取得
   */
  getVolume(): number {
    return this._volume;
  }
}
