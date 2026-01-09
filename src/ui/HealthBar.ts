import Phaser from 'phaser';
import type { TipoElemental, EstadoAlterado } from '@game-types/index';
import { getTipoConfig } from '@data/index';
import { getEstadoConfig } from '@systems/index';
import { CYBER_THEME, drawCyberPanel } from './theme';

export interface HealthBarConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  nombre: string;
  tipo: TipoElemental;
  hpMax: number;
  hpActual: number;
  showHpText?: boolean;
  flipped?: boolean;
}

/**
 * Barra de HP estilo Digimon Cyber Sleuth
 */
export class HealthBar extends Phaser.GameObjects.Container {
  private config: Required<HealthBarConfig>;
  private background!: Phaser.GameObjects.Graphics;
  private tipoIconBg!: Phaser.GameObjects.Graphics;
  private tipoIconText!: Phaser.GameObjects.Text;
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private nombreText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private hpActual: number;
  private hpMax: number;
  private statusBadge!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: HealthBarConfig) {
    super(scene, config.x, config.y);

    this.config = {
      width: 200,
      height: 55,
      showHpText: true,
      flipped: false,
      ...config,
    };

    this.hpActual = config.hpActual;
    this.hpMax = config.hpMax;

    this.crearComponentes();
    scene.add.existing(this);
  }

  private crearComponentes(): void {
    const { width, height, nombre, tipo, flipped } = this.config;
    const tipoConfig = getTipoConfig(tipo);
    const tipoColor = Phaser.Display.Color.HexStringToColor(tipoConfig.color).color;
    const accentColor = flipped ? CYBER_THEME.colors.pink : CYBER_THEME.colors.cyan;

    // Panel de fondo estilo Cyber
    this.background = this.scene.add.graphics();
    drawCyberPanel(this.background, 0, 0, width, height, {
      fillAlpha: 0.9,
      borderColor: accentColor,
      borderAlpha: 0.4,
      cornerCut: 8,
      accentSide: flipped ? 'right' : 'left',
      accentColor: accentColor,
    });
    this.add(this.background);

    // Icono del tipo (círculo con símbolo Cyber)
    const iconX = flipped ? width - 18 : 18;
    const iconY = 14;

    this.tipoIconBg = this.scene.add.graphics();
    // Glow exterior
    this.tipoIconBg.fillStyle(tipoColor, 0.3);
    this.tipoIconBg.fillCircle(iconX, iconY, 11);
    // Círculo principal
    this.tipoIconBg.fillStyle(tipoColor, 1);
    this.tipoIconBg.fillCircle(iconX, iconY, 9);
    // Borde brillante
    this.tipoIconBg.lineStyle(1, CYBER_THEME.colors.white, 0.6);
    this.tipoIconBg.strokeCircle(iconX, iconY, 9);
    this.add(this.tipoIconBg);

    // Icono de texto
    this.tipoIconText = this.scene.add
      .text(iconX, iconY, tipoConfig.icono, {
        fontFamily: 'Orbitron',
        fontSize: '10px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add(this.tipoIconText);

    // Nombre del Kodamon (ajustado para dejar espacio al icono)
    const nombreX = flipped ? width - 32 : 32;
    this.nombreText = this.scene.add.text(nombreX, 8, nombre.toUpperCase(), {
      fontFamily: 'Orbitron',
      fontSize: '10px',
      fontStyle: 'bold',
      color: CYBER_THEME.colors.whiteHex,
    });
    if (flipped) this.nombreText.setOrigin(1, 0);
    this.add(this.nombreText);

    // Fondo de la barra HP
    this.hpBarBg = this.scene.add.graphics();
    this.hpBarBg.fillStyle(CYBER_THEME.colors.white, 0.1);
    this.hpBarBg.fillRect(10, 28, width - 20, 10);

    // Patrón de segmentos sobre la barra
    this.hpBarBg.fillStyle(CYBER_THEME.colors.dark, 0.3);
    for (let i = 0; i < width - 20; i += 5) {
      this.hpBarBg.fillRect(10 + i + 4, 28, 1, 10);
    }
    this.add(this.hpBarBg);

    // Barra HP relleno
    this.hpBarFill = this.scene.add.graphics();
    this.add(this.hpBarFill);
    this.actualizarBarraHP();

    // Texto HP
    if (this.config.showHpText) {
      this.hpText = this.scene.add
        .text(flipped ? 12 : width - 12, 42, '', {
          fontFamily: 'Orbitron',
          fontSize: '9px',
          color:
            accentColor === CYBER_THEME.colors.cyan
              ? CYBER_THEME.colors.cyanHex
              : CYBER_THEME.colors.pinkHex,
        })
        .setOrigin(flipped ? 0 : 1, 0);
      this.add(this.hpText);
      this.actualizarTextoHP();
    }

    // Badge de estado alterado (inicialmente oculto)
    this.statusBadge = this.scene.add.graphics();
    this.statusBadge.setVisible(false);
    this.add(this.statusBadge);

    this.statusText = this.scene.add
      .text(flipped ? width - 70 : 70, 8, '', {
        fontFamily: 'Rajdhani',
        fontSize: '8px',
        fontStyle: 'bold',
        color: CYBER_THEME.colors.whiteHex,
      })
      .setOrigin(flipped ? 1 : 0, 0);
    this.statusText.setVisible(false);
    this.add(this.statusText);
  }

  private actualizarBarraHP(): void {
    const { width } = this.config;
    const barWidth = width - 24;
    const porcentaje = Math.max(0, this.hpActual / this.hpMax);
    const fillWidth = barWidth * porcentaje;

    // Colores según HP (estilo Cyber)
    let colors: { main: number; glow: number };
    if (porcentaje > 0.5) {
      colors = { main: CYBER_THEME.hp.high, glow: CYBER_THEME.hp.highGradient[0] };
    } else if (porcentaje > 0.2) {
      colors = { main: CYBER_THEME.hp.medium, glow: CYBER_THEME.hp.mediumGradient[0] };
    } else {
      colors = { main: CYBER_THEME.hp.low, glow: CYBER_THEME.hp.lowGradient[0] };
    }

    this.hpBarFill.clear();

    if (fillWidth > 0) {
      // Barra principal con gradiente simulado
      this.hpBarFill.fillStyle(colors.main, 1);
      this.hpBarFill.fillRect(12, 30, fillWidth, 6);

      // Brillo superior
      this.hpBarFill.fillStyle(colors.glow, 0.5);
      this.hpBarFill.fillRect(12, 30, fillWidth, 2);
    }
  }

  private actualizarTextoHP(): void {
    if (this.hpText) {
      const hpStr = Math.max(0, this.hpActual).toString().padStart(3, '0');
      const maxStr = this.hpMax.toString().padStart(3, '0');
      this.hpText.setText(`${hpStr}/${maxStr}`);
    }
  }

  /**
   * Actualiza el HP con animación
   */
  setHP(nuevoHP: number, animado: boolean = true): void {
    const hpAnterior = this.hpActual;
    this.hpActual = Math.max(0, Math.min(nuevoHP, this.hpMax));

    if (animado && hpAnterior !== this.hpActual) {
      this.scene.tweens.addCounter({
        from: hpAnterior,
        to: this.hpActual,
        duration: 500,
        ease: 'Quad.easeOut',
        onUpdate: (tween) => {
          const value = tween.getValue();
          if (value !== null) {
            this.hpActual = Math.round(value);
            this.actualizarBarraHP();
            this.actualizarTextoHP();
          }
        },
      });
    } else {
      this.actualizarBarraHP();
      this.actualizarTextoHP();
    }
  }

  getHP(): number {
    return this.hpActual;
  }

  /**
   * Actualiza el indicador de estado alterado
   */
  setEstado(estado: EstadoAlterado): void {
    if (estado === null) {
      this.statusBadge.setVisible(false);
      this.statusText.setVisible(false);
      return;
    }

    const config = getEstadoConfig(estado);
    if (!config) return;

    const { width, flipped } = this.config;
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;

    // Posición del badge
    const badgeX = flipped ? width - 105 : 75;
    const badgeY = 6;
    const badgeWidth = 28;
    const badgeHeight = 12;

    // Dibujar badge estilo Cyber (angular)
    this.statusBadge.clear();
    this.statusBadge.fillStyle(color, 0.9);
    const cut = 3;
    this.statusBadge.beginPath();
    this.statusBadge.moveTo(badgeX + cut, badgeY);
    this.statusBadge.lineTo(badgeX + badgeWidth, badgeY);
    this.statusBadge.lineTo(badgeX + badgeWidth - cut, badgeY + badgeHeight);
    this.statusBadge.lineTo(badgeX, badgeY + badgeHeight);
    this.statusBadge.closePath();
    this.statusBadge.fillPath();
    this.statusBadge.setVisible(true);

    // Actualizar texto
    this.statusText.setText(config.nombre.substring(0, 3).toUpperCase());
    this.statusText.setX(flipped ? width - 81 : 79);
    this.statusText.setY(7);
    this.statusText.setVisible(true);

    // Animación de pulso
    this.scene.tweens.add({
      targets: [this.statusBadge, this.statusText],
      alpha: { from: 0.5, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: 1,
    });
  }
}
