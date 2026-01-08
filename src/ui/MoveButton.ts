import Phaser from 'phaser';
import type { TipoElemental } from '@game-types/index';
import { getTipoConfig } from '@data/index';

export interface MoveButtonConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  nombre: string;
  tipo: TipoElemental;
  poder: number;
  ppActual: number;
  ppMax: number;
  efectividad?: number; // Multiplicador de efectividad vs enemigo actual
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Botón de movimiento con estilo visual mejorado
 */
export class MoveButton extends Phaser.GameObjects.Container {
  private config: Required<MoveButtonConfig>;
  private background!: Phaser.GameObjects.Graphics;
  private nombreText!: Phaser.GameObjects.Text;
  private ppText!: Phaser.GameObjects.Text;
  private tipoIndicator!: Phaser.GameObjects.Graphics;
  private _isHovered: boolean = false;
  private isDisabled: boolean;

  /** Indica si el botón está siendo hover */
  get isHovered(): boolean {
    return this._isHovered;
  }

  constructor(scene: Phaser.Scene, config: MoveButtonConfig) {
    super(scene, config.x, config.y);

    this.config = {
      width: 118,
      height: 58,
      efectividad: 1,
      disabled: false,
      onClick: () => {},
      ...config,
    };

    this.isDisabled = this.config.disabled || config.ppActual <= 0;

    this.crearComponentes();
    this.configurarInteractividad();
    scene.add.existing(this);
  }

  private crearComponentes(): void {
    const { width, height, nombre, tipo, poder, ppActual, ppMax, efectividad } = this.config;
    const tipoConfig = getTipoConfig(tipo);
    const tipoColor = Phaser.Display.Color.HexStringToColor(tipoConfig.color).color;

    // Fondo del botón
    this.background = this.scene.add.graphics();
    this.dibujarFondo(tipoColor, false);
    this.add(this.background);

    // Indicador de tipo (barra lateral)
    this.tipoIndicator = this.scene.add.graphics();
    this.tipoIndicator.fillStyle(tipoColor, 1);
    this.tipoIndicator.fillRoundedRect(0, 0, 6, height, { tl: 6, bl: 6, tr: 0, br: 0 });
    this.add(this.tipoIndicator);

    // Icono del tipo pequeño
    const iconSize = 14;
    const iconX = width - iconSize - 6;
    const iconY = 6;
    const iconBg = this.scene.add.graphics();
    iconBg.fillStyle(tipoColor, 0.3);
    iconBg.fillCircle(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2);
    iconBg.lineStyle(1, tipoColor, 0.8);
    iconBg.strokeCircle(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2);
    this.add(iconBg);

    // Nombre del movimiento
    this.nombreText = this.scene.add.text(12, 6, nombre, {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: this.isDisabled ? '#666666' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
      wordWrap: { width: width - 30 },
    });
    this.add(this.nombreText);

    // Poder del movimiento
    const poderText = this.scene.add.text(12, 20, `PWR ${poder}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: this.isDisabled ? '#444444' : '#ffaa44',
    });
    this.add(poderText);

    // Indicador de efectividad
    if (efectividad && efectividad !== 1) {
      const efColor = efectividad >= 2 ? '#44ff88' : efectividad > 0 ? '#ff8844' : '#888888';
      const efText = efectividad >= 2 ? '▲▲' : efectividad > 0 && efectividad < 1 ? '▼▼' : '✕';
      const efLabel =
        efectividad >= 2 ? 'S.EFEC' : efectividad > 0 && efectividad < 1 ? 'RESIST' : 'INMUNE';

      const efectividadIndicator = this.scene.add.text(width - 8, 22, `${efText} ${efLabel}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '5px',
        color: this.isDisabled ? '#444444' : efColor,
      });
      efectividadIndicator.setOrigin(1, 0);
      this.add(efectividadIndicator);
    }

    // PP restantes
    const ppColor = this.getPPColor(ppActual, ppMax);
    this.ppText = this.scene.add.text(12, height - 14, `PP ${ppActual}/${ppMax}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: this.isDisabled ? '#444444' : ppColor,
    });
    this.add(this.ppText);

    // Tipo texto
    const tipoText = this.scene.add
      .text(width - 8, height - 14, tipoConfig.nombre.substring(0, 4).toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: '5px',
        color: this.isDisabled ? '#444444' : tipoConfig.color,
      })
      .setOrigin(1, 0);
    this.add(tipoText);
  }

  private dibujarFondo(tipoColor: number, hovered: boolean): void {
    const { width, height } = this.config;
    const g = this.background;
    g.clear();

    if (this.isDisabled) {
      // Estilo deshabilitado
      g.fillStyle(0x2a2a2a, 0.9);
      g.fillRoundedRect(0, 0, width, height, 6);
      g.lineStyle(1, 0x3a3a3a);
      g.strokeRoundedRect(0, 0, width, height, 6);
      return;
    }

    if (hovered) {
      // Sombra más pronunciada al hover
      g.fillStyle(0x000000, 0.4);
      g.fillRoundedRect(2, 2, width, height, 6);

      // Fondo más brillante
      g.fillStyle(tipoColor, 0.3);
      g.fillRoundedRect(0, 0, width, height, 6);

      // Borde brillante
      g.lineStyle(2, tipoColor, 0.9);
      g.strokeRoundedRect(0, 0, width, height, 6);

      // Brillo interior
      g.fillStyle(0xffffff, 0.1);
      g.fillRoundedRect(4, 4, width - 8, height / 2 - 4, 4);
    } else {
      // Sombra
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(2, 2, width, height, 6);

      // Fondo oscuro
      g.fillStyle(0x1a1a2e, 0.95);
      g.fillRoundedRect(0, 0, width, height, 6);

      // Borde con color del tipo
      g.lineStyle(1, tipoColor, 0.5);
      g.strokeRoundedRect(0, 0, width, height, 6);

      // Brillo sutil
      g.fillStyle(0xffffff, 0.03);
      g.fillRoundedRect(4, 4, width - 8, height / 2 - 4, 4);
    }
  }

  private getPPColor(ppActual: number, ppMax: number): string {
    const ratio = ppActual / ppMax;
    if (ratio > 0.5) return '#88ff88';
    if (ratio > 0.25) return '#ffcc44';
    return '#ff6666';
  }

  private configurarInteractividad(): void {
    const { width, height } = this.config;

    this.setSize(width, height);
    this.setInteractive({ useHandCursor: !this.isDisabled });

    const tipoConfig = getTipoConfig(this.config.tipo);
    const tipoColor = Phaser.Display.Color.HexStringToColor(tipoConfig.color).color;

    this.on('pointerover', () => {
      if (!this.isDisabled) {
        this._isHovered = true;
        this.dibujarFondo(tipoColor, true);
        this.setScale(1.02);
      }
    });

    this.on('pointerout', () => {
      if (!this.isDisabled) {
        this._isHovered = false;
        this.dibujarFondo(tipoColor, false);
        this.setScale(1);
      }
    });

    this.on('pointerdown', () => {
      if (!this.isDisabled) {
        this.setScale(0.98);
        // Efecto de click
        this.scene.tweens.add({
          targets: this,
          scale: 1,
          duration: 100,
          ease: 'Back.easeOut',
        });
        this.config.onClick();
      }
    });
  }

  /**
   * Actualiza los PP mostrados
   */
  updatePP(ppActual: number): void {
    this.ppText.setText(`PP ${ppActual}/${this.config.ppMax}`);
    this.ppText.setColor(this.getPPColor(ppActual, this.config.ppMax));

    if (ppActual <= 0 && !this.isDisabled) {
      this.isDisabled = true;
      this.nombreText.setColor('#666666');
      this.ppText.setColor('#444444');
      const tipoConfig = getTipoConfig(this.config.tipo);
      const tipoColor = Phaser.Display.Color.HexStringToColor(tipoConfig.color).color;
      this.dibujarFondo(tipoColor, false);
      this.disableInteractive();
    }
  }
}
