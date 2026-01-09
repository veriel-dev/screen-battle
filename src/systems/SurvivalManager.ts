import Phaser from 'phaser';
import type { SurvivalState, BattleResultData, ModeToBattleData } from '@game-types/index';
import { getPersistenceManager } from './PersistenceManager';
import { getAllKodamons } from '@data/kodamons';

// Porcentaje de HP que se recupera entre oleadas
const HP_RECOVERY_PERCENT = 0.5;

/**
 * Gestor del modo supervivencia
 * Maneja el estado del modo supervivencia entre batallas
 */
export class SurvivalManager {
  private state: SurvivalState;

  constructor(state: SurvivalState) {
    this.state = { ...state };
  }

  /**
   * Obtiene el estado actual
   */
  getState(): SurvivalState {
    return { ...this.state };
  }

  /**
   * Obtiene la oleada actual
   */
  getCurrentWave(): number {
    return this.state.currentWave;
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
   * Obtiene el total de enemigos derrotados
   */
  getEnemiesDefeated(): number {
    return this.state.enemiesDefeated;
  }

  /**
   * Obtiene el mejor récord
   */
  getBestWave(): number {
    return this.state.bestWave;
  }

  /**
   * Genera un oponente para la oleada actual
   * Las oleadas más altas tienen enemigos más variados
   */
  generateOpponent(): string {
    // Obtener Kodamon disponibles (excluir el del jugador)
    const allKodamons = getAllKodamons();
    const available = allKodamons.filter((k) => k.id !== this.state.playerKodamonId);

    // En oleadas más altas, preferir Kodamon con mejores stats
    if (this.state.currentWave >= 10) {
      // Oleada 10+: Solo Kodamon con stats altos
      const strong = available.filter(
        (k) =>
          k.estadisticas.hp >= 80 ||
          k.estadisticas.ataque >= 100 ||
          k.estadisticas.ataqueEspecial >= 100
      );
      if (strong.length > 0) {
        return Phaser.Math.RND.pick(strong).id;
      }
    } else if (this.state.currentWave >= 5) {
      // Oleada 5-9: Mezcla de todos
      // Aleatorio puro
    }

    // Oleadas 1-4: Cualquier Kodamon
    return Phaser.Math.RND.pick(available).id;
  }

  /**
   * Procesa el resultado de una batalla
   * @returns Datos para la siguiente batalla o null si terminó
   */
  processResult(result: BattleResultData): {
    continueToNext: boolean;
    nextBattleData?: ModeToBattleData;
    finalWave?: number;
    isNewRecord?: boolean;
  } {
    // Registrar batalla en persistencia
    getPersistenceManager().recordBattle(
      result.playerKodamonId,
      result.enemyKodamonId,
      result.result,
      'supervivencia'
    );

    if (result.result === 'defeat') {
      // El jugador perdió - fin del modo supervivencia
      const isNewRecord = this.state.currentWave > this.state.bestWave;

      if (isNewRecord) {
        // Actualizar récord
        this.state.bestWave = this.state.currentWave;
        getPersistenceManager().recordSurvivalWave(this.state.currentWave);
      }

      return {
        continueToNext: false,
        finalWave: this.state.currentWave,
        isNewRecord,
      };
    }

    // El jugador ganó - avanzar a siguiente oleada
    this.state.enemiesDefeated++;
    this.state.currentWave++;

    // Recuperar HP parcialmente
    const hpRecovery = Math.floor(this.state.playerMaxHP * HP_RECOVERY_PERCENT);
    this.state.playerHP = Math.min(result.playerRemainingHP + hpRecovery, this.state.playerMaxHP);

    // Actualizar récord si es necesario
    if (this.state.currentWave > this.state.bestWave) {
      this.state.bestWave = this.state.currentWave;
      getPersistenceManager().recordSurvivalWave(this.state.currentWave);
    }

    // Generar siguiente oponente
    const nextOpponentId = this.generateOpponent();

    // Rotar arenas basado en la oleada
    const arenas = ['arena_grass', 'arena_desert', 'arena_ice', 'arena_fire'];
    const arenaIndex = (this.state.currentWave - 1) % arenas.length;

    // Preparar datos para siguiente batalla
    const nextBattleData: ModeToBattleData = {
      mode: 'supervivencia',
      playerKodamonId: this.state.playerKodamonId,
      enemyKodamonId: nextOpponentId,
      arenaId: arenas[arenaIndex],
      survivalState: this.getState(),
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
    currentWave: number;
    enemiesDefeated: number;
    bestWave: number;
    playerHP: number;
    playerMaxHP: number;
    hpPercent: number;
  } {
    return {
      currentWave: this.state.currentWave,
      enemiesDefeated: this.state.enemiesDefeated,
      bestWave: this.state.bestWave,
      playerHP: this.state.playerHP,
      playerMaxHP: this.state.playerMaxHP,
      hpPercent: this.getPlayerHPPercent(),
    };
  }

  /**
   * Obtiene el modificador de dificultad para la oleada actual
   * Se usa para ajustar stats del enemigo
   */
  getDifficultyModifier(): number {
    // Incrementar dificultad gradualmente
    // Oleada 1: 1.0, Oleada 10: 1.2, Oleada 20: 1.4
    return 1 + Math.floor(this.state.currentWave / 10) * 0.2;
  }
}
