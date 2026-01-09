import type { TournamentState, BattleResultData, ModeToBattleData } from '@game-types/index';
import { getPersistenceManager } from './PersistenceManager';
import { getKodamon } from '@data/kodamons';

const TOURNAMENT_ROUNDS = 4;

/**
 * Gestor del modo torneo
 * Maneja el estado del torneo entre batallas
 */
export class TournamentManager {
  private state: TournamentState;

  constructor(state: TournamentState) {
    this.state = { ...state };
  }

  /**
   * Obtiene el estado actual del torneo
   */
  getState(): TournamentState {
    return { ...this.state };
  }

  /**
   * Obtiene la ronda actual (1-4)
   */
  getCurrentRound(): number {
    return this.state.currentRound;
  }

  /**
   * Obtiene el número total de rondas
   */
  getTotalRounds(): number {
    return TOURNAMENT_ROUNDS;
  }

  /**
   * Obtiene el ID del oponente actual
   */
  getCurrentOpponentId(): string {
    return this.state.opponents[this.state.currentRound - 1];
  }

  /**
   * Obtiene los datos del oponente actual
   */
  getCurrentOpponent() {
    const opponentId = this.getCurrentOpponentId();
    return getKodamon(opponentId);
  }

  /**
   * Obtiene el HP actual del jugador
   */
  getPlayerHP(): number {
    return this.state.playerHP;
  }

  /**
   * Obtiene el HP máximo del jugador
   */
  getPlayerMaxHP(): number {
    return this.state.playerMaxHP;
  }

  /**
   * Obtiene el porcentaje de HP actual
   */
  getPlayerHPPercent(): number {
    return (this.state.playerHP / this.state.playerMaxHP) * 100;
  }

  /**
   * Verifica si el torneo está completado
   */
  isCompleted(): boolean {
    return this.state.completed;
  }

  /**
   * Verifica si es la ronda final
   */
  isFinalRound(): boolean {
    return this.state.currentRound === TOURNAMENT_ROUNDS;
  }

  /**
   * Procesa el resultado de una batalla
   * @returns Datos para la siguiente batalla o null si terminó
   */
  processResult(result: BattleResultData): {
    continueToNext: boolean;
    nextBattleData?: ModeToBattleData;
    tournamentResult?: 'victory' | 'defeat';
  } {
    // Actualizar HP del jugador
    this.state.playerHP = result.playerRemainingHP;

    // Registrar batalla en persistencia
    getPersistenceManager().recordBattle(
      result.playerKodamonId,
      result.enemyKodamonId,
      result.result,
      'torneo'
    );

    if (result.result === 'defeat') {
      // El jugador perdió - fin del torneo
      return {
        continueToNext: false,
        tournamentResult: 'defeat',
      };
    }

    // El jugador ganó la ronda
    if (this.isFinalRound()) {
      // Victoria del torneo
      this.state.completed = true;
      getPersistenceManager().recordTournamentWin();
      return {
        continueToNext: false,
        tournamentResult: 'victory',
      };
    }

    // Avanzar a siguiente ronda
    this.state.currentRound++;

    // Preparar datos para siguiente batalla
    const nextBattleData: ModeToBattleData = {
      mode: 'torneo',
      playerKodamonId: this.state.playerKodamonId,
      enemyKodamonId: this.getCurrentOpponentId(),
      arenaId: 'arena_grass', // Usar arena por defecto o rotar
      tournamentState: this.getState(),
    };

    return {
      continueToNext: true,
      nextBattleData,
    };
  }

  /**
   * Obtiene información del progreso para mostrar en UI
   */
  getProgressInfo(): {
    currentRound: number;
    totalRounds: number;
    opponents: { id: string; name: string; defeated: boolean }[];
    playerHP: number;
    playerMaxHP: number;
  } {
    return {
      currentRound: this.state.currentRound,
      totalRounds: TOURNAMENT_ROUNDS,
      opponents: this.state.opponents.map((id, index) => {
        const kodamon = getKodamon(id);
        return {
          id,
          name: kodamon?.nombre ?? id,
          defeated: index < this.state.currentRound - 1,
        };
      }),
      playerHP: this.state.playerHP,
      playerMaxHP: this.state.playerMaxHP,
    };
  }
}
