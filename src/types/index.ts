// Tipos elementales disponibles en el juego
export type TipoElemental =
  | 'fuego'
  | 'agua'
  | 'planta'
  | 'electrico'
  | 'tierra'
  | 'hielo'
  | 'volador'
  | 'roca'
  | 'normal'
  | 'fantasma';
// Categoría de movimiento: físico usa Ataque, especial usa Ataque Especial
export type CategoriaMovimiento = 'fisico' | 'especial' | 'estado';
// Efecto secundario de estado que puede causar un movimiento
export interface EfectoEstadoMovimiento {
  estado: Exclude<EstadoAlterado, null>; // El estado a aplicar
  probabilidad: number; // Probabilidad 0-100 de aplicar el estado
}

// Definición de un movimiento de combate
export interface Movimiento {
  id: string;
  nombre: string;
  tipo: TipoElemental;
  categoria: CategoriaMovimiento;
  poder: number; // 0 movimientos de estado
  precision: number; // 0-100 number
  ppMax: number; // Puntos de poder máximos
  descripcion: string;
  // Efecto de estado opcional (algunos movimientos pueden causar quemadura, parálisis, etc.)
  efectoEstado?: EfectoEstadoMovimiento;
}
// Estadísticas base de un kodamon
export interface EstadisticasBase {
  hp: number;
  ataque: number;
  defensa: number;
  ataqueEspecial: number;
  defensaEspecial: number;
  velocidad: number;
}
// Definición completa de un Kodamon
export interface KodamonData {
  id: string;
  nombre: string;
  tipo: TipoElemental;
  estadisticas: EstadisticasBase;
  movimientos: string[]; // IDs de los movimientos que puede aprender
  descripcion: string;
}
// Configuración visual de un tipo elemental
export interface TipoConfig {
  nombre: string;
  color: string; // Color hexadecimal principal
  colorClaro: string; // Color más claro para degradados
  icono: string; // Emoji representativo
}

// ═══════════════════════════════════════════════════════════════
// ESTADOS ALTERADOS
// ═══════════════════════════════════════════════════════════════

/**
 * Estados alterados que puede sufrir un Kodamon
 *
 * - quemado: Pierde HP cada turno, -50% ATK físico
 * - paralizado: 25% de no poder atacar, -50% VEL
 * - envenenado: Pierde HP cada turno (más que quemado)
 * - dormido: No puede atacar por 1-3 turnos
 * - congelado: No puede atacar hasta descongelarse
 */
export type EstadoAlterado =
  | 'quemado'
  | 'paralizado'
  | 'envenenado'
  | 'dormido'
  | 'congelado'
  | null;

/**
 * Configuración visual y descriptiva de un estado alterado
 */
export interface EstadoAlteradoConfig {
  id: EstadoAlterado;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
}

// Estado de un Kodamon durante la batalla
export interface KodamonBatalla {
  datos: KodamonData;
  hpActual: number;
  movimientosActuales: {
    movimiento: Movimiento;
    ppActual: number;
  }[];
  // ═══════════════════════════════════════════════════════════════
  // ESTADO ALTERADO (Fase 4.1.4)
  // ═══════════════════════════════════════════════════════════════
  /**
   * Estado alterado actual del Kodamon (null si no tiene ninguno)
   * Solo puede tener UN estado alterado a la vez
   */
  estadoAlterado: EstadoAlterado;
  /**
   * Turnos restantes para estados con duración limitada:
   * - dormido: 1-3 turnos
   * - congelado: 1-5 turnos
   * Para estados permanentes (quemado, paralizado, envenenado) este valor es 0
   */
  turnosEstado: number;
}
