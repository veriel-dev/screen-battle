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

// Estado de un Kodamon durante la batalla
export interface KodamonBatalla {
  datos: KodamonData;
  hpActual: number;
  movimientosActuales: {
    movimiento: Movimiento;
    ppActual: number;
  }[];
}
