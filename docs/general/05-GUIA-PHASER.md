# Guía de Phaser 3 para Principiantes

Esta guía te enseñará los conceptos fundamentales de Phaser 3 que necesitas para desarrollar el juego de batallas.

---

## ¿Qué es Phaser?

Phaser es un framework de JavaScript para crear juegos 2D en el navegador. Utiliza WebGL o Canvas para renderizar y proporciona:

- Sistema de escenas (pantallas del juego)
- Carga y gestión de assets
- Sistema de sprites y animaciones
- Físicas (opcional)
- Sistema de input (teclado, ratón, touch)
- Audio
- Tweens (animaciones programáticas)
- Partículas
- Y mucho más...

---

## Conceptos Fundamentales

### 1. El Game Object

Todo en Phaser empieza con el objeto `Game`:

```typescript
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,        // WebGL si está disponible, sino Canvas
  width: 512,               // Ancho del canvas
  height: 384,              // Alto del canvas
  parent: 'game-container', // ID del div contenedor
  backgroundColor: '#202040',
  pixelArt: true,           // Renderizado nítido para pixel art
  zoom: 2,                  // Escala del canvas (2x = 1024x768 visual)
  scene: [BootScene, MenuScene, BattleScene], // Escenas del juego
};

const game = new Phaser.Game(config);
```

### 2. Escenas (Scenes)

Las escenas son las "pantallas" de tu juego. Cada escena tiene un ciclo de vida:

```typescript
class MiEscena extends Phaser.Scene {
  constructor() {
    super({ key: 'MiEscena' }); // Identificador único
  }

  // Se ejecuta al iniciar la escena (recibe datos de otras escenas)
  init(data: any): void {
    console.log('Datos recibidos:', data);
  }

  // Carga de assets (imágenes, audio, etc.)
  preload(): void {
    this.load.image('logo', 'assets/logo.png');
  }

  // Inicialización de objetos (se ejecuta después de preload)
  create(): void {
    this.add.image(256, 192, 'logo');
  }

  // Loop del juego (60 veces por segundo)
  update(time: number, delta: number): void {
    // Lógica que se ejecuta cada frame
  }
}
```

#### Navegar entre Escenas

```typescript
// Ir a otra escena
this.scene.start('OtraEscena');

// Ir a otra escena pasando datos
this.scene.start('BattleScene', { jugador: 'flamita', enemigo: 'aquarex' });

// Reiniciar la escena actual
this.scene.restart();

// Pausar/reanudar escena
this.scene.pause();
this.scene.resume();

// Ejecutar escenas en paralelo
this.scene.launch('UIScene'); // Lanza sin detener la actual
this.scene.stop('UIScene');   // Detiene la escena
```

### 3. Game Objects (Objetos del Juego)

Los Game Objects son los elementos visuales: sprites, textos, gráficos, etc.

#### Imágenes y Sprites

```typescript
// Imagen estática
const logo = this.add.image(100, 200, 'logo');

// Sprite (puede tener animaciones)
const bicho = this.add.sprite(100, 200, 'flamita');

// Propiedades comunes
bicho.x = 150;           // Posición X
bicho.y = 250;           // Posición Y
bicho.setScale(2);       // Escala (2x)
bicho.setAlpha(0.5);     // Transparencia (0-1)
bicho.setOrigin(0.5, 1); // Punto de origen (0.5, 1 = centro-abajo)
bicho.setFlipX(true);    // Voltear horizontalmente
bicho.setVisible(false); // Ocultar
bicho.setDepth(10);      // Orden de renderizado (mayor = encima)
bicho.setTint(0xff0000); // Teñir de color
```

#### Texto

```typescript
const texto = this.add.text(100, 50, '¡Hola Mundo!', {
  fontFamily: '"Press Start 2P"',
  fontSize: '16px',
  color: '#ffffff',
  stroke: '#000000',       // Borde
  strokeThickness: 2,
  wordWrap: { width: 200 }, // Ajuste de línea
  lineSpacing: 8,
});

texto.setOrigin(0.5);      // Centrar
texto.setText('Nuevo texto'); // Cambiar texto
```

#### Graphics (Dibujo Programático)

```typescript
const g = this.add.graphics();

// Rellenar formas
g.fillStyle(0xff0000, 1);  // Color, alpha
g.fillRect(10, 10, 100, 50); // x, y, ancho, alto
g.fillCircle(200, 100, 30);  // x, y, radio
g.fillRoundedRect(10, 100, 100, 50, 8); // Con bordes redondeados

// Líneas y bordes
g.lineStyle(2, 0x00ff00, 1); // grosor, color, alpha
g.strokeRect(10, 10, 100, 50);
g.strokeCircle(200, 100, 30);

// Dibujo libre
g.beginPath();
g.moveTo(0, 0);
g.lineTo(100, 50);
g.lineTo(50, 100);
g.closePath();
g.fill();

// Limpiar
g.clear();
```

#### Containers (Contenedores)

Agrupa objetos para moverlos/escalarlos juntos:

```typescript
const container = this.add.container(100, 100);

const bg = this.add.graphics();
bg.fillStyle(0x333333);
bg.fillRect(-50, -50, 100, 100);

const texto = this.add.text(0, 0, 'Hola').setOrigin(0.5);

container.add([bg, texto]);

// Mover el container mueve todo su contenido
container.x = 200;
container.setScale(1.5);
```

### 4. Input (Interactividad)

#### Hacer un objeto interactivo

```typescript
const boton = this.add.image(100, 100, 'boton');
boton.setInteractive({ useHandCursor: true }); // Cursor de mano

// Eventos de ratón
boton.on('pointerover', () => {
  boton.setTint(0xaaaaaa); // Mouse encima
});

boton.on('pointerout', () => {
  boton.clearTint(); // Mouse sale
});

boton.on('pointerdown', () => {
  console.log('Click!'); // Click
});

boton.on('pointerup', () => {
  console.log('Soltado');
});
```

#### Zona de hit personalizada

```typescript
// Área rectangular invisible
const hitArea = this.add.rectangle(100, 100, 80, 40)
  .setInteractive({ useHandCursor: true });

hitArea.on('pointerdown', () => {
  console.log('Zona clickeada');
});
```

#### Teclado

```typescript
// Tecla específica
const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

// En update()
if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
  console.log('Espacio presionado (una vez)');
}

if (spaceKey.isDown) {
  console.log('Espacio mantenido');
}

// Cursores
const cursors = this.input.keyboard.createCursorKeys();
if (cursors.left.isDown) {
  // Mover izquierda
}
```

### 5. Tweens (Animaciones Programáticas)

Los tweens animan propiedades de objetos suavemente:

```typescript
// Tween básico
this.tweens.add({
  targets: sprite,           // Objeto(s) a animar
  x: 400,                    // Propiedad final
  duration: 1000,            // Duración en ms
  ease: 'Power2',            // Curva de aceleración
});

// Tween completo
this.tweens.add({
  targets: sprite,
  x: 400,
  y: 300,
  alpha: 0.5,
  scale: 2,
  rotation: Math.PI,
  duration: 1000,
  delay: 500,                // Esperar antes de empezar
  yoyo: true,                // Ir y volver
  repeat: 3,                 // Repetir 3 veces (-1 = infinito)
  ease: 'Bounce.easeOut',
  onStart: () => console.log('Empezó'),
  onComplete: () => console.log('Terminó'),
  onUpdate: (tween) => console.log(tween.progress),
});

// Encadenar tweens
this.tweens.chain({
  targets: sprite,
  tweens: [
    { x: 400, duration: 500 },
    { y: 300, duration: 500 },
    { alpha: 0, duration: 300 },
  ],
});
```

#### Curvas de Ease comunes

- `'Linear'` - Velocidad constante
- `'Power2'`, `'Power3'`, `'Power4'` - Aceleración
- `'Sine.easeInOut'` - Suave
- `'Bounce.easeOut'` - Rebote
- `'Back.easeOut'` - Sobrepasa y vuelve
- `'Elastic.easeOut'` - Elástico

### 6. Tiempo y Delays

```typescript
// Ejecutar después de X milisegundos
this.time.delayedCall(2000, () => {
  console.log('2 segundos después');
});

// Timer repetitivo
const timer = this.time.addEvent({
  delay: 1000,
  callback: () => console.log('Cada segundo'),
  loop: true,
});

// Detener timer
timer.remove();

// Timer con repeticiones limitadas
this.time.addEvent({
  delay: 500,
  callback: () => console.log('Tick'),
  repeat: 5, // Se ejecuta 6 veces (1 inicial + 5 repeticiones)
});
```

### 7. Animaciones de Sprites

Primero carga un spritesheet:

```typescript
// En preload()
this.load.spritesheet('flamita', 'assets/flamita-sheet.png', {
  frameWidth: 64,
  frameHeight: 64,
});
```

Luego define las animaciones:

```typescript
// En create()
this.anims.create({
  key: 'flamita-idle',
  frames: this.anims.generateFrameNumbers('flamita', {
    start: 0,
    end: 3,
  }),
  frameRate: 8,
  repeat: -1, // -1 = loop infinito
});

this.anims.create({
  key: 'flamita-attack',
  frames: this.anims.generateFrameNumbers('flamita', {
    frames: [4, 5, 6, 7], // Frames específicos
  }),
  frameRate: 12,
  repeat: 0, // Solo una vez
});
```

Reproducir animaciones:

```typescript
const bicho = this.add.sprite(100, 200, 'flamita');

// Reproducir
bicho.play('flamita-idle');

// Cambiar animación
bicho.play('flamita-attack');

// Evento cuando termina
bicho.on('animationcomplete', (anim) => {
  if (anim.key === 'flamita-attack') {
    bicho.play('flamita-idle');
  }
});

// Pausar/reanudar
bicho.anims.pause();
bicho.anims.resume();
```

### 8. Audio

```typescript
// En preload()
this.load.audio('musica', 'assets/music.mp3');
this.load.audio('golpe', 'assets/hit.wav');

// En create()
// Música de fondo
const musica = this.sound.add('musica', {
  loop: true,
  volume: 0.5,
});
musica.play();

// Efecto de sonido
this.sound.play('golpe', { volume: 0.8 });

// Controles
musica.pause();
musica.resume();
musica.stop();

// Fade out
this.tweens.add({
  targets: musica,
  volume: 0,
  duration: 1000,
  onComplete: () => musica.stop(),
});
```

### 9. Cámara

```typescript
// Acceder a la cámara principal
const camera = this.cameras.main;

// Fade in/out
camera.fadeIn(1000);  // Aparecer
camera.fadeOut(1000); // Desaparecer
camera.fade(1000, 255, 0, 0); // Fade a rojo

// Shake (temblor)
camera.shake(300, 0.01); // duración, intensidad

// Flash
camera.flash(200, 255, 255, 255); // duración, R, G, B

// Zoom
camera.setZoom(2);

// Seguir un objeto
camera.startFollow(sprite, true, 0.1, 0.1);

// Límites
camera.setBounds(0, 0, 1000, 1000);
```

### 10. Generación de Texturas

Crear texturas con código:

```typescript
// En preload() o create()
const graphics = this.make.graphics({ add: false });

// Dibujar
graphics.fillStyle(0xff0000);
graphics.fillCircle(16, 16, 16);

// Generar textura
graphics.generateTexture('circulo-rojo', 32, 32);

// Limpiar el graphics temporal
graphics.destroy();

// Usar la textura
this.add.image(100, 100, 'circulo-rojo');
```

---

## Patrones Comunes en el Proyecto

### Efecto de Escritura de Texto (Typewriter)

```typescript
escribirTexto(mensaje: string, callback?: () => void): void {
  this.textoUI.setText('');
  let index = 0;

  this.time.addEvent({
    delay: 30, // Velocidad de escritura
    repeat: mensaje.length - 1,
    callback: () => {
      index++;
      this.textoUI.setText(mensaje.substring(0, index));

      if (index >= mensaje.length && callback) {
        this.time.delayedCall(300, callback);
      }
    },
  });
}
```

### Botón Reutilizable

```typescript
crearBoton(
  x: number,
  y: number,
  texto: string,
  onClick: () => void
): Phaser.GameObjects.Container {
  const container = this.add.container(x, y);

  const bg = this.add.graphics();
  bg.fillStyle(0x4060a0);
  bg.fillRoundedRect(-60, -15, 120, 30, 6);

  const label = this.add.text(0, 0, texto, {
    fontFamily: '"Press Start 2P"',
    fontSize: '8px',
    color: '#ffffff',
  }).setOrigin(0.5);

  container.add([bg, label]);

  const hitArea = this.add.rectangle(x, y, 120, 30)
    .setInteractive({ useHandCursor: true });

  hitArea.on('pointerover', () => {
    bg.clear();
    bg.fillStyle(0x5080c0);
    bg.fillRoundedRect(-60, -15, 120, 30, 6);
  });

  hitArea.on('pointerout', () => {
    bg.clear();
    bg.fillStyle(0x4060a0);
    bg.fillRoundedRect(-60, -15, 120, 30, 6);
  });

  hitArea.on('pointerdown', onClick);

  return container;
}
```

### Barra de Vida Animada

```typescript
class HealthBar {
  private scene: Phaser.Scene;
  private bar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private value: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 100, height = 10) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.bar = scene.add.graphics();
    this.draw();
  }

  setPercent(percent: number, animate = true): void {
    if (animate) {
      this.scene.tweens.add({
        targets: this,
        value: percent,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => this.draw(),
      });
    } else {
      this.value = percent;
      this.draw();
    }
  }

  private draw(): void {
    this.bar.clear();

    // Fondo
    this.bar.fillStyle(0x333333);
    this.bar.fillRect(this.x, this.y, this.width, this.height);

    // Barra de vida
    const fillWidth = (this.width - 4) * (this.value / 100);
    const color = this.value > 50 ? 0x00ff00 : this.value > 20 ? 0xffff00 : 0xff0000;

    this.bar.fillStyle(color);
    this.bar.fillRect(this.x + 2, this.y + 2, fillWidth, this.height - 4);
  }
}
```

---

## Depuración

### Mostrar FPS

```typescript
const config: Phaser.Types.Core.GameConfig = {
  // ...
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  callbacks: {
    postBoot: (game) => {
      game.domContainer?.classList.add('loaded');
    },
  },
};

// En create de cualquier escena
this.add.text(10, 10, '', { fontSize: '12px', color: '#00ff00' })
  .setScrollFactor(0) // No se mueve con la cámara
  .setDepth(1000);

// En update
this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
```

### Console.log de objetos Phaser

```typescript
console.log(sprite.x, sprite.y);
console.log(this.children.list); // Todos los hijos de la escena
console.log(this.textures.list); // Todas las texturas cargadas
```

---

## Errores Comunes y Soluciones

### "Cannot read property 'x' of undefined"

**Causa:** Intentas acceder a un objeto antes de que se cree.

**Solución:** Asegúrate de crear objetos en `create()`, no antes.

### La imagen no aparece

**Posibles causas:**
1. La ruta del asset es incorrecta
2. No cargaste el asset en `preload()`
3. La posición está fuera de la pantalla
4. El objeto está detrás de otro (usa `setDepth()`)

### El audio no suena

**Posibles causas:**
1. El navegador bloquea audio sin interacción del usuario
2. Solución: Inicia audio después de un click

```typescript
this.input.once('pointerdown', () => {
  this.sound.play('musica');
});
```

### Los tweens no funcionan en objetos destruidos

```typescript
// Mal
this.tweens.add({
  targets: sprite,
  x: 400,
  duration: 1000,
  onComplete: () => sprite.destroy(), // Puede causar errores
});

// Bien
this.tweens.add({
  targets: sprite,
  x: 400,
  duration: 1000,
  onComplete: () => {
    if (sprite.active) sprite.destroy();
  },
});
```

---

## Recursos Adicionales

- **Documentación oficial:** [phaser.io/docs](https://phaser.io/docs)
- **Ejemplos oficiales:** [phaser.io/examples](https://phaser.io/examples)
- **API Reference:** [newdocs.phaser.io](https://newdocs.phaser.io/)
- **Phaser Discord:** [discord.gg/phaser](https://discord.gg/phaser)
- **Tutoriales de GameDev Academy:** [gamedevacademy.org](https://gamedevacademy.org/phaser-tutorial/)
