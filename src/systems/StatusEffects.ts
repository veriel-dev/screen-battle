/**
 * Sistema de Estados Alterados (Fase 4.1.4)
 *
 * Gestiona los estados alterados que pueden afectar a los Kodamon:
 * - quemado: Daño por turno, reduce ataque físico
 * - paralizado: Puede no atacar, reduce velocidad
 * - envenenado: Daño por turno (más que quemado)
 * - dormido: No puede atacar por 1-3 turnos
 * - congelado: No puede atacar hasta descongelarse
 */

import type { EstadoAlterado, EstadoAlteradoConfig, KodamonBatalla } from '@game-types/index';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE ESTADOS ALTERADOS
// ═══════════════════════════════════════════════════════════════

export const STATUS_CONSTANTS = {
  /**
   * Daño de quemadura por turno: 1/16 del HP máximo (6.25%)
   */
  BURN_DAMAGE_FRACTION: 16,

  /**
   * Reducción de ataque físico cuando está quemado: 50%
   */
  BURN_ATTACK_MODIFIER: 0.5,

  /**
   * Daño de veneno por turno: 1/8 del HP máximo (12.5%)
   */
  POISON_DAMAGE_FRACTION: 8,

  /**
   * Probabilidad de no poder atacar por parálisis: 25%
   */
  PARALYSIS_SKIP_CHANCE: 0.25,

  /**
   * Reducción de velocidad cuando está paralizado: 50%
   */
  PARALYSIS_SPEED_MODIFIER: 0.5,

  /**
   * Turnos mínimos dormido
   */
  SLEEP_MIN_TURNS: 1,

  /**
   * Turnos máximos dormido
   */
  SLEEP_MAX_TURNS: 3,

  /**
   * Turnos mínimos congelado
   */
  FREEZE_MIN_TURNS: 1,

  /**
   * Turnos máximos congelado
   */
  FREEZE_MAX_TURNS: 5,

  /**
   * Probabilidad de descongelarse al recibir ataque fuego: 100%
   */
  FREEZE_THAW_ON_FIRE: 1.0,
} as const;

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN VISUAL DE ESTADOS
// ═══════════════════════════════════════════════════════════════

/**
 * Configuración visual y descriptiva de cada estado alterado
 */
export const ESTADOS_CONFIG: Record<Exclude<EstadoAlterado, null>, EstadoAlteradoConfig> = {
  quemado: {
    id: 'quemado',
    nombre: 'QUE',
    icono: '🔥',
    color: '#ff6b35',
    descripcion: 'Pierde HP cada turno. Ataque físico reducido.',
  },
  paralizado: {
    id: 'paralizado',
    nombre: 'PAR',
    icono: '⚡',
    color: '#ffd93d',
    descripcion: 'Puede no atacar. Velocidad reducida.',
  },
  envenenado: {
    id: 'envenenado',
    nombre: 'ENV',
    icono: '☠️',
    color: '#9b59b6',
    descripcion: 'Pierde HP cada turno.',
  },
  dormido: {
    id: 'dormido',
    nombre: 'DOR',
    icono: '💤',
    color: '#3498db',
    descripcion: 'No puede atacar durante varios turnos.',
  },
  congelado: {
    id: 'congelado',
    nombre: 'CON',
    icono: '❄️',
    color: '#74b9ff',
    descripcion: 'No puede atacar hasta descongelarse.',
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene la configuración visual de un estado alterado
 */
export function getEstadoConfig(estado: EstadoAlterado): EstadoAlteradoConfig | null {
  if (estado === null) return null;
  return ESTADOS_CONFIG[estado];
}

/**
 * Aplica un estado alterado a un Kodamon
 * Retorna true si se aplicó exitosamente, false si ya tenía un estado
 */
export function aplicarEstado(
  kodamon: KodamonBatalla,
  estado: Exclude<EstadoAlterado, null>
): boolean {
  // Un Kodamon solo puede tener UN estado alterado a la vez
  if (kodamon.estadoAlterado !== null) {
    console.log(
      `[Estado] ${kodamon.datos.nombre} ya tiene ${kodamon.estadoAlterado}, ` +
        `no se puede aplicar ${estado}`
    );
    return false;
  }

  kodamon.estadoAlterado = estado;

  // Calcular turnos para estados con duración limitada
  if (estado === 'dormido') {
    kodamon.turnosEstado =
      Math.floor(
        Math.random() * (STATUS_CONSTANTS.SLEEP_MAX_TURNS - STATUS_CONSTANTS.SLEEP_MIN_TURNS + 1)
      ) + STATUS_CONSTANTS.SLEEP_MIN_TURNS;
    console.log(
      `[Estado] ${kodamon.datos.nombre} se ha dormido por ${kodamon.turnosEstado} turnos`
    );
  } else if (estado === 'congelado') {
    kodamon.turnosEstado =
      Math.floor(
        Math.random() * (STATUS_CONSTANTS.FREEZE_MAX_TURNS - STATUS_CONSTANTS.FREEZE_MIN_TURNS + 1)
      ) + STATUS_CONSTANTS.FREEZE_MIN_TURNS;
    console.log(
      `[Estado] ${kodamon.datos.nombre} se ha congelado por ${kodamon.turnosEstado} turnos`
    );
  } else {
    // Estados permanentes (quemado, paralizado, envenenado)
    kodamon.turnosEstado = 0;
    console.log(`[Estado] ${kodamon.datos.nombre} ahora está ${estado}`);
  }

  return true;
}

/**
 * Cura el estado alterado de un Kodamon
 */
export function curarEstado(kodamon: KodamonBatalla): void {
  if (kodamon.estadoAlterado !== null) {
    console.log(`[Estado] ${kodamon.datos.nombre} se ha curado de ${kodamon.estadoAlterado}`);
    kodamon.estadoAlterado = null;
    kodamon.turnosEstado = 0;
  }
}

/**
 * Calcula el daño por estado al inicio del turno
 * Retorna el daño a aplicar (0 si no hay daño por estado)
 */
export function calcularDañoPorEstado(kodamon: KodamonBatalla): number {
  const hpMax = kodamon.datos.estadisticas.hp;

  switch (kodamon.estadoAlterado) {
    case 'quemado': {
      const dañoQuemado = Math.floor(hpMax / STATUS_CONSTANTS.BURN_DAMAGE_FRACTION);
      console.log(`[Estado] ${kodamon.datos.nombre} sufre ${dañoQuemado} de daño por quemadura`);
      return dañoQuemado;
    }

    case 'envenenado': {
      const dañoVeneno = Math.floor(hpMax / STATUS_CONSTANTS.POISON_DAMAGE_FRACTION);
      console.log(`[Estado] ${kodamon.datos.nombre} sufre ${dañoVeneno} de daño por veneno`);
      return dañoVeneno;
    }

    default:
      return 0;
  }
}

/**
 * Verifica si el Kodamon puede atacar este turno
 * Retorna { puedeAtacar: boolean, mensaje: string }
 */
export function verificarPuedeAtacar(kodamon: KodamonBatalla): {
  puedeAtacar: boolean;
  mensaje: string;
} {
  switch (kodamon.estadoAlterado) {
    case 'dormido':
      // Reducir contador de turnos
      if (kodamon.turnosEstado > 0) {
        kodamon.turnosEstado--;
        if (kodamon.turnosEstado === 0) {
          // Se despierta
          curarEstado(kodamon);
          return {
            puedeAtacar: true,
            mensaje: `${kodamon.datos.nombre} se ha despertado!`,
          };
        }
        return {
          puedeAtacar: false,
          mensaje: `${kodamon.datos.nombre} está dormido...`,
        };
      }
      break;

    case 'congelado':
      // Reducir contador de turnos
      if (kodamon.turnosEstado > 0) {
        kodamon.turnosEstado--;
        if (kodamon.turnosEstado === 0) {
          // Se descongela
          curarEstado(kodamon);
          return {
            puedeAtacar: true,
            mensaje: `${kodamon.datos.nombre} se ha descongelado!`,
          };
        }
        return {
          puedeAtacar: false,
          mensaje: `${kodamon.datos.nombre} está congelado!`,
        };
      }
      break;

    case 'paralizado':
      // 25% de probabilidad de no poder atacar
      if (Math.random() < STATUS_CONSTANTS.PARALYSIS_SKIP_CHANCE) {
        return {
          puedeAtacar: false,
          mensaje: `${kodamon.datos.nombre} está paralizado! No puede moverse!`,
        };
      }
      break;
  }

  return { puedeAtacar: true, mensaje: '' };
}

/**
 * Obtiene el modificador de ataque según el estado
 * (quemado reduce ataque físico al 50%)
 */
export function getModificadorAtaque(kodamon: KodamonBatalla): number {
  if (kodamon.estadoAlterado === 'quemado') {
    return STATUS_CONSTANTS.BURN_ATTACK_MODIFIER;
  }
  return 1.0;
}

/**
 * Obtiene el modificador de velocidad según el estado
 * (paralizado reduce velocidad al 50%)
 */
export function getModificadorVelocidad(kodamon: KodamonBatalla): number {
  if (kodamon.estadoAlterado === 'paralizado') {
    return STATUS_CONSTANTS.PARALYSIS_SPEED_MODIFIER;
  }
  return 1.0;
}
