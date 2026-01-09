# Kodamon - Digital Battles

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser-3.90-8B5CF6?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Juego de batallas por turnos estilo Pokemon/Digimon con estética Cyberpunk**

### [Jugar Ahora](https://kodamon.veriel.dev/)

[Instalación](#instalación) • [Características](#características) • [Arquitectura](#arquitectura) • [Tecnologías](#tecnologías)

</div>

---

## Descripción

**Kodamon** es un juego web de batallas por turnos desarrollado con **Phaser 3** y **TypeScript**. El proyecto demuestra competencias avanzadas en desarrollo de videojuegos, arquitectura de software modular, y diseño de interfaces de usuario con estética **Digimon Cyber Sleuth**.

### Habilidades Demostradas

| Área | Competencias |
|------|--------------|
| **Game Development** | Motor Phaser 3, sistemas de turnos, IA de combate, sistema de partículas |
| **Frontend** | TypeScript estricto, componentes modulares, animaciones fluidas |
| **Arquitectura** | Patrones de diseño (Scene, Component, Data-Driven), gestión de estado |
| **UI/UX** | Diseño responsivo, feedback visual, efectos glow/blur, iconografía vectorial |
| **DevOps** | Vite 7, ESLint 9, Prettier, path aliases, builds optimizados |

---

## Características

### Sistema de Combate
- **20 Kodamon** con 10 tipos elementales y tabla de efectividad completa
- **Tipos**: fuego, agua, planta, eléctrico, tierra, hielo, volador, roca, normal, fantasma
- **Sistema de velocidad** que determina orden de turnos
- **Golpes críticos** con probabilidad basada en estadísticas
- **Estados alterados**: quemado, paralizado, envenenado, congelado, dormido
- **STAB** (Same Type Attack Bonus) del 1.5x

### Modos de Juego
- **Batalla Libre**: Combate individual contra IA
- **Torneo**: 4 rondas con HP persistente entre batallas
- **Supervivencia**: Oleadas infinitas con dificultad escalante
- **Multijugador Local**: 2 jugadores en el mismo dispositivo

### Interfaz Cyber Sleuth
- Paneles angulares con esquinas cortadas
- Grid animado de fondo con partículas estilo Tron
- Efectos glow y blur en sprites y partículas
- Iconos vectoriales para tipos elementales
- Fuentes cyberpunk (Orbitron, Rajdhani)

### Sistema de Persistencia
- Estadísticas guardadas en localStorage
- Historial de batallas
- Rachas de victorias
- Records de supervivencia

---

## Capturas de Pantalla

```
┌─────────────────────────────────────────────────────────────┐
│                     MENU SCENE                              │
│  ┌────────────────────┐  ┌───────────────────────────────┐  │
│  │   KODAMON          │  │   KODAMON DATA               │  │
│  │   DIGITAL BATTLES  │  │   [Sprite Preview]           │  │
│  │                    │  │   ATK: ███████ 120           │  │
│  │   [Type Filters]   │  │   DEF: █████░░ 80            │  │
│  │   🔥 💧 🌿 ⚡ ...  │  │   VEL: ████████ 130          │  │
│  │                    │  ├───────────────────────────────┤  │
│  │   ┌───┬───┬───┐    │  │   ARENA SELECT               │  │
│  │   │ K │ K │ K │    │  │   [Background Preview]       │  │
│  │   ├───┼───┼───┤    │  ├───────────────────────────────┤  │
│  │   │ K │ K │ K │    │  │   [► CONNECT]  [? RANDOM]    │  │
│  │   └───┴───┴───┘    │  │                              │  │
│  └────────────────────┘  └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     BATTLE SCENE                            │
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │ PYREX     🔥    │              │ AQUON       💧  │       │
│  │ ████████░░ 78/100│             │ ██████░░░ 64/100│       │
│  └─────────────────┘              └─────────────────┘       │
│                                                             │
│       [Sprite]            VS            [Sprite]            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ¡PYREX usó LLAMARADA!                               │    │
│  │ ¡Es súper efectivo! (-36 HP)                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │LLAMARADA │ │ASCUAS    │ │GARRA     │ │RUGIDO    │       │
│  │🔥 PWR:90 │ │🔥 PWR:40 │ │⚪ PWR:50 │ │⚪ PWR:0  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Instalación

### Requisitos
- Node.js 18+
- pnpm 8+

### Pasos

```bash
# Clonar repositorio
git clone https://github.com/veriel-dev/screen-battle.git
cd screen-battle

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

El juego estará disponible en `http://localhost:5173`

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con hot reload |
| `pnpm build` | Build de producción (TypeScript + Vite) |
| `pnpm preview` | Previsualizar build de producción |
| `pnpm lint` | Analizar código con ESLint |
| `pnpm lint:fix` | Corregir errores de lint automáticamente |

---

## Arquitectura

### Estructura del Proyecto

```
src/
├── main.ts                    # Entry point y configuración Phaser
├── config.ts                  # Configuración del juego
├── scenes/
│   ├── BootScene.ts           # Carga de assets
│   ├── MenuScene.ts           # Selección de Kodamon y arena
│   ├── ModeSelectScene.ts     # Selección de modo de juego
│   └── BattleScene.ts         # Sistema de combate por turnos
├── ui/
│   ├── theme.ts               # Sistema de temas Cyber Sleuth
│   ├── HealthBar.ts           # Barra de HP animada
│   ├── MoveButton.ts          # Botones de movimientos
│   ├── DialogBox.ts           # Caja de diálogo con typewriter
│   ├── TypeIcons.ts           # Iconos vectoriales de tipos
│   ├── GridRunners.ts         # Partículas estilo Tron
│   └── AudioControls.ts       # Controles de volumen
├── systems/
│   ├── BattleEffects.ts       # Partículas y efectos visuales
│   ├── StatusEffects.ts       # Estados alterados
│   ├── AudioManager.ts        # Gestión de audio
│   ├── PersistenceManager.ts  # LocalStorage y estadísticas
│   ├── TournamentManager.ts   # Lógica de torneo
│   └── SurvivalManager.ts     # Lógica de supervivencia
├── data/
│   ├── kodamons.ts            # 20 criaturas con stats
│   ├── movimientos.ts         # 20+ movimientos de combate
│   ├── tipos.ts               # Configuración de tipos
│   └── efectividad.ts         # Tabla de efectividad
├── types/
│   └── index.ts               # Interfaces TypeScript
└── assets/
    ├── sprites/kodamons/      # Sprites de criaturas
    ├── sprites/backgrounds/   # Fondos de batalla
    └── audio/                 # Música y efectos
```

### Patrones de Diseño

| Patrón | Implementación |
|--------|----------------|
| **Scene Pattern** | Escenas Phaser con ciclo de vida (init, create, update, shutdown) |
| **Component Pattern** | UI extiende `Phaser.GameObjects.Container` |
| **Data-Driven Design** | Datos separados en `/data/` para fácil balanceo |
| **State Machine** | Estados de batalla (INTRO, JUGADOR_TURNO, ENEMIGO_TURNO, etc.) |
| **Singleton** | PersistenceManager con instancia única |
| **Observer** | Eventos Phaser para comunicación entre sistemas |

### Flujo de Escenas

```
BootScene (carga assets)
    ↓
MenuScene (selección Kodamon + arena)
    ↓
ModeSelectScene (selección modo)
    ↓
BattleScene (combate por turnos)
    ↓ (victoria/derrota)
MenuScene (nuevo ciclo)
```

---

## Tecnologías

### Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Phaser** | 3.90 | Motor de juego 2D con WebGL |
| **TypeScript** | 5.9 | Tipado estricto y autocompletado |
| **Vite** | 7.x | Bundler ultrarrápido con HMR |

### Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| **ESLint 9** | Análisis estático de código |
| **Prettier 3** | Formateo consistente |
| **Path Aliases** | Imports limpios (`@ui/*`, `@data/*`, etc.) |

### Características Técnicas

- **Canvas**: 512x384 px con zoom 2x (1024x768 visual)
- **Rendering**: `pixelArt: true` para sprites nítidos
- **Fuentes**: Google Fonts (Orbitron, Rajdhani)
- **Audio**: Web Audio API con fallback HTML5
- **Persistencia**: localStorage con límite de 100 registros

---

## Sistema de Combate

### Fórmula de Daño

```typescript
const base = (((2 * nivel) / 5 + 2) * poder * (ataque / defensa)) / 50 + 2;
const daño = base * efectividad * stab * critico * random;
```

| Factor | Valor |
|--------|-------|
| **Efectividad** | 0x, 0.5x, 1x, 2x |
| **STAB** | 1.5x si tipo movimiento = tipo Kodamon |
| **Crítico** | 1.5x con probabilidad basada en velocidad |
| **Random** | 0.85 - 1.0 |

### Los 20 Kodamon

| Nombre | Tipo | HP | ATK | DEF | ATK-E | DEF-E | VEL |
|--------|------|-----|-----|-----|-------|-------|-----|
| Pyrex | Fuego | 78 | 84 | 78 | 109 | 85 | 100 |
| Aquon | Agua | 84 | 70 | 80 | 100 | 110 | 70 |
| Florix | Planta | 80 | 82 | 83 | 100 | 100 | 80 |
| Voltik | Eléctrico | 60 | 55 | 50 | 95 | 75 | 130 |
| Terron | Tierra | 110 | 100 | 130 | 55 | 65 | 45 |
| Glaceon | Hielo | 65 | 60 | 60 | 130 | 95 | 110 |
| Aerix | Volador | 83 | 80 | 75 | 95 | 85 | 115 |
| Petros | Roca | 80 | 110 | 130 | 45 | 50 | 35 |
| Normex | Normal | 105 | 75 | 85 | 65 | 85 | 70 |
| Spekter | Fantasma | 60 | 50 | 60 | 130 | 100 | 110 |
| Blazor | Fuego | 85 | 100 | 70 | 95 | 70 | 95 |
| Drakon | Volador | 90 | 95 | 80 | 85 | 75 | 100 |
| Toxin | Planta | 75 | 70 | 85 | 100 | 90 | 70 |
| Zephyr | Volador | 70 | 75 | 65 | 90 | 80 | 110 |
| Verdex | Planta | 95 | 85 | 90 | 75 | 85 | 60 |
| Fuzzle | Normal | 80 | 70 | 75 | 85 | 90 | 85 |
| Mechon | Eléctrico | 75 | 90 | 100 | 80 | 70 | 75 |
| Krakos | Agua | 90 | 95 | 85 | 90 | 80 | 65 |
| Sparky | Eléctrico | 65 | 80 | 60 | 95 | 70 | 105 |
| Thornix | Roca | 85 | 95 | 105 | 50 | 75 | 55 |

---

## Roadmap

- [x] **Fase 1-3**: Setup, migración, assets externos
- [x] **Fase 3.5**: UI estilo Cyber Sleuth
- [x] **Fase 4**: Velocidad, estados alterados, críticos
- [x] **Fase 5**: Sistema de audio
- [x] **Fase 6**: Modos de juego y persistencia
- [x] **Fase 7**: Optimización y distribución (Cloudflare Pages)
- [ ] **Futuro**: Más Kodamon, evoluciones, online multiplayer

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con Phaser 3 + TypeScript**

[![Demo](https://img.shields.io/badge/Demo-Jugar%20Ahora-00d4ff?style=flat-square)](https://kodamon.veriel.dev/)
[![GitHub](https://img.shields.io/badge/GitHub-Repositorio-181717?style=flat-square&logo=github)](https://github.com/veriel-dev/screen-battle)

</div>
