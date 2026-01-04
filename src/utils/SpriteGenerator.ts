import Phaser from 'phaser';
import type { TipoElemental } from '@game-types/index';
import { getTipoConfig } from '@data/index';

// Patrones de sprites para cada Kodamon (matrices 8x8 que se escalan a 64x64)
// 0 = transparente, 1 = color principal, 2 = color secundario, 3 = color oscuro
const PATRONES: Record<string, number[][]> = {
  pyrex: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 2, 2, 2, 2, 1, 1],
    [0, 1, 1, 2, 2, 1, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
  ],
  aquon: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 1, 3, 3, 1, 3, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
  ],
  florix: [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 2, 2, 1, 1, 2, 2, 1],
    [0, 1, 1, 2, 2, 1, 1, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 1, 2, 3, 3, 2, 1, 0],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  voltik: [
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 2, 1, 0, 0, 1, 2, 1],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 1, 3, 2, 2, 3, 1, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
  ],
  terron: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 3, 1, 1, 3, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 1, 3, 3, 1, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 3, 1, 1, 3, 3, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
  ],
  glaceon: [
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 2, 1, 1, 1, 1, 2, 1],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 1, 3, 2, 2, 3, 1, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ],
  aerix: [
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 0, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  petros: [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 3, 1, 1, 1, 1, 3, 1],
    [1, 1, 3, 1, 1, 3, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 3, 3, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  normex: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
  ],
  spekter: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
  ],
};

export class SpriteGenerator {
  private scene: Phaser.Scene;
  private size: number;

  constructor(scene: Phaser.Scene, size: number = 64) {
    this.scene = scene;
    this.size = size;
  }
  // Genera el sprite de un Kodamon y lo registra en el cache de texturas
  generate(kodamonId: string, tipo: TipoElemental): string {
    const textureKey = `kodamon-${kodamonId}`;

    // Si ya existe, no regenerar
    if (this.scene.textures.exists(textureKey)) {
      return textureKey;
    }

    const patron = PATRONES[kodamonId] || PATRONES['normex'];
    const colores = this.getColoresParaTipo(tipo);

    // Crear canvas temporal
    const canvas = document.createElement('canvas');
    canvas.width = this.size;
    canvas.height = this.size;
    const ctx = canvas.getContext('2d')!;

    // Escala del patrón 8x8 al tamaño final
    const pixelSize = this.size / 8;

    // Dibujar cada pixel del patrón
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const valor = patron[y][x];
        if (valor === 0) continue; // Transparente

        ctx.fillStyle = colores[valor - 1];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    // Registrar en el sistema de texturas de Phaser
    this.scene.textures.addCanvas(textureKey, canvas);

    return textureKey;
  }
  // Genera sprites para todos los Kodamon
  generateAll(kodamons: { id: string; tipo: TipoElemental }[]): void {
    kodamons.forEach(({ id, tipo }) => this.generate(id, tipo));
  }
  // Obtiene la paleta de colores basada en el tipo
  private getColoresParaTipo(tipo: TipoElemental): string[] {
    const config = getTipoConfig(tipo);

    // Convertir color hex a RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 128, g: 128, b: 128 };
    };

    // Oscurecer un color
    const oscurecer = (hex: string, factor: number): string => {
      const rgb = hexToRgb(hex);
      const r = Math.floor(rgb.r * factor);
      const g = Math.floor(rgb.g * factor);
      const b = Math.floor(rgb.b * factor);
      return `rgb(${r}, ${g}, ${b})`;
    };

    return [
      config.color, // Color principal (1)
      config.colorClaro, // Color claro (2)
      oscurecer(config.color, 0.5), // Color oscuro (3)
    ];
  }
}
