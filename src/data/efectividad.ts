import type { TipoElemental } from '@game-types/index';
// Multiplicadores de daño según tipo atacante vs tipo defensor
// 2 = súper efectivo, 0.5 = poco efectivo, 0 = inmune
type TablaEfectividad = Record<TipoElemental, Partial<Record<TipoElemental, number>>>;

const TABLA_EFECTIVIDAD: TablaEfectividad = {
  fuego: {
    planta: 2,
    hielo: 2,
    agua: 0.5,
    roca: 0.5,
    fuego: 0.5,
  },
  agua: {
    fuego: 2,
    tierra: 2,
    roca: 2,
    planta: 0.5,
    agua: 0.5,
  },
  planta: {
    agua: 2,
    tierra: 2,
    roca: 2,
    fuego: 0.5,
    planta: 0.5,
    volador: 0.5,
    hielo: 0.5,
  },
  electrico: {
    agua: 2,
    volador: 2,
    tierra: 0,
    electrico: 0.5,
    planta: 0.5,
  },
  tierra: {
    fuego: 2,
    electrico: 2,
    roca: 2,
    planta: 0.5,
    volador: 0,
  },
  hielo: {
    planta: 2,
    tierra: 2,
    volador: 2,
    fuego: 0.5,
    agua: 0.5,
    hielo: 0.5,
  },
  volador: {
    planta: 2,
    electrico: 0.5,
    roca: 0.5,
  },
  roca: {
    fuego: 2,
    hielo: 2,
    volador: 2,
    tierra: 0.5,
  },
  normal: {
    roca: 0.5,
    fantasma: 0,
  },
  fantasma: {
    fantasma: 2,
    normal: 0,
  },
};
// Calcula el multiplicador de efectividad
export function getEfectividad(tipoAtaque: TipoElemental, tipoDefensor: TipoElemental): number {
  return TABLA_EFECTIVIDAD[tipoAtaque][tipoDefensor] ?? 1;
}
// Devuelve un texto descriptivo de la efectividad
export function getTextoEfectividad(multiplicador: number): string | null {
  if (multiplicador >= 2) return '¡Es súper efectivo!';
  if (multiplicador === 0) return 'No afecta al enemigo...';
  if (multiplicador <= 0.5) return 'No es muy efectivo...';
  return null;
}
