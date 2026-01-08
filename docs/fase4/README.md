# Fase 4: Mejoras de Gameplay

**Estado**: Completada
**Prioridad**: Alta
**Prerrequisitos**: Fases 1-3.5 completadas

---

## Objetivo

Implementar mecánicas de batalla más profundas y animaciones fluidas para mejorar la experiencia de juego.

---

## 4.1 Sistema de Batalla Mejorado

### 4.1.1 Sistema de Velocidad
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Alto

Determina qué Kodamon ataca primero en cada turno basándose en el stat de velocidad.

**Reglas**:
- El Kodamon con mayor velocidad ataca primero
- En caso de empate, se decide aleatoriamente (50/50)
- Mensaje "¡X es más rápido!" al inicio de batalla

**Archivos modificados**:
- `src/scenes/BattleScene.ts` - `determinarOrdenTurno()`

---

### 4.1.2 Golpes Críticos
**Estado**: [x] Completado
**Complejidad**: Baja
**Impacto**: Medio

Probabilidad de infligir daño aumentado en un ataque.

**Reglas**:
- Probabilidad base: 6.25% (1/16)
- Multiplicador de daño: x1.5
- Mensaje "¡Golpe crítico!" en DialogBox
- Efecto visual en `BattleEffects.ts`

**Archivos modificados**:
- `src/scenes/BattleScene.ts`
- `src/data/constants.ts`
- `src/systems/BattleEffects.ts`

---

### 4.1.3 Precisión de Movimientos
**Estado**: [x] Completado
**Complejidad**: Baja
**Impacto**: Medio

Los movimientos pueden fallar según su stat de precisión.

**Reglas**:
- Cada movimiento tiene un valor de precisión (0-100)
- Si el random supera la precisión, el ataque falla
- Mensaje "¡El ataque falló!" si falla

**Archivos modificados**:
- `src/types/index.ts` - Campo `precision` en Movimiento
- `src/data/movimientos.ts` - Precisión para cada movimiento
- `src/scenes/BattleScene.ts`

---

### 4.1.4 Movimientos de Estado
**Estado**: [x] Completado
**Complejidad**: Alta
**Impacto**: Alto

Efectos de estado que persisten entre turnos.

**Estados implementados**:

| Estado | Efecto | Duración |
|--------|--------|----------|
| Quemado | -1/16 HP por turno | Hasta curar |
| Paralizado | 25% no atacar | Hasta curar |
| Envenenado | -1/8 HP por turno | Hasta curar |
| Dormido | No puede atacar | 1-3 turnos |
| Congelado | No puede atacar | 1-5 turnos |

**Archivos creados/modificados**:
- `src/types/index.ts` - `EstadoAlterado`, `EfectoEstadoMovimiento`
- `src/systems/StatusEffects.ts` - Sistema completo de estados
- `src/data/movimientos.ts` - Movimientos con efectos de estado
- `src/scenes/BattleScene.ts` - Integración en flujo de batalla
- `src/ui/HealthBar.ts` - Indicador visual de estado

---

## 4.2 Animaciones de Batalla

### 4.2.1 Animación Idle
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Medio

Movimiento sutil constante (flotación/respiración) para dar vida a los Kodamon.

**Implementación**:
- Tween programático con `Sine.easeInOut`
- Jugador: sube 4px, 1000ms
- Enemigo: sube 3px, 1200ms (desfasado)
- Se pausa durante ataques y se reanuda en cambio de turno

**Archivos modificados**:
- `src/scenes/BattleScene.ts` - `iniciarAnimacionesIdle()`, `pausarAnimacionesIdle()`, `reanudarAnimacionesIdle()`

---

### 4.2.2 Animación de Ataque
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Alto

Movimiento del sprite al ejecutar un ataque (lunge hacia el enemigo).

**Secuencia**:
1. Avanza 40px horizontal + 15px vertical (150ms)
2. Pausa breve (100ms)
3. Regresa a posición original (200ms)

**Archivos modificados**:
- `src/scenes/BattleScene.ts` - `animarAtaque()`

---

### 4.2.3 Animación de Recibir Daño
**Estado**: [x] Completado
**Complejidad**: Baja
**Impacto**: Medio

Reacción visual al recibir un golpe.

**Secuencia**:
1. Flash rojo
2. Shake horizontal (4 repeticiones)
3. Números de daño flotantes

**Archivos modificados**:
- `src/systems/BattleEffects.ts` - `recibirDano()`
- `src/scenes/BattleScene.ts` - `mostrarDanoFlotante()`

---

### 4.2.4 Animación de Desmayo
**Estado**: [x] Completado
**Complejidad**: Baja
**Impacto**: Medio

Animación dramática cuando un Kodamon llega a 0 HP.

**Secuencia**:
1. Flash rojo de impacto final
2. Shake horizontal rápido
3. Transición a tinte gris
4. Pausa dramática (200ms)
5. Caída con rotación (20°), escala reducida (0.8), fade out (800ms)

**Archivos modificados**:
- `src/systems/BattleEffects.ts` - `derrotaKodamon()`
- `src/scenes/BattleScene.ts` - Pausa de idle antes de derrota

---

### 4.2.5 Transiciones Suaves
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Medio

Transiciones entre estados de batalla.

**Transiciones implementadas**:
- **Intro de batalla**: Sprites entran desde fuera de pantalla con `Back.easeOut`
  - Enemigo desde la derecha
  - Jugador desde la izquierda (después del primer diálogo)
  - Animaciones idle inician después de la entrada
- **Cambio de turno**: Banner animado que baja con estrellas giratorias
- **Fin de batalla**: Fade a negro (400ms) antes de volver al menú

**Archivos modificados**:
- `src/scenes/BattleScene.ts` - `crearSprites()`, `iniciarIntro()`, `volverAlMenu()`

---

## 4.3 Menú de Selección Mejorado

### 4.3.1 Vista Previa de Estadísticas
**Estado**: [x] Completado (Fase 3.5)
**Complejidad**: Media
**Impacto**: Alto

Panel detallado al seleccionar/hover un Kodamon.

**Información mostrada**:
- Sprite grande (1.5x)
- Nombre y tipo con icono
- Todas las estadísticas
- Descripción del Kodamon

---

### 4.3.2 Filtrado por Tipo
**Estado**: [x] Completado
**Complejidad**: Baja
**Impacto**: Bajo

Botones para filtrar la lista de Kodamon por tipo elemental.

**Implementación**:
- Fila de 11 botones (todos + 10 tipos)
- Iconos con colores de cada tipo
- Botón seleccionado resaltado en dorado
- Grid se recrea con Kodamon filtrados

**Archivos modificados**:
- `src/scenes/MenuScene.ts` - `crearFiltrosTipo()`, `aplicarFiltro()`

---

### 4.3.3 Comparación de Kodamon
**Estado**: [x] Completado
**Complejidad**: Media
**Impacto**: Medio

Mostrar dos Kodamon lado a lado para comparar stats.

**Implementación**:
- Botón "COMPARAR" activa modo comparación
- Click en dos Kodamon abre panel overlay
- 6 stats con barras comparativas
- Colores: verde (superior), rojo (inferior), gris (empate)
- Botón "CERRAR" para volver

**Archivos modificados**:
- `src/scenes/MenuScene.ts` - `crearBotonComparar()`, `mostrarComparacion()`, `crearPanelKodamon()`

---

### 4.3.4 Selección Aleatoria
**Estado**: [x] Completado
**Complejidad**: Baja
**Impacto**: Bajo

Botón para seleccionar Kodamon al azar.

**Implementación**:
- Botón "? ALEATORIO"
- Efecto visual de "ruleta" (15 iteraciones rápidas)
- Sprite seleccionado hace bounce al final
- Funciona con filtros activos

**Archivos modificados**:
- `src/scenes/MenuScene.ts` - `crearBotonAleatorio()`, `seleccionarAleatorio()`

---

## Checklist de Implementación

### Sistema de Batalla
- [x] Crear `src/data/constants.ts` con constantes de batalla
- [x] Implementar sistema de velocidad
- [x] Implementar golpes críticos
- [x] Añadir precisión a movimientos
- [x] Crear `src/systems/StatusEffects.ts`
- [x] Implementar estados alterados básicos
- [x] Indicador visual de estado en HealthBar

### Animaciones
- [x] Animación idle (tween programático)
- [x] Animación de ataque (lunge)
- [x] Mejorar animación de daño recibido
- [x] Animación de desmayo (dramática)
- [x] Números de daño flotantes (completado en Fase 3.5)
- [x] Transiciones entre estados (intro, turno, fin)

### Menú
- [x] Panel de vista previa detallada (completado en Fase 3.5)
- [x] Filtros por tipo
- [x] Comparación lado a lado
- [x] Botón de selección aleatoria

### Deuda Técnica (Futura)
- [ ] Reemplazar sprites actuales por assets de mayor calidad
- [ ] Definir estilo visual coherente (ver designs/ para candidatos)

---

## Entregable

Sistema de batalla con mecánicas más profundas y animaciones fluidas que mejoran significativamente la experiencia de juego.

**Funcionalidades entregadas**:
- Sistema de velocidad para orden de turnos
- Golpes críticos con feedback visual
- Precisión de movimientos (pueden fallar)
- 5 estados alterados con efectos persistentes
- Animaciones idle, ataque, daño y desmayo
- Transiciones suaves de batalla
- Menú con filtros, comparación y selección aleatoria

---

## Referencias

- [Roadmap General](../01-ROADMAP.md)
- [Análisis de Mejoras](../07-ANALISIS-MEJORAS.md)
- [Propuestas Visuales](../10-PROPUESTAS-MEJORA-VISUAL.md)
- [Recursos Visuales](../09-RECURSOS-VISUALES.md)
