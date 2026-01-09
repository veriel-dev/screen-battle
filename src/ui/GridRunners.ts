import Phaser from 'phaser';
import { CYBER_THEME } from './theme';

/**
 * Partícula que viaja por las líneas del grid estilo Tron
 */
interface GridParticle {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  speed: number;
  color: number;
  trail: { x: number; y: number; age: number }[];
  trailLength: number;
  lastTurnTime: number; // Para evitar giros muy frecuentes
}

export interface GridRunnersConfig {
  gridSize?: number;
  particleCount?: number;
  minSpeed?: number;
  maxSpeed?: number;
  trailLength?: number;
  colors?: number[];
  blurLayers?: number; // Capas de blur para el efecto difuminado
}

const DEFAULT_CONFIG: Required<GridRunnersConfig> = {
  gridSize: 30,
  particleCount: 2,
  minSpeed: 40,
  maxSpeed: 70,
  trailLength: 12,
  colors: [CYBER_THEME.colors.cyan, CYBER_THEME.colors.pink],
  blurLayers: 5,
};

/**
 * Sistema de partículas que viajan por las líneas del grid estilo Tron
 * Con efecto blur difuminado y evasión de colisiones
 */
export class GridRunners {
  private scene: Phaser.Scene;
  private config: Required<GridRunnersConfig>;
  private graphics: Phaser.GameObjects.Graphics;
  private particles: GridParticle[] = [];
  private width: number;
  private height: number;
  private updateEvent?: Phaser.Time.TimerEvent;
  private margin: number; // Margen de seguridad de los bordes
  private minDistance: number = 60; // Distancia mínima entre partículas

  constructor(scene: Phaser.Scene, width: number, height: number, config: GridRunnersConfig = {}) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.margin = this.config.gridSize * 2; // Margen de 2 celdas del borde

    // Crear graphics para dibujar las partículas
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(0); // Debajo de todos los elementos UI

    // Inicializar partículas
    this.initParticles();

    // Iniciar loop de actualización
    this.startUpdate();
  }

  /**
   * Inicializa las partículas en posiciones aleatorias del grid (evitando bordes)
   */
  private initParticles(): void {
    const { gridSize, particleCount, minSpeed, maxSpeed, trailLength, colors } = this.config;

    // Calcular rango válido para spawn (evitando bordes)
    const minGridX = 2;
    const maxGridX = Math.floor((this.width - this.margin) / gridSize) - 1;
    const minGridY = 2;
    const maxGridY = Math.floor((this.height - this.margin) / gridSize) - 1;

    for (let i = 0; i < particleCount; i++) {
      let x: number, y: number;
      let attempts = 0;

      // Intentar encontrar una posición que no esté muy cerca de otras partículas
      do {
        const gridX = minGridX + Math.floor(Math.random() * (maxGridX - minGridX));
        const gridY = minGridY + Math.floor(Math.random() * (maxGridY - minGridY));
        x = gridX * gridSize;
        y = gridY * gridSize;
        attempts++;
      } while (this.isTooCloseToOthers(x, y, -1) && attempts < 20);

      // Dirección inicial aleatoria
      const directions: GridParticle['direction'][] = ['up', 'down', 'left', 'right'];
      let direction = directions[Math.floor(Math.random() * directions.length)];

      // Asegurar que la dirección inicial no lleve directo al borde
      direction = this.getSafeDirection(x, y, direction);

      // Velocidad aleatoria
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      // Color (alterna entre los colores disponibles)
      const color = colors[i % colors.length];

      this.particles.push({
        x,
        y,
        direction,
        speed,
        color,
        trail: [],
        trailLength,
        lastTurnTime: 0,
      });
    }
  }

  /**
   * Verifica si una posición está muy cerca de otras partículas
   */
  private isTooCloseToOthers(x: number, y: number, excludeIndex: number): boolean {
    for (let i = 0; i < this.particles.length; i++) {
      if (i === excludeIndex) continue;
      const p = this.particles[i];
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < this.minDistance) return true;
    }
    return false;
  }

  /**
   * Obtiene una dirección segura que no lleve directo al borde
   */
  private getSafeDirection(
    x: number,
    y: number,
    preferred: GridParticle['direction']
  ): GridParticle['direction'] {
    const validDirections = this.getValidDirections(x, y);
    if (validDirections.includes(preferred)) {
      return preferred;
    }
    return validDirections[Math.floor(Math.random() * validDirections.length)] || 'right';
  }

  /**
   * Obtiene las direcciones válidas desde una posición (que no llevan al borde)
   */
  private getValidDirections(x: number, y: number): GridParticle['direction'][] {
    const valid: GridParticle['direction'][] = [];

    if (x > this.margin) valid.push('left');
    if (x < this.width - this.margin) valid.push('right');
    if (y > this.margin) valid.push('up');
    if (y < this.height - this.margin) valid.push('down');

    return valid;
  }

  /**
   * Inicia el loop de actualización
   */
  private startUpdate(): void {
    this.updateEvent = this.scene.time.addEvent({
      delay: 16, // ~60 FPS
      callback: this.update,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Actualiza las posiciones de las partículas
   */
  private update(): void {
    const { gridSize } = this.config;
    const delta = 16 / 1000;
    const now = Date.now();

    this.particles.forEach((particle, index) => {
      // Guardar posición anterior para el trail
      particle.trail.unshift({ x: particle.x, y: particle.y, age: 0 });

      // Envejecer y limpiar trail
      particle.trail = particle.trail
        .map((p) => ({ ...p, age: p.age + 1 }))
        .filter((p) => p.age < particle.trailLength);

      // Mover partícula
      const movement = particle.speed * delta;
      switch (particle.direction) {
        case 'up':
          particle.y -= movement;
          break;
        case 'down':
          particle.y += movement;
          break;
        case 'left':
          particle.x -= movement;
          break;
        case 'right':
          particle.x += movement;
          break;
      }

      // Verificar si se acerca a un borde o a otra partícula
      const needsTurn = this.needsToTurn(particle, index, now);

      // Verificar si llegó a una intersección del grid
      const atIntersectionX = Math.abs(particle.x % gridSize) < movement * 2;
      const atIntersectionY = Math.abs(particle.y % gridSize) < movement * 2;

      if (atIntersectionX && atIntersectionY) {
        // Snap a la intersección
        particle.x = Math.round(particle.x / gridSize) * gridSize;
        particle.y = Math.round(particle.y / gridSize) * gridSize;

        // Cambiar dirección si es necesario o aleatoriamente
        if (needsTurn || (Math.random() < 0.25 && now - particle.lastTurnTime > 500)) {
          const newDir = this.getBestDirection(particle, index);
          if (newDir !== particle.direction) {
            particle.direction = newDir;
            particle.lastTurnTime = now;
          }
        }
      }
    });

    // Redibujar
    this.draw();
  }

  /**
   * Verifica si la partícula necesita girar (cerca del borde o de otra partícula)
   */
  private needsToTurn(particle: GridParticle, index: number, now: number): boolean {
    // No girar si acaba de girar
    if (now - particle.lastTurnTime < 300) return false;

    const { x, y, direction } = particle;
    const lookAhead = this.config.gridSize * 2;

    // Verificar proximidad al borde
    switch (direction) {
      case 'up':
        if (y - lookAhead < this.margin) return true;
        break;
      case 'down':
        if (y + lookAhead > this.height - this.margin) return true;
        break;
      case 'left':
        if (x - lookAhead < this.margin) return true;
        break;
      case 'right':
        if (x + lookAhead > this.width - this.margin) return true;
        break;
    }

    // Verificar proximidad a otras partículas
    for (let i = 0; i < this.particles.length; i++) {
      if (i === index) continue;
      const other = this.particles[i];
      const dist = Math.sqrt((other.x - x) ** 2 + (other.y - y) ** 2);

      if (dist < this.minDistance) {
        // Verificar si vamos hacia la otra partícula
        const dx = other.x - x;
        const dy = other.y - y;

        if (
          (direction === 'right' && dx > 0) ||
          (direction === 'left' && dx < 0) ||
          (direction === 'down' && dy > 0) ||
          (direction === 'up' && dy < 0)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Obtiene la mejor dirección para evitar bordes y otras partículas
   */
  private getBestDirection(particle: GridParticle, index: number): GridParticle['direction'] {
    const { x, y, direction } = particle;
    const validDirs = this.getValidDirections(x, y);

    // Filtrar direcciones que llevan hacia otras partículas
    const safeDirs = validDirs.filter((dir) => {
      for (let i = 0; i < this.particles.length; i++) {
        if (i === index) continue;
        const other = this.particles[i];
        const dx = other.x - x;
        const dy = other.y - y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);

        if (dist < this.minDistance * 1.5) {
          if (
            (dir === 'right' && dx > 0 && Math.abs(dx) > Math.abs(dy)) ||
            (dir === 'left' && dx < 0 && Math.abs(dx) > Math.abs(dy)) ||
            (dir === 'down' && dy > 0 && Math.abs(dy) > Math.abs(dx)) ||
            (dir === 'up' && dy < 0 && Math.abs(dy) > Math.abs(dx))
          ) {
            return false;
          }
        }
      }
      return true;
    });

    // Preferir direcciones perpendiculares (giro de 90°)
    const perpendicular =
      direction === 'up' || direction === 'down' ? ['left', 'right'] : ['up', 'down'];

    const preferredDirs = safeDirs.filter((d) =>
      perpendicular.includes(d)
    ) as GridParticle['direction'][];

    if (preferredDirs.length > 0) {
      return preferredDirs[Math.floor(Math.random() * preferredDirs.length)];
    }

    if (safeDirs.length > 0) {
      return safeDirs[Math.floor(Math.random() * safeDirs.length)];
    }

    // Fallback: invertir dirección
    const opposite: Record<GridParticle['direction'], GridParticle['direction']> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    return opposite[direction];
  }

  /**
   * Dibuja las partículas y sus trails con efecto blur difuminado
   */
  private draw(): void {
    this.graphics.clear();

    this.particles.forEach((particle) => {
      const { x, y, color, trail, trailLength } = particle;
      const { blurLayers } = this.config;

      // Dibujar trail con efecto blur difuminado
      trail.forEach((point) => {
        const progress = point.age / trailLength;
        const baseAlpha = (1 - progress) * 0.6;
        const baseSize = 2 + (1 - progress) * 2;

        // Múltiples capas para efecto blur
        for (let layer = blurLayers; layer >= 0; layer--) {
          const layerProgress = layer / blurLayers;
          const size = baseSize + layerProgress * 8;
          const alpha = baseAlpha * (1 - layerProgress) * 0.3;

          this.graphics.fillStyle(color, Math.max(0, alpha));
          this.graphics.fillCircle(point.x, point.y, size);
        }
      });

      // Dibujar partícula principal con efecto glow difuminado
      // Capas externas (más grandes, más transparentes)
      for (let layer = blurLayers; layer >= 0; layer--) {
        const layerProgress = layer / blurLayers;
        const size = 3 + layerProgress * 12;
        const alpha = 0.15 * (1 - layerProgress * 0.7);

        this.graphics.fillStyle(color, alpha);
        this.graphics.fillCircle(x, y, size);
      }

      // Glow medio
      this.graphics.fillStyle(color, 0.4);
      this.graphics.fillCircle(x, y, 4);

      // Núcleo brillante (blanco)
      this.graphics.fillStyle(0xffffff, 0.9);
      this.graphics.fillCircle(x, y, 1.5);
    });
  }

  /**
   * Establece la profundidad del graphics
   */
  setDepth(depth: number): this {
    this.graphics.setDepth(depth);
    return this;
  }

  /**
   * Destruye el sistema de partículas
   */
  destroy(): void {
    if (this.updateEvent) {
      this.updateEvent.destroy();
    }
    this.graphics.destroy();
    this.particles = [];
  }
}
