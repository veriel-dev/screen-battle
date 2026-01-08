import Phaser from 'phaser';

export interface DialogBoxConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * Caja de diálogo con estilo visual mejorado
 */
export class DialogBox extends Phaser.GameObjects.Container {
  private config: Required<DialogBoxConfig>;
  private background!: Phaser.GameObjects.Graphics;
  private dialogText!: Phaser.GameObjects.Text;
  private indicator!: Phaser.GameObjects.Text;
  private isTyping: boolean = false;
  private typewriterEvent?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, config: DialogBoxConfig) {
    super(scene, config.x, config.y);

    this.config = {
      width: 492,
      height: 55,
      ...config,
    };

    this.crearComponentes();
    scene.add.existing(this);
  }

  private crearComponentes(): void {
    const { width, height } = this.config;

    // Fondo del diálogo
    this.background = this.scene.add.graphics();
    this.dibujarFondo(width, height);
    this.add(this.background);

    // Texto del diálogo
    this.dialogText = this.scene.add.text(15, 12, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#e8e8e8',
      wordWrap: { width: width - 40 },
      lineSpacing: 6,
    });
    this.add(this.dialogText);

    // Indicador de continuar (triángulo animado)
    this.indicator = this.scene.add
      .text(width - 20, height - 18, '▼', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#88ccff',
      })
      .setOrigin(0.5);
    this.indicator.setVisible(false);
    this.add(this.indicator);

    // Animación del indicador
    this.scene.tweens.add({
      targets: this.indicator,
      y: this.indicator.y + 3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private dibujarFondo(width: number, height: number): void {
    const g = this.background;
    g.clear();

    // Sombra
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(3, 3, width, height, 8);

    // Fondo principal con gradiente simulado
    g.fillStyle(0x16213e, 0.98);
    g.fillRoundedRect(0, 0, width, height, 8);

    // Borde exterior
    g.lineStyle(2, 0x0f3460);
    g.strokeRoundedRect(0, 0, width, height, 8);

    // Borde interior brillante
    g.lineStyle(1, 0x4a6fa5, 0.3);
    g.strokeRoundedRect(4, 4, width - 8, height - 8, 6);

    // Decoración superior
    g.fillStyle(0x4a6fa5, 0.2);
    g.fillRoundedRect(8, 6, width - 16, 3, 1);

    // Esquinas decorativas
    this.dibujarEsquina(g, 6, 6);
    this.dibujarEsquina(g, width - 10, 6);
    this.dibujarEsquina(g, 6, height - 10);
    this.dibujarEsquina(g, width - 10, height - 10);
  }

  private dibujarEsquina(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x4a6fa5, 0.5);
    g.fillRect(x, y, 4, 4);
    g.fillStyle(0x88ccff, 0.3);
    g.fillRect(x + 1, y + 1, 2, 2);
  }

  /**
   * Muestra texto inmediatamente
   */
  setText(texto: string): void {
    this.stopTypewriter();
    this.dialogText.setText(texto);
    this.indicator.setVisible(false);
  }

  /**
   * Muestra texto con efecto de máquina de escribir
   */
  typeText(texto: string, velocidad: number = 30, onComplete?: () => void): void {
    this.stopTypewriter();
    this.isTyping = true;
    this.indicator.setVisible(false);

    let index = 0;
    this.dialogText.setText('');

    this.typewriterEvent = this.scene.time.addEvent({
      delay: velocidad,
      callback: () => {
        if (index < texto.length) {
          this.dialogText.setText(texto.substring(0, index + 1));
          index++;
        } else {
          this.stopTypewriter();
          this.indicator.setVisible(true);
          if (onComplete) onComplete();
        }
      },
      repeat: texto.length - 1,
    });
  }

  /**
   * Detiene el efecto de máquina de escribir
   */
  stopTypewriter(): void {
    if (this.typewriterEvent) {
      this.typewriterEvent.destroy();
      this.typewriterEvent = undefined;
    }
    this.isTyping = false;
  }

  /**
   * Verifica si está escribiendo
   */
  getIsTyping(): boolean {
    return this.isTyping;
  }

  /**
   * Muestra el indicador de continuar
   */
  showIndicator(): void {
    this.indicator.setVisible(true);
  }

  /**
   * Oculta el indicador de continuar
   */
  hideIndicator(): void {
    this.indicator.setVisible(false);
  }

  /**
   * Limpia el texto
   */
  clear(): void {
    this.stopTypewriter();
    this.dialogText.setText('');
    this.indicator.setVisible(false);
  }
}
