import Phaser from 'phaser';
import type { KodamonData, KodamonBatalla, Movimiento } from '@game-types/index';
import {
  getRandomKodamon,
  getMovimiento,
  getEfectividad,
  getTextoEfectividad,
} from '@data/index';
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
  private estado: EstadoBatalla = 'INTRO';
  private fondoId: string = 'battle-bg-1';

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
    this.estado = 'INTRO';
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
    this.estado = 'JUGADOR_TURNO';
    this.dialogBox.setText(`¿Qué debería hacer ${this.jugador.datos.nombre}?`);
    this.mostrarBotonesMovimientos();
  }

  private mostrarBotonesMovimientos(): void {
    // Limpiar botones anteriores
    this.ocultarBotonesMovimientos();

    const startX = 10;
    const startY = 312;
    const buttonWidth = 120;
    const spacing = 4;

    this.jugador.movimientosActuales.forEach((movData, index) => {
      const col = index % 4;
      const x = startX + col * (buttonWidth + spacing);

      const button = new MoveButton(this, {
        x: x,
        y: startY,
        width: buttonWidth,
        height: 52,
        nombre: movData.movimiento.nombre,
        tipo: movData.movimiento.tipo,
        ppActual: movData.ppActual,
        ppMax: movData.movimiento.ppMax,
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
    this.estado = 'ANIMACION';
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

  private verificarFinBatalla(): void {
    if (this.enemigo.hpActual <= 0) {
      this.estado = 'VICTORIA';
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
      // Efecto de ataque con partículas
      this.effects.atacar(
        movData.movimiento.tipo,
        { x: this.enemigoSprite.x, y: this.enemigoSprite.y },
        { x: this.jugadorSprite.x, y: this.jugadorSprite.y },
        () => {
          // Efecto de daño recibido
          this.effects.recibirDano(this.jugadorSprite);

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
      this.estado = 'DERROTA';
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
