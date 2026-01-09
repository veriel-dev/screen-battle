import Phaser from 'phaser';
import type { TipoElemental, EstadoAlterado } from '@game-types/index';

// Claves para window.localStorage
const STORAGE_KEY_MUSIC_VOL = 'kodamon_music_volume';
const STORAGE_KEY_SFX_VOL = 'kodamon_sfx_volume';
const STORAGE_KEY_MUTED = 'kodamon_muted';

/**
 * Tipos de sonidos de UI disponibles
 */
export type UISoundType = 'hover' | 'click' | 'select';

/**
 * Tipos de sonidos de impacto
 */
export type ImpactSoundType = 'hit' | 'critical' | 'super-effective' | 'not-effective';

/**
 * Configuración de audio
 */
export interface AudioConfig {
  musicVolume?: number;
  sfxVolume?: number;
  muted?: boolean;
}

/**
 * Sistema de audio centralizado para Kodamon
 * Maneja música de fondo, efectos de sonido y controles de volumen
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private musicVolume: number;
  private sfxVolume: number;
  private isMuted: boolean;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentMusicKey: string = '';

  // Lista de todos los tipos elementales para validación
  private static readonly TIPOS: TipoElemental[] = [
    'fuego',
    'agua',
    'planta',
    'electrico',
    'tierra',
    'hielo',
    'volador',
    'roca',
    'normal',
    'fantasma',
  ];

  // Mapeo de estados alterados a sus claves de audio
  private static readonly ESTADO_AUDIO_MAP: Record<Exclude<EstadoAlterado, null>, string> = {
    quemado: 'quemadura',
    paralizado: 'paralisis',
    envenenado: 'veneno',
    dormido: 'dormido',
    congelado: 'congelado',
  };

  constructor(scene: Phaser.Scene, config?: AudioConfig) {
    this.scene = scene;

    // Cargar configuración desde window.localStorage o usar defaults
    this.musicVolume = this.loadFromStorage(STORAGE_KEY_MUSIC_VOL, config?.musicVolume ?? 0.5);
    this.sfxVolume = this.loadFromStorage(STORAGE_KEY_SFX_VOL, config?.sfxVolume ?? 0.7);
    this.isMuted = this.loadFromStorage(STORAGE_KEY_MUTED, config?.muted ?? false);
  }

  /**
   * Carga un valor desde window.localStorage
   */
  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Si hay error, usar valor por defecto
    }
    return defaultValue;
  }

  /**
   * Guarda un valor en window.localStorage
   */
  private saveToStorage<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignorar errores de window.localStorage
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE REPRODUCCIÓN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Reproduce un sonido de UI (hover, click, select)
   */
  playUI(type: UISoundType): void {
    if (this.isMuted) return;

    const key = `sfx-ui-${type}`;
    this.playSfx(key);
  }

  /**
   * Reproduce un sonido de ataque según el tipo elemental
   */
  playAttack(tipo: TipoElemental): void {
    if (this.isMuted) return;

    // Validar que el tipo existe
    if (!AudioManager.TIPOS.includes(tipo)) {
      console.warn(`[AudioManager] Tipo desconocido: ${tipo}`);
      return;
    }

    const key = `sfx-attack-${tipo}`;
    this.playSfx(key);
  }

  /**
   * Reproduce un sonido de impacto
   * @param efectividad - Multiplicador de efectividad (2 = super, 0.5 = poco, 1 = normal)
   * @param critico - Si fue golpe crítico
   */
  playImpact(efectividad: number = 1, critico: boolean = false): void {
    if (this.isMuted) return;

    let key: string;

    if (critico) {
      key = 'sfx-impact-critical';
    } else if (efectividad >= 2) {
      key = 'sfx-impact-super-effective';
    } else if (efectividad <= 0.5 && efectividad > 0) {
      key = 'sfx-impact-not-effective';
    } else {
      key = 'sfx-impact-hit';
    }

    this.playSfx(key);
  }

  /**
   * Reproduce un sonido de estado alterado
   */
  playState(estado: Exclude<EstadoAlterado, null>): void {
    if (this.isMuted) return;

    const audioKey = AudioManager.ESTADO_AUDIO_MAP[estado];
    if (!audioKey) {
      console.warn(`[AudioManager] Estado desconocido: ${estado}`);
      return;
    }

    const key = `sfx-state-${audioKey}`;
    this.playSfx(key);
  }

  /**
   * Reproduce un efecto de sonido genérico
   */
  private playSfx(key: string): void {
    if (!this.scene.sound.get(key) && !this.scene.cache.audio.has(key)) {
      console.warn(`[AudioManager] Audio no encontrado: ${key}`);
      return;
    }

    this.scene.sound.play(key, {
      volume: this.sfxVolume,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MÚSICA DE FONDO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Reproduce música de fondo
   * @param key - Clave del audio (sin prefijo 'music-')
   * @param loop - Si debe repetirse (default: true)
   * @param fadeIn - Duración del fade-in en ms (default: 500)
   */
  playMusic(key: string, loop: boolean = true, fadeIn: number = 500): void {
    const fullKey = `music-${key}`;

    // Si ya está reproduciendo la misma música, no hacer nada
    if (this.currentMusicKey === fullKey && this.currentMusic?.isPlaying) {
      return;
    }

    // Detener música anterior si existe
    this.stopMusic(0);

    // Verificar que el audio existe
    if (!this.scene.cache.audio.has(fullKey)) {
      console.warn(`[AudioManager] Música no encontrada: ${fullKey}`);
      return;
    }

    // Crear y reproducir la nueva música
    this.currentMusic = this.scene.sound.add(fullKey, {
      loop,
      volume: this.isMuted ? 0 : this.musicVolume,
    });

    this.currentMusicKey = fullKey;
    this.currentMusic.play();

    // Fade-in si no está muteado
    if (fadeIn > 0 && !this.isMuted) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(0);
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: this.musicVolume,
        duration: fadeIn,
        ease: 'Linear',
      });
    }
  }

  /**
   * Detiene la música actual
   * @param fadeOut - Duración del fade-out en ms (default: 500)
   */
  stopMusic(fadeOut: number = 500): void {
    if (!this.currentMusic) return;

    if (fadeOut > 0) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeOut,
        ease: 'Linear',
        onComplete: () => {
          this.currentMusic?.stop();
          this.currentMusic?.destroy();
          this.currentMusic = null;
          this.currentMusicKey = '';
        },
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentMusicKey = '';
    }
  }

  /**
   * Pausa la música actual
   */
  pauseMusic(): void {
    if (this.currentMusic?.isPlaying) {
      this.currentMusic.pause();
    }
  }

  /**
   * Reanuda la música pausada
   */
  resumeMusic(): void {
    if (this.currentMusic && !this.currentMusic.isPlaying) {
      this.currentMusic.resume();
    }
  }

  /**
   * Cambia la música con transición suave
   * @param newKey - Nueva clave de música
   * @param crossfade - Duración del crossfade en ms
   */
  transitionMusic(newKey: string, crossfade: number = 1000): void {
    const fullKey = `music-${newKey}`;

    if (this.currentMusicKey === fullKey) return;

    // Fade out actual
    if (this.currentMusic) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: crossfade / 2,
        ease: 'Linear',
        onComplete: () => {
          this.currentMusic?.stop();
          this.currentMusic?.destroy();
          this.currentMusic = null;
          // Iniciar nueva música con fade in
          this.playMusic(newKey, true, crossfade / 2);
        },
      });
    } else {
      this.playMusic(newKey, true, crossfade / 2);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CONTROL DE VOLUMEN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Establece el volumen de la música (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveToStorage(STORAGE_KEY_MUSIC_VOL, this.musicVolume);

    if (this.currentMusic && !this.isMuted) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
    }
  }

  /**
   * Obtiene el volumen actual de la música
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Establece el volumen de los efectos de sonido (0-1)
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveToStorage(STORAGE_KEY_SFX_VOL, this.sfxVolume);
  }

  /**
   * Obtiene el volumen actual de los SFX
   */
  getSfxVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Alterna el estado de mute
   * @returns El nuevo estado de mute
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.saveToStorage(STORAGE_KEY_MUTED, this.isMuted);

    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(
        this.isMuted ? 0 : this.musicVolume
      );
    }

    return this.isMuted;
  }

  /**
   * Establece el estado de mute
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.saveToStorage(STORAGE_KEY_MUTED, this.isMuted);

    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(
        this.isMuted ? 0 : this.musicVolume
      );
    }
  }

  /**
   * Obtiene el estado actual de mute
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  // ═══════════════════════════════════════════════════════════════
  // CARGA DE ASSETS (para usar en BootScene)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Carga todos los archivos de audio necesarios
   * Llamar desde BootScene.preload()
   */
  static preloadAudio(scene: Phaser.Scene): void {
    const basePath = 'src/assets/audio';

    // Música
    scene.load.audio('music-menu', `${basePath}/music/menu.ogg`);
    scene.load.audio('music-battle', `${basePath}/music/battle.ogg`);
    scene.load.audio('music-victory', `${basePath}/music/victory.ogg`);
    scene.load.audio('music-defeat', `${basePath}/music/defeat.ogg`);

    // UI SFX
    scene.load.audio('sfx-ui-hover', `${basePath}/sfx/ui/hover.ogg`);
    scene.load.audio('sfx-ui-click', `${basePath}/sfx/ui/click.ogg`);
    scene.load.audio('sfx-ui-select', `${basePath}/sfx/ui/select.ogg`);

    // Attack SFX (por tipo)
    AudioManager.TIPOS.forEach((tipo) => {
      scene.load.audio(`sfx-attack-${tipo}`, `${basePath}/sfx/attacks/${tipo}.ogg`);
    });

    // Impact SFX
    scene.load.audio('sfx-impact-hit', `${basePath}/sfx/impacts/hit.ogg`);
    scene.load.audio('sfx-impact-critical', `${basePath}/sfx/impacts/critical.ogg`);
    scene.load.audio('sfx-impact-super-effective', `${basePath}/sfx/impacts/super-effective.ogg`);
    scene.load.audio('sfx-impact-not-effective', `${basePath}/sfx/impacts/not-effective.ogg`);

    // State SFX
    scene.load.audio('sfx-state-quemadura', `${basePath}/sfx/states/quemadura.ogg`);
    scene.load.audio('sfx-state-veneno', `${basePath}/sfx/states/veneno.ogg`);
    scene.load.audio('sfx-state-paralisis', `${basePath}/sfx/states/paralisis.ogg`);
    scene.load.audio('sfx-state-congelado', `${basePath}/sfx/states/congelado.ogg`);
    scene.load.audio('sfx-state-dormido', `${basePath}/sfx/states/dormido.ogg`);
  }

  // ═══════════════════════════════════════════════════════════════
  // LIMPIEZA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Limpia recursos al destruir
   */
  destroy(): void {
    this.stopMusic(0);
    this.currentMusic = null;
    this.currentMusicKey = '';
  }
}
