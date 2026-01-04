import type { TipoElemental, TipoConfig } from '@game-types/index';

// Configuración visual de cada tipo elemental
export const TIPOS_CONFIG: Record<TipoElemental, TipoConfig> = {
  fuego: {
    nombre: 'Fuego',
    color: '#f08030',
    colorClaro: '#f5ac78',
    icono: '🔥',
  },
  agua: {
    nombre: 'Agua',
    color: '#6890f0',
    colorClaro: '#9db7f5',
    icono: '💧',
  },
  planta: {
    nombre: 'Planta',
    color: '#78c850',
    colorClaro: '#a7db8d',
    icono: '🌿',
  },
  electrico: {
    nombre: 'Eléctrico',
    color: '#f8d030',
    colorClaro: '#fae078',
    icono: '⚡',
  },
  tierra: {
    nombre: 'Tierra',
    color: '#e0c068',
    colorClaro: '#ebd69d',
    icono: '🏔️',
  },
  hielo: {
    nombre: 'Hielo',
    color: '#98d8d8',
    colorClaro: '#bce6e6',
    icono: '❄️',
  },
  volador: {
    nombre: 'Volador',
    color: '#a890f0',
    colorClaro: '#c6b7f5',
    icono: '🌪️',
  },
  roca: {
    nombre: 'Roca',
    color: '#b8a038',
    colorClaro: '#d1c17d',
    icono: '🪨',
  },
  normal: {
    nombre: 'Normal',
    color: '#a8a878',
    colorClaro: '#c6c6a7',
    icono: '⭐',
  },
  fantasma: {
    nombre: 'Fantasma',
    color: '#705898',
    colorClaro: '#a292bc',
    icono: '👻',
  },
};

// Helper para obtener la configuración de un tipo
export function getTipoConfig(tipo: TipoElemental): TipoConfig {
  return TIPOS_CONFIG[tipo];
}
