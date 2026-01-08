import Phaser from 'phaser';
import type { TipoElemental } from '@game-types/index';
import { getTipoConfig } from '@data/index';

/**
 * Sistema de efectos visuales para las batallas
 * Maneja partículas, impactos y animaciones de movimientos
 */
export class BattleEffects {
  private scene: Phaser.Scene;
  private particleTextures: Map<string, string> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.generarTexturasParticulas();
  }

  /**
   * Genera texturas de partículas para cada tipo elemental
   */
  private generarTexturasParticulas(): void {
    const tipos: TipoElemental[] = [
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

    tipos.forEach((tipo) => {
      const config = getTipoConfig(tipo);
      const key = `particle-${tipo}`;

      if (!this.scene.textures.exists(key)) {
        this.crearTexturaParticula(key, config.color);
      }
      this.particleTextures.set(tipo, key);
    });

    // Textura genérica para impactos
    if (!this.scene.textures.exists('particle-impact')) {
      this.crearTexturaParticula('particle-impact', '#ffffff');
    }

    // Textura para estrellas/destellos
    if (!this.scene.textures.exists('particle-star')) {
      this.crearTexturaEstrella('particle-star', '#ffff00');
    }
  }

  /**
   * Crea una textura circular para partículas
   */
  private crearTexturaParticula(key: string, color: string): void {
    const graphics = this.scene.add.graphics();
    const size = 8;

    // Círculo con gradiente simulado
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2);

    // Centro más brillante
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(size / 2, size / 2, size / 4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Crea una textura de estrella para destellos
   */
  private crearTexturaEstrella(key: string, color: string): void {
    const graphics = this.scene.add.graphics();
    const size = 12;
    const cx = size / 2;
    const cy = size / 2;

    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);

    // Dibujar forma de estrella simple (cruz)
    graphics.fillRect(cx - 1, 0, 2, size);
    graphics.fillRect(0, cy - 1, size, 2);
    graphics.fillRect(cx - 2, cy - 2, 4, 4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Efecto de ataque según el tipo elemental
   */
  atacar(
    tipo: TipoElemental,
    origen: { x: number; y: number },
    destino: { x: number; y: number },
    callback?: () => void
  ): void {
    const textureKey = this.particleTextures.get(tipo) || 'particle-impact';

    // Crear emisor de partículas para el proyectil
    const particles = this.scene.add.particles(origen.x, origen.y, textureKey, {
      speed: { min: 50, max: 100 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 2,
      frequency: 30,
      blendMode: 'ADD',
    });

    // Calcular dirección y duración
    const distance = Phaser.Math.Distance.Between(origen.x, origen.y, destino.x, destino.y);
    const duration = Math.max(200, distance * 1.5);

    // Animar el emisor hacia el destino
    this.scene.tweens.add({
      targets: particles,
      x: destino.x,
      y: destino.y,
      duration: duration,
      ease: 'Quad.easeIn',
      onComplete: () => {
        particles.stop();
        // Efecto de impacto al llegar
        this.impacto(destino.x, destino.y, tipo);

        this.scene.time.delayedCall(300, () => {
          particles.destroy();
          if (callback) callback();
        });
      },
    });
  }

  /**
   * Efecto de impacto cuando un ataque conecta
   */
  impacto(x: number, y: number, tipo?: TipoElemental): void {
    const textureKey = tipo
      ? this.particleTextures.get(tipo) || 'particle-impact'
      : 'particle-impact';

    // Explosión de partículas
    const explosion = this.scene.add.particles(x, y, textureKey, {
      speed: { min: 100, max: 200 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 15,
      blendMode: 'ADD',
      emitting: false,
    });

    explosion.explode(15);

    // Añadir estrellas/destellos
    const stars = this.scene.add.particles(x, y, 'particle-star', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8,
      blendMode: 'ADD',
      emitting: false,
    });

    stars.explode(8);

    // Limpiar después
    this.scene.time.delayedCall(600, () => {
      explosion.destroy();
      stars.destroy();
    });
  }

  /**
   * Efecto de daño recibido (flash rojo + shake)
   */
  recibirDano(sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite): void {
    // Flash rojo
    sprite.setTint(0xff0000);

    // Shake del sprite
    const originalX = sprite.x;
    this.scene.tweens.add({
      targets: sprite,
      x: originalX - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        sprite.clearTint();
        sprite.x = originalX;
      },
    });
  }

  /**
   * Efecto de curación (partículas verdes ascendentes)
   */
  curacion(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'particle-planta', {
      speed: { min: 20, max: 50 },
      angle: { min: 250, max: 290 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      quantity: 1,
      frequency: 100,
      blendMode: 'ADD',
    });

    this.scene.time.delayedCall(1000, () => {
      particles.stop();
      this.scene.time.delayedCall(800, () => particles.destroy());
    });
  }

  /**
   * Efecto de movimiento súper efectivo
   */
  superEfectivo(x: number, y: number): void {
    // Texto animado
    const texto = this.scene.add
      .text(x, y - 30, '¡Super Efectivo!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: texto,
      y: y - 60,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => texto.destroy(),
    });

    // Partículas extra
    this.impacto(x, y);
  }

  /**
   * Efecto de movimiento poco efectivo
   */
  pocoEfectivo(x: number, y: number): void {
    const texto = this.scene.add
      .text(x, y - 30, 'Poco Efectivo...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#888888',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: texto,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => texto.destroy(),
    });
  }

  /**
   * Efecto de crítico
   */
  critico(x: number, y: number): void {
    const texto = this.scene.add
      .text(x, y - 40, '¡CRÍTICO!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Animación de rebote
    this.scene.tweens.add({
      targets: texto,
      y: y - 70,
      scale: { from: 0.5, to: 1.3 },
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: texto,
          alpha: 0,
          duration: 500,
          onComplete: () => texto.destroy(),
        });
      },
    });
  }

  /**
   * Efecto de entrada de Kodamon (aparecer con estilo)
   */
  entradaKodamon(sprite: Phaser.GameObjects.Image, callback?: () => void): void {
    sprite.setAlpha(0);
    sprite.setScale(0.5);

    // Partículas de aparición
    const particles = this.scene.add.particles(sprite.x, sprite.y, 'particle-star', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 10,
      blendMode: 'ADD',
      emitting: false,
    });

    particles.explode(10);

    // Animación del sprite
    this.scene.tweens.add({
      targets: sprite,
      alpha: 1,
      scale: sprite.getData('originalScale') || 1,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        particles.destroy();
        if (callback) callback();
      },
    });
  }

  /**
   * Efecto de derrota mejorado (Kodamon cae dramáticamente)
   * Secuencia: Flash rojo → Shake → Tinte gris → Caída con rotación → Fade out
   */
  derrotaKodamon(sprite: Phaser.GameObjects.Image, callback?: () => void): void {
    const baseX = sprite.x;
    const baseY = sprite.y;

    // Fase 1: Flash rojo de impacto final
    sprite.setTint(0xff0000);

    // Fase 2: Shake horizontal rápido
    this.scene.tweens.add({
      targets: sprite,
      x: baseX - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        sprite.x = baseX;

        // Fase 3: Transición a gris (como perdiendo vida)
        sprite.setTint(0x888888);

        // Pequeña pausa antes de caer
        this.scene.time.delayedCall(200, () => {
          // Fase 4: Caída dramática con rotación y fade
          this.scene.tweens.add({
            targets: sprite,
            y: baseY + 50, // Cae más que antes
            alpha: 0,
            angle: 20, // Rota hacia el lado
            scaleX: 0.8, // Se encoge un poco
            scaleY: 0.8,
            duration: 800,
            ease: 'Quad.easeIn',
            onComplete: () => {
              sprite.setVisible(false);
              if (callback) callback();
            },
          });
        });
      },
    });
  }

  /**
   * Efecto de victoria (celebración)
   */
  victoriaKodamon(sprite: Phaser.GameObjects.Image): void {
    // Salto de celebración
    this.scene.tweens.add({
      targets: sprite,
      y: sprite.y - 15,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Quad.easeOut',
    });

    // Partículas de confeti
    const colores = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    colores.forEach((color, i) => {
      const key = `confetti-${i}`;
      if (!this.scene.textures.exists(key)) {
        const g = this.scene.add.graphics();
        g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color);
        g.fillRect(0, 0, 4, 4);
        g.generateTexture(key, 4, 4);
        g.destroy();
      }

      const confetti = this.scene.add.particles(sprite.x, sprite.y - 30, key, {
        speed: { min: 50, max: 150 },
        angle: { min: 220, max: 320 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
        gravityY: 100,
        quantity: 3,
        frequency: 100,
      });

      this.scene.time.delayedCall(1000, () => {
        confetti.stop();
        this.scene.time.delayedCall(1500, () => confetti.destroy());
      });
    });
  }

  /**
   * Limpieza de recursos
   */
  destroy(): void {
    this.particleTextures.clear();
  }
}
