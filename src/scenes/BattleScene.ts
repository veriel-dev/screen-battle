import Phaser from 'phaser';
import type { KodamonData, KodamonBatalla, Movimiento } from '@game-types/index';
import {
  getRandomKodamon,
  getTipoConfig,
  getMovimiento,
  getEfectividad,
  getTextoEfectividad,
} from '@data/index';

type EstadoBatalla =
  | 'INTRO'
  | 'JUGADOR_TURNO'
  | 'ENEMIGO_TURNO'
  | 'ANIMACION'
  | 'VICTORIA'
  | 'DERROTA';

export class BattleScene extends Phaser.Scene {
  // Datos de batalla
  private jugador!: KodamonBatalla;
  private enemigo!: KodamonBatalla;
  private estado: EstadoBatalla = 'INTRO';

  // Elementos visuales
  private jugadorSprite!: Phaser.GameObjects.Image;
  private enemigoSprite!: Phaser.GameObjects.Image;
  private jugadorHpBar!: Phaser.GameObjects.Graphics;
  private enemigoHpBar!: Phaser.GameObjects.Graphics;
  private dialogoBox!: Phaser.GameObjects.Graphics;
  private dialogoText!: Phaser.GameObjects.Text;
  private botonesMovimientos: Phaser.GameObjects.Container[] = [];

  // UI elementos
  private jugadorNombreText!: Phaser.GameObjects.Text;
  private jugadorHpText!: Phaser.GameObjects.Text;
  private enemigoNombreText!: Phaser.GameObjects.Text;
  private enemigoHpText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { jugador: KodamonData }): void {
    // Crear estado de batalla para el jugador
    this.jugador = this.crearKodamonBatalla(data.jugador);

    // Seleccionar enemigo aleatorio (diferente al jugador)
    let enemigoData: KodamonData;
    do {
      enemigoData = getRandomKodamon();
    } while (enemigoData.id === data.jugador.id);

    this.enemigo = this.crearKodamonBatalla(enemigoData);
    this.estado = 'INTRO';
  }

  create(): void {
    this.cameras.main.fadeIn(400);
    this.dibujarFondo();
    this.crearSprites();
    this.crearBarrasHP();
    this.crearDialogo();
    this.iniciarIntro();
  }

  private crearKodamonBatalla(data: KodamonData): KodamonBatalla {
    return {
      datos: data,
      hpActual: data.estadisticas.hp,
      movimientosActuales: data.movimientos.map((movId) => {
        const mov = getMovimiento(movId);
        return {
          movimiento: mov!,
          ppActual: mov!.ppMax,
        };
      }),
    };
  }

  private dibujarFondo(): void {
    const g = this.add.graphics();

    // Cielo degradado
    for (let i = 0; i < 160; i++) {
      const t = i / 160;
      g.fillStyle(
        Phaser.Display.Color.GetColor(
          Math.floor(100 + t * 80),
          Math.floor(160 + t * 60),
          Math.floor(220 + t * 30)
        )
      );
      g.fillRect(0, i, 512, 1);
    }

    // Plataforma enemigo (arriba derecha)
    g.fillStyle(0x78b048);
    g.fillEllipse(400, 145, 85, 20);

    // Plataforma jugador (abajo izquierda)
    g.fillStyle(0x78b048);
    g.fillEllipse(110, 210, 100, 24);

    // Suelo
    g.fillStyle(0x906840);
    g.fillRect(0, 225, 512, 160);
  }

  private crearSprites(): void {
    // Sprite del enemigo (arriba derecha)
    this.enemigoSprite = this.add.image(400, 110, `kodamon-${this.enemigo.datos.id}`);
    this.enemigoSprite.setScale(1.2);

    // Sprite del jugador (abajo izquierda)
    this.jugadorSprite = this.add.image(110, 175, `kodamon-${this.jugador.datos.id}`);
    this.jugadorSprite.setScale(1.5);
    this.jugadorSprite.setFlipX(true); // Mira hacia el enemigo
  }

  private crearBarrasHP(): void {
    // Panel HP enemigo (arriba izquierda)
    this.crearPanelHP(20, 20, this.enemigo, false);

    // Panel HP jugador (abajo derecha)
    this.crearPanelHP(280, 150, this.jugador, true);
  }

  private crearPanelHP(x: number, y: number, kodamon: KodamonBatalla, esJugador: boolean): void {
    const g = this.add.graphics();
    const tipoConfig = getTipoConfig(kodamon.datos.tipo);

    // Fondo del panel
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(x, y, 200, 55, 6);

    // Borde con color del tipo
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(tipoConfig.color).color);
    g.strokeRoundedRect(x, y, 200, 55, 6);

    // Nombre y nivel
    const nombreText = this.add.text(x + 10, y + 8, `${tipoConfig.icono} ${kodamon.datos.nombre}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#ffffff',
    });

    // Texto HP
    const hpText = this.add.text(x + 10, y + 25, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#88ff88',
    });

    // Barra HP fondo
    g.fillStyle(0x333333);
    g.fillRect(x + 10, y + 40, 180, 8);

    // Barra HP
    const hpBar = this.add.graphics();

    if (esJugador) {
      this.jugadorNombreText = nombreText;
      this.jugadorHpText = hpText;
      this.jugadorHpBar = hpBar;
    } else {
      this.enemigoNombreText = nombreText;
      this.enemigoHpText = hpText;
      this.enemigoHpBar = hpBar;
    }

    this.actualizarBarraHP(kodamon, hpBar, hpText, x + 10, y + 40);
  }

  private actualizarBarraHP(
    kodamon: KodamonBatalla,
    hpBar: Phaser.GameObjects.Graphics,
    hpText: Phaser.GameObjects.Text,
    x: number,
    y: number
  ): void {
    const porcentaje = kodamon.hpActual / kodamon.datos.estadisticas.hp;
    const anchoActual = 180 * porcentaje;

    // Color según HP restante
    let color = 0x00ff00; // Verde
    if (porcentaje < 0.5) color = 0xffff00; // Amarillo
    if (porcentaje < 0.2) color = 0xff0000; // Rojo

    hpBar.clear();
    hpBar.fillStyle(color);
    hpBar.fillRect(x, y, anchoActual, 8);

    hpText.setText(`HP: ${kodamon.hpActual} / ${kodamon.datos.estadisticas.hp}`);
  }

  private crearDialogo(): void {
    this.dialogoBox = this.add.graphics();
    this.dialogoBox.fillStyle(0xf8f8f8);
    this.dialogoBox.fillRoundedRect(10, 255, 492, 50, 6);
    this.dialogoBox.lineStyle(3, 0x484848);
    this.dialogoBox.strokeRoundedRect(10, 255, 492, 50, 6);

    this.dialogoText = this.add.text(25, 270, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#303030',
      wordWrap: { width: 470 },
    });
  }

  private mostrarDialogo(texto: string, callback?: () => void): void {
    this.dialogoText.setText(texto);
    this.ocultarBotonesMovimientos();

    if (callback) {
      this.time.delayedCall(1500, callback);
    }
  }

  private iniciarIntro(): void {
    this.mostrarDialogo(`¡Un ${this.enemigo.datos.nombre} salvaje apareció!`, () => {
      this.mostrarDialogo(`¡Adelante, ${this.jugador.datos.nombre}!`, () => {
        this.iniciarTurnoJugador();
      });
    });
  }

  private iniciarTurnoJugador(): void {
    this.estado = 'JUGADOR_TURNO';
    this.mostrarDialogo(`¿Qué debería hacer ${this.jugador.datos.nombre}?`);
    this.mostrarBotonesMovimientos();
  }

  private mostrarBotonesMovimientos(): void {
    // Limpiar botones anteriores
    this.ocultarBotonesMovimientos();

    const startX = 20;
    const startY = 310;
    const buttonWidth = 115;
    const buttonHeight = 30;
    const spacing = 5;

    this.jugador.movimientosActuales.forEach((movData, index) => {
      const col = index % 4;
      const x = startX + col * (buttonWidth + spacing);
      const y = startY;

      const container = this.add.container(x, y);
      const tipoConfig = getTipoConfig(movData.movimiento.tipo);

      // Fondo del botón
      const bg = this.add.graphics();
      bg.fillStyle(Phaser.Display.Color.HexStringToColor(tipoConfig.color).color, 0.9);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
      bg.lineStyle(2, 0x000000, 0.3);
      bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 4);

      // Nombre del movimiento
      const texto = this.add
        .text(buttonWidth / 2, buttonHeight / 2 - 4, movData.movimiento.nombre, {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      // PP restantes
      const ppTexto = this.add
        .text(
          buttonWidth / 2,
          buttonHeight / 2 + 8,
          `PP: ${movData.ppActual}/${movData.movimiento.ppMax}`,
          {
            fontFamily: '"Press Start 2P"',
            fontSize: '5px',
            color: '#dddddd',
          }
        )
        .setOrigin(0.5);

      container.add([bg, texto, ppTexto]);

      // Interactividad
      container.setSize(buttonWidth, buttonHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(tipoConfig.colorClaro).color, 1);
        bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
        bg.lineStyle(2, 0xffffff, 0.5);
        bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
      });

      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(tipoConfig.color).color, 0.9);
        bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
        bg.lineStyle(2, 0x000000, 0.3);
        bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
      });

      container.on('pointerdown', () => {
        if (movData.ppActual > 0) {
          this.ejecutarMovimiento(index);
        }
      });

      this.botonesMovimientos.push(container);
    });
  }

  private ocultarBotonesMovimientos(): void {
    this.botonesMovimientos.forEach((btn) => btn.destroy());
    this.botonesMovimientos = [];
  }

  private ejecutarMovimiento(index: number): void {
    this.estado = 'ANIMACION';
    const movData = this.jugador.movimientosActuales[index];
    movData.ppActual--;

    const daño = this.calcularDaño(this.jugador, this.enemigo, movData.movimiento);
    const efectividad = getEfectividad(movData.movimiento.tipo, this.enemigo.datos.tipo);
    const textoEfectividad = getTextoEfectividad(efectividad);

    this.mostrarDialogo(`¡${this.jugador.datos.nombre} usó ${movData.movimiento.nombre}!`, () => {
      // Animación de ataque
      this.animarAtaque(this.jugadorSprite, this.enemigoSprite, () => {
        this.enemigo.hpActual = Math.max(0, this.enemigo.hpActual - daño);
        this.actualizarBarraHP(this.enemigo, this.enemigoHpBar, this.enemigoHpText, 30, 60);

        if (textoEfectividad) {
          this.mostrarDialogo(textoEfectividad, () => this.verificarFinBatalla());
        } else {
          this.verificarFinBatalla();
        }
      });
    });
  }

  private calcularDaño(
    atacante: KodamonBatalla,
    defensor: KodamonBatalla,
    movimiento: Movimiento
  ): number {
    const statsAtacante = atacante.datos.estadisticas;
    const statsDefensor = defensor.datos.estadisticas;

    // Usar ataque/defensa física o especial según categoría
    const ataque =
      movimiento.categoria === 'fisico' ? statsAtacante.ataque : statsAtacante.ataqueEspecial;
    const defensa =
      movimiento.categoria === 'fisico' ? statsDefensor.defensa : statsDefensor.defensaEspecial;

    // Fórmula simplificada de daño
    const nivel = 50; // Nivel fijo por ahora
    const base = (((2 * nivel) / 5 + 2) * movimiento.poder * (ataque / defensa)) / 50 + 2;

    // Efectividad de tipo
    const efectividad = getEfectividad(movimiento.tipo, defensor.datos.tipo);

    // STAB (Same Type Attack Bonus)
    const stab = movimiento.tipo === atacante.datos.tipo ? 1.5 : 1;

    // Variación aleatoria (85-100%)
    const random = 0.85 + Math.random() * 0.15;

    return Math.floor(base * efectividad * stab * random);
  }

  private animarAtaque(
    atacante: Phaser.GameObjects.Image,
    objetivo: Phaser.GameObjects.Image,
    callback: () => void
  ): void {
    const originalX = atacante.x;

    // Movimiento hacia el objetivo
    this.tweens.add({
      targets: atacante,
      x: atacante.x + (objetivo.x > atacante.x ? 30 : -30),
      duration: 100,
      yoyo: true,
      onComplete: () => {
        // Flash en el objetivo
        this.tweens.add({
          targets: objetivo,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 2,
          onComplete: callback,
        });
      },
    });
  }

  private verificarFinBatalla(): void {
    if (this.enemigo.hpActual <= 0) {
      this.estado = 'VICTORIA';
      this.mostrarDialogo(`¡${this.enemigo.datos.nombre} se debilitó!`, () => {
        this.mostrarDialogo(`¡${this.jugador.datos.nombre} ganó la batalla!`, () => {
          this.volverAlMenu();
        });
      });
    } else {
      this.turnoEnemigo();
    }
  }

  private turnoEnemigo(): void {
    this.estado = 'ENEMIGO_TURNO';

    // El enemigo elige un movimiento aleatorio con PP
    const movimientosDisponibles = this.enemigo.movimientosActuales.filter((m) => m.ppActual > 0);
    if (movimientosDisponibles.length === 0) {
      // Sin PP, usa forcejeo (daño fijo)
      this.mostrarDialogo(`¡${this.enemigo.datos.nombre} no puede atacar!`, () => {
        this.iniciarTurnoJugador();
      });
      return;
    }

    const movData =
      movimientosDisponibles[Math.floor(Math.random() * movimientosDisponibles.length)];
    movData.ppActual--;

    const daño = this.calcularDaño(this.enemigo, this.jugador, movData.movimiento);
    const efectividad = getEfectividad(movData.movimiento.tipo, this.jugador.datos.tipo);
    const textoEfectividad = getTextoEfectividad(efectividad);

    this.mostrarDialogo(`¡${this.enemigo.datos.nombre} usó ${movData.movimiento.nombre}!`, () => {
      this.animarAtaque(this.enemigoSprite, this.jugadorSprite, () => {
        this.jugador.hpActual = Math.max(0, this.jugador.hpActual - daño);
        this.actualizarBarraHP(this.jugador, this.jugadorHpBar, this.jugadorHpText, 290, 190);

        if (textoEfectividad) {
          this.mostrarDialogo(textoEfectividad, () => this.verificarDerrotaJugador());
        } else {
          this.verificarDerrotaJugador();
        }
      });
    });
  }

  private verificarDerrotaJugador(): void {
    if (this.jugador.hpActual <= 0) {
      this.estado = 'DERROTA';
      this.mostrarDialogo(`¡${this.jugador.datos.nombre} se debilitó!`, () => {
        this.mostrarDialogo('Has perdido la batalla...', () => {
          this.volverAlMenu();
        });
      });
    } else {
      this.iniciarTurnoJugador();
    }
  }

  private volverAlMenu(): void {
    this.time.delayedCall(1000, () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
