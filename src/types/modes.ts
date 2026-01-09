// ═══════════════════════════════════════════════════════════════
// TIPOS PARA MODOS DE JUEGO - FASE 6
// ═══════════════════════════════════════════════════════════════

/**
 * Modos de juego disponibles
 */
export type GameMode = 'libre' | 'torneo' | 'supervivencia' | 'multijugador';

// ═══════════════════════════════════════════════════════════════
// PERSISTENCIA
// ═══════════════════════════════════════════════════════════════

/**
 * Estadísticas globales del jugador
 */
export interface GameStats {
  totalBattles: number;
  totalVictories: number;
  totalDefeats: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayed: string; // ISO date
}

/**
 * Registro de una batalla individual
 */
export interface BattleRecord {
  timestamp: number;
  playerKodamon: string;
  enemyKodamon: string;
  result: 'victory' | 'defeat';
  mode: GameMode;
}

/**
 * Estadísticas por Kodamon individual
 */
export interface KodamonStats {
  timesUsed: number;
  victories: number;
  defeats: number;
}

/**
 * Mapa de estadísticas por ID de Kodamon
 */
export type KodamonStatsMap = Record<string, KodamonStats>;

/**
 * Definición de un logro
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

/**
 * Datos completos de persistencia
 */
export interface PersistenceData {
  stats: GameStats;
  history: BattleRecord[];
  kodamonStats: KodamonStatsMap;
  achievements: Achievement[];
  survivalBestWave: number;
  tournamentsWon: number;
}

// ═══════════════════════════════════════════════════════════════
// MODO TORNEO
// ═══════════════════════════════════════════════════════════════

/**
 * Estado del torneo en curso
 */
export interface TournamentState {
  /** Ronda actual (1-4) */
  currentRound: number;
  /** IDs de los 4 oponentes del torneo */
  opponents: string[];
  /** HP actual del jugador (persistente entre rondas) */
  playerHP: number;
  /** HP máximo del jugador */
  playerMaxHP: number;
  /** Si el torneo ha sido completado */
  completed: boolean;
  /** ID del Kodamon del jugador */
  playerKodamonId: string;
}

// ═══════════════════════════════════════════════════════════════
// MODO SUPERVIVENCIA
// ═══════════════════════════════════════════════════════════════

/**
 * Estado del modo supervivencia en curso
 */
export interface SurvivalState {
  /** Oleada actual */
  currentWave: number;
  /** HP actual del jugador */
  playerHP: number;
  /** HP máximo del jugador */
  playerMaxHP: number;
  /** Total de enemigos derrotados */
  enemiesDefeated: number;
  /** Mejor oleada alcanzada (record) */
  bestWave: number;
  /** ID del Kodamon del jugador */
  playerKodamonId: string;
}

// ═══════════════════════════════════════════════════════════════
// MULTIJUGADOR LOCAL
// ═══════════════════════════════════════════════════════════════

/**
 * Estado del modo multijugador local
 */
export interface MultiplayerState {
  /** ID del Kodamon del jugador 1 */
  player1KodamonId: string;
  /** ID del Kodamon del jugador 2 */
  player2KodamonId: string;
  /** Arena seleccionada */
  arenaId: string;
}

// ═══════════════════════════════════════════════════════════════
// DATOS PASADOS ENTRE ESCENAS
// ═══════════════════════════════════════════════════════════════

/**
 * Datos que se pasan del MenuScene al ModeSelectScene
 */
export interface MenuToModeData {
  playerKodamonId: string;
  arenaId: string;
}

/**
 * Datos que se pasan del ModeSelectScene al BattleScene
 */
export interface ModeToBattleData {
  mode: GameMode;
  playerKodamonId: string;
  enemyKodamonId: string;
  arenaId: string;
  // Datos específicos de modo
  tournamentState?: TournamentState;
  survivalState?: SurvivalState;
  multiplayerState?: MultiplayerState;
}

/**
 * Datos que se pasan del BattleScene de vuelta (resultado)
 */
export interface BattleResultData {
  mode: GameMode;
  result: 'victory' | 'defeat';
  playerKodamonId: string;
  enemyKodamonId: string;
  playerRemainingHP: number;
  // Datos específicos de modo actualizados
  tournamentState?: TournamentState;
  survivalState?: SurvivalState;
}
