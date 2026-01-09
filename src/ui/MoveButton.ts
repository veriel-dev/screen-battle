import Phaser from 'phaser';
import type { TipoElemental } from '@game-types/index';
import { getTipoConfig } from '@data/index';
import { CYBER_THEME } from './theme';

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
  efectividad?: number;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Botón de movimiento estilo Digimon Cyber Sleuth
 */
export class MoveButton extends Phaser.GameObjects.Container {
  private config: Required<MoveButtonConfig>;
  private background!: Phaser.GameObjects.Graphics;
  private nombreText!: Phaser.GameObjects.Text;
  private ppText!: Phaser.GameObjects.Text;
  private _isHovered: boolean = false;
  private isDisabled: boolean;

  get isHovered(): boolean {
    return this._isHovered;
  }

  constructor(scene: Phaser.Scene, config: MoveButtonConfig) {
    super(scene, config.x, config.y);

    this.config = {
      width: 115,
      height: 34,
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
    const { width, height, nombre, tipo, ppActual, ppMax, efectividad } = this.config;
    const tipoConfig = getTipoConfig(tipo);
    const tipoColor = Phaser.Display.Color.HexStringToColor(tipoConfig.color).color;

    // Fondo del botón
    this.background = this.scene.add.graphics();
    this.dibujarFondo(tipoColor, false);
    this.add(this.background);

    // Línea de acento izquierda (color del tipo)
    const accent = this.scene.add.graphics();
    accent.fillStyle(this.isDisabled ? 0x444444 : tipoColor, 1);
    accent.fillRect(0, 0, 2, height);
    this.add(accent);

    // Nombre del movimiento
    this.nombreText = this.scene.add.text(8, 5, nombre, {
      fontFamily: 'Rajdhani',
      fontSize: '10px',
      fontStyle: 'bold',
      color: this.isDisabled ? '#666666' : CYBER_THEME.colors.whiteHex,
    });
    this.add(this.nombreText);

    // Tipo badge (estilo Cyber)
    const tipoBadge = this.scene.add.graphics();
    tipoBadge.fillStyle(0x000000, 0.3);
    const badgeWidth = 30;
    const badgeX = width - badgeWidth - 4;
    tipoBadge.fillRoundedRect(badgeX, 4, badgeWidth, 10, 2);
    this.add(tipoBadge);

    const tipoText = this.scene.add
      .text(badgeX + badgeWidth / 2, 8, tipoConfig.nombre.substring(0, 4).toUpperCase(), {
        fontFamily: 'Rajdhani',
        fontSize: '7px',
        fontStyle: 'bold',
        color: this.isDisabled ? '#444444' : tipoConfig.color,
      })
      .setOrigin(0.5);
    this.add(tipoText);

    // Indicador de efectividad
    if (efectividad && efectividad !== 1 && !this.isDisabled) {
      let efColor: string;
      let efText: string;

      if (efectividad >= 2) {
        efColor = CYBER_THEME.colors.cyanHex;
        efText = '▲';
      } else if (efectividad > 0 && efectividad < 1) {
        efColor = CYBER_THEME.colors.pinkHex;
        efText = '▼';
      } else {
        efColor = '#666666';
        efText = '✕';
      }

      const efIndicator = this.scene.add
        .text(width - 6, height - 10, efText, {
          fontFamily: 'Rajdhani',
          fontSize: '10px',
          color: efColor,
        })
        .setOrigin(1, 0.5);
      this.add(efIndicator);
    }

    // PP restantes
    const ppColor = this.getPPColor(ppActual, ppMax);
    this.ppText = this.scene.add.text(8, height - 12, `PP ${ppActual}/${ppMax}`, {
      fontFamily: 'Orbitron',
      fontSize: '7px',
      color: this.isDisabled ? '#444444' : ppColor,
    });
    this.add(this.ppText);
  }

  private dibujarFondo(tipoColor: number, hovered: boolean): void {
    const { width, height } = this.config;
    const g = this.background;
    g.clear();

    // Forma angular (clip-path simulado)
    const cut = 5;

    if (this.isDisabled) {
      g.fillStyle(CYBER_THEME.colors.panel, 0.6);
      g.lineStyle(1, 0x333333, 0.5);
    } else if (hovered) {
      g.fillStyle(tipoColor, 0.2);
      g.lineStyle(1, tipoColor, 0.8);
    } else {
      g.fillStyle(CYBER_THEME.colors.panel, 0.8);
      g.lineStyle(1, CYBER_THEME.colors.cyan, 0.3);
    }

    g.beginPath();
    g.moveTo(cut, 0);
    g.lineTo(width, 0);
    g.lineTo(width - cut, height);
    g.lineTo(0, height);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Efecto de glow al hover
    if (hovered && !this.isDisabled) {
      g.fillStyle(tipoColor, 0.1);
      g.fillRect(2, 2, width - 4, height - 4);
    }
  }

  private getPPColor(ppActual: number, ppMax: number): string {
    const ratio = ppActual / ppMax;
    if (ratio > 0.5) return CYBER_THEME.colors.cyanHex;
    if (ratio > 0.25) return CYBER_THEME.hp.mediumGradient[0].toString(16).padStart(6, '0');
    return CYBER_THEME.colors.pinkHex;
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
