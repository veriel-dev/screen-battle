import type {
  GameStats,
  BattleRecord,
  Achievement,
  PersistenceData,
  GameMode,
} from '@game-types/index';

// Claves para localStorage
const STORAGE_KEY = 'kodamon_persistence';
const MAX_HISTORY_RECORDS = 100; // Limitar historial para no ocupar mucho espacio

/**
 * Lista de logros disponibles
 */
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_victory',
    name: 'Primera Victoria',
    description: 'Gana tu primera batalla',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'streak_3',
    name: 'En Racha',
    description: 'Consigue una racha de 3 victorias',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'streak_5',
    name: 'Imparable',
    description: 'Consigue una racha de 5 victorias',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'streak_10',
    name: 'Leyenda',
    description: 'Consigue una racha de 10 victorias',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'use_all_types',
    name: 'Coleccionista',
    description: 'Usa Kodamon de los 10 tipos elementales',
    icon: '🌈',
    unlocked: false,
  },
  {
    id: 'tournament_winner',
    name: 'Campeón',
    description: 'Gana un torneo completo',
    icon: '🥇',
    unlocked: false,
  },
  {
    id: 'survival_5',
    name: 'Superviviente',
    description: 'Sobrevive 5 oleadas',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'survival_10',
    name: 'Resistencia',
    description: 'Sobrevive 10 oleadas',
    icon: '💪',
    unlocked: false,
  },
  {
    id: 'survival_20',
    name: 'Inmortal',
    description: 'Sobrevive 20 oleadas',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'battles_10',
    name: 'Veterano',
    description: 'Pelea 10 batallas',
    icon: '⚔️',
    unlocked: false,
  },
  {
    id: 'battles_50',
    name: 'Guerrero',
    description: 'Pelea 50 batallas',
    icon: '🗡️',
    unlocked: false,
  },
];

/**
 * Sistema de persistencia para Kodamon
 * Guarda estadísticas, historial y logros en localStorage
 */
export class PersistenceManager {
  private data: PersistenceData;
  private newlyUnlockedAchievements: Achievement[] = [];

  constructor() {
    this.data = this.loadData();
  }

  // ═══════════════════════════════════════════════════════════════
  // CARGA Y GUARDADO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Carga los datos desde localStorage o inicializa con valores por defecto
   */
  private loadData(): PersistenceData {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistenceData>;
        // Asegurar que tenemos todos los campos
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('[PersistenceManager] Error loading data:', error);
    }
    return this.getDefaultData();
  }

  /**
   * Mezcla datos cargados con valores por defecto para campos faltantes
   */
  private mergeWithDefaults(partial: Partial<PersistenceData>): PersistenceData {
    const defaults = this.getDefaultData();

    // Mezclar achievements manteniendo los ya desbloqueados
    const mergedAchievements = DEFAULT_ACHIEVEMENTS.map((defaultAch) => {
      const existing = partial.achievements?.find((a) => a.id === defaultAch.id);
      return existing ? { ...defaultAch, ...existing } : defaultAch;
    });

    return {
      stats: { ...defaults.stats, ...partial.stats },
      history: partial.history ?? defaults.history,
      kodamonStats: partial.kodamonStats ?? defaults.kodamonStats,
      achievements: mergedAchievements,
      survivalBestWave: partial.survivalBestWave ?? defaults.survivalBestWave,
      tournamentsWon: partial.tournamentsWon ?? defaults.tournamentsWon,
    };
  }

  /**
   * Obtiene datos por defecto para un nuevo jugador
   */
  private getDefaultData(): PersistenceData {
    return {
      stats: {
        totalBattles: 0,
        totalVictories: 0,
        totalDefeats: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastPlayed: new Date().toISOString(),
      },
      history: [],
      kodamonStats: {},
      achievements: [...DEFAULT_ACHIEVEMENTS],
      survivalBestWave: 0,
      tournamentsWon: 0,
    };
  }

  /**
   * Guarda los datos en localStorage
   */
  private saveData(): void {
    try {
      // Limitar historial antes de guardar
      if (this.data.history.length > MAX_HISTORY_RECORDS) {
        this.data.history = this.data.history.slice(-MAX_HISTORY_RECORDS);
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.warn('[PersistenceManager] Error saving data:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // REGISTRO DE BATALLAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Registra el resultado de una batalla
   */
  recordBattle(
    playerKodamon: string,
    enemyKodamon: string,
    result: 'victory' | 'defeat',
    mode: GameMode
  ): void {
    // Actualizar fecha
    this.data.stats.lastPlayed = new Date().toISOString();
    this.data.stats.totalBattles++;

    // Actualizar victorias/derrotas
    if (result === 'victory') {
      this.data.stats.totalVictories++;
      this.data.stats.currentStreak++;
      if (this.data.stats.currentStreak > this.data.stats.bestStreak) {
        this.data.stats.bestStreak = this.data.stats.currentStreak;
      }
    } else {
      this.data.stats.totalDefeats++;
      this.data.stats.currentStreak = 0;
    }

    // Actualizar stats del Kodamon usado
    if (!this.data.kodamonStats[playerKodamon]) {
      this.data.kodamonStats[playerKodamon] = {
        timesUsed: 0,
        victories: 0,
        defeats: 0,
      };
    }
    this.data.kodamonStats[playerKodamon].timesUsed++;
    if (result === 'victory') {
      this.data.kodamonStats[playerKodamon].victories++;
    } else {
      this.data.kodamonStats[playerKodamon].defeats++;
    }

    // Añadir al historial
    this.data.history.push({
      timestamp: Date.now(),
      playerKodamon,
      enemyKodamon,
      result,
      mode,
    });

    // Verificar logros
    this.checkAchievements();

    // Guardar
    this.saveData();
  }

  /**
   * Registra una oleada de supervivencia completada
   */
  recordSurvivalWave(wave: number): void {
    if (wave > this.data.survivalBestWave) {
      this.data.survivalBestWave = wave;
    }
    this.checkAchievements();
    this.saveData();
  }

  /**
   * Registra un torneo ganado
   */
  recordTournamentWin(): void {
    this.data.tournamentsWon++;
    this.checkAchievements();
    this.saveData();
  }

  // ═══════════════════════════════════════════════════════════════
  // LOGROS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Verifica y desbloquea logros
   */
  private checkAchievements(): void {
    this.newlyUnlockedAchievements = [];
    const stats = this.data.stats;

    // Primera victoria
    this.tryUnlockAchievement('first_victory', stats.totalVictories >= 1);

    // Rachas
    this.tryUnlockAchievement('streak_3', stats.bestStreak >= 3);
    this.tryUnlockAchievement('streak_5', stats.bestStreak >= 5);
    this.tryUnlockAchievement('streak_10', stats.bestStreak >= 10);

    // Batallas totales
    this.tryUnlockAchievement('battles_10', stats.totalBattles >= 10);
    this.tryUnlockAchievement('battles_50', stats.totalBattles >= 50);

    // Supervivencia
    this.tryUnlockAchievement('survival_5', this.data.survivalBestWave >= 5);
    this.tryUnlockAchievement('survival_10', this.data.survivalBestWave >= 10);
    this.tryUnlockAchievement('survival_20', this.data.survivalBestWave >= 20);

    // Torneo
    this.tryUnlockAchievement('tournament_winner', this.data.tournamentsWon >= 1);

    // Usar todos los tipos - simplificamos contando Kodamon únicos usados
    const kodamonsUsados = Object.keys(this.data.kodamonStats).length;
    if (kodamonsUsados >= 10) {
      this.tryUnlockAchievement('use_all_types', true);
    }
  }

  /**
   * Intenta desbloquear un logro
   */
  private tryUnlockAchievement(id: string, condition: boolean): void {
    if (!condition) return;

    const achievement = this.data.achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      this.newlyUnlockedAchievements.push(achievement);
    }
  }

  /**
   * Obtiene los logros recién desbloqueados (para mostrar notificación)
   */
  getNewlyUnlockedAchievements(): Achievement[] {
    return [...this.newlyUnlockedAchievements];
  }

  /**
   * Limpia la lista de logros recién desbloqueados
   */
  clearNewlyUnlocked(): void {
    this.newlyUnlockedAchievements = [];
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene las estadísticas globales
   */
  getStats(): GameStats {
    return { ...this.data.stats };
  }

  /**
   * Obtiene el historial de batallas
   */
  getHistory(): BattleRecord[] {
    return [...this.data.history];
  }

  /**
   * Obtiene las últimas N batallas
   */
  getRecentHistory(count: number = 10): BattleRecord[] {
    return this.data.history.slice(-count);
  }

  /**
   * Obtiene estadísticas de un Kodamon específico
   */
  getKodamonStats(kodamonId: string): { timesUsed: number; victories: number; defeats: number } {
    return (
      this.data.kodamonStats[kodamonId] ?? {
        timesUsed: 0,
        victories: 0,
        defeats: 0,
      }
    );
  }

  /**
   * Obtiene todos los logros
   */
  getAchievements(): Achievement[] {
    return [...this.data.achievements];
  }

  /**
   * Obtiene solo los logros desbloqueados
   */
  getUnlockedAchievements(): Achievement[] {
    return this.data.achievements.filter((a) => a.unlocked);
  }

  /**
   * Obtiene la mejor oleada de supervivencia
   */
  getSurvivalBestWave(): number {
    return this.data.survivalBestWave;
  }

  /**
   * Obtiene el número de torneos ganados
   */
  getTournamentsWon(): number {
    return this.data.tournamentsWon;
  }

  /**
   * Obtiene el porcentaje de victorias
   */
  getWinRate(): number {
    if (this.data.stats.totalBattles === 0) return 0;
    return Math.round((this.data.stats.totalVictories / this.data.stats.totalBattles) * 100);
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Reinicia todos los datos (para debug o nuevo juego)
   */
  resetAll(): void {
    this.data = this.getDefaultData();
    this.saveData();
  }

  /**
   * Exporta los datos para backup
   */
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Importa datos desde un backup
   */
  importData(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as Partial<PersistenceData>;
      this.data = this.mergeWithDefaults(imported);
      this.saveData();
      return true;
    } catch {
      console.error('[PersistenceManager] Error importing data');
      return false;
    }
  }
}

// Singleton para acceso global
let instance: PersistenceManager | null = null;

/**
 * Obtiene la instancia singleton del PersistenceManager
 */
export function getPersistenceManager(): PersistenceManager {
  if (!instance) {
    instance = new PersistenceManager();
  }
  return instance;
}
