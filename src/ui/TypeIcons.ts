import Phaser from 'phaser';
import type { TipoElemental } from '@game-types/index';
import { getTipoConfig } from '@data/tipos';

/**
 * Utilidad para dibujar iconos de tipo elementales con gráficos vectoriales
 * Proporciona iconos con mejor definición que caracteres Unicode
 */

export interface TypeIconConfig {
  size?: number;
  filled?: boolean;
  strokeWidth?: number;
  glowEffect?: boolean;
}

const DEFAULT_CONFIG: TypeIconConfig = {
  size: 16,
  filled: true,
  strokeWidth: 1.5,
  glowEffect: false,
};

/**
 * Dibuja el icono de un tipo elemental en un Graphics object
 */
export function drawTypeIcon(
  graphics: Phaser.GameObjects.Graphics,
  tipo: TipoElemental | 'todos',
  x: number,
  y: number,
  config: TypeIconConfig = {}
): void {
  const { size, filled, strokeWidth } = { ...DEFAULT_CONFIG, ...config };
  const halfSize = size! / 2;
  const tipoConfig = tipo !== 'todos' ? getTipoConfig(tipo) : null;
  const color = tipoConfig
    ? Phaser.Display.Color.HexStringToColor(tipoConfig.color).color
    : 0xffffff;

  // Setup principal
  if (filled) {
    graphics.fillStyle(color, 1);
  }
  graphics.lineStyle(strokeWidth!, 0xffffff, 0.9);

  switch (tipo) {
    case 'fuego':
      drawFlameIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'agua':
      drawDropIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'planta':
      drawLeafIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'electrico':
      drawBoltIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'tierra':
      drawMountainIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'hielo':
      drawSnowflakeIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'volador':
      drawWindIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'roca':
      drawRockIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'normal':
      drawCircleIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'fantasma':
      drawGhostIcon(graphics, x, y, halfSize, filled!);
      break;
    case 'todos':
      drawStarIcon(graphics, x, y, halfSize, filled!, 0xffffff);
      break;
  }
}

// --- Funciones de dibujo individual (usando formas básicas de Phaser) ---

function drawFlameIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Llama estilizada (triángulo con ondas)
  g.beginPath();
  g.moveTo(x, y - r);
  g.lineTo(x + r * 0.6, y + r * 0.3);
  g.lineTo(x + r * 0.3, y + r * 0.1);
  g.lineTo(x, y + r);
  g.lineTo(x - r * 0.3, y + r * 0.1);
  g.lineTo(x - r * 0.6, y + r * 0.3);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();
}

function drawDropIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Gota de agua (diamante redondeado)
  g.beginPath();
  g.moveTo(x, y - r);
  g.lineTo(x + r * 0.7, y + r * 0.2);
  g.lineTo(x + r * 0.5, y + r * 0.7);
  g.lineTo(x, y + r);
  g.lineTo(x - r * 0.5, y + r * 0.7);
  g.lineTo(x - r * 0.7, y + r * 0.2);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();
}

function drawLeafIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Hoja (forma de diamante asimétrico)
  g.beginPath();
  g.moveTo(x, y - r);
  g.lineTo(x + r * 0.8, y - r * 0.2);
  g.lineTo(x + r * 0.4, y + r * 0.8);
  g.lineTo(x, y + r * 0.5);
  g.lineTo(x - r * 0.4, y + r * 0.8);
  g.lineTo(x - r * 0.8, y - r * 0.2);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();

  // Nervadura central
  g.lineStyle(1, 0xffffff, 0.5);
  g.beginPath();
  g.moveTo(x, y - r * 0.6);
  g.lineTo(x, y + r * 0.4);
  g.strokePath();
}

function drawBoltIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Rayo (zigzag)
  g.beginPath();
  g.moveTo(x + r * 0.3, y - r);
  g.lineTo(x - r * 0.3, y - r * 0.1);
  g.lineTo(x + r * 0.1, y - r * 0.1);
  g.lineTo(x - r * 0.3, y + r);
  g.lineTo(x + r * 0.3, y + r * 0.1);
  g.lineTo(x - r * 0.1, y + r * 0.1);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();
}

function drawMountainIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Montaña/Tierra (doble triángulo)
  g.beginPath();
  g.moveTo(x - r, y + r * 0.7);
  g.lineTo(x - r * 0.3, y - r * 0.4);
  g.lineTo(x, y + r * 0.1);
  g.lineTo(x + r * 0.5, y - r * 0.8);
  g.lineTo(x + r, y + r * 0.7);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();
}

function drawSnowflakeIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Copo de nieve (6 brazos)
  const arms = 6;
  const color = filled ? 0x88ddff : 0xffffff;

  for (let i = 0; i < arms; i++) {
    const angle = (i * Math.PI * 2) / arms - Math.PI / 2;
    const ax = x + Math.cos(angle) * r;
    const ay = y + Math.sin(angle) * r;

    g.lineStyle(2, color, 1);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(ax, ay);
    g.strokePath();

    // Pequeñas ramas
    const branchAngle1 = angle + Math.PI / 6;
    const branchAngle2 = angle - Math.PI / 6;
    const midX = x + Math.cos(angle) * r * 0.6;
    const midY = y + Math.sin(angle) * r * 0.6;

    g.lineStyle(1.5, color, 0.8);
    g.beginPath();
    g.moveTo(midX, midY);
    g.lineTo(midX + Math.cos(branchAngle1) * r * 0.3, midY + Math.sin(branchAngle1) * r * 0.3);
    g.strokePath();
    g.beginPath();
    g.moveTo(midX, midY);
    g.lineTo(midX + Math.cos(branchAngle2) * r * 0.3, midY + Math.sin(branchAngle2) * r * 0.3);
    g.strokePath();
  }

  // Centro
  if (filled) {
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r * 0.2);
  }
}

function drawWindIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Viento (líneas onduladas - simuladas con segmentos)
  const color = filled ? 0xaa88ff : 0xffffff;
  g.lineStyle(2, color, 1);

  // Línea superior
  g.beginPath();
  g.moveTo(x - r, y - r * 0.5);
  g.lineTo(x - r * 0.3, y - r * 0.6);
  g.lineTo(x + r * 0.3, y - r * 0.4);
  g.lineTo(x + r * 0.7, y - r * 0.5);
  g.strokePath();

  // Línea central
  g.beginPath();
  g.moveTo(x - r * 0.8, y);
  g.lineTo(x - r * 0.2, y + r * 0.1);
  g.lineTo(x + r * 0.4, y - r * 0.1);
  g.lineTo(x + r, y);
  g.strokePath();

  // Línea inferior
  g.beginPath();
  g.moveTo(x - r * 0.5, y + r * 0.5);
  g.lineTo(x, y + r * 0.4);
  g.lineTo(x + r * 0.5, y + r * 0.6);
  g.strokePath();
}

function drawRockIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Roca (polígono irregular)
  g.beginPath();
  g.moveTo(x - r * 0.3, y - r * 0.8);
  g.lineTo(x + r * 0.5, y - r * 0.6);
  g.lineTo(x + r * 0.9, y - r * 0.1);
  g.lineTo(x + r * 0.6, y + r * 0.7);
  g.lineTo(x - r * 0.2, y + r * 0.8);
  g.lineTo(x - r * 0.8, y + r * 0.3);
  g.lineTo(x - r * 0.7, y - r * 0.4);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();

  // Línea de textura
  g.lineStyle(1, 0xffffff, 0.3);
  g.beginPath();
  g.moveTo(x - r * 0.2, y - r * 0.3);
  g.lineTo(x + r * 0.3, y + r * 0.2);
  g.strokePath();
}

function drawCircleIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Círculo simple para Normal
  if (filled) {
    g.fillCircle(x, y, r * 0.8);
  }
  g.strokeCircle(x, y, r * 0.8);

  // Punto central
  g.fillStyle(0xffffff, 0.5);
  g.fillCircle(x, y, r * 0.25);
}

function drawGhostIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean
): void {
  // Fantasma (silueta ondulada)
  g.beginPath();
  g.moveTo(x, y - r);
  g.lineTo(x + r * 0.7, y - r * 0.4);
  g.lineTo(x + r * 0.8, y + r * 0.3);
  g.lineTo(x + r * 0.5, y + r * 0.5);
  g.lineTo(x + r * 0.3, y + r * 0.3);
  g.lineTo(x, y + r * 0.6);
  g.lineTo(x - r * 0.3, y + r * 0.3);
  g.lineTo(x - r * 0.5, y + r * 0.5);
  g.lineTo(x - r * 0.8, y + r * 0.3);
  g.lineTo(x - r * 0.7, y - r * 0.4);
  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();

  // Ojos
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(x - r * 0.25, y - r * 0.2, r * 0.15);
  g.fillCircle(x + r * 0.25, y - r * 0.2, r * 0.15);
}

function drawStarIcon(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  filled: boolean,
  color: number
): void {
  // Estrella de 6 puntas para "todos"
  const points = 6;
  const innerR = r * 0.5;

  g.fillStyle(color, 1);
  g.beginPath();

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;

    if (i === 0) {
      g.moveTo(px, py);
    } else {
      g.lineTo(px, py);
    }
  }

  g.closePath();
  if (filled) g.fillPath();
  g.strokePath();
}

/**
 * Crea un Container con el icono de tipo dibujado
 * Útil para agregar iconos como objetos independientes
 */
export function createTypeIconContainer(
  scene: Phaser.Scene,
  tipo: TipoElemental | 'todos',
  x: number,
  y: number,
  config: TypeIconConfig = {}
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const graphics = scene.add.graphics();

  drawTypeIcon(graphics, tipo, 0, 0, config);
  container.add(graphics);

  return container;
}
