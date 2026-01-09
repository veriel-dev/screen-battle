# Assets y Recursos

Esta guía detalla las especificaciones técnicas para los assets del juego, herramientas recomendadas para crearlos, y recursos gratuitos disponibles.

---

## Especificaciones Técnicas

### Sprites de Kodamon (Criaturas)

| Propiedad | Valor |
|-----------|-------|
| **Tamaño base** | 64x64 píxeles |
| **Formato** | PNG con transparencia |
| **Estilo** | Pixel art |
| **Paleta** | Máximo 16 colores por Kodamon |
| **Escala en juego** | 1x (64px) o 2x (128px) |

#### Spritesheet de Animaciones

Para animaciones, usar spritesheets horizontales:

```
┌────────┬────────┬────────┬────────┐
│ Idle 1 │ Idle 2 │ Idle 3 │ Idle 4 │  <- Fila 1: Animación idle (4 frames)
├────────┼────────┼────────┼────────┤
│Attack 1│Attack 2│Attack 3│Attack 4│  <- Fila 2: Animación ataque (4 frames)
├────────┼────────┼────────┼────────┤
│ Hurt 1 │ Hurt 2 │ Hurt 3 │ Hurt 4 │  <- Fila 3: Recibir daño (4 frames)
├────────┼────────┼────────┼────────┤
│Faint 1 │Faint 2 │Faint 3 │Faint 4 │  <- Fila 4: Desmayo (4 frames)
└────────┴────────┴────────┴────────┘

Total: 256x256 píxeles (4 columnas x 4 filas de 64x64)
```

**Nomenclatura de archivos:**
```
sprites/kodamons/
├── flamita.png           # Sprite estático
├── flamita-sheet.png     # Spritesheet con animaciones
├── plantin.png
├── plantin-sheet.png
└── ...
```

### Fondos de Batalla

| Propiedad | Valor |
|-----------|-------|
| **Tamaño** | 512x384 píxeles (o múltiplos) |
| **Formato** | PNG o JPG |
| **Estilo** | Pixel art o semi-realista estilizado |
| **Capas** | Opcional: cielo, montañas, plataformas |

**Fondos sugeridos:**
1. `grass-field.png` - Campo de hierba (día)
2. `cave.png` - Interior de cueva
3. `beach.png` - Playa con agua
4. `volcano.png` - Volcán (para tipo fuego)
5. `haunted.png` - Lugar embrujado (para fantasma)

### Elementos de UI

| Elemento | Tamaño | Descripción |
|----------|--------|-------------|
| `hp-bar-frame.png` | 180x20 | Marco de la barra de vida |
| `hp-bar-fill.png` | 1x16 | Relleno de barra (se estira) |
| `dialog-box.png` | 492x60 | Caja de diálogo |
| `button.png` | 116x20 | Botón de movimiento |
| `type-icons.png` | 192x16 | Spritesheet de iconos (12x16 c/u) |

### Efectos y Partículas

| Elemento | Tamaño | Descripción |
|----------|--------|-------------|
| `particle-fire.png` | 8x8 | Partícula de fuego |
| `particle-water.png` | 8x8 | Gota de agua |
| `particle-leaf.png` | 8x8 | Hoja |
| `impact-star.png` | 16x16 | Estrella de impacto |
| `hit-effect.png` | 32x32 | Efecto de golpe |

### Audio

| Tipo | Formato | Bitrate | Descripción |
|------|---------|---------|-------------|
| Música | MP3/OGG | 128-192 kbps | Loops de fondo |
| SFX | WAV/OGG | 16-bit | Efectos cortos |

**Lista de audio necesario:**

```
audio/
├── music/
│   ├── menu-theme.mp3      # Música del menú de selección
│   ├── battle-theme.mp3    # Música de batalla
│   ├── victory-theme.mp3   # Fanfarria de victoria
│   └── defeat-theme.mp3    # Música de derrota
│
└── sfx/
    ├── select.wav          # Selección en menú
    ├── confirm.wav         # Confirmar selección
    ├── hit-normal.wav      # Golpe normal
    ├── hit-super.wav       # Golpe súper efectivo
    ├── hit-weak.wav        # Golpe poco efectivo
    ├── heal.wav            # Curación
    ├── faint.wav           # Desmayo
    └── type/
        ├── fire.wav        # Ataque de fuego
        ├── water.wav       # Ataque de agua
        ├── grass.wav       # Ataque de planta
        ├── electric.wav    # Ataque eléctrico
        └── ...             # Resto de tipos
```

---

## Herramientas de Creación

### Para Pixel Art (Sprites y Fondos)

#### Gratuitas

| Herramienta | Plataforma | URL | Notas |
|-------------|------------|-----|-------|
| **Piskel** | Web/Desktop | [piskelapp.com](https://www.piskelapp.com/) | Ideal para principiantes, exporta spritesheets |
| **LibreSprite** | Desktop | [libresprite.github.io](https://libresprite.github.io/) | Fork gratuito de Aseprite |
| **Pixelorama** | Desktop | [orama-interactive.itch.io/pixelorama](https://orama-interactive.itch.io/pixelorama) | Open source, muy completo |
| **GIMP** | Desktop | [gimp.org](https://www.gimp.org/) | Con configuración para pixel art |
| **Lospec Pixel Editor** | Web | [lospec.com/pixel-editor](https://lospec.com/pixel-editor/) | Editor web simple |

#### De Pago

| Herramienta | Precio | URL | Notas |
|-------------|--------|-----|-------|
| **Aseprite** | $20 USD | [aseprite.org](https://www.aseprite.org/) | Estándar de la industria |
| **Pyxel Edit** | $9 USD | [pyxeledit.com](https://pyxeledit.com/) | Bueno para tilesets |
| **Pro Motion NG** | $40 USD | [cosmigo.com](https://www.cosmigo.com/) | Profesional |

### Para Generación con IA

| Herramienta | Tipo | Notas |
|-------------|------|-------|
| **Stable Diffusion** | Local/Cloud | Usa LoRA de pixel art |
| **Midjourney** | Cloud | Prompt: "pixel art, 16-bit style, game sprite" |
| **DALL-E 3** | Cloud | Bueno para conceptos, luego retocar |
| **Pixelicious** | Web | [pixelicious.xyz](https://pixelicious.xyz/) - Convierte imágenes a pixel art |
| **PixelMe** | Web | [pixel-me.tokyo](https://pixel-me.tokyo/en/) - Convierte fotos |

### Para Audio

| Herramienta | Tipo | URL | Uso |
|-------------|------|-----|-----|
| **jsfxr** | Web | [sfxr.me](https://sfxr.me/) | Generador de SFX retro |
| **ChipTone** | Web | [sfbgames.itch.io/chiptone](https://sfbgames.itch.io/chiptone) | SFX estilo chiptune |
| **Audacity** | Desktop | [audacityteam.org](https://www.audacityteam.org/) | Edición de audio |
| **BeepBox** | Web | [beepbox.co](https://www.beepbox.co/) | Composición chiptune |
| **Bosca Ceoil** | Desktop | [boscaceoil.net](https://boscaceoil.net/) | Música retro simple |

---

## Recursos Gratuitos

### Sprites y Arte

| Recurso | URL | Licencia | Contenido |
|---------|-----|----------|-----------|
| **OpenGameArt** | [opengameart.org](https://opengameart.org/) | Variada (CC0, CC-BY, etc.) | Miles de assets |
| **Itch.io Game Assets** | [itch.io/game-assets/free](https://itch.io/game-assets/free) | Variada | Assets de alta calidad |
| **Kenney.nl** | [kenney.nl/assets](https://kenney.nl/assets) | CC0 (dominio público) | Excelente calidad |
| **Game-Icons.net** | [game-icons.net](https://game-icons.net/) | CC BY 3.0 | Iconos SVG |
| **Lospec Palettes** | [lospec.com/palette-list](https://lospec.com/palette-list) | CC0 | Paletas de colores |

### Búsquedas Específicas

**Para sprites tipo Pokémon:**
```
Sitio: OpenGameArt
Búsqueda: "monster sprite pixel art"
Filtro: License: CC0 or CC-BY

Sitio: Itch.io
Búsqueda: "creature sprites pixel"
Filtro: Free, Downloadable
```

**Para fondos de batalla:**
```
Sitio: OpenGameArt
Búsqueda: "battle background pixel art"

Sitio: Itch.io
Búsqueda: "rpg battle background"
```

### Packs Recomendados (Gratis)

1. **Monsters Creatures Fantasy**
   - URL: [itch.io/game-assets/free/tag-monsters](https://itch.io/game-assets/free/tag-monsters)
   - Varios packs con criaturas animadas

2. **RPG Battle Backgrounds**
   - Buscar en OpenGameArt o Itch.io
   - Fondos estilo JRPG clásico

3. **UI Pack - RPG**
   - Kenney tiene varios packs de UI
   - [kenney.nl/assets?q=2d](https://kenney.nl/assets?q=2d)

### Audio Gratuito

| Recurso | URL | Licencia | Contenido |
|---------|-----|----------|-----------|
| **Freesound** | [freesound.org](https://freesound.org/) | CC0/CC-BY | Efectos de sonido |
| **OpenGameArt (Audio)** | [opengameart.org/art-type/music](https://opengameart.org/art-type/music) | Variada | Música y SFX |
| **Incompetech** | [incompetech.com/music](https://incompetech.com/music/) | CC BY | Música de Kevin MacLeod |
| **Free Music Archive** | [freemusicarchive.org](https://freemusicarchive.org/) | CC | Música variada |

---

## Guía de Creación de Sprites

### Paso 1: Diseño del Concepto

Antes de dibujar, define:
- **Tipo elemental** → Define paleta de colores
- **Silueta distintiva** → Reconocible a 64px
- **Personalidad** → Agresivo, tierno, misterioso, etc.

### Paso 2: Paleta de Colores

Usa 3-5 colores base + variaciones:

```
Color base     → Tono principal del Kodamon
Sombra (-20%)  → Para profundidad
Luz (+20%)     → Para highlights
Acento         → Color secundario
Ojos           → Generalmente brillante
```

**Paletas por tipo sugeridas:**

| Tipo | Colores principales |
|------|---------------------|
| Fuego | #f06030, #f89848, #f8c078, #b03018 |
| Agua | #3890d8, #58a8e8, #88c8f8, #206890 |
| Planta | #48a048, #68c058, #98d878, #287028 |
| Eléctrico | #f0c030, #f8e068, #f8f0a8, #c09018 |
| Roca | #908070, #b8a890, #605848, #c8c0b0 |
| Fantasma | #6848a0, #8868c0, #a890e0, #483078 |
| Dragón | #5070b0, #7090d0, #90b0f0, #304878 |
| Hielo | #80c0e0, #a8d8f0, #d0f0f8, #5098b8 |
| Veneno | #9050b0, #a868c8, #c090e0, #683888 |
| Psíquico | #e070a0, #f090c0, #f8b0d8, #b04878 |

### Paso 3: Dibujar el Sprite Base

1. **Empieza con la silueta** (forma general)
2. **Define colores base** (sin sombreado)
3. **Añade sombras** (dirección de luz consistente)
4. **Añade highlights** (ojos, reflejos)
5. **Detalles finales** (texturas, acentos)

### Paso 4: Animaciones

**Orden de prioridad:**
1. **Idle** (2-4 frames) - Movimiento sutil de respiración
2. **Ataque** (3-4 frames) - Movimiento hacia adelante
3. **Daño** (2 frames) - Parpadeo o retroceso
4. **Desmayo** (3-4 frames) - Caída

**Tips para animación:**
- Mantén el volumen consistente
- El movimiento debe ser exagerado (es pixel art)
- 4-8 FPS es común para pixel art

---

## Integración con Phaser

### Cargar Sprites Estáticos

```typescript
// En BootScene.preload()
this.load.image('flamita', 'assets/sprites/kodamons/flamita.png');
```

### Cargar Spritesheets

```typescript
// En BootScene.preload()
this.load.spritesheet('flamita-sheet', 'assets/sprites/kodamons/flamita-sheet.png', {
  frameWidth: 64,
  frameHeight: 64,
});

// En create() - Definir animaciones
this.anims.create({
  key: 'flamita-idle',
  frames: this.anims.generateFrameNumbers('flamita-sheet', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1, // Loop infinito
});

this.anims.create({
  key: 'flamita-attack',
  frames: this.anims.generateFrameNumbers('flamita-sheet', { start: 4, end: 7 }),
  frameRate: 10,
  repeat: 0,
});
```

### Usar Animaciones

```typescript
// Crear sprite animado
const kodamon = this.add.sprite(100, 200, 'flamita-sheet');
kodamon.play('flamita-idle');

// Cambiar animación
kodamon.play('flamita-attack');

// Escuchar cuando termina
kodamon.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
  if (anim.key === 'flamita-attack') {
    kodamon.play('flamita-idle');
  }
});
```

### Cargar Fondos

```typescript
this.load.image('bg-grass', 'assets/backgrounds/grass-field.png');

// En create()
this.add.image(256, 192, 'bg-grass').setOrigin(0.5);
```

### Cargar Audio

```typescript
// Música
this.load.audio('battle-music', 'assets/audio/music/battle-theme.mp3');

// SFX
this.load.audio('hit', 'assets/audio/sfx/hit-normal.wav');

// Reproducir
this.sound.play('battle-music', { loop: true, volume: 0.5 });
this.sound.play('hit');
```

---

## Checklist de Assets

### Sprites de Kodamon (10 total)

| Kodamon | Estático | Spritesheet | Animaciones |
|-------|----------|-------------|-------------|
| Flamita | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Plantín | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Aquarex | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Voltix | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Petrón | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Espectrix | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Drakón | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Glacius | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Toxin | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |
| Lumix | [ ] | [ ] | [ ] idle, [ ] attack, [ ] hurt, [ ] faint |

### Fondos

| Fondo | Estado |
|-------|--------|
| Campo de hierba | [ ] |
| Cueva | [ ] |
| Playa | [ ] |

### UI

| Elemento | Estado |
|----------|--------|
| Barra de HP | [ ] |
| Caja de diálogo | [ ] |
| Botones de movimiento | [ ] |
| Iconos de tipo | [ ] |

### Audio

| Audio | Estado |
|-------|--------|
| Música menú | [ ] |
| Música batalla | [ ] |
| Música victoria | [ ] |
| SFX selección | [ ] |
| SFX golpe | [ ] |
| SFX por tipo (10) | [ ] |

---

## Prompts para IA (Generación de Assets)

### Para Stable Diffusion / Midjourney

**Sprite de criatura:**
```
pixel art monster sprite, [DESCRIPCION], 64x64 pixels,
transparent background, 16-bit style, pokemon style creature,
front view, centered, game asset, clean lines
```

Ejemplos:
```
pixel art monster sprite, fire lizard with flame tail, orange and red colors,
64x64 pixels, transparent background, 16-bit style, pokemon style creature,
front view, centered, game asset

pixel art monster sprite, cute electric mouse, yellow with red cheeks,
64x64 pixels, transparent background, 16-bit style, pokemon style creature,
front view, centered, game asset
```

**Fondo de batalla:**
```
pixel art battle background, [ESCENARIO], 512x384 pixels,
rpg battle scene, 16-bit jrpg style, vibrant colors,
parallax layers, game asset
```

Ejemplos:
```
pixel art battle background, grassy meadow with mountains,
512x384 pixels, rpg battle scene, 16-bit jrpg style,
sunny day, blue sky with clouds

pixel art battle background, dark cave with crystals,
512x384 pixels, rpg battle scene, 16-bit jrpg style,
mysterious atmosphere, glowing gems
```

**Nota:** Las imágenes generadas por IA generalmente necesitan retoque manual para ser consistentes y usables como sprites de juego.
