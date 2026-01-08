import Phaser from 'phaser';
import type { TipoElemental } from '@game-types/index';
import { getTipoConfig } from '@data/index';

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
  flipped?: boolean; // Para mostrar en lado opuesto
}

/**
 * Componente de barra de HP con estilo visual mejorado
 */
export class HealthBar extends Phaser.GameObjects.Container {
  private config: Required<HealthBarConfig>;
  private background!: Phaser.GameObjects.Graphics;
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private nombreText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private tipoIcon!: Phaser.GameObjects.Graphics;
  private hpActual: number;
  private hpMax: number;

  constructor(scene: Phaser.Scene, config: HealthBarConfig) {
    super(scene, config.x, config.y);

    this.config = {
      width: 210,
      height: 60,
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

    // Fondo principal con gradiente simulado
    this.background = this.scene.add.graphics();
    this.dibujarFondoPanel(width, height, tipoColor);
    this.add(this.background);

    // Icono del tipo
    this.tipoIcon = this.scene.add.graphics();
    this.dibujarIconoTipo(tipo, flipped ? width - 25 : 12, 12);
    this.add(this.tipoIcon);

    // Nombre del Kodamon
    this.nombreText = this.scene.add.text(flipped ? width - 35 : 30, 10, nombre, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    if (flipped) this.nombreText.setOrigin(1, 0);
    this.add(this.nombreText);

    // Barra HP fondo
    this.hpBarBg = this.scene.add.graphics();
    this.hpBarBg.fillStyle(0x1a1a2e, 1);
    this.hpBarBg.fillRoundedRect(10, 32, width - 20, 12, 3);
    this.hpBarBg.lineStyle(1, 0x4a4a6a);
    this.hpBarBg.strokeRoundedRect(10, 32, width - 20, 12, 3);
    this.add(this.hpBarBg);

    // Barra HP relleno
    this.hpBarFill = this.scene.add.graphics();
    this.add(this.hpBarFill);
    this.actualizarBarraHP();

    // Texto HP
    if (this.config.showHpText) {
      this.hpText = this.scene.add
        .text(width / 2, 50, '', {
          fontFamily: '"Press Start 2P"',
          fontSize: '7px',
          color: '#aaffaa',
          stroke: '#000000',
          strokeThickness: 1,
        })
        .setOrigin(0.5, 0);
      this.add(this.hpText);
      this.actualizarTextoHP();
    }
  }

  private dibujarFondoPanel(width: number, height: number, accentColor: number): void {
    const g = this.background;
    g.clear();

    // Sombra
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(3, 3, width, height, 8);

    // Fondo principal oscuro
    g.fillStyle(0x16213e, 0.95);
    g.fillRoundedRect(0, 0, width, height, 8);

    // Borde exterior
    g.lineStyle(2, 0x0f3460);
    g.strokeRoundedRect(0, 0, width, height, 8);

    // Línea de acento superior con color del tipo
    g.fillStyle(accentColor, 0.8);
    g.fillRoundedRect(4, 4, width - 8, 4, 2);

    // Brillo interior
    g.fillStyle(0xffffff, 0.05);
    g.fillRoundedRect(4, 8, width - 8, 20, 4);
  }

  private dibujarIconoTipo(tipo: TipoElemental, x: number, y: number): void {
    const g = this.tipoIcon;
    const config = getTipoConfig(tipo);
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;

    g.clear();

    // Fondo circular
    g.fillStyle(color, 1);
    g.fillCircle(x, y, 8);

    // Borde
    g.lineStyle(1, 0xffffff, 0.5);
    g.strokeCircle(x, y, 8);

    // Símbolo interno según tipo (simplificado)
    g.fillStyle(0xffffff, 0.9);
    switch (tipo) {
      case 'fuego':
        // Llama
        g.fillTriangle(x, y - 5, x - 4, y + 4, x + 4, y + 4);
        break;
      case 'agua':
        // Gota
        g.fillCircle(x, y + 2, 4);
        g.fillTriangle(x, y - 5, x - 3, y, x + 3, y);
        break;
      case 'planta':
        // Hoja
        g.fillEllipse(x, y, 6, 10);
        break;
      case 'electrico':
        // Rayo
        g.fillTriangle(x - 3, y - 4, x + 2, y - 1, x - 1, y - 1);
        g.fillTriangle(x - 2, y + 1, x + 3, y + 4, x + 1, y + 1);
        break;
      case 'hielo':
        // Copo
        g.fillRect(x - 1, y - 5, 2, 10);
        g.fillRect(x - 5, y - 1, 10, 2);
        break;
      case 'tierra':
        // Montaña
        g.fillTriangle(x, y - 4, x - 5, y + 4, x + 5, y + 4);
        break;
      case 'volador':
        // Ala
        g.fillTriangle(x - 5, y + 3, x, y - 4, x + 5, y + 3);
        break;
      case 'roca':
        // Roca
        g.fillRect(x - 4, y - 2, 8, 6);
        break;
      case 'fantasma':
        // Fantasma
        g.fillCircle(x, y - 1, 4);
        g.fillRect(x - 4, y, 8, 5);
        break;
      default:
        // Normal - círculo
        g.fillCircle(x, y, 4);
    }
  }

  private actualizarBarraHP(): void {
    const { width } = this.config;
    const barWidth = width - 24;
    const porcentaje = Math.max(0, this.hpActual / this.hpMax);
    const fillWidth = barWidth * porcentaje;

    // Color según HP
    let color = 0x00ff88; // Verde
    let colorOscuro = 0x00aa55;
    if (porcentaje < 0.5) {
      color = 0xffcc00; // Amarillo
      colorOscuro = 0xaa8800;
    }
    if (porcentaje < 0.2) {
      color = 0xff4444; // Rojo
      colorOscuro = 0xaa2222;
    }

    this.hpBarFill.clear();

    if (fillWidth > 0) {
      // Barra principal
      this.hpBarFill.fillStyle(colorOscuro, 1);
      this.hpBarFill.fillRoundedRect(12, 34, fillWidth, 8, 2);

      // Brillo superior
      this.hpBarFill.fillStyle(color, 1);
      this.hpBarFill.fillRoundedRect(12, 34, fillWidth, 4, 2);
    }
  }

  private actualizarTextoHP(): void {
    if (this.hpText) {
      this.hpText.setText(`${Math.max(0, this.hpActual)} / ${this.hpMax}`);
    }
  }

  /**
   * Actualiza el HP con animación
   */
  setHP(nuevoHP: number, animado: boolean = true): void {
    const hpAnterior = this.hpActual;
    this.hpActual = Math.max(0, Math.min(nuevoHP, this.hpMax));

    if (animado && hpAnterior !== this.hpActual) {
      // Animación de cambio de HP
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
}
