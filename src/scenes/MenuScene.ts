import Phaser from 'phaser';
import { getAllKodamons, getTipoConfig } from '@data/index';
import type { KodamonData, TipoElemental } from '@game-types/index';
import { FONDOS_DISPONIBLES } from './BootScene';

export class MenuScene extends Phaser.Scene {
  private kodamons: KodamonData[] = [];
  private kodamonsFiltrados: KodamonData[] = [];
  private selectedIndex: number = 0;
  private kodamonSprites: Phaser.GameObjects.Image[] = [];
  private nombreTexts: Phaser.GameObjects.Text[] = [];
  private selectorRect!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private previewSprite!: Phaser.GameObjects.Image;

  // Filtro por tipo
  private filtroActual: TipoElemental | 'todos' = 'todos';
  private filtroButtons: Phaser.GameObjects.Container[] = [];

  // Selector de fondo
  private fondoSeleccionado: number = 0;
  private fondoPreview!: Phaser.GameObjects.Image;
  private fondoNombreText!: Phaser.GameObjects.Text;

  // Modo comparación
  private modoComparacion: boolean = false;
  private kodamonComparar1: KodamonData | null = null;
  private comparacionOverlay: Phaser.GameObjects.Container | null = null;
  private btnCompararText!: Phaser.GameObjects.Text;
  private btnCompararBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.kodamons = getAllKodamons();
    this.kodamonsFiltrados = [...this.kodamons];
    this.selectedIndex = 0;
    this.fondoSeleccionado = 0;
    this.filtroActual = 'todos';

    this.dibujarFondo();
    this.crearTitulo();
    this.crearFiltrosTipo();
    this.crearGridKodamons();
    this.crearSelector();
    this.crearSelectorFondo();
    this.crearBotonAleatorio();
    this.crearBotonComparar();
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

    const startX = 25;
    const y = 72;
    const spacing = 26;

    tipos.forEach((tipo, index) => {
      const x = startX + index * spacing;
      const container = this.add.container(x, y);

      // Fondo del botón
      const bg = this.add.graphics();
      const isSelected = tipo === this.filtroActual;

      if (tipo === 'todos') {
        // Botón "todos" con fondo gris
        bg.fillStyle(isSelected ? 0xf0c030 : 0x444444, 1);
      } else {
        // Botón de tipo con su color
        const config = getTipoConfig(tipo);
        const color = Phaser.Display.Color.HexStringToColor(config.color).color;
        bg.fillStyle(isSelected ? 0xf0c030 : color, isSelected ? 1 : 0.7);
      }
      bg.fillRoundedRect(-10, -8, 20, 16, 4);
      if (isSelected) {
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-10, -8, 20, 16, 4);
      }
      container.add(bg);

      // Icono/texto
      const icono = tipo === 'todos' ? '*' : getTipoConfig(tipo).icono;
      const text = this.add
        .text(0, 0, icono, {
          fontFamily: '"Press Start 2P"',
          fontSize: '8px',
          color: isSelected ? '#000000' : '#ffffff',
        })
        .setOrigin(0.5);
      container.add(text);

      // Interactividad
      container.setSize(20, 16);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => this.aplicarFiltro(tipo));
      container.on('pointerover', () => {
        if (tipo !== this.filtroActual) {
          bg.clear();
          bg.fillStyle(0xffffff, 0.3);
          bg.fillRoundedRect(-10, -8, 20, 16, 4);
        }
      });
      container.on('pointerout', () => {
        if (tipo !== this.filtroActual) {
          bg.clear();
          if (tipo === 'todos') {
            bg.fillStyle(0x444444, 1);
          } else {
            const config = getTipoConfig(tipo);
            const color = Phaser.Display.Color.HexStringToColor(config.color).color;
            bg.fillStyle(color, 0.7);
          }
          bg.fillRoundedRect(-10, -8, 20, 16, 4);
        }
      });

      this.filtroButtons.push(container);
    });
  }

  private aplicarFiltro(tipo: TipoElemental | 'todos'): void {
    if (tipo === this.filtroActual) return;

    this.filtroActual = tipo;

    // Filtrar Kodamons
    if (tipo === 'todos') {
      this.kodamonsFiltrados = [...this.kodamons];
    } else {
      this.kodamonsFiltrados = this.kodamons.filter((k) => k.tipo === tipo);
    }

    // Recrear botones de filtro para actualizar visual
    this.filtroButtons.forEach((b) => b.destroy());
    this.filtroButtons = [];
    this.crearFiltrosTipo();

    // Recrear grid
    this.selectedIndex = 0;
    this.crearGridKodamons();

    // Actualizar selección si hay Kodamons
    if (this.kodamonsFiltrados.length > 0) {
      this.actualizarSeleccion();
    } else {
      // Si no hay Kodamons del tipo, limpiar vista previa
      this.selectorRect.clear();
      this.infoText.setText('Sin resultados');
      this.statsText.setText('');
      this.descText.setText('');
    }
  }

  private crearGridKodamons(): void {
    // Limpiar sprites y textos anteriores
    this.kodamonSprites.forEach((s) => s.destroy());
    this.kodamonSprites = [];
    this.nombreTexts.forEach((t) => t.destroy());
    this.nombreTexts = [];

    // Grid compactado a la izquierda para dejar espacio al panel de vista previa
    const startX = 45;
    const startY = 100; // Ajustado para dejar espacio a los filtros
    const spacingX = 55;
    const spacingY = 70;
    const columns = 5;

    this.kodamonsFiltrados.forEach((kodamon, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // Sprite del Kodamon (reducido)
      const sprite = this.add.image(x, y, `kodamon-${kodamon.id}`);
      sprite.setScale(0.85);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.seleccionarKodamon(index));
      sprite.on('pointerover', () => this.previsualizarKodamon(index));

      this.kodamonSprites.push(sprite);

      // Nombre debajo del sprite
      const nombreText = this.add
        .text(x, y + 35, kodamon.nombre, {
          fontFamily: '"Press Start 2P"',
          fontSize: '5px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.nombreTexts.push(nombreText);
    });
  }

  private crearSelector(): void {
    this.selectorRect = this.add.graphics();
    this.selectorRect.lineStyle(3, 0xf0c030, 1);
  }

  private crearSelectorFondo(): void {
    // Selector de arena movido debajo del grid de Kodamons
    const panelX = 155; // Centrado bajo el grid
    const panelY = 250; // Debajo del grid

    // Título
    this.add
      .text(panelX, panelY - 30, 'ARENA', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#f0c030',
      })
      .setOrigin(0.5);

    // Fondo del panel (horizontal ahora)
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(panelX - 90, panelY - 18, 180, 55, 6);
    g.lineStyle(2, 0xf0c030, 0.5);
    g.strokeRoundedRect(panelX - 90, panelY - 18, 180, 55, 6);

    // Preview del fondo (miniatura más pequeña)
    this.fondoPreview = this.add.image(panelX, panelY + 5, FONDOS_DISPONIBLES[0].id);
    this.fondoPreview.setDisplaySize(60, 40);

    // Nombre del fondo
    this.fondoNombreText = this.add
      .text(panelX, panelY + 32, FONDOS_DISPONIBLES[0].nombre, {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Botones de navegación (a los lados de la preview)
    const btnIzq = this.add
      .text(panelX - 50, panelY + 5, '<', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#f0c030',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const btnDer = this.add
      .text(panelX + 50, panelY + 5, '>', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#f0c030',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btnIzq.on('pointerdown', () => this.cambiarFondo(-1));
    btnDer.on('pointerdown', () => this.cambiarFondo(1));

    btnIzq.on('pointerover', () => btnIzq.setColor('#ffffff'));
    btnIzq.on('pointerout', () => btnIzq.setColor('#f0c030'));
    btnDer.on('pointerover', () => btnDer.setColor('#ffffff'));
    btnDer.on('pointerout', () => btnDer.setColor('#f0c030'));
  }

  private cambiarFondo(delta: number): void {
    this.fondoSeleccionado =
      (this.fondoSeleccionado + delta + FONDOS_DISPONIBLES.length) % FONDOS_DISPONIBLES.length;
    const fondo = FONDOS_DISPONIBLES[this.fondoSeleccionado];
    this.fondoPreview.setTexture(fondo.id);
    this.fondoNombreText.setText(fondo.nombre);
  }

  private crearBotonAleatorio(): void {
    const x = 155;
    const y = 310;

    // Fondo del botón
    const bg = this.add.graphics();
    bg.fillStyle(0x4a6fa5, 1);
    bg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
    bg.lineStyle(2, 0xf0c030, 0.8);
    bg.strokeRoundedRect(x - 55, y - 12, 110, 24, 6);

    // Texto del botón
    const btnText = this.add
      .text(x, y, '? ALEATORIO', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Zona interactiva
    const hitArea = this.add.zone(x, y, 110, 24).setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => this.seleccionarAleatorio());
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xf0c030, 1);
      bg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
      btnText.setColor('#000000');
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a6fa5, 1);
      bg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
      bg.lineStyle(2, 0xf0c030, 0.8);
      bg.strokeRoundedRect(x - 55, y - 12, 110, 24, 6);
      btnText.setColor('#ffffff');
    });
  }

  private seleccionarAleatorio(): void {
    if (this.kodamonsFiltrados.length === 0) return;

    // Seleccionar índice aleatorio
    const randomIndex = Math.floor(Math.random() * this.kodamonsFiltrados.length);
    this.selectedIndex = randomIndex;

    // Efecto visual de "ruleta" rápida antes de mostrar el resultado
    let iterations = 0;
    const maxIterations = 15;
    const interval = 50;

    const ruleta = this.time.addEvent({
      delay: interval,
      callback: () => {
        iterations++;
        // Selección aleatoria temporal
        const tempIndex = Math.floor(Math.random() * this.kodamonsFiltrados.length);
        this.selectedIndex = tempIndex;
        this.actualizarSeleccion();

        if (iterations >= maxIterations) {
          ruleta.destroy();
          // Selección final
          this.selectedIndex = randomIndex;
          this.actualizarSeleccion();

          // Flash del sprite seleccionado
          const sprite = this.kodamonSprites[this.selectedIndex];
          this.tweens.add({
            targets: sprite,
            scale: 1.1,
            duration: 150,
            yoyo: true,
            repeat: 1,
            ease: 'Quad.easeOut',
          });
        }
      },
      repeat: maxIterations - 1,
    });
  }

  private crearBotonComparar(): void {
    const x = 155;
    const y = 340;

    // Fondo del botón
    this.btnCompararBg = this.add.graphics();
    this.btnCompararBg.fillStyle(0x6a4a8a, 1);
    this.btnCompararBg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
    this.btnCompararBg.lineStyle(2, 0xf0c030, 0.8);
    this.btnCompararBg.strokeRoundedRect(x - 55, y - 12, 110, 24, 6);

    // Texto del botón
    this.btnCompararText = this.add
      .text(x, y, 'COMPARAR', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Zona interactiva
    const hitArea = this.add.zone(x, y, 110, 24).setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => this.toggleModoComparacion());
    hitArea.on('pointerover', () => {
      if (!this.modoComparacion) {
        this.btnCompararBg.clear();
        this.btnCompararBg.fillStyle(0xf0c030, 1);
        this.btnCompararBg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
        this.btnCompararText.setColor('#000000');
      }
    });
    hitArea.on('pointerout', () => {
      if (!this.modoComparacion) {
        this.btnCompararBg.clear();
        this.btnCompararBg.fillStyle(0x6a4a8a, 1);
        this.btnCompararBg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
        this.btnCompararBg.lineStyle(2, 0xf0c030, 0.8);
        this.btnCompararBg.strokeRoundedRect(x - 55, y - 12, 110, 24, 6);
        this.btnCompararText.setColor('#ffffff');
      }
    });
  }

  private toggleModoComparacion(): void {
    const x = 155;
    const y = 340;

    this.modoComparacion = !this.modoComparacion;
    this.kodamonComparar1 = null;

    // Actualizar visual del botón
    this.btnCompararBg.clear();
    if (this.modoComparacion) {
      this.btnCompararBg.fillStyle(0xff6666, 1);
      this.btnCompararBg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
      this.btnCompararText.setText('CANCELAR');
      this.btnCompararText.setColor('#ffffff');
    } else {
      this.btnCompararBg.fillStyle(0x6a4a8a, 1);
      this.btnCompararBg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
      this.btnCompararBg.lineStyle(2, 0xf0c030, 0.8);
      this.btnCompararBg.strokeRoundedRect(x - 55, y - 12, 110, 24, 6);
      this.btnCompararText.setText('COMPARAR');
      this.btnCompararText.setColor('#ffffff');
    }
  }

  private seleccionarParaComparar(kodamon: KodamonData): void {
    if (!this.kodamonComparar1) {
      // Primer Kodamon seleccionado
      this.kodamonComparar1 = kodamon;
      this.btnCompararText.setText('ELIGE 2do');
    } else {
      // Segundo Kodamon seleccionado - mostrar comparación
      this.mostrarComparacion(this.kodamonComparar1, kodamon);
    }
  }

  private mostrarComparacion(k1: KodamonData, k2: KodamonData): void {
    // Crear overlay
    this.comparacionOverlay = this.add.container(0, 0);

    // Fondo oscuro
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, 512, 384);
    this.comparacionOverlay.add(overlay);

    // Panel central
    const panel = this.add.graphics();
    panel.fillStyle(0x16213e, 1);
    panel.fillRoundedRect(30, 30, 452, 324, 12);
    panel.lineStyle(3, 0xf0c030, 1);
    panel.strokeRoundedRect(30, 30, 452, 324, 12);
    this.comparacionOverlay.add(panel);

    // Título
    const titulo = this.add
      .text(256, 50, 'COMPARACION', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#f0c030',
      })
      .setOrigin(0.5);
    this.comparacionOverlay.add(titulo);

    // === Kodamon 1 (izquierda) ===
    const x1 = 140;
    this.crearPanelKodamon(k1, x1, this.comparacionOverlay);

    // === Kodamon 2 (derecha) ===
    const x2 = 372;
    this.crearPanelKodamon(k2, x2, this.comparacionOverlay);

    // === Barras de comparación en el centro ===
    const statsNames = ['HP', 'ATK', 'DEF', 'SPA', 'SPD', 'VEL'];
    const statsKeys: (keyof KodamonData['estadisticas'])[] = [
      'hp',
      'ataque',
      'defensa',
      'ataqueEspecial',
      'defensaEspecial',
      'velocidad',
    ];
    const startY = 180;

    statsKeys.forEach((key, i) => {
      const y = startY + i * 22;
      const val1 = k1.estadisticas[key];
      const val2 = k2.estadisticas[key];

      // Nombre del stat
      const statLabel = this.add
        .text(256, y, statsNames[i], {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: '#aaaaaa',
        })
        .setOrigin(0.5);
      this.comparacionOverlay!.add(statLabel);

      // Valor y barra izquierda
      const color1 = val1 > val2 ? 0x44ff88 : val1 < val2 ? 0xff6666 : 0xaaaaaa;
      const bar1Bg = this.add.graphics();
      bar1Bg.fillStyle(0x333333, 1);
      bar1Bg.fillRoundedRect(70, y + 8, 100, 8, 2);
      this.comparacionOverlay!.add(bar1Bg);

      const bar1 = this.add.graphics();
      bar1.fillStyle(color1, 1);
      bar1.fillRoundedRect(70, y + 8, Math.min(100, (val1 / 150) * 100), 8, 2);
      this.comparacionOverlay!.add(bar1);

      const val1Text = this.add
        .text(175, y + 12, `${val1}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: Phaser.Display.Color.IntegerToColor(color1).rgba,
        })
        .setOrigin(1, 0.5);
      this.comparacionOverlay!.add(val1Text);

      // Valor y barra derecha
      const color2 = val2 > val1 ? 0x44ff88 : val2 < val1 ? 0xff6666 : 0xaaaaaa;
      const bar2Bg = this.add.graphics();
      bar2Bg.fillStyle(0x333333, 1);
      bar2Bg.fillRoundedRect(342, y + 8, 100, 8, 2);
      this.comparacionOverlay!.add(bar2Bg);

      const bar2 = this.add.graphics();
      bar2.fillStyle(color2, 1);
      bar2.fillRoundedRect(342, y + 8, Math.min(100, (val2 / 150) * 100), 8, 2);
      this.comparacionOverlay!.add(bar2);

      const val2Text = this.add
        .text(337, y + 12, `${val2}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: Phaser.Display.Color.IntegerToColor(color2).rgba,
        })
        .setOrigin(0, 0.5);
      this.comparacionOverlay!.add(val2Text);
    });

    // Botón cerrar
    const closeBtn = this.add
      .text(256, 340, 'CERRAR', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#ff4444',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.cerrarComparacion());
    closeBtn.on('pointerover', () => closeBtn.setBackgroundColor('#ff6666'));
    closeBtn.on('pointerout', () => closeBtn.setBackgroundColor('#ff4444'));
    this.comparacionOverlay.add(closeBtn);
  }

  private crearPanelKodamon(
    kodamon: KodamonData,
    x: number,
    container: Phaser.GameObjects.Container
  ): void {
    const tipoConfig = getTipoConfig(kodamon.tipo);

    // Sprite
    const sprite = this.add.image(x, 110, `kodamon-${kodamon.id}`);
    sprite.setScale(1.2);
    container.add(sprite);

    // Nombre
    const nombre = this.add
      .text(x, 150, kodamon.nombre, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    container.add(nombre);

    // Tipo
    const tipo = this.add
      .text(x, 165, `${tipoConfig.icono} ${tipoConfig.nombre}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: tipoConfig.color,
      })
      .setOrigin(0.5);
    container.add(tipo);
  }

  private cerrarComparacion(): void {
    if (this.comparacionOverlay) {
      this.comparacionOverlay.destroy();
      this.comparacionOverlay = null;
    }
    this.modoComparacion = false;
    this.kodamonComparar1 = null;

    // Restaurar botón
    const x = 155;
    const y = 340;
    this.btnCompararBg.clear();
    this.btnCompararBg.fillStyle(0x6a4a8a, 1);
    this.btnCompararBg.fillRoundedRect(x - 55, y - 12, 110, 24, 6);
    this.btnCompararBg.lineStyle(2, 0xf0c030, 0.8);
    this.btnCompararBg.strokeRoundedRect(x - 55, y - 12, 110, 24, 6);
    this.btnCompararText.setText('COMPARAR');
    this.btnCompararText.setColor('#ffffff');
  }

  private crearPanelInfo(): void {
    // Panel de Vista Previa - lado derecho de la pantalla
    const panelX = 400; // Centro del panel de preview

    // Fondo del panel de vista previa
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.8);
    g.fillRoundedRect(300, 70, 200, 240, 10);
    g.lineStyle(2, 0xf0c030, 0.6);
    g.strokeRoundedRect(300, 70, 200, 240, 10);

    // Título del panel
    this.add
      .text(panelX, 85, 'VISTA PREVIA', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#f0c030',
      })
      .setOrigin(0.5);

    // Texto de información (nombre + tipo) - justo debajo del título
    this.infoText = this.add
      .text(panelX, 105, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Sprite de vista previa (más grande que en el grid)
    // Se inicializa con el primer Kodamon y se actualiza en actualizarSeleccion()
    this.previewSprite = this.add.image(panelX, 160, `kodamon-${this.kodamonsFiltrados[0].id}`);
    this.previewSprite.setScale(1.5); // 1.5x más grande que el original

    // Texto de estadísticas (formato vertical para mejor legibilidad)
    this.statsText = this.add
      .text(panelX, 225, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#aaaaaa',
        align: 'left',
        lineSpacing: 4,
      })
      .setOrigin(0.5);

    // Descripción del Kodamon
    this.descText = this.add
      .text(panelX, 285, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '5px',
        color: '#888888',
        align: 'center',
        wordWrap: { width: 180 },
      })
      .setOrigin(0.5);

    // Instrucciones en la parte inferior de la pantalla
    this.add
      .text(256, 370, 'Flechas: Mover | ESPACIO: Seleccionar', {
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
    if (newIndex >= 0 && newIndex < this.kodamonsFiltrados.length) {
      this.selectedIndex = newIndex;
      this.actualizarSeleccion();
    }
  }

  private seleccionarKodamon(index: number): void {
    this.selectedIndex = index;
    this.actualizarSeleccion();

    if (this.modoComparacion) {
      this.seleccionarParaComparar(this.kodamonsFiltrados[index]);
    } else {
      this.confirmarSeleccion();
    }
  }

  private previsualizarKodamon(index: number): void {
    this.selectedIndex = index;
    this.actualizarSeleccion();
  }

  private actualizarSeleccion(): void {
    const kodamon = this.kodamonsFiltrados[this.selectedIndex];
    const sprite = this.kodamonSprites[this.selectedIndex];
    const tipoConfig = getTipoConfig(kodamon.tipo);

    // Actualizar selector visual en el grid (ajustado al nuevo tamaño de sprites)
    this.selectorRect.clear();
    this.selectorRect.lineStyle(2, 0xf0c030, 1);
    this.selectorRect.strokeRect(sprite.x - 30, sprite.y - 30, 60, 60);

    // Actualizar sprite de vista previa
    this.previewSprite.setTexture(`kodamon-${kodamon.id}`);

    // Actualizar info (nombre + tipo)
    this.infoText.setText(`${tipoConfig.icono} ${kodamon.nombre}`);

    // Actualizar stats (formato vertical para mejor legibilidad)
    const stats = kodamon.estadisticas;
    this.statsText.setText(
      `HP: ${stats.hp}  ATK: ${stats.ataque}  DEF: ${stats.defensa}\n` +
        `SPA: ${stats.ataqueEspecial}  SPD: ${stats.defensaEspecial}  VEL: ${stats.velocidad}`
    );

    // Actualizar descripción
    this.descText.setText(kodamon.descripcion);
  }

  private confirmarSeleccion(): void {
    if (this.kodamonsFiltrados.length === 0) return;
    const kodamonSeleccionado = this.kodamonsFiltrados[this.selectedIndex];
    const fondoId = FONDOS_DISPONIBLES[this.fondoSeleccionado].id;

    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('BattleScene', {
        jugador: kodamonSeleccionado,
        fondoId: fondoId,
      });
    });
  }
}
