import Phaser from 'phaser';
import { getAllKodamons, getTipoConfig } from '@data/index';
import type {
  KodamonData,
  TipoElemental,
  MenuToModeData,
  ModeToBattleData,
  MultiplayerState,
} from '@game-types/index';
import { FONDOS_DISPONIBLES } from './BootScene';
import { CYBER_THEME, drawCyberPanel, drawCyberGrid } from '@ui/theme';
import { AudioManager } from '@systems/AudioManager';
import { AudioControls } from '@ui/AudioControls';

interface MenuSceneData {
  mode?: 'normal' | 'player2Select';
  player1KodamonId?: string;
  arenaId?: string;
}

export class MenuScene extends Phaser.Scene {
  private kodamons: KodamonData[] = [];
  private kodamonsFiltrados: KodamonData[] = [];
  private selectedIndex: number = 0;
  private kodamonCards: Phaser.GameObjects.Container[] = [];
  private selectorGlow!: Phaser.GameObjects.Graphics;
  private previewSprite!: Phaser.GameObjects.Image;
  private previewName!: Phaser.GameObjects.Text;
  private previewType!: Phaser.GameObjects.Text;
  private statsTexts: Phaser.GameObjects.Text[] = [];
  private statsValues: Phaser.GameObjects.Text[] = [];

  // Filtro por tipo
  private filtroActual: TipoElemental | 'todos' = 'todos';
  private filtroButtons: Phaser.GameObjects.Container[] = [];

  // Selector de fondo
  private fondoSeleccionado: number = 0;
  private fondoPreview!: Phaser.GameObjects.Image;
  private fondoNombreText!: Phaser.GameObjects.Text;

  // Grid animado
  private gridGraphics!: Phaser.GameObjects.Graphics;

  // Audio
  private audio!: AudioManager;

  // Modo de selección (normal o jugador 2 para multijugador)
  private menuMode: 'normal' | 'player2Select' = 'normal';
  private player1KodamonId: string = '';
  private player1ArenaId: string = '';

  // Layout constants
  private readonly LEFT_CENTER_X = 155;
  private readonly RIGHT_PANEL_X = 350;

  // Vertical layout - centrado con padding equilibrado (~57px top/bottom)
  // Canvas height: 384px
  // Left column: Title(70) -> Filter(125) -> Grid(190-290) -> Instructions(320)
  // Right column: PanelData(38-183) -> PanelArena(193-278) -> Buttons(303-345)
  private readonly PADDING_TOP_LEFT = 70;
  private readonly PADDING_TOP_RIGHT = 38;

  constructor() {
    super({ key: 'MenuScene' });
  }

  init(data?: MenuSceneData): void {
    this.menuMode = data?.mode ?? 'normal';
    this.player1KodamonId = data?.player1KodamonId ?? '';
    this.player1ArenaId = data?.arenaId ?? '';
  }

  create(): void {
    // Reset de arrays para evitar referencias corruptas al reiniciar escena
    this.kodamonCards = [];
    this.filtroButtons = [];
    this.statsTexts = [];
    this.statsValues = [];

    // Inicializar audio
    this.audio = new AudioManager(this);
    this.audio.playMusic('menu');

    // Control de audio (esquina superior derecha)
    new AudioControls(this, {
      x: 495,
      y: 17,
      audio: this.audio,
    });

    this.kodamons = getAllKodamons();
    this.kodamonsFiltrados = [...this.kodamons];
    this.selectedIndex = 0;
    this.fondoSeleccionado = 0;
    this.filtroActual = 'todos';

    this.dibujarFondo();
    this.crearTitulo();
    this.crearFiltrosTipo();
    this.crearGridKodamons();
    this.crearPanelPreview();
    this.crearPanelArena();
    this.crearBotonesAccion();
    this.crearInstrucciones();
    this.configurarInput();

    this.actualizarSeleccion();
  }

  private dibujarFondo(): void {
    const { width, height } = this.cameras.main;

    // Gradiente de fondo
    const bg = this.add.graphics();
    for (let i = 0; i < height; i++) {
      const t = i / height;
      const r = Math.floor(10 + t * 16);
      const g = Math.floor(10 + t * 16);
      const b = Math.floor(26 + t * 32);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, i, width, 1);
    }

    // Grid cyberpunk
    this.gridGraphics = this.add.graphics();
    drawCyberGrid(this.gridGraphics, width, height, 30, 0.08);

    // Animación del grid
    this.tweens.add({
      targets: this.gridGraphics,
      alpha: { from: 0.5, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Líneas decorativas superiores
    const deco = this.add.graphics();
    deco.fillStyle(CYBER_THEME.colors.cyan, 0.3);
    deco.fillRect(0, 0, width, 2);
    deco.fillStyle(CYBER_THEME.colors.pink, 0.2);
    deco.fillRect(0, 3, width, 1);

    // Línea separadora vertical
    const separator = this.add.graphics();
    separator.fillStyle(CYBER_THEME.colors.cyan, 0.15);
    separator.fillRect(310, 10, 1, 364);
  }

  private crearTitulo(): void {
    const baseY = this.PADDING_TOP_LEFT;

    // Título diferente según el modo
    const isPlayer2Select = this.menuMode === 'player2Select';
    const titleText = isPlayer2Select ? 'PLAYER 2' : 'KODAMON';
    const subtitleText = isPlayer2Select ? 'SELECT YOUR KODAMON' : 'DIGITAL BATTLES';
    const titleColor = isPlayer2Select ? CYBER_THEME.colors.pinkHex : CYBER_THEME.colors.whiteHex;
    const glowColor = isPlayer2Select ? CYBER_THEME.colors.pinkHex : CYBER_THEME.colors.cyanHex;

    // Logo principal - centrado en columna izquierda
    const logo = this.add
      .text(this.LEFT_CENTER_X, baseY, titleText, {
        fontFamily: 'Orbitron',
        fontSize: '26px',
        fontStyle: 'bold',
        color: titleColor,
      })
      .setOrigin(0.5);

    // Efecto glow
    logo.setShadow(0, 0, glowColor, 12, true, true);

    // Subtítulo
    this.add
      .text(this.LEFT_CENTER_X, baseY + 23, subtitleText, {
        fontFamily: 'Rajdhani',
        fontSize: '10px',
        color: CYBER_THEME.colors.pinkHex,
        letterSpacing: 4,
      })
      .setOrigin(0.5);
  }

  private crearFiltrosTipo(): void {
    const tipos: (TipoElemental | 'todos')[] = [
      'todos',
      'fuego',
      'agua',
      'planta',
      'electrico',
      'tierra',
      'hielo',
      'volador',
      'roca',
      'normal',
      'fantasma',
    ];

    const totalWidth = tipos.length * 22;
    const startX = this.LEFT_CENTER_X - totalWidth / 2 + 11;
    const filterY = this.PADDING_TOP_LEFT + 55;

    // Etiqueta FILTER centrada
    this.add
      .text(this.LEFT_CENTER_X, filterY, 'FILTER', {
        fontFamily: 'Orbitron',
        fontSize: '7px',
        color: CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    const buttonsY = filterY + 14;
    tipos.forEach((tipo, index) => {
      const x = startX + index * 22;
      const container = this.add.container(x, buttonsY);
      const isSelected = tipo === this.filtroActual;

      // Fondo del botón
      const bg = this.add.graphics();
      let color: number = CYBER_THEME.colors.panel;

      if (tipo !== 'todos') {
        const tipoColor = CYBER_THEME.tipos[tipo as TipoElemental];
        color = tipoColor ? tipoColor.color : CYBER_THEME.colors.panel;
      }

      if (isSelected) {
        bg.fillStyle(CYBER_THEME.colors.cyan, 1);
        bg.lineStyle(1, CYBER_THEME.colors.white, 0.8);
      } else {
        bg.fillStyle(color, 0.6);
        bg.lineStyle(1, CYBER_THEME.colors.cyan, 0.3);
      }
      bg.fillRoundedRect(-9, -7, 18, 14, 2);
      bg.strokeRoundedRect(-9, -7, 18, 14, 2);
      container.add(bg);

      // Icono
      const icono = tipo === 'todos' ? '✱' : getTipoConfig(tipo).icono;
      const text = this.add
        .text(0, 0, icono, {
          fontFamily: 'Orbitron',
          fontSize: '9px',
          color: isSelected ? CYBER_THEME.colors.darkHex : CYBER_THEME.colors.whiteHex,
        })
        .setOrigin(0.5);
      container.add(text);

      // Interactividad
      container.setSize(18, 14);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        this.audio.playUI('click');
        this.aplicarFiltro(tipo);
      });
      container.on('pointerover', () => {
        this.audio.playUI('hover');
        if (tipo !== this.filtroActual) {
          bg.clear();
          bg.fillStyle(CYBER_THEME.colors.cyan, 0.3);
          bg.lineStyle(1, CYBER_THEME.colors.cyan, 0.8);
          bg.fillRoundedRect(-9, -7, 18, 14, 2);
          bg.strokeRoundedRect(-9, -7, 18, 14, 2);
        }
      });
      container.on('pointerout', () => {
        if (tipo !== this.filtroActual) {
          bg.clear();
          bg.fillStyle(color, 0.6);
          bg.lineStyle(1, CYBER_THEME.colors.cyan, 0.3);
          bg.fillRoundedRect(-9, -7, 18, 14, 2);
          bg.strokeRoundedRect(-9, -7, 18, 14, 2);
        }
      });

      this.filtroButtons.push(container);
    });
  }

  private aplicarFiltro(tipo: TipoElemental | 'todos'): void {
    if (tipo === this.filtroActual) return;

    this.filtroActual = tipo;

    if (tipo === 'todos') {
      this.kodamonsFiltrados = [...this.kodamons];
    } else {
      this.kodamonsFiltrados = this.kodamons.filter((k) => k.tipo === tipo);
    }

    // Recrear filtros y grid
    this.filtroButtons.forEach((b) => b.destroy());
    this.filtroButtons = [];
    this.crearFiltrosTipo();

    this.selectedIndex = 0;
    this.crearGridKodamons();

    if (this.kodamonsFiltrados.length > 0) {
      this.actualizarSeleccion();
    }
  }

  private crearGridKodamons(): void {
    // Limpiar cards anteriores
    this.kodamonCards.forEach((c) => c.destroy());
    this.kodamonCards = [];
    if (this.selectorGlow) this.selectorGlow.destroy();

    // Crear selector glow
    this.selectorGlow = this.add.graphics();

    // Layout: grid 5x2 centrado en columna izquierda
    const cardW = 50;
    const spacingX = 55;
    const spacingY = 70;
    const columns = 5;
    const rows = 2;

    const gridWidth = columns * spacingX - (spacingX - cardW);
    const startX = this.LEFT_CENTER_X - gridWidth / 2 + cardW / 2;
    // Grid center of first row: filter buttons end (~124) + gap + half card height
    const startY = this.PADDING_TOP_LEFT + 120;

    this.kodamonsFiltrados.forEach((kodamon, index) => {
      if (index >= columns * rows) return; // Limitar a 10

      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const card = this.crearKodamonCard(kodamon, x, y, index);
      this.kodamonCards.push(card);
    });
  }

  private crearKodamonCard(
    kodamon: KodamonData,
    x: number,
    y: number,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const tipoConfig = getTipoConfig(kodamon.tipo);
    const tipoColor = Phaser.Display.Color.HexStringToColor(tipoConfig.color).color;

    // Fondo de la card con estilo angular
    const bg = this.add.graphics();
    bg.fillStyle(CYBER_THEME.colors.panel, 0.8);
    bg.lineStyle(1, CYBER_THEME.colors.cyan, 0.3);

    // Forma angular
    const w = 48;
    const h = 60;
    const cut = 6;
    bg.beginPath();
    bg.moveTo(-w / 2 + cut, -h / 2);
    bg.lineTo(w / 2, -h / 2);
    bg.lineTo(w / 2, h / 2 - cut);
    bg.lineTo(w / 2 - cut, h / 2);
    bg.lineTo(-w / 2, h / 2);
    bg.lineTo(-w / 2, -h / 2 + cut);
    bg.closePath();
    bg.fillPath();
    bg.strokePath();

    // Línea de acento superior (color del tipo)
    bg.fillStyle(tipoColor, 0.8);
    bg.fillRect(-w / 2 + cut, -h / 2, w - cut, 2);

    container.add(bg);

    // Icono del tipo (esquina superior derecha) - estilo Cyber
    const iconBg = this.add.graphics();
    iconBg.fillStyle(tipoColor, 0.9);
    iconBg.fillCircle(w / 2 - 10, -h / 2 + 10, 8);
    iconBg.lineStyle(1, 0xffffff, 0.4);
    iconBg.strokeCircle(w / 2 - 10, -h / 2 + 10, 8);
    container.add(iconBg);

    const tipoIconText = this.add
      .text(w / 2 - 10, -h / 2 + 10, tipoConfig.icono, {
        fontFamily: 'Orbitron',
        fontSize: '9px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    container.add(tipoIconText);

    // Sprite
    const sprite = this.add.image(0, -2, `kodamon-${kodamon.id}`);
    sprite.setScale(0.6);
    container.add(sprite);

    // Nombre
    const nombre = this.add
      .text(0, 23, kodamon.nombre.toUpperCase(), {
        fontFamily: 'Rajdhani',
        fontSize: '7px',
        fontStyle: 'bold',
        color: CYBER_THEME.colors.whiteHex,
      })
      .setOrigin(0.5);
    container.add(nombre);

    // Interactividad
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      this.audio.playUI('select');
      this.seleccionarKodamon(index);
    });
    container.on('pointerover', () => {
      this.audio.playUI('hover');
      this.previsualizarKodamon(index);
    });

    return container;
  }

  private crearPanelPreview(): void {
    const panelX = this.RIGHT_PANEL_X;
    const panelY = this.PADDING_TOP_RIGHT;
    const panelW = 150;
    const panelH = 145;

    // Panel con estilo cyber
    const panel = this.add.graphics();
    drawCyberPanel(panel, panelX, panelY, panelW, panelH, {
      accentSide: 'left',
      accentColor: CYBER_THEME.colors.cyan,
      cornerCut: 10,
    });

    // Título
    this.add
      .text(panelX + panelW / 2, panelY + 12, 'KODAMON DATA', {
        fontFamily: 'Orbitron',
        fontSize: '9px',
        color: CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5);

    // Sprite preview
    this.previewSprite = this.add.image(
      panelX + 42,
      panelY + 65,
      `kodamon-${this.kodamonsFiltrados[0].id}`
    );
    this.previewSprite.setScale(1.2);

    // Nombre
    this.previewName = this.add.text(panelX + 88, panelY + 32, '', {
      fontFamily: 'Orbitron',
      fontSize: '11px',
      fontStyle: 'bold',
      color: CYBER_THEME.colors.whiteHex,
    });

    // Tipo
    this.previewType = this.add.text(panelX + 88, panelY + 48, '', {
      fontFamily: 'Rajdhani',
      fontSize: '9px',
      color: CYBER_THEME.colors.pinkHex,
    });

    // Stats (2 columnas)
    const statsNames = ['HP', 'ATK', 'DEF', 'SPD'];
    const statsStartX = panelX + 88;
    const statsStartY = panelY + 70;

    statsNames.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = statsStartX + col * 32;
      const sy = statsStartY + row * 20;

      const label = this.add.text(sx, sy, stat, {
        fontFamily: 'Rajdhani',
        fontSize: '7px',
        color: CYBER_THEME.colors.pinkHex,
      });
      this.statsTexts.push(label);

      const value = this.add.text(sx, sy + 9, '000', {
        fontFamily: 'Orbitron',
        fontSize: '10px',
        color: CYBER_THEME.colors.cyanHex,
      });
      this.statsValues.push(value);
    });
  }

  private crearPanelArena(): void {
    const panelX = this.RIGHT_PANEL_X;
    // Position below Panel Preview (PADDING_TOP_RIGHT + 145 + 10 gap)
    const panelY = this.PADDING_TOP_RIGHT + 155;
    const panelW = 150;
    const panelH = 85;

    // Panel
    const panel = this.add.graphics();
    drawCyberPanel(panel, panelX, panelY, panelW, panelH, {
      accentSide: 'left',
      accentColor: CYBER_THEME.colors.pink,
      cornerCut: 8,
    });

    // Título
    this.add
      .text(panelX + panelW / 2, panelY + 12, 'ARENA SELECT', {
        fontFamily: 'Orbitron',
        fontSize: '9px',
        color: CYBER_THEME.colors.pinkHex,
      })
      .setOrigin(0.5);

    // Preview del fondo
    this.fondoPreview = this.add.image(panelX + panelW / 2, panelY + 45, FONDOS_DISPONIBLES[0].id);
    this.fondoPreview.setDisplaySize(95, 48);

    // Nombre
    this.fondoNombreText = this.add
      .text(panelX + panelW / 2, panelY + 75, FONDOS_DISPONIBLES[0].nombre, {
        fontFamily: 'Rajdhani',
        fontSize: '8px',
        color: CYBER_THEME.colors.whiteHex,
      })
      .setOrigin(0.5);

    // Botones navegación
    const btnStyle = {
      fontFamily: 'Orbitron',
      fontSize: '16px',
      color: CYBER_THEME.colors.cyanHex,
    };

    const btnIzq = this.add
      .text(panelX + 12, panelY + 45, '‹', btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const btnDer = this.add
      .text(panelX + panelW - 12, panelY + 45, '›', btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btnIzq.on('pointerdown', () => {
      this.audio.playUI('click');
      this.cambiarFondo(-1);
    });
    btnDer.on('pointerdown', () => {
      this.audio.playUI('click');
      this.cambiarFondo(1);
    });
    btnIzq.on('pointerover', () => {
      this.audio.playUI('hover');
      btnIzq.setColor(CYBER_THEME.colors.whiteHex);
    });
    btnIzq.on('pointerout', () => btnIzq.setColor(CYBER_THEME.colors.cyanHex));
    btnDer.on('pointerover', () => {
      this.audio.playUI('hover');
      btnDer.setColor(CYBER_THEME.colors.whiteHex);
    });
    btnDer.on('pointerout', () => btnDer.setColor(CYBER_THEME.colors.cyanHex));
  }

  private cambiarFondo(delta: number): void {
    this.fondoSeleccionado =
      (this.fondoSeleccionado + delta + FONDOS_DISPONIBLES.length) % FONDOS_DISPONIBLES.length;
    const fondo = FONDOS_DISPONIBLES[this.fondoSeleccionado];
    this.fondoPreview.setTexture(fondo.id);
    this.fondoNombreText.setText(fondo.nombre);
  }

  private crearBotonesAccion(): void {
    const btnX = this.RIGHT_PANEL_X + 75;
    // Position below Panel Arena (PADDING_TOP_RIGHT + 155 + 85 + 25 gap)
    const btnY = this.PADDING_TOP_RIGHT + 265;

    // Botón CONNECT (principal)
    this.crearBotonCyber(btnX, btnY, 'CONNECT', true, () => this.confirmarSeleccion());

    // Botón RANDOM
    this.crearBotonCyber(btnX, btnY + 30, 'RANDOM', false, () => this.seleccionarAleatorio());
  }

  private crearBotonCyber(
    x: number,
    y: number,
    texto: string,
    primary: boolean,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 110;
    const h = 24;

    const bg = this.add.graphics();

    const drawButton = (hover: boolean) => {
      bg.clear();
      if (primary) {
        if (hover) {
          bg.fillStyle(CYBER_THEME.colors.cyan, 1);
        } else {
          bg.fillGradientStyle(
            CYBER_THEME.colors.cyan,
            CYBER_THEME.colors.purple,
            CYBER_THEME.colors.cyan,
            CYBER_THEME.colors.purple,
            1
          );
        }
      } else {
        bg.fillStyle(hover ? CYBER_THEME.colors.cyan : CYBER_THEME.colors.panel, hover ? 0.3 : 0.8);
        bg.lineStyle(1, CYBER_THEME.colors.cyan, hover ? 1 : 0.5);
      }

      // Forma angular
      const cut = 6;
      bg.beginPath();
      bg.moveTo(-w / 2 + cut, -h / 2);
      bg.lineTo(w / 2, -h / 2);
      bg.lineTo(w / 2 - cut, h / 2);
      bg.lineTo(-w / 2, h / 2);
      bg.closePath();
      bg.fillPath();
      if (!primary) bg.strokePath();
    };

    drawButton(false);
    container.add(bg);

    const label = this.add
      .text(0, 0, texto, {
        fontFamily: 'Orbitron',
        fontSize: '11px',
        fontStyle: 'bold',
        color: primary ? CYBER_THEME.colors.darkHex : CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5);
    container.add(label);

    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      this.audio.playUI('select');
      callback();
    });
    container.on('pointerover', () => {
      this.audio.playUI('hover');
      drawButton(true);
      if (!primary) label.setColor(CYBER_THEME.colors.whiteHex);
    });
    container.on('pointerout', () => {
      drawButton(false);
      if (!primary) label.setColor(CYBER_THEME.colors.cyanHex);
    });

    return container;
  }

  private seleccionarAleatorio(): void {
    if (this.kodamonsFiltrados.length === 0) return;

    const randomIndex = Math.floor(Math.random() * this.kodamonsFiltrados.length);
    let iterations = 0;
    const maxIterations = 12;

    const ruleta = this.time.addEvent({
      delay: 60,
      callback: () => {
        iterations++;
        this.audio.playUI('click');
        const tempIndex = Math.floor(Math.random() * this.kodamonsFiltrados.length);
        this.selectedIndex = tempIndex;
        this.actualizarSeleccion();

        if (iterations >= maxIterations) {
          ruleta.destroy();
          this.selectedIndex = randomIndex;
          this.actualizarSeleccion();

          // Flash effect
          const card = this.kodamonCards[this.selectedIndex];
          if (card) {
            this.tweens.add({
              targets: card,
              scaleX: 1.15,
              scaleY: 1.15,
              duration: 100,
              yoyo: true,
              repeat: 1,
            });
          }
        }
      },
      repeat: maxIterations - 1,
    });
  }

  private crearInstrucciones(): void {
    // Grid bottom is at PADDING_TOP_LEFT + 120 + 70 + 30 = 275
    // Instructions positioned below with gap for balanced bottom padding
    const instructionsY = this.PADDING_TOP_LEFT + 250;

    this.add
      .text(this.LEFT_CENTER_X, instructionsY, 'ARROWS: Move | SPACE: Select', {
        fontFamily: 'Rajdhani',
        fontSize: '8px',
        color: CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5)
      .setAlpha(0.6);
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
    if (newIndex >= 0 && newIndex < this.kodamonsFiltrados.length) {
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
    if (this.kodamonsFiltrados.length === 0) return;

    const kodamon = this.kodamonsFiltrados[this.selectedIndex];
    const card = this.kodamonCards[this.selectedIndex];
    if (!card) return;

    const tipoConfig = getTipoConfig(kodamon.tipo);

    // Actualizar glow del selector
    this.selectorGlow.clear();
    this.selectorGlow.lineStyle(2, CYBER_THEME.colors.cyan, 1);

    const w = 52;
    const h = 64;
    const cut = 6;
    const cx = card.x;
    const cy = card.y;

    this.selectorGlow.beginPath();
    this.selectorGlow.moveTo(cx - w / 2 + cut, cy - h / 2);
    this.selectorGlow.lineTo(cx + w / 2, cy - h / 2);
    this.selectorGlow.lineTo(cx + w / 2, cy + h / 2 - cut);
    this.selectorGlow.lineTo(cx + w / 2 - cut, cy + h / 2);
    this.selectorGlow.lineTo(cx - w / 2, cy + h / 2);
    this.selectorGlow.lineTo(cx - w / 2, cy - h / 2 + cut);
    this.selectorGlow.closePath();
    this.selectorGlow.strokePath();

    // Actualizar preview
    this.previewSprite.setTexture(`kodamon-${kodamon.id}`);
    this.previewName.setText(kodamon.nombre.toUpperCase());
    this.previewType.setText(tipoConfig.nombre.toUpperCase());
    this.previewType.setColor(tipoConfig.color);

    // Actualizar stats
    const stats = kodamon.estadisticas;
    const values = [stats.hp, stats.ataque, stats.defensa, stats.velocidad];
    values.forEach((val, i) => {
      this.statsValues[i].setText(val.toString().padStart(3, '0'));
    });
  }

  private confirmarSeleccion(): void {
    if (this.kodamonsFiltrados.length === 0) return;
    const kodamonSeleccionado = this.kodamonsFiltrados[this.selectedIndex];
    const fondoId = FONDOS_DISPONIBLES[this.fondoSeleccionado].id;

    // Efecto de transición cyber
    const flash = this.add.graphics();
    flash.fillStyle(CYBER_THEME.colors.cyan, 0);
    flash.fillRect(0, 0, 512, 384);

    this.tweens.add({
      targets: flash,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.cameras.main.fade(300, 10, 10, 26);
        this.time.delayedCall(300, () => {
          if (this.menuMode === 'player2Select') {
            // Modo multijugador: ir directamente a batalla
            const multiplayerState: MultiplayerState = {
              player1KodamonId: this.player1KodamonId,
              player2KodamonId: kodamonSeleccionado.id,
              arenaId: this.player1ArenaId,
            };

            const battleData: ModeToBattleData = {
              mode: 'multijugador',
              playerKodamonId: this.player1KodamonId,
              enemyKodamonId: kodamonSeleccionado.id,
              arenaId: this.player1ArenaId,
              multiplayerState,
            };

            this.audio.stopMusic(0);
            this.scene.start('BattleScene', battleData);
          } else {
            // Modo normal: ir a selección de modo
            const modeData: MenuToModeData = {
              playerKodamonId: kodamonSeleccionado.id,
              arenaId: fondoId,
            };
            // Detener música antes de cambiar de escena
            this.sound.stopAll();
            this.scene.start('ModeSelectScene', modeData);
          }
        });
      },
    });
  }

  /**
   * Limpieza al cerrar la escena para evitar errores de tweens huérfanos
   */
  shutdown(): void {
    // Detener todos los tweens de esta escena
    this.tweens.killAll();

    // Detener todos los timers
    this.time.removeAllEvents();

    // Limpiar audio
    if (this.audio) {
      this.audio.destroy();
    }

    // Limpiar arrays de referencias
    this.kodamonCards = [];
    this.filtroButtons = [];
    this.statsTexts = [];
    this.statsValues = [];
  }
}
