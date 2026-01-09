# Arquitectura del Proyecto

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vite** | 5.x | Bundler y servidor de desarrollo |
| **TypeScript** | 5.x | Tipado estático |
| **Phaser** | 3.70+ | Motor de juego 2D |
| **ESLint** | 8.x | Linting de código |
| **Prettier** | 3.x | Formateo de código |

---

## Estructura de Carpetas

```
kodamon/
├── public/                     # Assets estáticos (copiados sin procesar)
│   ├── favicon.ico
│   └── fonts/
│       └── PressStart2P.ttf
│
├── src/
│   ├── main.ts                 # Entry point de la aplicación
│   ├── config.ts               # Configuración de Phaser
│   ├── vite-env.d.ts           # Tipos de Vite
│   │
│   ├── assets/                 # Assets procesados por Vite
│   │   ├── sprites/
│   │   │   ├── kodamons/       # Sprites de las criaturas
│   │   │   │   ├── flamita.png
│   │   │   │   ├── flamita-sheet.png  # Spritesheet con animaciones
│   │   │   │   └── ...
│   │   │   ├── effects/        # Efectos de partículas
│   │   │   │   ├── fire-particle.png
│   │   │   │   └── ...
│   │   │   └── ui/             # Elementos de interfaz
│   │   │       ├── hp-bar.png
│   │   │       └── ...
│   │   │
│   │   ├── backgrounds/        # Fondos de batalla
│   │   │   ├── grass-field.png
│   │   │   ├── cave.png
│   │   │   └── beach.png
│   │   │
│   │   └── audio/              # Sonidos y música
│   │       ├── music/
│   │       │   ├── menu-theme.mp3
│   │       │   └── battle-theme.mp3
│   │       └── sfx/
│   │           ├── hit.wav
│   │           └── select.wav
│   │
│   ├── scenes/                 # Escenas de Phaser
│   │   ├── index.ts            # Exportación de todas las escenas
│   │   ├── BootScene.ts        # Precarga de assets
│   │   ├── PreloaderScene.ts   # Pantalla de carga con progreso
│   │   ├── MenuScene.ts        # Menú de selección de Kodamon
│   │   └── BattleScene.ts      # Escena de batalla principal
│   │
│   ├── entities/               # Clases de entidades del juego
│   │   ├── Kodamon.ts          # Clase base para Kodamon
│   │   ├── KodamonSprite.ts    # Representación visual del Kodamon
│   │   └── Movimiento.ts       # Clase para movimientos
│   │
│   ├── ui/                     # Componentes de UI
│   │   ├── HealthBar.ts        # Barra de vida
│   │   ├── DialogBox.ts        # Caja de diálogo
│   │   ├── MoveButton.ts       # Botón de movimiento
│   │   ├── KodamonCard.ts      # Tarjeta de selección de Kodamon
│   │   └── TypeIcon.ts         # Icono de tipo
│   │
│   ├── systems/                # Sistemas del juego
│   │   ├── BattleSystem.ts     # Lógica de batalla
│   │   ├── DamageCalculator.ts # Cálculo de daño
│   │   ├── TypeEffectiveness.ts # Sistema de efectividad
│   │   └── AudioManager.ts     # Gestión de audio
│   │
│   ├── data/                   # Datos estáticos del juego
│   │   ├── kodamons.ts         # Definición de todos los Kodamon
│   │   ├── movimientos.ts      # Definición de movimientos
│   │   ├── tipos.ts            # Tipos y efectividad
│   │   └── constants.ts        # Constantes globales
│   │
│   ├── types/                  # Definiciones de tipos TypeScript
│   │   ├── kodamon.types.ts    # Tipos relacionados a Kodamon
│   │   ├── battle.types.ts     # Tipos de batalla
│   │   ├── ui.types.ts         # Tipos de UI
│   │   └── index.ts            # Exportación de tipos
│   │
│   └── utils/                  # Utilidades
│       ├── helpers.ts          # Funciones auxiliares
│       ├── animations.ts       # Funciones de animación
│       └── spriteGenerator.ts  # Generador de sprites procedural
│
├── tests/                      # Tests
│   ├── unit/
│   │   ├── DamageCalculator.test.ts
│   │   └── TypeEffectiveness.test.ts
│   └── integration/
│       └── BattleFlow.test.ts
│
├── docs/                       # Documentación
│   ├── 01-ROADMAP.md
│   ├── 02-ARQUITECTURA.md
│   ├── 03-FASES-DESARROLLO.md
│   ├── 04-ASSETS-RECURSOS.md
│   └── 05-GUIA-PHASER.md
│
├── .eslintrc.cjs               # Configuración ESLint
├── .prettierrc                 # Configuración Prettier
├── .gitignore
├── index.html                  # HTML principal
├── package.json
├── tsconfig.json               # Configuración TypeScript
├── tsconfig.node.json          # TypeScript para Node
└── vite.config.ts              # Configuración Vite
```

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         VITE (Bundler)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   index.ts  │───▶│  config.ts  │───▶│   Phaser.Game       │ │
│  │  (Entry)    │    │  (Config)   │    │   (Instancia)       │ │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘ │
│                                                   │             │
│  ┌────────────────────────────────────────────────┼───────────┐ │
│  │                    SCENES                      │           │ │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │           │ │
│  │  │BootScene │─▶│MenuScene  │─▶│BattleScene  │◀┘           │ │
│  │  │(Preload) │  │(Selección)│  │ (Combate)   │             │ │
│  │  └───────────┘  └───────────┘  └──────┬──────┘             │ │
│  └───────────────────────────────────────┼────────────────────┘ │
│                                          │                      │
│  ┌───────────────────────────────────────┼────────────────────┐ │
│  │                   SYSTEMS             │                    │ │
│  │  ┌──────────────┐  ┌─────────────────▼─────┐               │ │
│  │  │AudioManager  │  │   BattleSystem        │               │ │
│  │  └──────────────┘  │  ┌─────────────────┐  │               │ │
│  │                    │  │DamageCalculator │  │               │ │
│  │  ┌──────────────┐  │  └─────────────────┘  │               │ │
│  │  │TypeEffective │◀─┤  ┌─────────────────┐  │               │ │
│  │  └──────────────┘  │  │  TurnManager    │  │               │ │
│  │                    │  └─────────────────┘  │               │ │
│  │                    └───────────────────────┘               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    ENTITIES                                │ │
│  │  ┌─────────┐  ┌─────────────┐  ┌───────────┐               │ │
│  │  │ Kodamon │  │KodamonSprite│  │Movimiento │               │ │
│  │  │ (Data)  │─▶│  (Visual)   │  │  (Acción) │               │ │
│  │  └─────────┘  └─────────────┘  └───────────┘               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                       UI                                   │ │
│  │  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │ │
│  │  │HealthBar │ │DialogBox │ │MoveButton│ │ KodamonCard  │  │ │
│  │  └───────────┘ └──────────┘ └──────────┘ └──────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      DATA                                  │ │
│  │  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  │ │
│  │  │kodamons │  │movimientos │  │  tipos   │  │ constants │  │ │
│  │  │  .ts    │  │    .ts     │  │   .ts    │  │    .ts    │  │ │
│  │  └─────────┘  └────────────┘  └──────────┘  └───────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Escenas

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  BootScene   │────▶│ PreloaderScene│────▶│  MenuScene   │
│  (Mínimo)    │     │  (Con barra)  │     │ (Selección)  │
└──────────────┘     └───────────────┘     └──────┬───────┘
                                                  │
                                                  │ Selecciona
                                                  │ 2 Kodamon
                                                  ▼
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  MenuScene   │◀────│ ResultScene   │◀────│ BattleScene  │
│  (Reinicio)  │     │ (Victoria/    │     │  (Combate)   │
└──────────────┘     │  Derrota)     │     └──────────────┘
                     └───────────────┘
```

---

## Patrones de Diseño Utilizados

### 1. Scene Pattern (Phaser)
Cada pantalla del juego es una escena independiente con su propio ciclo de vida.

```typescript
class BattleScene extends Phaser.Scene {
  init(data: BattleData) { }     // Recibe datos
  preload() { }                   // Carga assets específicos
  create() { }                    // Inicializa objetos
  update(time: number, delta: number) { } // Loop del juego
}
```

### 2. Component Pattern
Los elementos de UI son componentes reutilizables.

```typescript
class HealthBar extends Phaser.GameObjects.Container {
  private bar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  setPercent(value: number): void { }
}
```

### 3. Data-Driven Design
Los datos de Kodamon y movimientos están separados de la lógica.

```typescript
// data/kodamons.ts
export const KODAMONS: Record<string, KodamonData> = {
  flamita: { nombre: 'FLAMITA', tipo: 'fuego', ... }
};
```

### 4. State Machine (para batalla)
La batalla tiene estados claros y transiciones definidas.

```typescript
type BattleState =
  | 'INTRO'
  | 'PLAYER_TURN'
  | 'PLAYER_ANIMATING'
  | 'ENEMY_TURN'
  | 'ENEMY_ANIMATING'
  | 'VICTORY'
  | 'DEFEAT';
```

---

## Comunicación entre Componentes

### Events (Phaser EventEmitter)
```typescript
// Emitir evento
this.events.emit('damage-dealt', { target: 'enemy', amount: 25 });

// Escuchar evento
this.events.on('damage-dealt', this.handleDamage, this);
```

### Scene Events
```typescript
// Pasar datos entre escenas
this.scene.start('BattleScene', {
  jugador: seleccionJugador,
  enemigo: seleccionEnemigo
});

// Recibir en la escena destino
init(data: { jugador: string; enemigo: string }) {
  this.jugadorKey = data.jugador;
}
```

---

## Gestión de Assets

### Preload Centralizado
```typescript
class BootScene extends Phaser.Scene {
  preload() {
    // Sprites de Kodamon
    Object.keys(KODAMONS).forEach(key => {
      this.load.image(key, `assets/sprites/kodamons/${key}.png`);
      this.load.spritesheet(`${key}-anim`,
        `assets/sprites/kodamons/${key}-sheet.png`,
        { frameWidth: 64, frameHeight: 64 }
      );
    });

    // Fondos
    this.load.image('bg-grass', 'assets/backgrounds/grass-field.png');

    // Audio
    this.load.audio('battle-theme', 'assets/audio/music/battle-theme.mp3');
  }
}
```

---

## Configuración de TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@scenes/*": ["./src/scenes/*"],
      "@entities/*": ["./src/entities/*"],
      "@ui/*": ["./src/ui/*"],
      "@data/*": ["./src/data/*"],
      "@systems/*": ["./src/systems/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@assets/*": ["./src/assets/*"]
    }
  },
  "include": ["src"]
}
```
