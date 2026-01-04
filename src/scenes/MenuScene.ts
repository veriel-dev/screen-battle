import Phaser from 'phaser';
import { getAllKodamons, getTipoConfig } from '@data/index';
import type { KodamonData } from '@game-types/index';

export class MenuScene extends Phaser.Scene {
  private kodamons: KodamonData[] = [];
  private selectedIndex: number = 0;
  private kodamonSprites: Phaser.GameObjects.Image[] = [];
  private selectorRect!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.kodamons = getAllKodamons();
    this.selectedIndex = 0;

    this.dibujarFondo();
    this.crearTitulo();
    this.crearGridKodamons();
    this.crearSelector();
    this.crearPanelInfo();
    this.configurarInput();

    this.actualizarSeleccion();
  }

  private dibujarFondo(): void {
    const g = this.add.graphics();
    const { height, width } = this.cameras.main;

    for (let i = 0; i < height; i++) {
      const t = i / height;
      const r = Math.floor(32 + t * 16);
      const gr = Math.floor(32 + t * 32);
      const b = Math.floor(64 + t * 32);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, i, width, 1);
    }
  }

  private crearTitulo(): void {
    this.add
      .text(256, 30, 'KODAMON', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#f0c030',
      })
      .setOrigin(0.5);

    this.add
      .text(256, 55, 'Elige tu Kodamon', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  private crearGridKodamons(): void {
    const startX = 64;
    const startY = 100;
    const spacingX = 80;
    const spacingY = 80;
    const columns = 5;

    this.kodamons.forEach((kodamon, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // Sprite del Kodamon
      const sprite = this.add.image(x, y, `kodamon-${kodamon.id}`);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.seleccionarKodamon(index));
      sprite.on('pointerover', () => this.previsualizarKodamon(index));

      this.kodamonSprites.push(sprite);

      // Nombre debajo del sprite
      this.add
        .text(x, y + 40, kodamon.nombre, {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
    });
  }

  private crearSelector(): void {
    this.selectorRect = this.add.graphics();
    this.selectorRect.lineStyle(3, 0xf0c030, 1);
  }

  private crearPanelInfo(): void {
    const panelX = 256;
    const panelY = 310;

    // Fondo del panel
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(20, panelY - 30, 472, 90, 8);

    // Texto de información
    this.infoText = this.add
      .text(panelX, panelY - 10, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Texto de estadísticas
    this.statsText = this.add
      .text(panelX, panelY + 20, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        color: '#aaaaaa',
        align: 'center',
      })
      .setOrigin(0.5);

    // Instrucciones
    this.add
      .text(panelX, panelY + 45, 'Flechas: Mover | ESPACIO: Seleccionar', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#666666',
      })
      .setOrigin(0.5);
  }

  private configurarInput(): void {
    const keyboard = this.input.keyboard!;

    keyboard.on('keydown-LEFT', () => this.moverSeleccion(-1));
    keyboard.on('keydown-RIGHT', () => this.moverSeleccion(1));
    keyboard.on('keydown-UP', () => this.moverSeleccion(-5));
    keyboard.on('keydown-DOWN', () => this.moverSeleccion(5));
    keyboard.on('keydown-SPACE', () => this.confirmarSeleccion());
    keyboard.on('keydown-ENTER', () => this.confirmarSeleccion());
  }

  private moverSeleccion(delta: number): void {
    const newIndex = this.selectedIndex + delta;
    if (newIndex >= 0 && newIndex < this.kodamons.length) {
      this.selectedIndex = newIndex;
      this.actualizarSeleccion();
    }
  }

  private seleccionarKodamon(index: number): void {
    this.selectedIndex = index;
    this.actualizarSeleccion();
    this.confirmarSeleccion();
  }

  private previsualizarKodamon(index: number): void {
    this.selectedIndex = index;
    this.actualizarSeleccion();
  }

  private actualizarSeleccion(): void {
    const kodamon = this.kodamons[this.selectedIndex];
    const sprite = this.kodamonSprites[this.selectedIndex];
    const tipoConfig = getTipoConfig(kodamon.tipo);

    // Actualizar selector visual
    this.selectorRect.clear();
    this.selectorRect.lineStyle(3, 0xf0c030, 1);
    this.selectorRect.strokeRect(sprite.x - 36, sprite.y - 36, 72, 72);

    // Actualizar info
    this.infoText.setText(
      `${tipoConfig.icono} ${kodamon.nombre} - Tipo ${tipoConfig.nombre}\n${kodamon.descripcion}`
    );

    // Actualizar stats
    const stats = kodamon.estadisticas;
    this.statsText.setText(
      `HP:${stats.hp} ATK:${stats.ataque} DEF:${stats.defensa} ` +
        `SPA:${stats.ataqueEspecial} SPD:${stats.defensaEspecial} VEL:${stats.velocidad}`
    );
  }

  private confirmarSeleccion(): void {
    const kodamonSeleccionado = this.kodamons[this.selectedIndex];

    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('BattleScene', {
        jugador: kodamonSeleccionado,
      });
    });
  }
}
