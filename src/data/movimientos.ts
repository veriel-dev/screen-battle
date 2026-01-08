import type { Movimiento } from '@game-types/index';

export const MOVIMIENTOS: Record<string, Movimiento> = {
  // Movimientos de Fuego
  llamarada: {
    id: 'llamarada',
    nombre: 'Llamarada',
    tipo: 'fuego',
    categoria: 'especial',
    poder: 90,
    precision: 100,
    ppMax: 15,
    descripcion: 'Lanza una intensa ráfaga de fuego. Puede quemar.',
    efectoEstado: { estado: 'quemado', probabilidad: 10 },
  },
  ascuas: {
    id: 'ascuas',
    nombre: 'Ascuas',
    tipo: 'fuego',
    categoria: 'especial',
    poder: 40,
    precision: 100,
    ppMax: 25,
    descripcion: 'Ataca con pequeñas llamas. Puede quemar.',
    efectoEstado: { estado: 'quemado', probabilidad: 10 },
  },

  // Movimientos de Agua
  hidrobomba: {
    id: 'hidrobomba',
    nombre: 'Hidrobomba',
    tipo: 'agua',
    categoria: 'especial',
    poder: 110,
    precision: 80,
    ppMax: 5,
    descripcion: 'Dispara un potente chorro de agua.',
  },
  pistolAagua: {
    id: 'pistolAagua',
    nombre: 'Pistola Agua',
    tipo: 'agua',
    categoria: 'especial',
    poder: 40,
    precision: 100,
    ppMax: 25,
    descripcion: 'Dispara un chorro de agua.',
  },

  // Movimientos de Planta
  latigocepa: {
    id: 'latigocepa',
    nombre: 'Látigo Cepa',
    tipo: 'planta',
    categoria: 'fisico',
    poder: 45,
    precision: 100,
    ppMax: 25,
    descripcion: 'Golpea con látigos de vid.',
  },
  rayoSolar: {
    id: 'rayoSolar',
    nombre: 'Rayo Solar',
    tipo: 'planta',
    categoria: 'especial',
    poder: 120,
    precision: 100,
    ppMax: 10,
    descripcion: 'Absorbe luz y lanza un rayo devastador.',
  },

  // Movimientos de Eléctrico
  rayo: {
    id: 'rayo',
    nombre: 'Rayo',
    tipo: 'electrico',
    categoria: 'especial',
    poder: 90,
    precision: 100,
    ppMax: 15,
    descripcion: 'Un potente ataque eléctrico. Puede paralizar.',
    efectoEstado: { estado: 'paralizado', probabilidad: 10 },
  },
  impactrueno: {
    id: 'impactrueno',
    nombre: 'Impactrueno',
    tipo: 'electrico',
    categoria: 'especial',
    poder: 40,
    precision: 100,
    ppMax: 30,
    descripcion: 'Lanza una descarga eléctrica. Puede paralizar.',
    efectoEstado: { estado: 'paralizado', probabilidad: 10 },
  },

  // Movimientos de Tierra
  terremoto: {
    id: 'terremoto',
    nombre: 'Terremoto',
    tipo: 'tierra',
    categoria: 'fisico',
    poder: 100,
    precision: 100,
    ppMax: 10,
    descripcion: 'Sacude la tierra con gran fuerza.',
  },
  excavar: {
    id: 'excavar',
    nombre: 'Excavar',
    tipo: 'tierra',
    categoria: 'fisico',
    poder: 80,
    precision: 100,
    ppMax: 10,
    descripcion: 'Cava bajo tierra y ataca.',
  },

  // Movimientos de Hielo
  rayoHielo: {
    id: 'rayoHielo',
    nombre: 'Rayo Hielo',
    tipo: 'hielo',
    categoria: 'especial',
    poder: 90,
    precision: 100,
    ppMax: 10,
    descripcion: 'Lanza un rayo de aire helado. Puede congelar.',
    efectoEstado: { estado: 'congelado', probabilidad: 10 },
  },
  ventisca: {
    id: 'ventisca',
    nombre: 'Ventisca',
    tipo: 'hielo',
    categoria: 'especial',
    poder: 110,
    precision: 70,
    ppMax: 5,
    descripcion: 'Invoca una tormenta de nieve. Puede congelar.',
    efectoEstado: { estado: 'congelado', probabilidad: 10 },
  },

  // Movimientos de Volador
  alaDeAcero: {
    id: 'alaDeAcero',
    nombre: 'Ala de Acero',
    tipo: 'volador',
    categoria: 'fisico',
    poder: 70,
    precision: 90,
    ppMax: 25,
    descripcion: 'Golpea con alas endurecidas.',
  },
  tornado: {
    id: 'tornado',
    nombre: 'Tornado',
    tipo: 'volador',
    categoria: 'especial',
    poder: 40,
    precision: 100,
    ppMax: 35,
    descripcion: 'Crea un pequeño tornado.',
  },

  // Movimientos de Roca
  avalancha: {
    id: 'avalancha',
    nombre: 'Avalancha',
    tipo: 'roca',
    categoria: 'fisico',
    poder: 75,
    precision: 90,
    ppMax: 10,
    descripcion: 'Lanza grandes rocas al enemigo.',
  },
  lanzarrocas: {
    id: 'lanzarrocas',
    nombre: 'Lanzarrocas',
    tipo: 'roca',
    categoria: 'fisico',
    poder: 50,
    precision: 90,
    ppMax: 15,
    descripcion: 'Lanza rocas pequeñas.',
  },

  // Movimientos de Normal
  placaje: {
    id: 'placaje',
    nombre: 'Placaje',
    tipo: 'normal',
    categoria: 'fisico',
    poder: 40,
    precision: 100,
    ppMax: 35,
    descripcion: 'Embiste con todo el cuerpo.',
  },
  golpeCuerpo: {
    id: 'golpeCuerpo',
    nombre: 'Golpe Cuerpo',
    tipo: 'normal',
    categoria: 'fisico',
    poder: 85,
    precision: 100,
    ppMax: 15,
    descripcion: 'Ataca con todo el peso del cuerpo. Puede paralizar.',
    efectoEstado: { estado: 'paralizado', probabilidad: 30 },
  },

  // Movimientos de Fantasma
  bolaSombra: {
    id: 'bolaSombra',
    nombre: 'Bola Sombra',
    tipo: 'fantasma',
    categoria: 'especial',
    poder: 80,
    precision: 100,
    ppMax: 15,
    descripcion: 'Lanza una bola de oscuridad.',
  },
  lenguetazo: {
    id: 'lenguetazo',
    nombre: 'Lengüetazo',
    tipo: 'fantasma',
    categoria: 'fisico',
    poder: 30,
    precision: 100,
    ppMax: 30,
    descripcion: 'Lame al enemigo con lengua espectral. Puede paralizar.',
    efectoEstado: { estado: 'paralizado', probabilidad: 30 },
  },

  // ═══════════════════════════════════════════════════════════════
  // MOVIMIENTOS DE ESTADO (Fase 4.1.4)
  // ═══════════════════════════════════════════════════════════════

  hipnosis: {
    id: 'hipnosis',
    nombre: 'Hipnosis',
    tipo: 'fantasma',
    categoria: 'estado',
    poder: 0,
    precision: 60,
    ppMax: 20,
    descripcion: 'Hipnotiza al rival para dormirlo.',
    efectoEstado: { estado: 'dormido', probabilidad: 100 },
  },
  toxico: {
    id: 'toxico',
    nombre: 'Tóxico',
    tipo: 'normal',
    categoria: 'estado',
    poder: 0,
    precision: 90,
    ppMax: 10,
    descripcion: 'Envenena gravemente al rival.',
    efectoEstado: { estado: 'envenenado', probabilidad: 100 },
  },
  paralizador: {
    id: 'paralizador',
    nombre: 'Onda Trueno',
    tipo: 'electrico',
    categoria: 'estado',
    poder: 0,
    precision: 90,
    ppMax: 20,
    descripcion: 'Lanza una onda eléctrica que paraliza.',
    efectoEstado: { estado: 'paralizado', probabilidad: 100 },
  },
};

// Helper para obtener un movimiento por ID
export function getMovimiento(id: string): Movimiento | undefined {
  return MOVIMIENTOS[id];
}

// Helper para obtener varios movimientos por IDs
export function getMovimientos(ids: string[]): Movimiento[] {
  return ids.map((id) => MOVIMIENTOS[id]).filter(Boolean);
}
