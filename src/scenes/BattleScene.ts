import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(400);
    this.dibujarFondo();
    this.crearUI();
  }

  private dibujarFondo(): void {
    const g = this.add.graphics();

    // Cielo
    for (let i = 0; i < 160; i++) {
      const t = i / 160;
      g.fillStyle(
        Phaser.Display.Color.GetColor(Math.floor(100 + t * 80), Math.floor(160 + t * 60), Math.floor(220 + t * 30))
      );
      g.fillRect(0, i, 512, 1);
    }

    // Plataformas
    g.fillStyle(0x78b048);
    g.fillEllipse(400, 145, 85, 20);
    g.fillEllipse(110, 210, 100, 24);

    // Suelo
    g.fillStyle(0x906840);
    g.fillRect(0, 225, 512, 160);
  }

  private crearUI(): void {
    const g = this.add.graphics();

    // Caja de diálogo
    g.fillStyle(0xf8f8f8);
    g.fillRoundedRect(10, 235, 492, 60, 6);
    g.lineStyle(3, 0x484848);
    g.strokeRoundedRect(10, 235, 492, 60, 6);

    this.add.text(25, 255, '¡Escena de batalla cargada!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#303030',
    });

    this.add.text(25, 275, 'Pulsa ESPACIO para volver al menu', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#606060',
    });

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
