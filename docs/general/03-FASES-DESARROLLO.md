# Fases de Desarrollo - Guía Detallada

Este documento detalla cada fase del desarrollo con instrucciones específicas, código de ejemplo y criterios de aceptación.

---

## Fase 1: Configuración del Proyecto

### 1.1 Crear el proyecto

```bash
# Crear proyecto Vite con TypeScript
npm create vite@latest kodamon -- --template vanilla-ts

# Entrar al directorio
cd kodamon

# Instalar Phaser
npm install phaser

# Instalar dependencias de desarrollo
npm install -D @types/node
```

### 1.2 Configurar Vite

Crear/modificar `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@scenes': resolve(__dirname, './src/scenes'),
      '@entities': resolve(__dirname, './src/entities'),
      '@ui': resolve(__dirname, './src/ui'),
      '@data': resolve(__dirname, './src/data'),
      '@systems': resolve(__dirname, './src/systems'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
```

### 1.3 Configurar TypeScript

Modificar `tsconfig.json`:

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
    "baseUrl": ".",
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

### 1.4 Crear estructura de carpetas

```bash
# Crear estructura
mkdir -p src/{scenes,entities,ui,systems,data,types,utils}
mkdir -p src/assets/{sprites/{kodamons,effects,ui},backgrounds,audio/{music,sfx}}
mkdir -p public/fonts
```

### 1.5 Archivo de entrada principal

Crear `src/main.ts`:

```typescript
import Phaser from 'phaser';
import { BootScene } from '@scenes/BootScene';
import { MenuScene } from '@scenes/MenuScene';
import { BattleScene } from '@scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 512,
  height: 384,
  parent: 'game-container',
  backgroundColor: '#202040',
  pixelArt: true,
  zoom: 2,
  scene: [BootScene, MenuScene, BattleScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
};

new Phaser.Game(config);
```

### 1.6 Modificar index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kodamon</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Press Start 2P', cursive;
    }

    #game-container {
      border: 4px solid #4a4a6a;
      border-radius: 8px;
      box-shadow: 0 0 40px rgba(100, 150, 255, 0.3);
    }

    canvas {
      display: block;
      image-rendering: pixelated;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Criterios de Aceptación Fase 1
- [ ] `npm run dev` inicia el servidor sin errores
- [ ] El canvas de Phaser se renderiza
- [ ] No hay errores en la consola del navegador
- [ ] Los alias de importación funcionan

---

## Fase 2: Migración del Código

### 2.1 Definir tipos base

Crear `src/types/kodamon.types.ts`:

```typescript
export type TipoKodamon =
  | 'fuego'
  | 'agua'
  | 'planta'
  | 'electrico'
  | 'roca'
  | 'fantasma'
  | 'dragon'
  | 'hielo'
  | 'veneno'
  | 'psiquico'
  | 'normal';

export type TipoMovimiento = TipoKodamon | 'estado';

export interface Movimiento {
  nombre: string;
  poder: number;
  tipo: TipoMovimiento;
  precision?: number;  // 0-100, default 100
  efectoSecundario?: string;
}

export interface KodamonData {
  nombre: string;
  tipo: TipoKodamon;
  hp: number;
  ataque?: number;
  defensa?: number;
  velocidad?: number;
  descripcion: string;
  color: string;
  movimientos: Movimiento[];
}

export interface KodamonEnBatalla extends KodamonData {
  key: string;
  vida: number;
  maxVida: number;
}
```

Crear `src/types/battle.types.ts`:

```typescript
import { KodamonEnBatalla, Movimiento } from './kodamon.types';

export type BattleState =
  | 'INTRO'
  | 'PLAYER_TURN'
  | 'PLAYER_ANIMATING'
  | 'ENEMY_TURN'
  | 'ENEMY_ANIMATING'
  | 'CHECKING_RESULT'
  | 'VICTORY'
  | 'DEFEAT';

export interface BattleData {
  jugadorKey: string;
  enemigoKey: string;
}

export interface BattleStateData {
  jugador: KodamonEnBatalla;
  enemigo: KodamonEnBatalla;
  estado: BattleState;
  turnoActual: 'jugador' | 'enemigo';
}

export interface DamageResult {
  danio: number;
  efectividad: 'super' | 'normal' | 'poco' | 'inmune';
  mensaje: string;
  esCritico: boolean;
}

export interface AttackEvent {
  atacante: KodamonEnBatalla;
  defensor: KodamonEnBatalla;
  movimiento: Movimiento;
  resultado: DamageResult;
}
```

Crear `src/types/index.ts`:

```typescript
export * from './kodamon.types';
export * from './battle.types';
```

### 2.2 Migrar datos

Crear `src/data/kodamons.ts`:

```typescript
import { KodamonData } from '@/types';

export const KODAMONS: Record<string, KodamonData> = {
  flamita: {
    nombre: 'FLAMITA',
    tipo: 'fuego',
    hp: 100,
    ataque: 52,
    defensa: 43,
    velocidad: 65,
    descripcion: 'Lagarto de fuego',
    color: '#f06030',
    movimientos: [
      { nombre: 'Llamarada', poder: 28, tipo: 'fuego' },
      { nombre: 'Arañazo', poder: 16, tipo: 'normal' },
      { nombre: 'Ascuas', poder: 22, tipo: 'fuego' },
      { nombre: 'Gruñido', poder: 0, tipo: 'estado' },
    ],
  },
  plantin: {
    nombre: 'PLANTÍN',
    tipo: 'planta',
    hp: 105,
    ataque: 49,
    defensa: 49,
    velocidad: 45,
    descripcion: 'Rana con bulbo',
    color: '#48a048',
    movimientos: [
      { nombre: 'Látigo Cepa', poder: 22, tipo: 'planta' },
      { nombre: 'Placaje', poder: 16, tipo: 'normal' },
      { nombre: 'Drenadoras', poder: 18, tipo: 'planta' },
      { nombre: 'Gruñido', poder: 0, tipo: 'estado' },
    ],
  },
  aquarex: {
    nombre: 'AQUAREX',
    tipo: 'agua',
    hp: 110,
    ataque: 48,
    defensa: 65,
    velocidad: 43,
    descripcion: 'Tortuga acuática',
    color: '#4090d0',
    movimientos: [
      { nombre: 'Pistola Agua', poder: 24, tipo: 'agua' },
      { nombre: 'Placaje', poder: 16, tipo: 'normal' },
      { nombre: 'Burbuja', poder: 20, tipo: 'agua' },
      { nombre: 'Refugio', poder: 0, tipo: 'estado' },
    ],
  },
  voltix: {
    nombre: 'VOLTIX',
    tipo: 'electrico',
    hp: 85,
    ataque: 55,
    defensa: 40,
    velocidad: 90,
    descripcion: 'Ratón eléctrico',
    color: '#f0c030',
    movimientos: [
      { nombre: 'Rayo', poder: 30, tipo: 'electrico' },
      { nombre: 'Ataque Rápido', poder: 18, tipo: 'normal' },
      { nombre: 'Chispa', poder: 22, tipo: 'electrico' },
      { nombre: 'Agilidad', poder: 0, tipo: 'estado' },
    ],
  },
  petron: {
    nombre: 'PETRÓN',
    tipo: 'roca',
    hp: 130,
    ataque: 55,
    defensa: 80,
    velocidad: 20,
    descripcion: 'Golem de piedra',
    color: '#908070',
    movimientos: [
      { nombre: 'Avalancha', poder: 26, tipo: 'roca' },
      { nombre: 'Golpe Roca', poder: 20, tipo: 'roca' },
      { nombre: 'Placaje', poder: 16, tipo: 'normal' },
      { nombre: 'Fortaleza', poder: 0, tipo: 'estado' },
    ],
  },
  espectrix: {
    nombre: 'ESPECTRIX',
    tipo: 'fantasma',
    hp: 90,
    ataque: 50,
    defensa: 45,
    velocidad: 70,
    descripcion: 'Fantasma travieso',
    color: '#8060a0',
    movimientos: [
      { nombre: 'Bola Sombra', poder: 28, tipo: 'fantasma' },
      { nombre: 'Lengüetazo', poder: 18, tipo: 'fantasma' },
      { nombre: 'Maldición', poder: 22, tipo: 'fantasma' },
      { nombre: 'Hipnosis', poder: 0, tipo: 'estado' },
    ],
  },
  drakon: {
    nombre: 'DRAKÓN',
    tipo: 'dragon',
    hp: 95,
    ataque: 64,
    defensa: 45,
    velocidad: 55,
    descripcion: 'Dragón bebé',
    color: '#6080c0',
    movimientos: [
      { nombre: 'Aliento Dragón', poder: 30, tipo: 'dragon' },
      { nombre: 'Garra Dragón', poder: 24, tipo: 'dragon' },
      { nombre: 'Mordisco', poder: 18, tipo: 'normal' },
      { nombre: 'Danza Dragón', poder: 0, tipo: 'estado' },
    ],
  },
  glacius: {
    nombre: 'GLACIUS',
    tipo: 'hielo',
    hp: 95,
    ataque: 50,
    defensa: 50,
    velocidad: 55,
    descripcion: 'Criatura de hielo',
    color: '#80c0e0',
    movimientos: [
      { nombre: 'Rayo Hielo', poder: 28, tipo: 'hielo' },
      { nombre: 'Ventisca', poder: 24, tipo: 'hielo' },
      { nombre: 'Cabezazo', poder: 16, tipo: 'normal' },
      { nombre: 'Neblina', poder: 0, tipo: 'estado' },
    ],
  },
  toxin: {
    nombre: 'TOXIN',
    tipo: 'veneno',
    hp: 100,
    ataque: 53,
    defensa: 48,
    velocidad: 52,
    descripcion: 'Serpiente venenosa',
    color: '#a050c0',
    movimientos: [
      { nombre: 'Ácido', poder: 26, tipo: 'veneno' },
      { nombre: 'Mordisco Veneno', poder: 22, tipo: 'veneno' },
      { nombre: 'Constricción', poder: 18, tipo: 'normal' },
      { nombre: 'Tóxico', poder: 0, tipo: 'estado' },
    ],
  },
  lumix: {
    nombre: 'LUMIX',
    tipo: 'psiquico',
    hp: 88,
    ataque: 45,
    defensa: 45,
    velocidad: 72,
    descripcion: 'Ser místico',
    color: '#e070a0',
    movimientos: [
      { nombre: 'Psíquico', poder: 30, tipo: 'psiquico' },
      { nombre: 'Confusión', poder: 22, tipo: 'psiquico' },
      { nombre: 'Destello', poder: 16, tipo: 'normal' },
      { nombre: 'Barrera', poder: 0, tipo: 'estado' },
    ],
  },
};

export const getKodamon = (key: string): KodamonData | undefined => KODAMONS[key];
export const getAllKodamonKeys = (): string[] => Object.keys(KODAMONS);
```

Crear `src/data/tipos.ts`:

```typescript
import { TipoKodamon, TipoMovimiento } from '@/types';

// Tabla de efectividad: tipo atacante -> tipo defensor -> multiplicador
export const EFECTIVIDAD: Partial<Record<TipoKodamon, Partial<Record<TipoKodamon, number>>>> = {
  fuego: { planta: 2, agua: 0.5, hielo: 2, roca: 0.5, dragon: 0.5 },
  agua: { fuego: 2, planta: 0.5, roca: 2, electrico: 0.5 },
  planta: { agua: 2, fuego: 0.5, roca: 2, veneno: 0.5, dragon: 0.5 },
  electrico: { agua: 2, roca: 0.5, dragon: 0.5 },
  roca: { fuego: 2, hielo: 2, electrico: 0.5 },
  fantasma: { fantasma: 2, psiquico: 2, normal: 0 },
  dragon: { dragon: 2 },
  hielo: { planta: 2, dragon: 2, fuego: 0.5, agua: 0.5 },
  veneno: { planta: 2, roca: 0.5, fantasma: 0.5 },
  psiquico: { veneno: 2, fantasma: 0.5 },
};

export const ICONOS_TIPO: Record<TipoMovimiento, string> = {
  fuego: '🔥',
  agua: '💧',
  planta: '🌿',
  electrico: '⚡',
  roca: '🪨',
  fantasma: '👻',
  dragon: '🐉',
  hielo: '❄️',
  veneno: '☠️',
  psiquico: '🔮',
  normal: '⭐',
  estado: '✨',
};

export const COLORES_TIPO: Record<TipoMovimiento, number> = {
  fuego: 0xf06028,
  agua: 0x4090d0,
  planta: 0x48a048,
  electrico: 0xf0c030,
  roca: 0x787068,
  fantasma: 0x8060a0,
  dragon: 0x6080c0,
  hielo: 0x80c0e0,
  veneno: 0xa050c0,
  psiquico: 0xe070a0,
  normal: 0x909090,
  estado: 0x707070,
};

export function getEfectividad(tipoAtaque: TipoKodamon, tipoDefensor: TipoKodamon): number {
  if (tipoAtaque === 'normal') return 1;
  return EFECTIVIDAD[tipoAtaque]?.[tipoDefensor] ?? 1;
}

export function getMensajeEfectividad(multiplicador: number): string {
  if (multiplicador >= 2) return '¡Es súper efectivo!';
  if (multiplicador === 0) return '¡No afecta al enemigo!';
  if (multiplicador <= 0.5) return 'No es muy efectivo...';
  return '';
}
```

### 2.3 Crear escenas base

Crear `src/scenes/BootScene.ts`:

```typescript
import Phaser from 'phaser';
import { KODAMONS, getAllKodamonKeys } from '@/data/kodamons';
import { SpriteGenerator } from '@/utils/spriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Mostrar texto de carga
    const loadingText = this.add.text(256, 192, 'Cargando...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Barra de progreso
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(156, 210, 200, 20);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(160, 214, 192 * value, 12);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Aquí cargaremos los assets reales cuando los tengamos
    // Por ahora generamos sprites proceduralmente
  }

  create(): void {
    // Generar sprites proceduralmente (temporal)
    const generator = new SpriteGenerator(this);
    getAllKodamonKeys().forEach(key => {
      generator.generateKodamonSprite(key);
    });
    generator.generateEffects();

    // Ir al menú
    this.scene.start('MenuScene');
  }
}
```

Crear `src/scenes/MenuScene.ts` (versión inicial simplificada):

```typescript
import Phaser from 'phaser';
import { KODAMONS, getAllKodamonKeys } from '@/data/kodamons';
import { ICONOS_TIPO } from '@/data/tipos';
import { BattleData } from '@/types';

export class MenuScene extends Phaser.Scene {
  private fase: 'jugador' | 'enemigo' = 'jugador';
  private seleccionTemp: string | null = null;
  private seleccionJugador: string | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.fase = 'jugador';
    this.seleccionTemp = null;
    this.seleccionJugador = null;

    this.dibujarFondo();
    this.crearTitulo();
    this.crearGridKodamon();

    // Texto temporal - se implementará UI completa después
    this.add.text(256, 350, 'Click en un Kodamon para seleccionar', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5);
  }

  private dibujarFondo(): void {
    const g = this.add.graphics();

    for (let i = 0; i < 384; i++) {
      const t = i / 384;
      const r = Math.floor(32 + t * 16);
      const gr = Math.floor(32 + t * 32);
      const b = Math.floor(64 + t * 32);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, i, 512, 1);
    }
  }

  private crearTitulo(): void {
    this.add.text(256, 30, '🎮 ELIGE TU KODAMON', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#f0c030',
    }).setOrigin(0.5);
  }

  private crearGridKodamon(): void {
    const keys = getAllKodamonKeys();
    const startX = 60;
    const startY = 90;
    const cols = 5;
    const espacioX = 90;
    const espacioY = 80;

    keys.forEach((key, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * espacioX;
      const y = startY + row * espacioY;
      const kodamon = KODAMONS[key];

      // Fondo
      const bg = this.add.graphics();
      bg.fillStyle(0x404060, 0.8);
      bg.fillRoundedRect(x - 38, y - 28, 76, 70, 6);

      // Sprite
      const sprite = this.add.image(x, y, key).setScale(0.7);

      // Nombre
      this.add.text(x, y + 32, kodamon.nombre, {
        fontFamily: '"Press Start 2P"',
        fontSize: '5px',
        color: kodamon.color,
      }).setOrigin(0.5);

      // Tipo
      this.add.text(x + 28, y - 22, ICONOS_TIPO[kodamon.tipo], {
        fontSize: '10px',
      }).setOrigin(0.5);

      // Interactividad
      const hitArea = this.add.rectangle(x, y, 76, 70)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerdown', () => this.seleccionarKodamon(key));
    });
  }

  private seleccionarKodamon(key: string): void {
    if (this.fase === 'jugador') {
      this.seleccionJugador = key;
      this.fase = 'enemigo';
      // Actualizar título
      this.children.getByName('titulo')?.destroy();
      this.add.text(256, 30, '👊 ELIGE TU RIVAL', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#f05050',
      }).setOrigin(0.5);
    } else if (this.seleccionJugador) {
      // Iniciar batalla
      const data: BattleData = {
        jugadorKey: this.seleccionJugador,
        enemigoKey: key,
      };
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('BattleScene', data);
      });
    }
  }
}
```

Crear `src/scenes/BattleScene.ts` (estructura base):

```typescript
import Phaser from 'phaser';
import { KODAMONS } from '@/data/kodamons';
import { BattleData, BattleStateData, KodamonEnBatalla } from '@/types';

export class BattleScene extends Phaser.Scene {
  private battleState!: BattleStateData;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: BattleData): void {
    const kodamonJ = KODAMONS[data.jugadorKey];
    const kodamonE = KODAMONS[data.enemigoKey];

    this.battleState = {
      jugador: {
        ...kodamonJ,
        key: data.jugadorKey,
        vida: kodamonJ.hp,
        maxVida: kodamonJ.hp,
      },
      enemigo: {
        ...kodamonE,
        key: data.enemigoKey,
        vida: kodamonE.hp,
        maxVida: kodamonE.hp,
      },
      estado: 'INTRO',
      turnoActual: 'jugador',
    };
  }

  create(): void {
    this.dibujarFondo();
    this.crearSprites();
    this.crearUI();
    this.entradaBatalla();
  }

  private dibujarFondo(): void {
    // Implementar fondo de batalla
    const g = this.add.graphics();

    // Cielo
    for (let i = 0; i < 160; i++) {
      const t = i / 160;
      g.fillStyle(Phaser.Display.Color.GetColor(
        100 + t * 80,
        160 + t * 60,
        220 + t * 30
      ));
      g.fillRect(0, i, 512, 1);
    }

    // Suelo
    g.fillStyle(0x78b048);
    g.fillEllipse(400, 145, 85, 20);
    g.fillEllipse(110, 210, 100, 24);

    g.fillStyle(0x906840);
    g.fillRect(0, 225, 512, 160);
  }

  private crearSprites(): void {
    // Sprites de Kodamon
    this.add.image(110, 205, this.battleState.jugador.key).setOrigin(0.5, 1);
    this.add.image(400, 140, this.battleState.enemigo.key)
      .setOrigin(0.5, 1)
      .setFlipX(true);
  }

  private crearUI(): void {
    // Panel enemigo
    const g = this.add.graphics();
    g.fillStyle(0xf8f0e0);
    g.fillRoundedRect(10, 15, 170, 55, 5);

    this.add.text(20, 22, this.battleState.enemigo.nombre, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#303030',
    });

    // Panel jugador
    g.fillRoundedRect(300, 160, 200, 60, 5);

    this.add.text(312, 167, this.battleState.jugador.nombre, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#303030',
    });

    // Caja de diálogo
    g.fillStyle(0xf8f8f8);
    g.fillRoundedRect(10, 235, 492, 60, 6);
    g.lineStyle(3, 0x484848);
    g.strokeRoundedRect(10, 235, 492, 60, 6);
  }

  private entradaBatalla(): void {
    this.cameras.main.fadeIn(400);

    this.add.text(25, 255, `¡${this.battleState.enemigo.nombre} quiere pelear!`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#303030',
    });

    // TODO: Implementar sistema de batalla completo
  }
}
```

Crear `src/scenes/index.ts`:

```typescript
export { BootScene } from './BootScene';
export { MenuScene } from './MenuScene';
export { BattleScene } from './BattleScene';
```

### 2.4 Crear generador de sprites procedural

Crear `src/utils/spriteGenerator.ts`:

```typescript
import Phaser from 'phaser';
import { KODAMONS } from '@/data/kodamons';

export class SpriteGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateKodamonSprite(key: string): void {
    const g = this.scene.make.graphics({ add: false });

    // Lógica de dibujo según el Kodamon
    // (Migrar desde el código original)
    switch (key) {
      case 'flamita':
        this.drawFlamita(g);
        break;
      case 'plantin':
        this.drawPlantin(g);
        break;
      // ... resto de Kodamon
      default:
        this.drawDefaultKodamon(g, KODAMONS[key]?.color || '#888888');
    }

    g.generateTexture(key, 68, 64);
    g.destroy();
  }

  generateEffects(): void {
    const tipos = [
      { key: 'part_fuego', color: 0xf87800 },
      { key: 'part_agua', color: 0x4090d0 },
      { key: 'part_planta', color: 0x58c058 },
      { key: 'part_electrico', color: 0xf0c830 },
      { key: 'part_roca', color: 0x787068 },
      { key: 'part_fantasma', color: 0x8060a0 },
      { key: 'part_dragon', color: 0x6080c0 },
      { key: 'part_hielo', color: 0xa0d8f0 },
      { key: 'part_veneno', color: 0xa050c0 },
      { key: 'part_psiquico', color: 0xe070a0 },
      { key: 'part_normal', color: 0xc0c0c0 },
    ];

    tipos.forEach(t => {
      const g = this.scene.make.graphics({ add: false });
      g.fillStyle(t.color);
      g.fillCircle(4, 4, 4);
      g.generateTexture(t.key, 8, 8);
      g.destroy();
    });
  }

  private drawFlamita(g: Phaser.GameObjects.Graphics): void {
    // Cola de fuego
    g.fillStyle(0xe07028);
    g.fillRect(6, 38, 10, 5);
    g.fillRect(2, 32, 8, 14);
    g.fillStyle(0xf87800);
    g.fillRect(3, 34, 5, 10);
    g.fillStyle(0xf8b800);
    g.fillRect(4, 36, 3, 6);

    // Cuerpo
    g.fillStyle(0xe87830);
    g.fillRect(20, 30, 24, 24);
    g.fillRect(18, 34, 28, 18);
    g.fillStyle(0xf8d898);
    g.fillRect(26, 36, 14, 14);

    // Cabeza
    g.fillStyle(0xe87830);
    g.fillRect(20, 12, 24, 22);

    // Ojos
    g.fillStyle(0xf8f8f8);
    g.fillRect(24, 18, 8, 8);
    g.fillRect(36, 18, 8, 8);
    g.fillStyle(0x3058a8);
    g.fillRect(28, 20, 4, 6);
    g.fillRect(40, 20, 4, 6);

    // Boca
    g.fillStyle(0x282828);
    g.fillRect(32, 30, 8, 2);

    // Brazos y piernas
    g.fillStyle(0xe87830);
    g.fillRect(14, 36, 6, 14);
    g.fillRect(44, 36, 6, 14);
    g.fillRect(22, 52, 10, 10);
    g.fillRect(36, 52, 10, 10);
  }

  private drawPlantin(g: Phaser.GameObjects.Graphics): void {
    // Bulbo
    g.fillStyle(0x48a048);
    g.fillRect(18, 4, 32, 22);
    g.fillStyle(0x58c058);
    g.fillRect(10, 0, 8, 16);
    g.fillRect(30, -4, 8, 14);
    g.fillRect(48, 2, 8, 14);

    // Cuerpo
    g.fillStyle(0x68a878);
    g.fillRect(12, 24, 44, 22);
    g.fillRect(2, 24, 26, 22);

    // Ojos
    g.fillStyle(0xf8f8f8);
    g.fillRect(4, 30, 9, 9);
    g.fillRect(18, 30, 9, 9);
    g.fillStyle(0xc83028);
    g.fillRect(8, 32, 5, 7);
    g.fillRect(22, 32, 5, 7);

    // Patas
    g.fillStyle(0x68a878);
    g.fillRect(6, 46, 14, 12);
    g.fillRect(30, 46, 14, 12);
  }

  private drawDefaultKodamon(g: Phaser.GameObjects.Graphics, colorHex: string): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;

    // Cuerpo simple
    g.fillStyle(color);
    g.fillRoundedRect(14, 10, 40, 44, 8);

    // Ojos
    g.fillStyle(0xffffff);
    g.fillCircle(24, 24, 6);
    g.fillCircle(44, 24, 6);
    g.fillStyle(0x000000);
    g.fillCircle(26, 24, 3);
    g.fillCircle(46, 24, 3);
  }
}
```

### Criterios de Aceptación Fase 2
- [ ] Todos los tipos TypeScript compilan sin errores
- [ ] Los datos se importan correctamente desde módulos
- [ ] Las escenas se cargan y transicionan correctamente
- [ ] Los sprites se generan proceduralmente
- [ ] La selección de Kodamon funciona

---

## Fase 3: Assets Externos (Próxima Fase)

Esta fase se documenta en `04-ASSETS-RECURSOS.md` con instrucciones detalladas sobre:
- Especificaciones de sprites
- Herramientas recomendadas
- Recursos gratuitos
- Integración con Phaser
