# Roadmap del Proyecto: Kodamon

## Visión General

Desarrollo de un juego de batallas por turnos estilo Pokémon utilizando **Vite** como bundler y **Phaser 3** como motor de juego.

---

## Fase 1: Configuración e Infraestructura ✅

### 1.1 Inicialización del Proyecto
- [x] Crear proyecto con Vite + TypeScript
- [x] Instalar dependencias (Phaser 3)
- [x] Configurar ESLint y Prettier
- [x] Configurar estructura de carpetas
- [x] Configurar alias de importación en `vite.config.ts`

### 1.2 Configuración de Phaser
- [x] Crear archivo de configuración principal
- [x] Configurar escenas base (Boot, Menu, Battle)
- [x] Configurar sistema de assets/preload
- [x] Configurar escalado responsive (zoom 2x, pixelArt: true)

**Entregable:** Proyecto base funcionando con Phaser mostrando una escena vacía. ✅

---

## Fase 2: Migración del Código Existente ✅

### 2.1 Extracción de Datos
- [x] Migrar datos de Kodamon a módulo separado (`data/kodamons.ts`)
- [x] Migrar tabla de efectividad (`data/efectividad.ts`)
- [x] Crear tipos TypeScript para Kodamon, movimientos, tipos
- [x] Crear constantes para iconos y colores de tipos

### 2.2 Migración de Escenas
- [x] Convertir `MenuScene` a clase TypeScript modular
- [x] Convertir `BattleScene` a clase TypeScript modular
- [x] Crear `BootScene` para precarga de assets
- [x] Extraer lógica común a utilidades

### 2.3 Sistema de Generación de Sprites Procedural
- [x] Migrar funciones de generación de sprites
- [x] Crear clase `SpriteGenerator` reutilizable
- [x] Generar sprites en BootScene y cachearlos

**Entregable:** Juego funcionando igual que la versión HTML pero con código modularizado. ✅

---

## Fase 3: Sistema de Assets Externos ✅

### 3.1 Sprites de Kodamon
- [x] Definir especificaciones de sprites (tamaño, formato)
- [x] Crear/obtener sprites para los 10 Kodamon
- [x] Implementar carga de sprites desde archivos
- [ ] Crear spritesheets con animaciones básicas

### 3.2 Fondos de Batalla
- [x] Diseñar/obtener fondos de batalla (mínimo 3 variantes)
- [x] Implementar sistema de fondos intercambiables
- [ ] Añadir parallax o efectos de profundidad (opcional)

### 3.3 Efectos Visuales
- [x] Crear sprites de partículas por tipo
- [x] Implementar efectos de impacto
- [x] Crear animaciones de movimientos especiales

### 3.4 UI Assets
- [x] Diseñar marcos de HP y paneles
- [x] Crear iconos de tipos
- [x] Diseñar botones y elementos de menú

**Entregable:** Juego con assets visuales propios reemplazando los generados por código. ✅

---

## Fase 3.5: Mejoras de UI y Experiencia Visual ✅

> 🎨 **Estilo implementado**: Digimon Cyber Sleuth

### 3.5.1 Sistema de Diseño Cyber Sleuth
- [x] Sistema de temas centralizado (`src/ui/theme.ts`)
- [x] Paleta de colores: cyan, pink, purple
- [x] Fuentes Google: Orbitron + Rajdhani
- [x] Paneles angulares con `drawCyberPanel()`
- [x] Grid animado de fondo con `drawCyberGrid()`

### 3.5.2 Rediseño de Componentes UI
- [x] HealthBar con panel cyber, icono de tipo geométrico
- [x] MoveButton angular con línea de acento del tipo
- [x] DialogBox con panel angular y bordes cyan
- [x] Iconos de tipo geométricos (▲◆✦϶▣✱≈◼●◐)

### 3.5.3 Feedback Visual
- [x] Indicador de turno con estilo angular animado
- [x] Números de daño flotantes con colores temáticos
- [x] Efectos glow en sprites (`postFX.addGlow()`)

### 3.5.4 Mejoras de Menú
- [x] Layout de dos columnas centradas verticalmente
- [x] Panel de vista previa de Kodamon (derecha)
- [x] Selector de arena con preview
- [x] Filtros de tipo con iconos geométricos
- [x] Grid de Kodamon con cards angulares

**Entregable:** UI con identidad visual Digimon Cyber Sleuth. ✅

---

## Fase 4: Mejoras de Gameplay

> 📄 **Documentación detallada**: [fase4/README.md](./fase4/README.md)

### 4.1 Sistema de Batalla Mejorado
- [ ] Sistema de velocidad (quién ataca primero)
- [ ] Golpes críticos (~6.25%, x1.5 daño)
- [ ] Precisión de movimientos
- [ ] Movimientos de estado (paralizar, quemar, etc.)

### 4.2 Animaciones de Batalla
- [ ] Animación idle para cada Kodamon
- [ ] Animación de ataque
- [ ] Animación de recibir daño
- [ ] Animación de desmayo

### 4.3 Menú de Selección Mejorado
- [ ] Vista previa de estadísticas detalladas
- [ ] Filtrado por tipo
- [ ] Comparación de Kodamon
- [ ] Selección aleatoria

**Entregable:** Sistema de batalla con mecánicas más profundas y animaciones fluidas.

---

## Fase 5: Audio ✅

### 5.1 Música
- [x] Música de menú de selección
- [x] Música de batalla
- [x] Música de victoria
- [x] Música de derrota

### 5.2 Efectos de Sonido
- [x] Sonido de selección en menú
- [x] Sonidos de ataques por tipo
- [x] Sonido de daño recibido
- [x] Sonido de estados alterados
- [x] Sonido de victoria/derrota

### 5.3 Sistema de Audio
- [x] Implementar gestor de audio (`AudioManager`)
- [x] Control de mute (`AudioControls`)
- [x] Persistencia en localStorage

**Entregable:** Experiencia de audio completa. ✅

---

## Fase 6: Funcionalidades Adicionales ✅

### 6.1 Persistencia
- [x] Guardar estadísticas de victorias/derrotas
- [x] Guardar configuración del usuario
- [x] Sistema de logros básico (11 logros)

### 6.2 Modos de Juego
- [x] Modo torneo (4 rondas, HP persistente)
- [x] Modo supervivencia (oleadas infinitas, +50% HP entre rondas)
- [x] ModeSelectScene para elegir modo

### 6.3 Multijugador Local
- [x] Dos jugadores en la misma pantalla
- [x] Selección de Kodamon para Player 2

**Entregable:** Juego con características adicionales y rejugabilidad. ✅

---

## Fase 7: Pulido y Distribución

### 7.1 Optimización
- [ ] Optimizar carga de assets
- [ ] Lazy loading de escenas
- [ ] Compresión de imágenes
- [ ] Minificación de código

### 7.2 Testing
- [ ] Tests unitarios para lógica de batalla
- [ ] Tests de integración de escenas
- [ ] Testing manual de gameplay

### 7.3 Distribución
- [ ] Build de producción
- [ ] Despliegue en hosting (Netlify/Vercel)
- [ ] PWA para instalación (opcional)
- [ ] Empaquetado con Electron para desktop (opcional)

**Entregable:** Juego optimizado y desplegado.

---

## Cronograma Sugerido

| Fase | Descripción | Prioridad | Estado |
|------|-------------|-----------|--------|
| 1 | Configuración | Alta | ✅ Completada |
| 2 | Migración | Alta | ✅ Completada |
| 3 | Assets | Alta | ✅ Completada |
| 3.5 | UI Cyber Sleuth | Alta | ✅ Completada |
| 4 | Gameplay | Alta | ✅ Completada |
| 5 | Audio | Media | ✅ Completada |
| **6** | **Adicionales** | **Baja** | **🔄 Próxima** |
| 7 | Distribución | Media | Pendiente |

---

## Métricas de Éxito

- [ ] El juego carga en menos de 3 segundos
- [ ] No hay errores en consola durante gameplay normal
- [ ] La batalla fluye sin interrupciones
- [ ] Los sprites se ven nítidos en diferentes resoluciones
- [ ] El juego es jugable en dispositivos móviles
