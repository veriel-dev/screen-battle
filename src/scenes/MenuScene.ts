import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.dibujarFondo();
    this.crearTitulo();
    this.crearTextoInstrucciones();
  }

  private dibujarFondo(): void {
    const g = this.add.graphics();

    for (let i = 0; i < 384; i++) {
      const t = i / 384;
      const r = Math.floor(32 + t * 16);
      const gr = Math.floor(32 + t * 32);
      const b = Math.floor(64 + t * 32);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, i, 512, 1);
    }
  }

  private crearTitulo(): void {
    this.add
      .text(256, 150, 'KODAMON', {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#f0c030',
      })
      .setOrigin(0.5);

    this.add
      .text(256, 200, 'Batallas por Turnos', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  private crearTextoInstrucciones(): void {
    const texto = this.add
      .text(256, 300, 'Pulsa ESPACIO para comenzar', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: texto,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('BattleScene');
      });
    });
  }
}
