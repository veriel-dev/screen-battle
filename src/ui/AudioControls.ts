import Phaser from 'phaser';
import { AudioManager } from '@systems/AudioManager';
import { CYBER_THEME } from './theme';

interface AudioControlsConfig {
  x: number;
  y: number;
  audio: AudioManager;
}

/**
 * Componente de controles de audio minimalista
 * Muestra un icono de speaker que permite mutear/desmutear
 */
export class AudioControls extends Phaser.GameObjects.Container {
  private audio: AudioManager;
  private speakerIcon: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: AudioControlsConfig) {
    super(scene, config.x, config.y);

    this.audio = config.audio;

    // Fondo del botón
    this.bg = scene.add.graphics();
    this.dibujarFondo(false);
    this.add(this.bg);

    // Icono de speaker
    this.speakerIcon = scene.add
      .text(0, 0, this.getIcon(), {
        fontFamily: 'Rajdhani',
        fontSize: '14px',
        color: CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5);
    this.add(this.speakerIcon);

    // Interactividad
    this.setSize(24, 24);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => this.toggleMute());
    this.on('pointerover', () => {
      this.dibujarFondo(true);
      this.speakerIcon.setColor(CYBER_THEME.colors.whiteHex);
    });
    this.on('pointerout', () => {
      this.dibujarFondo(false);
      this.speakerIcon.setColor(CYBER_THEME.colors.cyanHex);
    });

    scene.add.existing(this);
  }

  private dibujarFondo(hover: boolean): void {
    this.bg.clear();
    this.bg.fillStyle(
      hover ? CYBER_THEME.colors.cyan : CYBER_THEME.colors.panel,
      hover ? 0.3 : 0.6
    );
    this.bg.lineStyle(1, CYBER_THEME.colors.cyan, hover ? 0.8 : 0.4);
    this.bg.fillRoundedRect(-12, -12, 24, 24, 4);
    this.bg.strokeRoundedRect(-12, -12, 24, 24, 4);
  }

  private getIcon(): string {
    return this.audio.getMuted() ? '🔇' : '🔊';
  }

  private toggleMute(): void {
    this.audio.toggleMute();
    this.speakerIcon.setText(this.getIcon());
  }
}
