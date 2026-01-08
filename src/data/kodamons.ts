import type { KodamonData } from '@game-types/index';

export const KODAMONS: Record<string, KodamonData> = {
  pyrex: {
    id: 'pyrex',
    nombre: 'Pyrex',
    tipo: 'fuego',
    estadisticas: {
      hp: 78,
      ataque: 84,
      defensa: 78,
      ataqueEspecial: 109,
      defensaEspecial: 85,
      velocidad: 100,
    },
    movimientos: ['llamarada', 'ascuas', 'placaje', 'golpeCuerpo'],
    descripcion: 'Un lagarto de fuego con llamas en la cola.',
  },
  aquon: {
    id: 'aquon',
    nombre: 'Aquon',
    tipo: 'agua',
    estadisticas: {
      hp: 84,
      ataque: 79,
      defensa: 83,
      ataqueEspecial: 100,
      defensaEspecial: 105,
      velocidad: 78,
    },
    movimientos: ['hidrobomba', 'pistolAagua', 'placaje', 'rayoHielo'],
    descripcion: 'Una tortuga marina con caparazón brillante.',
  },
  florix: {
    id: 'florix',
    nombre: 'Florix',
    tipo: 'planta',
    estadisticas: {
      hp: 80,
      ataque: 82,
      defensa: 83,
      ataqueEspecial: 100,
      defensaEspecial: 100,
      velocidad: 80,
    },
    movimientos: ['rayoSolar', 'latigocepa', 'placaje', 'golpeCuerpo'],
    descripcion: 'Una criatura con una flor en el lomo.',
  },
  voltik: {
    id: 'voltik',
    nombre: 'Voltik',
    tipo: 'electrico',
    estadisticas: {
      hp: 60,
      ataque: 65,
      defensa: 60,
      ataqueEspecial: 110,
      defensaEspecial: 80,
      velocidad: 130,
    },
    movimientos: ['rayo', 'impactrueno', 'placaje', 'paralizador'],
    descripcion: 'Un roedor eléctrico muy veloz.',
  },
  terron: {
    id: 'terron',
    nombre: 'Terron',
    tipo: 'tierra',
    estadisticas: {
      hp: 110,
      ataque: 120,
      defensa: 130,
      ataqueEspecial: 55,
      defensaEspecial: 65,
      velocidad: 45,
    },
    movimientos: ['terremoto', 'excavar', 'avalancha', 'golpeCuerpo'],
    descripcion: 'Un golem de roca y tierra muy resistente.',
  },
  glaceon: {
    id: 'glaceon',
    nombre: 'Glaceon',
    tipo: 'hielo',
    estadisticas: {
      hp: 65,
      ataque: 60,
      defensa: 110,
      ataqueEspecial: 130,
      defensaEspecial: 95,
      velocidad: 65,
    },
    movimientos: ['ventisca', 'rayoHielo', 'placaje', 'tornado'],
    descripcion: 'Un zorro de hielo con pelaje cristalino.',
  },
  aerix: {
    id: 'aerix',
    nombre: 'Aerix',
    tipo: 'volador',
    estadisticas: {
      hp: 83,
      ataque: 80,
      defensa: 75,
      ataqueEspecial: 95,
      defensaEspecial: 70,
      velocidad: 115,
    },
    movimientos: ['alaDeAcero', 'tornado', 'placaje', 'impactrueno'],
    descripcion: 'Un ave majestuosa que domina los cielos.',
  },
  petros: {
    id: 'petros',
    nombre: 'Petros',
    tipo: 'roca',
    estadisticas: {
      hp: 80,
      ataque: 110,
      defensa: 130,
      ataqueEspecial: 55,
      defensaEspecial: 80,
      velocidad: 45,
    },
    movimientos: ['avalancha', 'lanzarrocas', 'terremoto', 'golpeCuerpo'],
    descripcion: 'Una serpiente hecha de rocas apiladas.',
  },
  normex: {
    id: 'normex',
    nombre: 'Normex',
    tipo: 'normal',
    estadisticas: {
      hp: 105,
      ataque: 95,
      defensa: 80,
      ataqueEspecial: 70,
      defensaEspecial: 80,
      velocidad: 90,
    },
    movimientos: ['golpeCuerpo', 'placaje', 'excavar', 'alaDeAcero'],
    descripcion: 'Una criatura común pero versátil.',
  },
  spekter: {
    id: 'spekter',
    nombre: 'Spekter',
    tipo: 'fantasma',
    estadisticas: {
      hp: 60,
      ataque: 65,
      defensa: 60,
      ataqueEspecial: 130,
      defensaEspecial: 75,
      velocidad: 110,
    },
    movimientos: ['bolaSombra', 'lenguetazo', 'hipnosis', 'rayo'],
    descripcion: 'Un espíritu travieso que flota en las sombras.',
  },
};

// Helper para obtener un Kodamon por ID
export function getKodamon(id: string): KodamonData | undefined {
  return KODAMONS[id];
}

// Helper para obtener todos los Kodamon como array
export function getAllKodamons(): KodamonData[] {
  return Object.values(KODAMONS);
}

// Helper para obtener un Kodamon aleatorio
export function getRandomKodamon(): KodamonData {
  const kodamons = getAllKodamons();
  return kodamons[Math.floor(Math.random() * kodamons.length)];
}
