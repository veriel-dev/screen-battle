import Phaser from 'phaser';
import { CYBER_THEME } from './theme';

export interface DialogBoxConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * Caja de diálogo estilo Digimon Cyber Sleuth
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
      width: 245,
      height: 72,
      ...config,
    };

    this.crearComponentes();
    scene.add.existing(this);
  }

  private crearComponentes(): void {
    const { width, height } = this.config;

    // Fondo del diálogo estilo Cyber
    this.background = this.scene.add.graphics();
    this.dibujarFondo(width, height);
    this.add(this.background);

    // Texto del diálogo
    this.dialogText = this.scene.add.text(12, 10, '', {
      fontFamily: 'Rajdhani',
      fontSize: '12px',
      color: CYBER_THEME.colors.whiteHex,
      wordWrap: { width: width - 24 },
      lineSpacing: 4,
    });
    this.add(this.dialogText);

    // Indicador de continuar (diamante animado)
    this.indicator = this.scene.add
      .text(width - 16, height - 16, '◆', {
        fontFamily: 'Rajdhani',
        fontSize: '10px',
        color: CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5);
    this.indicator.setVisible(false);
    this.add(this.indicator);

    // Animación del indicador
    this.scene.tweens.add({
      targets: this.indicator,
      alpha: { from: 0.4, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private dibujarFondo(width: number, height: number): void {
    const g = this.background;
    g.clear();

    // Fondo principal con panel angular
    const cut = 10;
    g.fillStyle(CYBER_THEME.colors.panel, 0.95);
    g.beginPath();
    g.moveTo(cut, 0);
    g.lineTo(width, 0);
    g.lineTo(width, height - cut);
    g.lineTo(width - cut, height);
    g.lineTo(0, height);
    g.lineTo(0, cut);
    g.closePath();
    g.fillPath();

    // Borde superior
    g.lineStyle(2, CYBER_THEME.colors.cyan, 0.4);
    g.beginPath();
    g.moveTo(cut, 0);
    g.lineTo(width, 0);
    g.strokePath();

    // Borde izquierdo (línea de acento)
    g.fillStyle(CYBER_THEME.colors.cyan, 0.8);
    g.fillRect(0, cut, 2, height - cut);

    // Efecto de brillo interior
    g.fillStyle(CYBER_THEME.colors.cyan, 0.03);
    g.fillRect(4, 4, width - 8, height / 3);

    // Esquina decorativa superior izquierda
    g.fillStyle(CYBER_THEME.colors.cyan, 0.3);
    g.beginPath();
    g.moveTo(0, cut);
    g.lineTo(cut, 0);
    g.lineTo(cut, cut);
    g.closePath();
    g.fillPath();
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
