import type { TipoElemental, TipoConfig } from '@game-types/index';

// Configuración visual de cada tipo elemental (estilo Cyber)
export const TIPOS_CONFIG: Record<TipoElemental, TipoConfig> = {
  fuego: {
    nombre: 'Fuego',
    color: '#ff6b6b',
    colorClaro: '#ff8a8a',
    icono: '▲',
  },
  agua: {
    nombre: 'Agua',
    color: '#00d4ff',
    colorClaro: '#66e5ff',
    icono: '◆',
  },
  planta: {
    nombre: 'Planta',
    color: '#00ff88',
    colorClaro: '#66ffaa',
    icono: '✦',
  },
  electrico: {
    nombre: 'Eléctrico',
    color: '#ffd93d',
    colorClaro: '#ffe066',
    icono: '϶',
  },
  tierra: {
    nombre: 'Tierra',
    color: '#d4a574',
    colorClaro: '#e0bc94',
    icono: '▣',
  },
  hielo: {
    nombre: 'Hielo',
    color: '#88ddff',
    colorClaro: '#aae8ff',
    icono: '✱',
  },
  volador: {
    nombre: 'Volador',
    color: '#aa88ff',
    colorClaro: '#c4aaff',
    icono: '≈',
  },
  roca: {
    nombre: 'Roca',
    color: '#bbaa88',
    colorClaro: '#d4c8aa',
    icono: '◼',
  },
  normal: {
    nombre: 'Normal',
    color: '#aaaaaa',
    colorClaro: '#cccccc',
    icono: '●',
  },
  fantasma: {
    nombre: 'Fantasma',
    color: '#9d4edd',
    colorClaro: '#b366e8',
    icono: '◐',
  },
};

// Helper para obtener la configuración de un tipo
export function getTipoConfig(tipo: TipoElemental): TipoConfig {
  return TIPOS_CONFIG[tipo];
}
