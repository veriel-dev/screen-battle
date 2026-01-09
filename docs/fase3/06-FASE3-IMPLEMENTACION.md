# Fase 3: Sistema de Assets Externos - Resumen de Implementación

Este documento detalla toda la lógica implementada en la Fase 3 del proyecto Kodamon.

---

## 3.1 Sprites de Kodamon

### Descripción
Reemplazo del sistema de generación procedural de sprites por assets PNG externos.

### Archivos Creados
```
src/assets/sprites/kodamons/
├── pyrex.png      (Fuego)
├── aquon.png      (Agua)
├── florix.png     (Planta)
├── voltix.png     (Eléctrico)
├── glaceon.png    (Hielo)
├── terron.png     (Tierra)
├── aerix.png      (Volador)
├── petrix.png     (Roca)
├── spectrus.png   (Fantasma)
└── normix.png     (Normal)
```

### Cambios en BootScene.ts
```typescript
// Importación estática de sprites (Vite)
import pyrexSprite from '@assets/sprites/kodamons/pyrex.png';
import aquonSprite from '@assets/sprites/kodamons/aquon.png';
// ... etc

const KODAMON_SPRITES: Record<string, string> = {
  pyrex: pyrexSprite,
  aquon: aquonSprite,
  // ... mapeo ID -> ruta del sprite
};

// En preload():
Object.entries(KODAMON_SPRITES).forEach(([id, path]) => {
  this.load.image(`kodamon-${id}`, path);
});
```

**Lógica**: Vite procesa los imports estáticos y genera rutas hasheadas en producción. El mapeo `KODAMON_SPRITES` asocia cada ID de Kodamon con su sprite correspondiente.

---

## 3.2 Fondos de Batalla

### Descripción
Sistema de selección de arena con 4 fondos diferentes y preview en el menú.

### Archivos Creados
```
src/assets/sprites/backgrounds/
├── battle-bg-1.png  (Ruinas)
├── battle-bg-2.png  (Bosque)
├── battle-bg-3.png  (Desierto)
└── battle-bg-4.png  (Castillo)
```

### Cambios en BootScene.ts
```typescript
import battleBg1 from '@assets/sprites/backgrounds/battle-bg-1.png';
// ... etc

const BATTLE_BACKGROUNDS: Record<string, string> = {
  'battle-bg-1': battleBg1,
  'battle-bg-2': battleBg2,
  'battle-bg-3': battleBg3,
  'battle-bg-4': battleBg4,
};

// Exportación para uso en MenuScene
export const FONDOS_DISPONIBLES = [
  { id: 'battle-bg-1', nombre: 'Ruinas' },
  { id: 'battle-bg-2', nombre: 'Bosque' },
  { id: 'battle-bg-3', nombre: 'Desierto' },
  { id: 'battle-bg-4', nombre: 'Castillo' },
];
```

### Cambios en MenuScene.ts
```typescript
private fondoSeleccionado: number = 0;
private fondoPreview!: Phaser.GameObjects.Image;

private crearSelectorFondo(): void {
  // Panel con título "ARENA"
  // Preview del fondo seleccionado (80x60 px)
  // Botones < y > para navegar
  // Nombre del fondo actual
}

private cambiarFondo(direccion: number): void {
  this.fondoSeleccionado = (this.fondoSeleccionado + direccion + total) % total;
  this.fondoPreview.setTexture(nuevoFondo.id);
  this.fondoNombreText.setText(nuevoFondo.nombre);
}

private confirmarSeleccion(): void {
  this.scene.start('BattleScene', {
    jugador: kodamonSeleccionado,
    fondoId: FONDOS_DISPONIBLES[this.fondoSeleccionado].id,
  });
}
```

**Lógica**: El usuario navega entre fondos con botones < >. El preview muestra una miniatura del fondo. Al confirmar, se pasa el `fondoId` a BattleScene.

### Cambios en BattleScene.ts
```typescript
private fondoId: string = 'battle-bg-1';

init(data: { jugador: KodamonData; fondoId?: string }): void {
  this.fondoId = data.fondoId || 'battle-bg-1';
}

private dibujarFondo(): void {
  const bg = this.add.image(256, 192, this.fondoId);
  bg.setDisplaySize(512, 384);
}
```

---

## 3.3 Sistema de Efectos Visuales

### Archivo: src/systems/BattleEffects.ts

Sistema completo de efectos de partículas y animaciones para la batalla.

### Estructura de la Clase
```typescript
export class BattleEffects {
  private scene: Phaser.Scene;
  private particleTextures: Map<string, string> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.generarTexturasParticulas();
  }
}
```

### Generación de Texturas de Partículas
```typescript
private generarTexturasParticulas(): void {
  const tipoColores: Record<TipoElemental, number> = {
    fuego: 0xff6600,
    agua: 0x3399ff,
    planta: 0x33cc33,
    electrico: 0xffcc00,
    hielo: 0x99ccff,
    tierra: 0xcc9966,
    volador: 0xccccff,
    roca: 0x999966,
    fantasma: 0x9966cc,
    normal: 0xcccccc,
  };

  Object.entries(tipoColores).forEach(([tipo, color]) => {
    const key = `particle-${tipo}`;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Círculo con gradiente simulado
    graphics.fillStyle(color, 1);
    graphics.fillCircle(8, 8, 6);
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(6, 6, 2);

    graphics.generateTexture(key, 16, 16);
    graphics.destroy();
    this.particleTextures.set(tipo, key);
  });
}
```

**Lógica**: Se genera una textura de partícula de 16x16 píxeles para cada tipo elemental. Cada partícula tiene el color del tipo con un brillo blanco simulando 3D.

### Método: atacar()
```typescript
atacar(
  tipo: TipoElemental,
  origen: { x: number; y: number },
  destino: { x: number; y: number },
  onComplete?: () => void
): void {
  const textureKey = this.particleTextures.get(tipo) || 'particle-normal';

  // Crear proyectil con partículas
  const particles = this.scene.add.particles(origen.x, origen.y, textureKey, {
    speed: { min: 20, max: 50 },
    scale: { start: 0.8, end: 0 },
    lifespan: 300,
    frequency: 20,
    quantity: 2,
  });

  // Animar movimiento hacia el destino
  this.scene.tweens.add({
    targets: particles,
    x: destino.x,
    y: destino.y,
    duration: 400,
    ease: 'Quad.easeIn',
    onComplete: () => {
      particles.destroy();
      this.impacto(destino.x, destino.y, tipo);
      if (onComplete) onComplete();
    },
  });
}
```

**Lógica**: Crea un emisor de partículas en la posición del atacante y lo anima hacia el defensor. Al llegar, genera un efecto de impacto y ejecuta el callback.

### Método: impacto()
```typescript
impacto(x: number, y: number, tipo: TipoElemental): void {
  const textureKey = this.particleTextures.get(tipo) || 'particle-normal';

  const particles = this.scene.add.particles(x, y, textureKey, {
    speed: { min: 100, max: 200 },
    scale: { start: 1, end: 0 },
    lifespan: 400,
    angle: { min: 0, max: 360 },
    quantity: 15,
    emitting: false,
  });

  particles.explode();
  this.scene.time.delayedCall(500, () => particles.destroy());
}
```

**Lógica**: Explosión radial de 15 partículas que se expanden en todas direcciones (0-360°).

### Método: recibirDano()
```typescript
recibirDano(sprite: Phaser.GameObjects.Image): void {
  // Flash rojo
  sprite.setTint(0xff0000);
  this.scene.time.delayedCall(100, () => sprite.clearTint());

  // Shake horizontal
  const originalX = sprite.x;
  this.scene.tweens.add({
    targets: sprite,
    x: originalX + 10,
    duration: 50,
    yoyo: true,
    repeat: 3,
    ease: 'Sine.easeInOut',
    onComplete: () => { sprite.x = originalX; },
  });
}
```

**Lógica**: Combina un flash rojo (tint) de 100ms con un shake horizontal de 4 oscilaciones.

### Método: superEfectivo()
```typescript
superEfectivo(x: number, y: number): void {
  const text = this.scene.add.text(x, y - 30, '¡SUPER EFECTIVO!', {
    fontFamily: '"Press Start 2P"',
    fontSize: '10px',
    color: '#ffcc00',
    stroke: '#000000',
    strokeThickness: 3,
  }).setOrigin(0.5);

  this.scene.tweens.add({
    targets: text,
    y: y - 60,
    alpha: 0,
    scale: 1.5,
    duration: 1000,
    ease: 'Quad.easeOut',
    onComplete: () => text.destroy(),
  });
}
```

**Lógica**: Texto amarillo que sube y se desvanece con efecto de escalado.

### Método: victoriaKodamon()
```typescript
victoriaKodamon(sprite: Phaser.GameObjects.Image): void {
  // Salto de victoria
  this.scene.tweens.add({
    targets: sprite,
    y: sprite.y - 20,
    duration: 200,
    yoyo: true,
    repeat: 2,
    ease: 'Quad.easeOut',
  });

  // Confeti con partículas multicolor
  const colors = [0xff6600, 0x33cc33, 0x3399ff, 0xffcc00, 0xff66cc];
  colors.forEach((color, i) => {
    const key = `confetti-${i}`;
    // Generar textura de confeti
    // Emitir partículas que caen
  });
}
```

**Lógica**: El sprite ganador salta 3 veces mientras caen partículas de confeti multicolor desde arriba.

### Método: derrotaKodamon()
```typescript
derrotaKodamon(sprite: Phaser.GameObjects.Image, onComplete?: () => void): void {
  sprite.setTint(0x666666); // Escala de grises

  this.scene.tweens.add({
    targets: sprite,
    y: sprite.y + 100,
    alpha: 0,
    angle: -15,
    duration: 800,
    ease: 'Quad.easeIn',
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });
}
```

**Lógica**: El sprite derrotado se vuelve gris, cae hacia abajo con rotación y se desvanece.

---

## 3.4 Componentes UI

### Archivo: src/ui/HealthBar.ts

Panel de HP con diseño visual mejorado.

### Estructura
```typescript
export interface HealthBarConfig {
  x: number;
  y: number;
  width?: number;       // default: 210
  height?: number;      // default: 60
  nombre: string;
  tipo: TipoElemental;
  hpMax: number;
  hpActual: number;
  showHpText?: boolean; // default: true
  flipped?: boolean;    // Para posición invertida
}

export class HealthBar extends Phaser.GameObjects.Container {
  private background: Graphics;      // Panel de fondo
  private hpBarBg: Graphics;         // Fondo de la barra
  private hpBarFill: Graphics;       // Relleno de HP
  private nombreText: Text;          // Nombre del Kodamon
  private hpText: Text;              // "HP actual / HP max"
  private tipoIcon: Graphics;        // Icono del tipo
}
```

### Fondo del Panel
```typescript
private dibujarFondoPanel(width, height, accentColor): void {
  // Sombra offset (3,3)
  g.fillStyle(0x000000, 0.3);
  g.fillRoundedRect(3, 3, width, height, 8);

  // Fondo principal oscuro
  g.fillStyle(0x16213e, 0.95);
  g.fillRoundedRect(0, 0, width, height, 8);

  // Borde exterior
  g.lineStyle(2, 0x0f3460);
  g.strokeRoundedRect(0, 0, width, height, 8);

  // Línea de acento con color del tipo
  g.fillStyle(accentColor, 0.8);
  g.fillRoundedRect(4, 4, width - 8, 4, 2);

  // Brillo interior sutil
  g.fillStyle(0xffffff, 0.05);
  g.fillRoundedRect(4, 8, width - 8, 20, 4);
}
```

### Icono del Tipo
```typescript
private dibujarIconoTipo(tipo, x, y): void {
  // Fondo circular con color del tipo
  g.fillStyle(color, 1);
  g.fillCircle(x, y, 8);

  // Símbolo interno según tipo
  switch (tipo) {
    case 'fuego':   // Triángulo (llama)
    case 'agua':    // Círculo + triángulo (gota)
    case 'planta':  // Elipse (hoja)
    case 'electrico': // Dos triángulos (rayo)
    case 'hielo':   // Cruz (copo)
    case 'tierra':  // Triángulo (montaña)
    case 'volador': // Triángulo invertido (ala)
    case 'roca':    // Rectángulo
    case 'fantasma': // Círculo + rectángulo
    default:        // Círculo pequeño (normal)
  }
}
```

### Colores de la Barra de HP
```typescript
private actualizarBarraHP(): void {
  const porcentaje = this.hpActual / this.hpMax;

  let color, colorOscuro;
  if (porcentaje >= 0.5) {
    color = 0x00ff88;      // Verde
    colorOscuro = 0x00aa55;
  } else if (porcentaje >= 0.2) {
    color = 0xffcc00;      // Amarillo
    colorOscuro = 0xaa8800;
  } else {
    color = 0xff4444;      // Rojo
    colorOscuro = 0xaa2222;
  }

  // Dibujar barra con efecto 3D (sombra + brillo)
}
```

### Animación de HP
```typescript
setHP(nuevoHP: number, animado: boolean = true): void {
  if (animado && hpAnterior !== this.hpActual) {
    this.scene.tweens.addCounter({
      from: hpAnterior,
      to: this.hpActual,
      duration: 500,
      ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        const value = tween.getValue();
        if (value !== null) {
          this.hpActual = Math.round(value);
          this.actualizarBarraHP();
          this.actualizarTextoHP();
        }
      },
    });
  }
}
```

**Lógica**: Usa `tweens.addCounter()` para interpolar suavemente entre el HP anterior y el nuevo, actualizando la barra en cada frame.

---

### Archivo: src/ui/MoveButton.ts

Botón de movimiento con indicador de tipo y PP.

### Estructura
```typescript
export interface MoveButtonConfig {
  x: number;
  y: number;
  width?: number;    // default: 118
  height?: number;   // default: 50
  nombre: string;
  tipo: TipoElemental;
  ppActual: number;
  ppMax: number;
  disabled?: boolean;
  onClick?: () => void;
}
```

### Componentes Visuales
- **Barra lateral**: Indicador de color del tipo (6px de ancho)
- **Icono circular**: Color del tipo en esquina superior derecha
- **Nombre**: Texto del movimiento
- **PP**: "PP X/Y" con color según cantidad restante
- **Tipo abreviado**: "FUEG", "AGUA", etc.

### Estados del Botón
```typescript
// Estado deshabilitado (PP = 0)
if (this.isDisabled) {
  g.fillStyle(0x2a2a2a, 0.9);  // Gris oscuro
  g.lineStyle(1, 0x3a3a3a);
}

// Estado hover
if (hovered) {
  g.fillStyle(tipoColor, 0.3);  // Fondo con color del tipo
  g.lineStyle(2, tipoColor, 0.9); // Borde brillante
  this.setScale(1.02);  // Ligeramente más grande
}

// Estado normal
else {
  g.fillStyle(0x1a1a2e, 0.95);  // Fondo oscuro
  g.lineStyle(1, tipoColor, 0.5); // Borde sutil
}
```

### Colores de PP
```typescript
private getPPColor(ppActual, ppMax): string {
  const ratio = ppActual / ppMax;
  if (ratio > 0.5) return '#88ff88';  // Verde
  if (ratio > 0.25) return '#ffcc44'; // Amarillo
  return '#ff6666';                    // Rojo
}
```

---

### Archivo: src/ui/DialogBox.ts

Caja de diálogo con estilo retro y efecto typewriter.

### Estructura
```typescript
export interface DialogBoxConfig {
  x: number;
  y: number;
  width?: number;   // default: 492
  height?: number;  // default: 55
}
```

### Decoraciones del Fondo
```typescript
private dibujarFondo(width, height): void {
  // Sombra
  g.fillStyle(0x000000, 0.4);
  g.fillRoundedRect(3, 3, width, height, 8);

  // Fondo principal
  g.fillStyle(0x16213e, 0.98);
  g.fillRoundedRect(0, 0, width, height, 8);

  // Borde exterior
  g.lineStyle(2, 0x0f3460);
  g.strokeRoundedRect(0, 0, width, height, 8);

  // Borde interior brillante
  g.lineStyle(1, 0x4a6fa5, 0.3);
  g.strokeRoundedRect(4, 4, width - 8, height - 8, 6);

  // Decoración superior (línea)
  g.fillStyle(0x4a6fa5, 0.2);
  g.fillRoundedRect(8, 6, width - 16, 3, 1);

  // Esquinas decorativas (4 esquinas)
  this.dibujarEsquina(g, 6, 6);
  this.dibujarEsquina(g, width - 10, 6);
  this.dibujarEsquina(g, 6, height - 10);
  this.dibujarEsquina(g, width - 10, height - 10);
}
```

### Efecto Typewriter
```typescript
typeText(texto: string, velocidad: number = 30, onComplete?: () => void): void {
  let index = 0;
  this.dialogText.setText('');

  this.typewriterEvent = this.scene.time.addEvent({
    delay: velocidad,  // ms entre caracteres
    callback: () => {
      if (index < texto.length) {
        this.dialogText.setText(texto.substring(0, index + 1));
        index++;
      } else {
        this.stopTypewriter();
        this.indicator.setVisible(true);  // Mostrar ▼
        if (onComplete) onComplete();
      }
    },
    repeat: texto.length - 1,
  });
}
```

### Indicador Animado
```typescript
// Triángulo ▼ que rebota
this.scene.tweens.add({
  targets: this.indicator,
  y: this.indicator.y + 3,
  duration: 500,
  yoyo: true,
  repeat: -1,  // Infinito
  ease: 'Sine.easeInOut',
});
```

---

## Integración en BattleScene.ts

### Importaciones
```typescript
import { BattleEffects } from '@systems/index';
import { HealthBar, MoveButton, DialogBox } from '@ui/index';
```

### Propiedades
```typescript
private effects!: BattleEffects;
private jugadorHpBar!: HealthBar;
private enemigoHpBar!: HealthBar;
private dialogBox!: DialogBox;
private moveButtons: MoveButton[] = [];
```

### Creación de UI
```typescript
private crearUI(): void {
  // HP del enemigo (arriba izquierda)
  this.enemigoHpBar = new HealthBar(this, {
    x: 15, y: 15,
    nombre: this.enemigo.datos.nombre,
    tipo: this.enemigo.datos.tipo,
    hpMax: this.enemigo.datos.estadisticas.hp,
    hpActual: this.enemigo.hpActual,
  });

  // HP del jugador (abajo derecha)
  this.jugadorHpBar = new HealthBar(this, {
    x: 285, y: 145,
    nombre: this.jugador.datos.nombre,
    tipo: this.jugador.datos.tipo,
    hpMax: this.jugador.datos.estadisticas.hp,
    hpActual: this.jugador.hpActual,
  });

  // Caja de diálogo (parte inferior)
  this.dialogBox = new DialogBox(this, {
    x: 10, y: 252,
  });
}
```

### Uso de Efectos en Combate
```typescript
// En ejecutarMovimiento():
this.effects.atacar(
  movData.movimiento.tipo,
  { x: this.jugadorSprite.x, y: this.jugadorSprite.y },
  { x: this.enemigoSprite.x, y: this.enemigoSprite.y },
  () => {
    this.effects.recibirDano(this.enemigoSprite);
    this.enemigoHpBar.setHP(this.enemigo.hpActual);

    if (efectividad >= 2) {
      this.effects.superEfectivo(this.enemigoSprite.x, this.enemigoSprite.y);
    }
  }
);

// En verificarFinBatalla():
if (this.enemigo.hpActual <= 0) {
  this.effects.derrotaKodamon(this.enemigoSprite);
  this.effects.victoriaKodamon(this.jugadorSprite);
}
```

---

## Resumen de Archivos Modificados/Creados

### Nuevos Archivos
| Archivo | Descripción |
|---------|-------------|
| `src/assets/sprites/kodamons/*.png` | 10 sprites de Kodamon |
| `src/assets/sprites/backgrounds/*.png` | 4 fondos de batalla |
| `src/systems/BattleEffects.ts` | Sistema de efectos visuales |
| `src/systems/index.ts` | Exports del módulo systems |
| `src/ui/HealthBar.ts` | Componente de barra de HP |
| `src/ui/MoveButton.ts` | Componente de botón de movimiento |
| `src/ui/DialogBox.ts` | Componente de caja de diálogo |
| `src/ui/index.ts` | Exports del módulo UI |

### Archivos Modificados
| Archivo | Cambios |
|---------|---------|
| `src/scenes/BootScene.ts` | Carga de assets externos, export de FONDOS_DISPONIBLES |
| `src/scenes/MenuScene.ts` | Selector de arena con preview |
| `src/scenes/BattleScene.ts` | Uso de nuevos componentes UI y efectos |

---

## Patrones de Diseño Utilizados

1. **Component Pattern**: Todos los elementos UI extienden `Phaser.GameObjects.Container`
2. **Factory Pattern**: `generarTexturasParticulas()` crea texturas dinámicamente
3. **Callback Pattern**: Efectos y animaciones reciben callbacks de finalización
4. **Configuration Object Pattern**: Todos los componentes reciben objetos de configuración con valores por defecto
