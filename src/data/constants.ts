/**
 * Constantes del sistema de batalla
 *
 * Este archivo centraliza todos los valores configurables del combate.
 * Modificar estos valores afecta el balance del juego.
 */

export const BATTLE_CONSTANTS = {
  // ═══════════════════════════════════════════════════════════════
  // SISTEMA DE VELOCIDAD (Fase 4.1.1)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Nivel base de todos los Kodamon (por ahora fijo)
   * En el futuro podría ser dinámico
   */
  NIVEL_BASE: 50,

  // ═══════════════════════════════════════════════════════════════
  // SISTEMA DE CRÍTICOS (Fase 4.1.2 - Para implementar después)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Probabilidad base de golpe crítico: 6.25% (1/16)
   * Igual que en los juegos de Pokémon clásicos (Gen 2-6)
   */
  CRITICAL_CHANCE: 0.0625,

  /**
   * Multiplicador de daño en golpe crítico
   * 1.5 = 50% más de daño
   */
  CRITICAL_MULTIPLIER: 1.5,

  // ═══════════════════════════════════════════════════════════════
  // SISTEMA DE DAÑO
  // ═══════════════════════════════════════════════════════════════

  /**
   * STAB (Same Type Attack Bonus)
   * Bonus cuando el tipo del movimiento coincide con el tipo del Kodamon
   */
  STAB_MULTIPLIER: 1.5,

  /**
   * Rango de variación aleatoria del daño
   * El daño final se multiplica por un valor entre estos dos
   */
  RANDOM_MIN: 0.85,
  RANDOM_MAX: 1.0,

  // ═══════════════════════════════════════════════════════════════
  // EFECTIVIDAD DE TIPOS
  // ═══════════════════════════════════════════════════════════════

  /** Multiplicador para ataques súper efectivos */
  SUPER_EFFECTIVE: 2.0,

  /** Multiplicador para ataques normales */
  NORMAL_EFFECTIVE: 1.0,

  /** Multiplicador para ataques poco efectivos */
  NOT_EFFECTIVE: 0.5,

  /** Multiplicador para ataques sin efecto */
  NO_EFFECT: 0.0,

  // ═══════════════════════════════════════════════════════════════
  // TIEMPOS DE ANIMACIÓN (en milisegundos)
  // ═══════════════════════════════════════════════════════════════

  /** Duración del mensaje de diálogo antes de continuar */
  DIALOG_DURATION: 1500,

  /** Tiempo antes de mostrar el siguiente turno */
  TURN_DELAY: 800,

  /** Duración del fade entre escenas */
  FADE_DURATION: 400,
} as const;

/**
 * Tipo para acceder a las constantes con autocompletado
 */
export type BattleConstantsType = typeof BATTLE_CONSTANTS;
