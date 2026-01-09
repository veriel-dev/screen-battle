import Phaser from 'phaser';
import { CYBER_THEME, drawCyberPanel, drawCyberGrid, CYBER_TEXT_STYLES } from '@ui/theme';
import { getPersistenceManager } from '@systems/PersistenceManager';
import { AudioManager } from '@systems/AudioManager';
import { AudioControls } from '@ui/AudioControls';
import { GridRunners } from '@ui/GridRunners';
import type {
  GameMode,
  MenuToModeData,
  ModeToBattleData,
  TournamentState,
  SurvivalState,
} from '@game-types/index';
import { getAllKodamons, getKodamon } from '@data/kodamons';

interface ModeOption {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
}

const MODES: ModeOption[] = [
  {
    id: 'libre',
    name: 'BATALLA LIBRE',
    description: 'Batalla individual contra la IA',
    icon: '⚔️',
  },
  {
    id: 'torneo',
    name: 'TORNEO',
    description: '4 rondas, HP persistente',
    icon: '🏆',
  },
  {
    id: 'supervivencia',
    name: 'SUPERVIVENCIA',
    description: 'Oleadas infinitas hasta caer',
    icon: '🛡️',
  },
  {
    id: 'multijugador',
    name: 'MULTIJUGADOR',
    description: '2 jugadores locales',
    icon: '👥',
  },
];

export class ModeSelectScene extends Phaser.Scene {
  private audio!: AudioManager;
  private gridRunners!: GridRunners;
  private playerKodamonId: string = '';
  private arenaId: string = '';
  private selectedMode: GameMode = 'libre';
  private modeButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'ModeSelectScene' });
  }

  init(data: MenuToModeData): void {
    this.playerKodamonId = data.playerKodamonId;
    this.arenaId = data.arenaId;
    this.selectedMode = 'libre';
  }

  create(): void {
    const { width, height } = CYBER_THEME.canvas;

    // Inicializar audio y reproducir música del menú
    this.audio = new AudioManager(this);
    this.audio.playMusic('menu');

    // Fondo
    this.add.rectangle(0, 0, width, height, CYBER_THEME.colors.dark).setOrigin(0);

    // Grid cyberpunk
    const gridGraphics = this.add.graphics();
    drawCyberGrid(gridGraphics, width, height);

    // Partículas estilo Tron que viajan por el grid (debajo de UI)
    this.gridRunners = new GridRunners(this, width, height, {
      gridSize: 30,
      particleCount: 2,
      minSpeed: 40,
      maxSpeed: 70,
      trailLength: 12,
      blurLayers: 6,
    });

    // Panel principal
    const panelGraphics = this.add.graphics();
    drawCyberPanel(panelGraphics, 40, 40, width - 80, height - 80, {
      fillAlpha: 0.85,
      cornerCut: 15,
      accentSide: 'top',
      accentColor: CYBER_THEME.colors.pink,
    });

    // Título
    this.add
      .text(width / 2, 70, 'SELECCIONA MODO', {
        ...CYBER_TEXT_STYLES.title,
        fontSize: '20px',
      })
      .setOrigin(0.5);

    // Crear botones de modo
    this.createModeButtons();

    // Stats del jugador
    this.createStatsPanel();

    // Controles de audio
    new AudioControls(this, {
      x: width - 24,
      y: 24,
      audio: this.audio,
    });

    // Animar entrada
    this.cameras.main.fadeIn(300);
  }

  private createModeButtons(): void {
    const { width } = CYBER_THEME.canvas;
    const startY = 115;
    const buttonWidth = 180;
    const buttonHeight = 60;
    const gap = 15;
    const cols = 2;

    MODES.forEach((mode, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = width / 2 - buttonWidth - gap / 2 + col * (buttonWidth + gap);
      const y = startY + row * (buttonHeight + gap);

      const button = this.createModeButton(x, y, buttonWidth, buttonHeight, mode);
      this.modeButtons.push(button);
    });
  }

  private createModeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    mode: ModeOption
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const isSelected = mode.id === this.selectedMode;

    // Background
    const bg = this.add.graphics();
    this.drawModeButtonBg(bg, width, height, isSelected, false);
    container.add(bg);

    // Icono
    const icon = this.add
      .text(15, height / 2, mode.icon, {
        fontSize: '20px',
      })
      .setOrigin(0, 0.5);
    container.add(icon);

    // Nombre
    const name = this.add
      .text(45, height / 2 - 10, mode.name, {
        fontFamily: CYBER_THEME.fonts.title,
        fontSize: '11px',
        color: isSelected ? CYBER_THEME.colors.cyanHex : CYBER_THEME.colors.whiteHex,
      })
      .setOrigin(0, 0.5);
    container.add(name);

    // Descripción
    const desc = this.add
      .text(45, height / 2 + 8, mode.description, {
        fontFamily: CYBER_THEME.fonts.body,
        fontSize: '8px',
        color: CYBER_THEME.colors.pinkHex,
      })
      .setOrigin(0, 0.5);
    container.add(desc);

    // Interactividad
    const hitArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      this.audio.playUI('hover');
      this.drawModeButtonBg(bg, width, height, mode.id === this.selectedMode, true);
    });

    hitArea.on('pointerout', () => {
      this.drawModeButtonBg(bg, width, height, mode.id === this.selectedMode, false);
    });

    hitArea.on('pointerdown', () => {
      this.audio.playUI('click');
      this.selectMode(mode.id);

      // Actualizar todos los botones
      MODES.forEach((m, i) => {
        const btn = this.modeButtons[i];
        const btnBg = btn.getAt(0) as Phaser.GameObjects.Graphics;
        const btnName = btn.getAt(2) as Phaser.GameObjects.Text;
        const isNowSelected = m.id === this.selectedMode;
        this.drawModeButtonBg(btnBg, width, height, isNowSelected, false);
        btnName.setColor(isNowSelected ? CYBER_THEME.colors.cyanHex : CYBER_THEME.colors.whiteHex);
      });
    });

    // Guardar referencia al modo
    container.setData('mode', mode.id);

    return container;
  }

  private drawModeButtonBg(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    selected: boolean,
    hover: boolean
  ): void {
    graphics.clear();

    const borderColor = selected ? CYBER_THEME.colors.cyan : CYBER_THEME.colors.purple;
    const fillAlpha = hover ? 0.4 : 0.3;
    const borderAlpha = selected ? 0.8 : hover ? 0.6 : 0.3;

    // Fondo
    graphics.fillStyle(CYBER_THEME.colors.panel, fillAlpha);
    graphics.fillRoundedRect(0, 0, width, height, 8);

    // Borde
    graphics.lineStyle(selected ? 2 : 1, borderColor, borderAlpha);
    graphics.strokeRoundedRect(0, 0, width, height, 8);

    // Línea de acento si está seleccionado
    if (selected) {
      graphics.fillStyle(CYBER_THEME.colors.cyan, 1);
      graphics.fillRect(0, 8, 3, height - 16);
    }
  }

  private selectMode(mode: GameMode): void {
    this.selectedMode = mode;
  }

  private createStatsPanel(): void {
    const { width, height } = CYBER_THEME.canvas;
    const persistence = getPersistenceManager();
    const stats = persistence.getStats();

    // Panel de stats
    const panelY = height - 110;
    const panelGraphics = this.add.graphics();
    drawCyberPanel(panelGraphics, 60, panelY, width - 120, 50, {
      fillAlpha: 0.7,
      cornerCut: 8,
      accentSide: 'none',
    });

    // Stats text
    const winRate = persistence.getWinRate();
    const statsStr = `${stats.totalVictories}W / ${stats.totalDefeats}L | Racha: ${stats.currentStreak} | Mejor: ${stats.bestStreak} | Win Rate: ${winRate}%`;

    this.add
      .text(width / 2, panelY + 25, statsStr, {
        fontFamily: CYBER_THEME.fonts.body,
        fontSize: '10px',
        color: CYBER_THEME.colors.whiteHex,
      })
      .setOrigin(0.5);

    // Botón INICIAR
    this.createStartButton();
  }

  private createStartButton(): void {
    const { width, height } = CYBER_THEME.canvas;
    const btnWidth = 150;
    const btnHeight = 40;
    const x = width / 2 - btnWidth / 2;
    const y = height - 55;

    const container = this.add.container(x, y);

    // Background
    const bg = this.add.graphics();
    this.drawStartButtonBg(bg, btnWidth, btnHeight, false);
    container.add(bg);

    // Texto
    const text = this.add
      .text(btnWidth / 2, btnHeight / 2, '► INICIAR', {
        fontFamily: CYBER_THEME.fonts.title,
        fontSize: '14px',
        color: CYBER_THEME.colors.cyanHex,
      })
      .setOrigin(0.5);
    container.add(text);

    // Interactividad
    const hitArea = this.add.rectangle(
      btnWidth / 2,
      btnHeight / 2,
      btnWidth,
      btnHeight,
      0x000000,
      0
    );
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      this.audio.playUI('hover');
      this.drawStartButtonBg(bg, btnWidth, btnHeight, true);
      text.setColor(CYBER_THEME.colors.whiteHex);
    });

    hitArea.on('pointerout', () => {
      this.drawStartButtonBg(bg, btnWidth, btnHeight, false);
      text.setColor(CYBER_THEME.colors.cyanHex);
    });

    hitArea.on('pointerdown', () => {
      this.audio.playUI('select');
      this.startGame();
    });
  }

  private drawStartButtonBg(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    hover: boolean
  ): void {
    graphics.clear();

    const cornerCut = 8;

    // Fondo
    graphics.fillStyle(
      hover ? CYBER_THEME.colors.cyan : CYBER_THEME.colors.panel,
      hover ? 0.3 : 0.8
    );
    graphics.beginPath();
    graphics.moveTo(cornerCut, 0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height - cornerCut);
    graphics.lineTo(width - cornerCut, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, cornerCut);
    graphics.closePath();
    graphics.fillPath();

    // Borde
    graphics.lineStyle(2, CYBER_THEME.colors.cyan, hover ? 1 : 0.6);
    graphics.beginPath();
    graphics.moveTo(cornerCut, 0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height - cornerCut);
    graphics.lineTo(width - cornerCut, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, cornerCut);
    graphics.closePath();
    graphics.strokePath();
  }

  private startGame(): void {
    // Obtener Kodamon del jugador
    const playerKodamon = getKodamon(this.playerKodamonId);
    if (!playerKodamon) {
      console.error('Kodamon no encontrado:', this.playerKodamonId);
      return;
    }

    // Seleccionar enemigo aleatorio (diferente al jugador)
    const allKodamons = getAllKodamons();
    const availableEnemies = allKodamons.filter((k) => k.id !== this.playerKodamonId);
    const enemyKodamon = Phaser.Math.RND.pick(availableEnemies);

    // Preparar datos según el modo
    let battleData: ModeToBattleData = {
      mode: this.selectedMode,
      playerKodamonId: this.playerKodamonId,
      enemyKodamonId: enemyKodamon.id,
      arenaId: this.arenaId,
    };

    // Datos específicos por modo
    if (this.selectedMode === 'torneo') {
      // Generar 4 oponentes para el torneo
      const shuffled = Phaser.Math.RND.shuffle([...availableEnemies]);
      const opponents = shuffled.slice(0, 4).map((k) => k.id);

      const tournamentState: TournamentState = {
        currentRound: 1,
        opponents,
        playerHP: playerKodamon.estadisticas.hp,
        playerMaxHP: playerKodamon.estadisticas.hp,
        completed: false,
        playerKodamonId: this.playerKodamonId,
      };

      battleData.tournamentState = tournamentState;
      battleData.enemyKodamonId = opponents[0];
    } else if (this.selectedMode === 'supervivencia') {
      const survivalState: SurvivalState = {
        currentWave: 1,
        playerHP: playerKodamon.estadisticas.hp,
        playerMaxHP: playerKodamon.estadisticas.hp,
        enemiesDefeated: 0,
        bestWave: getPersistenceManager().getSurvivalBestWave(),
        playerKodamonId: this.playerKodamonId,
      };

      battleData.survivalState = survivalState;
    } else if (this.selectedMode === 'multijugador') {
      // Para multijugador, ir a selección del jugador 2
      // Detener toda música antes de cambiar de escena
      this.sound.stopAll();
      this.scene.start('MenuScene', {
        mode: 'player2Select',
        player1KodamonId: this.playerKodamonId,
        arenaId: this.arenaId,
      });
      return;
    }

    // Fade out y cambiar a escena de batalla
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Detener toda música usando el sound manager global de Phaser
      // (necesario porque cada escena tiene su propio AudioManager)
      this.sound.stopAll();
      this.scene.start('BattleScene', battleData);
    });
  }

  shutdown(): void {
    // Limpiar audio
    if (this.audio) {
      this.audio.destroy();
    }

    // Limpiar grid runners
    if (this.gridRunners) {
      this.gridRunners.destroy();
    }

    // Limpiar arrays
    this.modeButtons = [];
  }
}
