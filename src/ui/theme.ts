/**
 * Tema visual estilo Digimon Cyber Sleuth
 * Paleta de colores y constantes de diseño
 */

import Phaser from 'phaser';

export const CYBER_THEME = {
  // Colores principales
  colors: {
    cyan: 0x00d4ff,
    cyanHex: '#00d4ff',
    pink: 0xff6b9d,
    pinkHex: '#ff6b9d',
    purple: 0x9d4edd,
    purpleHex: '#9d4edd',
    dark: 0x0a0a1a,
    darkHex: '#0a0a1a',
    darkBlue: 0x1a1a3a,
    darkBlueHex: '#1a1a3a',
    panel: 0x0a0a1e,
    panelAlpha: 0.9,
    white: 0xffffff,
    whiteHex: '#ffffff',
  },

  // Colores de HP
  hp: {
    high: 0x00ff88,
    highGradient: [0x00d4ff, 0x00ff88],
    medium: 0xffd93d,
    mediumGradient: [0xffd93d, 0xff9500],
    low: 0xff6b6b,
    lowGradient: [0xff6b6b, 0xee5a5a],
  },

  // Colores por tipo elemental (estilo Cyber)
  tipos: {
    fuego: { color: 0xff6b6b, hex: '#ff6b6b' },
    agua: { color: 0x00d4ff, hex: '#00d4ff' },
    planta: { color: 0x00ff88, hex: '#00ff88' },
    electrico: { color: 0xffd93d, hex: '#ffd93d' },
    tierra: { color: 0xd4a574, hex: '#d4a574' },
    hielo: { color: 0x88ddff, hex: '#88ddff' },
    volador: { color: 0xaa88ff, hex: '#aa88ff' },
    roca: { color: 0xbbaa88, hex: '#bbaa88' },
    normal: { color: 0xaaaaaa, hex: '#aaaaaa' },
    fantasma: { color: 0x9d4edd, hex: '#9d4edd' },
  },

  // Fuentes
  fonts: {
    title: '"Orbitron", "Press Start 2P", monospace',
    body: '"Rajdhani", "Press Start 2P", sans-serif',
  },

  // Tamaños
  sizes: {
    titleLarge: '28px',
    titleMedium: '18px',
    titleSmall: '12px',
    textLarge: '14px',
    textMedium: '11px',
    textSmall: '9px',
  },

  // Dimensiones del canvas
  canvas: {
    width: 512,
    height: 384,
  },

  // Espaciado
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
} as const;

/**
 * Dibuja un panel con estilo Cyber Sleuth
 */
export function drawCyberPanel(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fillAlpha?: number;
    borderColor?: number;
    borderAlpha?: number;
    cornerCut?: number;
    accentSide?: 'left' | 'right' | 'top' | 'none';
    accentColor?: number;
  } = {}
): void {
  const {
    fillAlpha = 0.9,
    borderColor = CYBER_THEME.colors.cyan,
    borderAlpha = 0.3,
    cornerCut = 10,
    accentSide = 'left',
    accentColor = CYBER_THEME.colors.cyan,
  } = options;

  // Fondo del panel con esquinas cortadas
  graphics.fillStyle(CYBER_THEME.colors.panel, fillAlpha);
  graphics.beginPath();
  graphics.moveTo(x + cornerCut, y);
  graphics.lineTo(x + width, y);
  graphics.lineTo(x + width, y + height - cornerCut);
  graphics.lineTo(x + width - cornerCut, y + height);
  graphics.lineTo(x, y + height);
  graphics.lineTo(x, y + cornerCut);
  graphics.closePath();
  graphics.fillPath();

  // Borde
  graphics.lineStyle(1, borderColor, borderAlpha);
  graphics.beginPath();
  graphics.moveTo(x + cornerCut, y);
  graphics.lineTo(x + width, y);
  graphics.lineTo(x + width, y + height - cornerCut);
  graphics.lineTo(x + width - cornerCut, y + height);
  graphics.lineTo(x, y + height);
  graphics.lineTo(x, y + cornerCut);
  graphics.closePath();
  graphics.strokePath();

  // Línea de acento
  if (accentSide !== 'none') {
    graphics.fillStyle(accentColor, 1);
    if (accentSide === 'left') {
      graphics.fillRect(x, y + cornerCut, 3, height - cornerCut);
    } else if (accentSide === 'right') {
      graphics.fillRect(x + width - 3, y, 3, height - cornerCut);
    } else if (accentSide === 'top') {
      graphics.fillRect(x + cornerCut, y, width - cornerCut, 3);
    }
  }
}

/**
 * Dibuja el grid cyberpunk de fondo
 */
export function drawCyberGrid(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  gridSize: number = 30,
  alpha: number = 0.05
): void {
  graphics.lineStyle(1, CYBER_THEME.colors.cyan, alpha);

  // Líneas verticales
  for (let x = 0; x <= width; x += gridSize) {
    graphics.beginPath();
    graphics.moveTo(x, 0);
    graphics.lineTo(x, height);
    graphics.strokePath();
  }

  // Líneas horizontales
  for (let y = 0; y <= height; y += gridSize) {
    graphics.beginPath();
    graphics.moveTo(0, y);
    graphics.lineTo(width, y);
    graphics.strokePath();
  }
}

/**
 * Crea estilos de texto para el tema Cyber
 */
export const CYBER_TEXT_STYLES = {
  title: {
    fontFamily: CYBER_THEME.fonts.title,
    fontSize: CYBER_THEME.sizes.titleLarge,
    color: CYBER_THEME.colors.whiteHex,
    stroke: CYBER_THEME.colors.cyanHex,
    strokeThickness: 0,
  },
  subtitle: {
    fontFamily: CYBER_THEME.fonts.body,
    fontSize: CYBER_THEME.sizes.titleSmall,
    color: CYBER_THEME.colors.pinkHex,
    letterSpacing: 4,
  },
  label: {
    fontFamily: CYBER_THEME.fonts.body,
    fontSize: CYBER_THEME.sizes.textSmall,
    color: CYBER_THEME.colors.pinkHex,
  },
  value: {
    fontFamily: CYBER_THEME.fonts.title,
    fontSize: CYBER_THEME.sizes.textLarge,
    color: CYBER_THEME.colors.cyanHex,
  },
  body: {
    fontFamily: CYBER_THEME.fonts.body,
    fontSize: CYBER_THEME.sizes.textMedium,
    color: CYBER_THEME.colors.whiteHex,
  },
  button: {
    fontFamily: CYBER_THEME.fonts.title,
    fontSize: CYBER_THEME.sizes.textSmall,
    color: CYBER_THEME.colors.cyanHex,
  },
} as const;
