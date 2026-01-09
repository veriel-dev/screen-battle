# Fase 3.5: Mejoras de UI y Experiencia Visual

**Estado**: Completado (~95%) - Pendiente: mejora de assets visuales
**Prioridad**: Alta (antes de Fase 4)
**Prerrequisitos**: Fases 1-3 completadas

---

## Objetivo

Mejorar significativamente la experiencia visual del juego mediante la implementación de assets externos, rediseño de componentes UI y mejora de la retroalimentación visual, antes de añadir nuevas mecánicas de gameplay.

---

## Justificación

La Fase 3 implementó sprites generados proceduralmente y efectos básicos. Antes de añadir mecánicas complejas (Fase 4), es necesario:

1. **Reemplazar sprites procedurales** por assets profesionales
2. **Mejorar la UI** para soportar más información (críticos, estados, etc.)
3. **Establecer base visual sólida** para futuras animaciones

---

## Documentación de Referencia

| Documento | Contenido |
|-----------|-----------|
| [ANALISIS-UI-VISUAL.md](./ANALISIS-UI-VISUAL.md) | Análisis del estado actual de la UI |
| [RECURSOS-VISUALES.md](./RECURSOS-VISUALES.md) | Catálogo de sprites y assets externos |
| [PROPUESTAS-MEJORA-VISUAL.md](./PROPUESTAS-MEJORA-VISUAL.md) | Mockups y propuestas de rediseño |
| [ui-layouts.excalidraw](./ui-layouts.excalidraw) | Diagramas visuales de layouts |

---

## 3.5.1 Assets Externos

### Sprites de Kodamon
**Estado**: [ ] Pendiente
**Complejidad**: Media
**Impacto**: Alto

Reemplazar los sprites generados proceduralmente por assets externos de 64x64 píxeles.

**Tareas**:
- [ ] Descargar pack de sprites de monstruos (itch.io/CraftPix)
- [ ] Seleccionar/adaptar 10 sprites para los Kodamon existentes
- [ ] Integrar sprites en `src/assets/sprites/kodamons/`
- [ ] Actualizar `BootScene.ts` para cargar sprites externos
- [ ] Eliminar `SpriteGenerator.ts` (opcional, mantener como fallback)

**Recursos recomendados**:
- [itch.io - 64x64 Monsters](https://itch.io/game-assets/tag-64x64/tag-monsters)
- [CraftPix - Free RPG Monster Sprites](https://craftpix.net/freebies/free-rpg-monster-sprites-pixel-art/)

**Archivos a modificar**:
- `src/scenes/BootScene.ts`
- `src/assets/sprites/kodamons/` (crear directorio)

---

### Fondos de Batalla
**Estado**: [ ] Pendiente
**Complejidad**: Baja
**Impacto**: Alto

Implementar fondos pixel art en lugar del color sólido actual.

**Tareas**:
- [ ] Descargar 3-5 fondos de batalla (OpenGameArt)
- [ ] Escalar/adaptar a 512x384 píxeles
- [ ] Integrar en `src/assets/backgrounds/`
- [ ] Implementar selección de fondo en `BattleScene.ts`
- [ ] (Opcional) Fondo según tipo del Kodamon del jugador

**Recursos recomendados**:
- [OpenGameArt - Battle Backgrounds](https://opengameart.org/content/backgrounds-3)
- [Hazy Hills Background](https://opengameart.org/content/battle-background-hazy-hills-0)

**Archivos a modificar**:
- `src/scenes/BootScene.ts`
- `src/scenes/BattleScene.ts`

---

### Pack de UI
**Estado**: [ ] Pendiente
**Complejidad**: Media
**Impacto**: Medio

Descargar e integrar pack de UI pixel art.

**Tareas**:
- [ ] Descargar Kenney Pixel UI Pack (750 assets, CC0)
- [ ] Seleccionar elementos necesarios (paneles, botones, barras)
- [ ] Integrar en `src/assets/ui/`
- [ ] Documentar sprites utilizados

**Recursos recomendados**:
- [Kenney Pixel UI Pack](https://kenney.nl/assets/pixel-ui-pack) (CC0)
- [CraftPix Free RPG UI](https://craftpix.net/freebies/free-basic-pixel-art-ui-for-rpg/)

---

## 3.5.2 Rediseño de Componentes UI

### HealthBar Mejorado
**Estado**: [ ] Pendiente
**Complejidad**: Media
**Impacto**: Alto

Rediseñar la barra de HP con marco decorativo y más información.

**Mejoras**:
- Marco 9-slice con sprites del UI pack
- Icono de tipo del Kodamon
- Nombre visible
- Números de HP (actual/máximo)
- Animación de "shake" cuando HP crítico

**Mockup**:
```
┌────────────────────────────────┐
│ [🔥] Flamander                 │
│ ████████████░░░░░░ 67/100 HP   │
└────────────────────────────────┘
```

**Archivos a modificar**:
- `src/ui/HealthBar.ts`

---

### MoveButton Mejorado
**Estado**: [ ] Pendiente
**Complejidad**: Media
**Impacto**: Medio

Añadir más información y estados visuales a los botones de movimiento.

**Mejoras**:
- Mostrar poder del movimiento
- Indicador de efectividad vs enemigo actual
- Estados visuales: normal, hover, pressed, disabled
- Icono de tipo más prominente

**Mockup**:
```
┌───────────────────┐
│ 🔥 LLAMARADA      │
│ Poder: 90         │
│ PP: 15/15         │
│ ▲ SUPER EFECTIVO  │
└───────────────────┘
```

**Archivos a modificar**:
- `src/ui/MoveButton.ts`

---

### DialogBox Mejorado
**Estado**: [ ] Pendiente
**Complejidad**: Baja
**Impacto**: Bajo

Mejorar la caja de diálogo con marco decorativo.

**Mejoras**:
- Marco 9-slice con sprites
- Indicador de continuar animado mejorado
- Soporte para mensajes de múltiples líneas

**Archivos a modificar**:
- `src/ui/DialogBox.ts`

---

## 3.5.3 Indicadores y Feedback Visual

### Indicador de Turno
**Estado**: [ ] Pendiente
**Complejidad**: Baja
**Impacto**: Medio

Mostrar claramente de quién es el turno actual.

**Opciones de implementación**:
```
Opción A: Banner superior
╔═══════════════════════════════════╗
║         ★ TURNO DE PYREX ★        ║
╚═══════════════════════════════════╝

Opción B: Indicador minimalista
[JUGADOR ●───────────────○ ENEMIGO]
```

**Archivos a modificar**:
- `src/scenes/BattleScene.ts`

---

### Números de Daño Flotantes
**Estado**: [ ] Pendiente
**Complejidad**: Baja
**Impacto**: Alto

Mostrar el daño infligido como número flotante animado.

**Implementación**:
```typescript
private mostrarDañoFlotante(x: number, y: number, daño: number, critico: boolean) {
  const color = critico ? '#FFD700' : '#FF4444';
  const texto = this.add.text(x, y, `-${daño}`, {
    fontFamily: '"Press Start 2P"',
    fontSize: critico ? '20px' : '14px',
    color: color
  }).setOrigin(0.5);

  this.tweens.add({
    targets: texto,
    y: y - 40,
    alpha: 0,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => texto.destroy()
  });
}
```

**Archivos a modificar**:
- `src/scenes/BattleScene.ts`

---

### Indicador de Efectividad
**Estado**: [ ] Pendiente
**Complejidad**: Baja
**Impacto**: Medio

Mejorar la retroalimentación visual de efectividad de tipo.

**Elementos**:
- Mensaje en DialogBox: "¡Es súper efectivo!" / "No es muy efectivo..."
- Icono visual: ▲▲ (súper) / ▼▼ (poco) / ✕✕ (sin efecto)
- Flash de color según efectividad

**Archivos a modificar**:
- `src/scenes/BattleScene.ts`
- `src/ui/DialogBox.ts`

---

## 3.5.4 Mejoras de Menú de Selección

### Panel de Vista Previa
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Alto

Mostrar información detallada del Kodamon seleccionado.

**Información a mostrar**:
- Sprite grande
- Nombre y tipo (con icono)
- Barras de estadísticas visuales
- Descripción del Kodamon
- Lista de movimientos

**Archivos a modificar**:
- `src/scenes/MenuScene.ts`

---

### Mejora de Layout
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Medio

Reorganizar el menú para mejor usabilidad.

**Mejoras**:
- Mayor espaciado entre cards de Kodamon
- Indicador claro de selección
- Sección de "seleccionados" más visible
- Botón de batalla más prominente

**Archivos a modificar**:
- `src/scenes/MenuScene.ts`

---

## 3.5.5 Iconos de Tipo

### Crear/Integrar Iconos
**Estado**: [ ] Pendiente
**Complejidad**: Baja
**Impacto**: Alto

Añadir iconos visuales para cada tipo elemental.

**Iconos por tipo**:
| Tipo | Emoji | Color Hex |
|------|-------|-----------|
| Fuego | 🔥 | #FF6B35 |
| Agua | 💧 | #4ECDC4 |
| Planta | 🌿 | #95D5B2 |
| Eléctrico | ⚡ | #FFE66D |
| Tierra | 🗿 | #8B7355 |
| Hielo | ❄️ | #A8DADC |
| Normal | ⭐ | #DFE6E9 |
| Veneno | ☠️ | #9B5DE5 |
| Fantasma | 👻 | #6C5B7B |
| Psíquico | 🔮 | #F15BB5 |

**Opciones**:
1. Usar emojis nativos (actual)
2. Crear sprites 16x16 personalizados
3. Descargar pack de iconos

**Archivos a modificar**:
- `src/data/tipos.ts`
- `src/ui/HealthBar.ts`
- `src/ui/MoveButton.ts`

---

## Checklist de Implementación

### Assets (Prioridad Alta)
- [x] Descargar sprites de Kodamon 64x64
- [x] Integrar sprites en el proyecto
- [x] Descargar fondos de batalla
- [x] Integrar fondos en BattleScene
- [ ] Descargar Kenney UI Pack (opcional)
- [x] Organizar assets en directorios

### Componentes UI (Prioridad Alta)
- [x] Rediseñar HealthBar con marco
- [x] Añadir números de HP visibles
- [x] Añadir iconos de tipo en HealthBar
- [x] Mejorar MoveButton con poder/efectividad
- [x] Implementar indicador de turno

### Feedback Visual (Prioridad Media)
- [x] Implementar números de daño flotantes
- [x] Mejorar mensajes de efectividad
- [x] Añadir flash de color por tipo (mediante partículas)

### Menú (Prioridad Media)
- [x] Crear panel de vista previa
- [x] Mejorar layout del grid
- [x] Mejorar indicador de selección

### Pendiente para futuro
- [ ] Reemplazar assets visuales por sprites de mayor calidad
- [ ] Descargar Kenney UI Pack (opcional)

---

## Entregable

Juego con identidad visual profesional: sprites externos, UI pulida con marcos decorativos, feedback visual claro y menú de selección informativo.

---

## Dependencias con Fase 4

La Fase 3.5 prepara la UI para soportar las mecánicas de Fase 4:

| Mejora Fase 3.5 | Habilita en Fase 4 |
|-----------------|-------------------|
| Números flotantes | Mostrar daño crítico |
| Indicador de turno | Sistema de velocidad |
| HealthBar mejorado | Estados alterados |
| MoveButton con poder | Preview de daño |

---

## Referencias

- [Roadmap General](../01-ROADMAP.md)
- [Fase 4: Gameplay](../fase4/README.md)
