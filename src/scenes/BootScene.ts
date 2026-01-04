import { getAllKodamons } from '@/data';
import { SpriteGenerator } from '@/utils';
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.crearBarraDeCarga();
  }

  create(): void {
    this.generarSprites();
    this.scene.start('MenuScene');
  }
  private crearBarraDeCarga(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const loadingText = this.add
      .text(centerX, centerY, 'Cargando...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(centerX - 100, centerY + 20, 200, 20);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(centerX - 96, centerY + 24, 192 * value, 12);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }
  private generarSprites(): void {
    const generator = new SpriteGenerator(this, 64);
    const kodamons = getAllKodamons();

    // Generar sprite para cada Kodamon
    kodamons.forEach((kodamon) => {
      generator.generate(kodamon.id, kodamon.tipo);
    });

    console.log(`[BootScene] ${kodamons.length} sprites generados`);
  }
}
