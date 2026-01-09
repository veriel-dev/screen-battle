# Kodamon - Documentación

Juego de batallas por turnos estilo Pokémon desarrollado con **Vite** y **Phaser 3**.

---

## Índice de Documentación

### Documentos Principales
| Documento | Descripción |
|-----------|-------------|
| [01-ROADMAP.md](./01-ROADMAP.md) | Plan completo del proyecto con todas las fases |

### Documentación General
| Documento | Descripción |
|-----------|-------------|
| [general/02-ARQUITECTURA.md](./general/02-ARQUITECTURA.md) | Estructura del proyecto y patrones de diseño |
| [general/03-FASES-DESARROLLO.md](./general/03-FASES-DESARROLLO.md) | Guía paso a paso para implementar cada fase |
| [general/05-GUIA-PHASER.md](./general/05-GUIA-PHASER.md) | Tutorial de Phaser 3 para principiantes |
| [general/07-ANALISIS-MEJORAS.md](./general/07-ANALISIS-MEJORAS.md) | Análisis técnico de mejoras del código |

### Fases del Proyecto
| Fase | Directorio | Estado |
|------|------------|--------|
| Fase 3 | [fase3/](./fase3/) | ✅ Completada |
| **Fase 3.5** | [fase3.5/](./fase3.5/) | **🔄 En progreso** |
| Fase 4 | [fase4/](./fase4/) | Pendiente |

---

## Inicio Rápido

### Prerrequisitos

- Node.js 18+ ([descargar](https://nodejs.org/))
- npm o pnpm
- Editor de código (VS Code recomendado)

### Instalación

```bash
# Clonar o crear proyecto
npm create vite@latest kodamon -- --template vanilla-ts
cd kodamon

# Instalar Phaser
npm install phaser

# Iniciar servidor de desarrollo
npm run dev
```

### Estructura Básica

```
kodamon/
├── src/
│   ├── main.ts           # Entry point
│   ├── scenes/           # Escenas del juego
│   ├── data/             # Datos de Kodamon y tipos
│   ├── ui/               # Componentes de interfaz
│   └── assets/           # Sprites, fondos, audio
├── docs/                 # Esta documentación
└── package.json
```

---

## Estado Actual

### Prototipo Existente

El archivo `batalla-10-bichos.html` contiene un prototipo funcional con:

- 10 Kodamon con estadísticas y movimientos
- Menú de selección
- Sistema de batalla por turnos
- Tabla de efectividad de tipos
- Sprites generados por código
- Animaciones básicas

### Objetivo

Migrar a una arquitectura moderna con:

- Vite como bundler
- TypeScript para tipado
- Código modular y mantenible
- Assets externos (sprites, audio)
- Funcionalidades adicionales

---

## Flujo del Juego

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   INICIO    │────▶│   MENÚ      │────▶│   BATALLA   │
│   (Boot)    │     │ (Selección) │     │  (Combate)  │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                           │   Selecciona       │
                           │   2 Kodamon        │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   MENÚ      │◀────│  RESULTADO  │
                    │  (Volver)   │     │(Victoria/   │
                    └─────────────┘     │ Derrota)    │
                                        └─────────────┘
```

---

## Los 10 Kodamon

| Kodamon | Tipo | HP | Descripción |
|-------|------|-----|-------------|
| Flamita | Fuego | 100 | Lagarto de fuego |
| Plantín | Planta | 105 | Rana con bulbo |
| Aquarex | Agua | 110 | Tortuga acuática |
| Voltix | Eléctrico | 85 | Ratón eléctrico |
| Petrón | Roca | 130 | Golem de piedra |
| Espectrix | Fantasma | 90 | Fantasma travieso |
| Drakón | Dragón | 95 | Dragón bebé |
| Glacius | Hielo | 95 | Criatura de hielo |
| Toxin | Veneno | 100 | Serpiente venenosa |
| Lumix | Psíquico | 88 | Ser místico |

---

## Sistema de Tipos

### Tabla de Efectividad

| Atacante ↓ | Fuego | Agua | Planta | Eléc. | Roca | Fant. | Dragón | Hielo | Veneno | Psíq. |
|------------|-------|------|--------|-------|------|-------|--------|-------|--------|-------|
| **Fuego** | - | 0.5 | 2 | - | 0.5 | - | 0.5 | 2 | - | - |
| **Agua** | 2 | - | 0.5 | 0.5 | 2 | - | - | - | - | - |
| **Planta** | 0.5 | 2 | - | - | 2 | - | 0.5 | - | 0.5 | - |
| **Eléctrico** | - | 2 | - | - | 0.5 | - | 0.5 | - | - | - |
| **Roca** | 2 | - | - | 0.5 | - | - | - | 2 | - | - |
| **Fantasma** | - | - | - | - | - | 2 | - | - | - | 2 |
| **Dragón** | - | - | - | - | - | - | 2 | - | - | - |
| **Hielo** | 0.5 | 0.5 | 2 | - | - | - | 2 | - | - | - |
| **Veneno** | - | - | 2 | - | 0.5 | 0.5 | - | - | - | - |
| **Psíquico** | - | - | - | - | - | 0.5 | - | - | 2 | - |

- **2** = Súper efectivo (x1.5 daño)
- **0.5** = Poco efectivo (x0.5 daño)
- **0** = Sin efecto (Fantasma vs Normal)
- **-** = Daño normal (x1)

---

## Próximos Pasos

1. **Leer** [01-ROADMAP.md](./01-ROADMAP.md) para entender el plan completo
2. **Seguir** [general/03-FASES-DESARROLLO.md](./general/03-FASES-DESARROLLO.md) paso a paso
3. **Consultar** [general/05-GUIA-PHASER.md](./general/05-GUIA-PHASER.md) cuando tengas dudas de Phaser
4. **Fase actual**: [fase3.5/README.md](./fase3.5/README.md) - Mejoras de UI

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot reload

# Producción
npm run build        # Construir para producción
npm run preview      # Previsualizar build

# Linting (si configurado)
npm run lint         # Revisar código
npm run lint:fix     # Corregir automáticamente
```

---

## Contribuir

1. Sigue la estructura de carpetas definida en [general/02-ARQUITECTURA.md](./general/02-ARQUITECTURA.md)
2. Usa TypeScript con tipos estrictos
3. Mantén los archivos pequeños y enfocados
4. Comenta el código cuando sea necesario
5. Haz commits pequeños y descriptivos
