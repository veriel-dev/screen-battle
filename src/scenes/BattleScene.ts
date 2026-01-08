import Phaser from 'phaser';
import type { KodamonData, KodamonBatalla, Movimiento } from '@game-types/index';
import { getRandomKodamon, getMovimiento, getEfectividad, getTextoEfectividad } from '@data/index';
import { BattleEffects } from '@systems/index';
import { HealthBar, MoveButton, DialogBox } from '@ui/index';

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
  private _estado: EstadoBatalla = 'INTRO';
  private fondoId: string = 'battle-bg-1';

  /** Estado actual de la batalla */
  get estado(): EstadoBatalla {
    return this._estado;
  }

  // Sistema de efectos
  private effects!: BattleEffects;

  // Elementos visuales
  private jugadorSprite!: Phaser.GameObjects.Image;
  private enemigoSprite!: Phaser.GameObjects.Image;

  // UI Components
  private jugadorHpBar!: HealthBar;
  private enemigoHpBar!: HealthBar;
  private dialogBox!: DialogBox;
  private moveButtons: MoveButton[] = [];
  private turnIndicator!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { jugador: KodamonData; fondoId?: string }): void {
    // Crear estado de batalla para el jugador
    this.jugador = this.crearKodamonBatalla(data.jugador);

    // Guardar el fondo seleccionado
    this.fondoId = data.fondoId || 'battle-bg-1';

    // Seleccionar enemigo aleatorio (diferente al jugador)
    let enemigoData: KodamonData;
    do {
      enemigoData = getRandomKodamon();
    } while (enemigoData.id === data.jugador.id);

    this.enemigo = this.crearKodamonBatalla(enemigoData);
    this._estado = 'INTRO';
  }

  create(): void {
    this.cameras.main.fadeIn(400);

    // Inicializar sistema de efectos
    this.effects = new BattleEffects(this);

    this.dibujarFondo();
    this.crearSprites();
    this.crearUI();
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
    // Usar el fondo de batalla seleccionado
    const bg = this.add.image(256, 192, this.fondoId);
    bg.setDisplaySize(512, 384);
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

  private crearUI(): void {
    // Barra HP del enemigo (arriba izquierda)
    this.enemigoHpBar = new HealthBar(this, {
      x: 15,
      y: 15,
      nombre: this.enemigo.datos.nombre,
      tipo: this.enemigo.datos.tipo,
      hpMax: this.enemigo.datos.estadisticas.hp,
      hpActual: this.enemigo.hpActual,
    });

    // Barra HP del jugador (abajo derecha)
    this.jugadorHpBar = new HealthBar(this, {
      x: 285,
      y: 145,
      nombre: this.jugador.datos.nombre,
      tipo: this.jugador.datos.tipo,
      hpMax: this.jugador.datos.estadisticas.hp,
      hpActual: this.jugador.hpActual,
    });

    // Caja de diálogo
    this.dialogBox = new DialogBox(this, {
      x: 10,
      y: 252,
    });

    // Indicador de turno
    this.crearIndicadorTurno();
  }

  private crearIndicadorTurno(): void {
    this.turnIndicator = this.add.container(256, -30);

    // Fondo del banner
    const bg = this.add.graphics();
    bg.fillStyle(0x16213e, 0.95);
    bg.fillRoundedRect(-100, -12, 200, 24, 12);
    bg.lineStyle(2, 0x4a6fa5);
    bg.strokeRoundedRect(-100, -12, 200, 24, 12);

    // Texto del turno
    const texto = this.add
      .text(0, 0, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Indicadores laterales (estrellas)
    const starLeft = this.add
      .text(-90, 0, '★', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffdd44',
      })
      .setOrigin(0.5);

    const starRight = this.add
      .text(90, 0, '★', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffdd44',
      })
      .setOrigin(0.5);

    this.turnIndicator.add([bg, starLeft, texto, starRight]);
    this.turnIndicator.setData('texto', texto);
    this.turnIndicator.setData('starLeft', starLeft);
    this.turnIndicator.setData('starRight', starRight);
    this.turnIndicator.setVisible(false);
  }

  private mostrarIndicadorTurno(nombreKodamon: string, esJugador: boolean): void {
    const texto = this.turnIndicator.getData('texto') as Phaser.GameObjects.Text;
    const starLeft = this.turnIndicator.getData('starLeft') as Phaser.GameObjects.Text;
    const starRight = this.turnIndicator.getData('starRight') as Phaser.GameObjects.Text;

    texto.setText(`TURNO DE ${nombreKodamon.toUpperCase()}`);

    // Color según quién juega
    const color = esJugador ? '#44ff88' : '#ff6666';
    starLeft.setColor(color);
    starRight.setColor(color);

    // Animación de entrada
    this.turnIndicator.setVisible(true);
    this.turnIndicator.y = -30;

    this.tweens.add({
      targets: this.turnIndicator,
      y: 20,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Animación de estrellas
    this.tweens.add({
      targets: [starLeft, starRight],
      angle: 360,
      duration: 1000,
      ease: 'Linear',
      repeat: -1,
    });
  }

  private ocultarIndicadorTurno(): void {
    this.tweens.add({
      targets: this.turnIndicator,
      y: -30,
      duration: 200,
      ease: 'Power2',
      onComplete: () => this.turnIndicator.setVisible(false),
    });
  }

  private mostrarDialogo(texto: string, callback?: () => void): void {
    this.ocultarBotonesMovimientos();
    this.dialogBox.setText(texto);

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
    this._estado = 'JUGADOR_TURNO';
    this.mostrarIndicadorTurno(this.jugador.datos.nombre, true);
    this.dialogBox.setText(`¿Qué debería hacer ${this.jugador.datos.nombre}?`);
    this.mostrarBotonesMovimientos();
  }

  private mostrarBotonesMovimientos(): void {
    // Limpiar botones anteriores
    this.ocultarBotonesMovimientos();

    const startX = 10;
    const startY = 306;
    const buttonWidth = 120;
    const spacing = 4;

    this.jugador.movimientosActuales.forEach((movData, index) => {
      const col = index % 4;
      const x = startX + col * (buttonWidth + spacing);

      // Calcular efectividad vs enemigo actual
      const efectividad = getEfectividad(movData.movimiento.tipo, this.enemigo.datos.tipo);

      const button = new MoveButton(this, {
        x: x,
        y: startY,
        width: buttonWidth,
        height: 58,
        nombre: movData.movimiento.nombre,
        tipo: movData.movimiento.tipo,
        poder: movData.movimiento.poder,
        ppActual: movData.ppActual,
        ppMax: movData.movimiento.ppMax,
        efectividad: efectividad,
        disabled: movData.ppActual <= 0,
        onClick: () => this.ejecutarMovimiento(index),
      });

      this.moveButtons.push(button);
    });
  }

  private ocultarBotonesMovimientos(): void {
    this.moveButtons.forEach((btn) => btn.destroy());
    this.moveButtons = [];
  }

  private ejecutarMovimiento(index: number): void {
    this._estado = 'ANIMACION';
    this.ocultarIndicadorTurno();

    const movData = this.jugador.movimientosActuales[index];
    movData.ppActual--;

    const daño = this.calcularDaño(this.jugador, this.enemigo, movData.movimiento);
    const efectividad = getEfectividad(movData.movimiento.tipo, this.enemigo.datos.tipo);
    const textoEfectividad = getTextoEfectividad(efectividad);

    this.mostrarDialogo(`¡${this.jugador.datos.nombre} usó ${movData.movimiento.nombre}!`, () => {
      // Efecto de ataque con partículas
      this.effects.atacar(
        movData.movimiento.tipo,
        { x: this.jugadorSprite.x, y: this.jugadorSprite.y },
        { x: this.enemigoSprite.x, y: this.enemigoSprite.y },
        () => {
          // Efecto de daño recibido
          this.effects.recibirDano(this.enemigoSprite);

          // Mostrar número de daño flotante
          this.mostrarDañoFlotante(
            this.enemigoSprite.x,
            this.enemigoSprite.y,
            daño,
            efectividad
          );

          this.enemigo.hpActual = Math.max(0, this.enemigo.hpActual - daño);
          this.enemigoHpBar.setHP(this.enemigo.hpActual);

          // Mostrar efecto de efectividad
          if (efectividad >= 2) {
            this.effects.superEfectivo(this.enemigoSprite.x, this.enemigoSprite.y);
          } else if (efectividad > 0 && efectividad < 1) {
            this.effects.pocoEfectivo(this.enemigoSprite.x, this.enemigoSprite.y);
          }

          if (textoEfectividad) {
            this.mostrarDialogo(textoEfectividad, () => this.verificarFinBatalla());
          } else {
            this.time.delayedCall(500, () => this.verificarFinBatalla());
          }
        }
      );
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

  /**
   * Muestra el daño como número flotante animado
   */
  private mostrarDañoFlotante(
    x: number,
    y: number,
    daño: number,
    efectividad: number
  ): void {
    // Color según efectividad
    let color = '#ffffff';
    let fontSize = '14px';

    if (efectividad >= 2) {
      color = '#ffdd44'; // Súper efectivo - dorado
      fontSize = '18px';
    } else if (efectividad > 0 && efectividad < 1) {
      color = '#888888'; // Poco efectivo - gris
      fontSize = '12px';
    } else if (efectividad === 0) {
      color = '#444444'; // Sin efecto
      fontSize = '10px';
    }

    const texto = this.add
      .text(x, y - 20, `-${daño}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: fontSize,
        color: color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Animación: sube y desaparece
    this.tweens.add({
      targets: texto,
      y: y - 60,
      alpha: 0,
      scale: 1.2,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => texto.destroy(),
    });
  }

  private verificarFinBatalla(): void {
    if (this.enemigo.hpActual <= 0) {
      this._estado = 'VICTORIA';
      // Efecto de derrota del enemigo
      this.effects.derrotaKodamon(this.enemigoSprite);
      this.mostrarDialogo(`¡${this.enemigo.datos.nombre} se debilitó!`, () => {
        // Efecto de victoria del jugador
        this.effects.victoriaKodamon(this.jugadorSprite);
        this.mostrarDialogo(`¡${this.jugador.datos.nombre} ganó la batalla!`, () => {
          this.volverAlMenu();
        });
      });
    } else {
      this.turnoEnemigo();
    }
  }

  private turnoEnemigo(): void {
    this._estado = 'ENEMIGO_TURNO';
    this.mostrarIndicadorTurno(this.enemigo.datos.nombre, false);

    // El enemigo elige un movimiento aleatorio con PP
    const movimientosDisponibles = this.enemigo.movimientosActuales.filter((m) => m.ppActual > 0);
    if (movimientosDisponibles.length === 0) {
      // Sin PP, usa forcejeo (daño fijo)
      this.ocultarIndicadorTurno();
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

    // Ocultar indicador antes de atacar
    this.time.delayedCall(800, () => this.ocultarIndicadorTurno());

    this.mostrarDialogo(`¡${this.enemigo.datos.nombre} usó ${movData.movimiento.nombre}!`, () => {
      // Efecto de ataque con partículas
      this.effects.atacar(
        movData.movimiento.tipo,
        { x: this.enemigoSprite.x, y: this.enemigoSprite.y },
        { x: this.jugadorSprite.x, y: this.jugadorSprite.y },
        () => {
          // Efecto de daño recibido
          this.effects.recibirDano(this.jugadorSprite);

          // Mostrar número de daño flotante
          this.mostrarDañoFlotante(
            this.jugadorSprite.x,
            this.jugadorSprite.y,
            daño,
            efectividad
          );

          this.jugador.hpActual = Math.max(0, this.jugador.hpActual - daño);
          this.jugadorHpBar.setHP(this.jugador.hpActual);

          // Mostrar efecto de efectividad
          if (efectividad >= 2) {
            this.effects.superEfectivo(this.jugadorSprite.x, this.jugadorSprite.y);
          } else if (efectividad > 0 && efectividad < 1) {
            this.effects.pocoEfectivo(this.jugadorSprite.x, this.jugadorSprite.y);
          }

          if (textoEfectividad) {
            this.mostrarDialogo(textoEfectividad, () => this.verificarDerrotaJugador());
          } else {
            this.time.delayedCall(500, () => this.verificarDerrotaJugador());
          }
        }
      );
    });
  }

  private verificarDerrotaJugador(): void {
    if (this.jugador.hpActual <= 0) {
      this._estado = 'DERROTA';
      // Efecto de derrota del jugador
      this.effects.derrotaKodamon(this.jugadorSprite);
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
