import Phaser from 'phaser';
import type { KodamonData, KodamonBatalla, Movimiento } from '@game-types/index';
import {
  getRandomKodamon,
  getMovimiento,
  getEfectividad,
  getTextoEfectividad,
  BATTLE_CONSTANTS,
} from '@data/index';
import {
  BattleEffects,
  aplicarEstado,
  getEstadoConfig,
  calcularDañoPorEstado,
  verificarPuedeAtacar,
} from '@systems/index';
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
  // Tweens de animación idle (para pausar/reanudar)
  private jugadorIdleTween!: Phaser.Tweens.Tween;
  private enemigoIdleTween!: Phaser.Tweens.Tween;
  // Posiciones base de los sprites (para restaurar después de animaciones)
  private jugadorBaseY!: number;
  private enemigoBaseY!: number;

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
      // Estado alterado inicial: ninguno
      estadoAlterado: null,
      turnosEstado: 0,
    };
  }

  private dibujarFondo(): void {
    // Usar el fondo de batalla seleccionado
    const bg = this.add.image(256, 192, this.fondoId);
    bg.setDisplaySize(512, 384);
  }

  private crearSprites(): void {
    // Posiciones finales de los sprites
    const enemigoFinalY = 110;
    const jugadorFinalY = 175;

    // Sprite del enemigo - empieza fuera de pantalla (derecha)
    this.enemigoSprite = this.add.image(550, enemigoFinalY, `kodamon-${this.enemigo.datos.id}`);
    this.enemigoSprite.setScale(1.2);
    this.enemigoSprite.setAlpha(0);
    this.enemigoBaseY = enemigoFinalY;

    // Sprite del jugador - empieza fuera de pantalla (izquierda)
    this.jugadorSprite = this.add.image(-50, jugadorFinalY, `kodamon-${this.jugador.datos.id}`);
    this.jugadorSprite.setScale(1.5);
    this.jugadorSprite.setFlipX(true);
    this.jugadorSprite.setAlpha(0);
    this.jugadorBaseY = jugadorFinalY;

    // Las animaciones idle se inician después de la animación de entrada
  }

  /**
   * Inicia la animación idle (respiración/flotación) para ambos Kodamon
   * Crea un movimiento sutil de subir/bajar que da vida a los sprites
   */
  private iniciarAnimacionesIdle(): void {
    // Animación idle del jugador - movimiento suave hacia arriba y abajo
    this.jugadorIdleTween = this.tweens.add({
      targets: this.jugadorSprite,
      y: this.jugadorBaseY - 4, // Sube 4 píxeles
      duration: 1000,
      yoyo: true, // Vuelve a la posición original
      repeat: -1, // Repite infinitamente
      ease: 'Sine.easeInOut', // Movimiento suave sinusoidal
    });

    // Animación idle del enemigo - ligeramente desfasada para variedad
    this.enemigoIdleTween = this.tweens.add({
      targets: this.enemigoSprite,
      y: this.enemigoBaseY - 3, // Sube 3 píxeles (un poco menos)
      duration: 1200, // Duración diferente para que no estén sincronizados
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 300, // Pequeño desfase inicial
    });
  }

  /**
   * Pausa las animaciones idle (durante ataques y otras animaciones)
   */
  private pausarAnimacionesIdle(): void {
    if (this.jugadorIdleTween) this.jugadorIdleTween.pause();
    if (this.enemigoIdleTween) this.enemigoIdleTween.pause();
  }

  /**
   * Reanuda las animaciones idle y restaura posiciones base
   */
  private reanudarAnimacionesIdle(): void {
    // Restaurar posiciones base suavemente
    this.tweens.add({
      targets: this.jugadorSprite,
      y: this.jugadorBaseY,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.jugadorIdleTween) this.jugadorIdleTween.resume();
      },
    });

    this.tweens.add({
      targets: this.enemigoSprite,
      y: this.enemigoBaseY,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.enemigoIdleTween) this.enemigoIdleTween.resume();
      },
    });
  }

  /**
   * Anima el sprite del atacante moviéndose hacia el defensor
   * Crea un efecto de "lunge" (embestida) antes del ataque
   *
   * @param esJugador - true si ataca el jugador, false si ataca el enemigo
   * @returns Promise que se resuelve cuando la animación termina
   */
  private animarAtaque(esJugador: boolean): Promise<void> {
    return new Promise((resolve) => {
      const atacante = esJugador ? this.jugadorSprite : this.enemigoSprite;
      const baseX = atacante.x;
      const baseY = esJugador ? this.jugadorBaseY : this.enemigoBaseY;

      // Dirección del movimiento: jugador va hacia la derecha, enemigo hacia la izquierda
      const offsetX = esJugador ? 40 : -40;
      // También un pequeño movimiento vertical hacia el oponente
      const offsetY = esJugador ? -15 : 15;

      // Timeline de animación: avanzar → pausa → regresar
      this.tweens.chain({
        targets: atacante,
        tweens: [
          {
            // Fase 1: Avanzar hacia el enemigo (lunge)
            x: baseX + offsetX,
            y: baseY + offsetY,
            duration: 150,
            ease: 'Power2.easeOut',
          },
          {
            // Fase 2: Pausa breve en posición de ataque
            x: baseX + offsetX,
            y: baseY + offsetY,
            duration: 100,
          },
          {
            // Fase 3: Regresar a posición original
            x: baseX,
            y: baseY,
            duration: 200,
            ease: 'Power2.easeIn',
          },
        ],
        onComplete: () => resolve(),
      });
    });
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
    // Animación de entrada del enemigo (desde la derecha)
    this.tweens.add({
      targets: this.enemigoSprite,
      x: 400,
      alpha: 1,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Después de que el enemigo entra, mostrar primer diálogo
        this.mostrarDialogo(`¡Un ${this.enemigo.datos.nombre} salvaje apareció!`, () => {
          // Animación de entrada del jugador (desde la izquierda)
          this.tweens.add({
            targets: this.jugadorSprite,
            x: 110,
            alpha: 1,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Iniciar animaciones idle después de que ambos estén en posición
              this.iniciarAnimacionesIdle();

              this.mostrarDialogo(`¡Adelante, ${this.jugador.datos.nombre}!`, () => {
                // Determinar quién ataca primero según velocidad
                const primero = this.determinarOrdenTurno();

                // Obtener nombres para el mensaje
                const nombreRapido =
                  primero === 'jugador' ? this.jugador.datos.nombre : this.enemigo.datos.nombre;

                // Mostrar quién es más rápido y comenzar el turno correspondiente
                this.mostrarDialogo(`¡${nombreRapido} es más rápido!`, () => {
                  if (primero === 'jugador') {
                    this.iniciarTurnoJugador();
                  } else {
                    this.turnoEnemigo();
                  }
                });
              });
            },
          });
        });
      },
    });
  }

  private iniciarTurnoJugador(): void {
    this._estado = 'JUGADOR_TURNO';
    this.mostrarIndicadorTurno(this.jugador.datos.nombre, true);

    // Reanudar animaciones idle al inicio del turno
    this.reanudarAnimacionesIdle();

    // Procesar estado alterado al inicio del turno
    this.procesarEstadoTurno(this.jugador, this.jugadorHpBar, () => {
      // Si el jugador murió por daño de estado, verificar derrota
      if (this.jugador.hpActual <= 0) {
        this.verificarDerrotaJugador();
        return;
      }

      // Verificar si puede atacar (dormido, congelado, paralizado)
      const { puedeAtacar, mensaje } = verificarPuedeAtacar(this.jugador);
      if (!puedeAtacar) {
        this.mostrarDialogo(mensaje, () => {
          // Pasa el turno al enemigo
          this.turnoEnemigo();
        });
        return;
      }

      // Si se despertó o descongeló, mostrar mensaje primero
      if (mensaje) {
        this.mostrarDialogo(mensaje, () => {
          this.dialogBox.setText(`¿Qué debería hacer ${this.jugador.datos.nombre}?`);
          this.mostrarBotonesMovimientos();
        });
        return;
      }

      // Turno normal
      this.dialogBox.setText(`¿Qué debería hacer ${this.jugador.datos.nombre}?`);
      this.mostrarBotonesMovimientos();
    });
  }

  /**
   * Procesa el estado alterado de un Kodamon al inicio de su turno
   * Aplica daño por quemadura/veneno y llama al callback cuando termina
   */
  private procesarEstadoTurno(
    kodamon: KodamonBatalla,
    hpBar: HealthBar,
    callback: () => void
  ): void {
    // Si no tiene estado, continuar directamente
    if (kodamon.estadoAlterado === null) {
      callback();
      return;
    }

    // Calcular daño por estado (quemadura o veneno)
    const dañoEstado = calcularDañoPorEstado(kodamon);

    if (dañoEstado > 0) {
      const config = getEstadoConfig(kodamon.estadoAlterado);
      const nombreEstado = config?.nombre.toLowerCase() || kodamon.estadoAlterado;

      this.mostrarDialogo(`¡${kodamon.datos.nombre} sufre por estar ${nombreEstado}!`, () => {
        // Aplicar daño
        kodamon.hpActual = Math.max(0, kodamon.hpActual - dañoEstado);
        hpBar.setHP(kodamon.hpActual);

        // Mostrar daño flotante
        const sprite = kodamon === this.jugador ? this.jugadorSprite : this.enemigoSprite;
        this.mostrarDañoFlotante(sprite.x, sprite.y, dañoEstado, 1, false);

        this.time.delayedCall(500, callback);
      });
    } else {
      callback();
    }
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

    this.mostrarDialogo(`¡${this.jugador.datos.nombre} usó ${movData.movimiento.nombre}!`, () => {
      // Verificar si el ataque acierta según la precisión
      const acierta = this.intentarAtaque(movData.movimiento);

      if (!acierta) {
        // El ataque falló - mostrar mensaje y pasar turno
        this.mostrarDialogo('¡El ataque falló!', () => {
          this.verificarFinBatalla();
        });
        return;
      }

      // ═══════════════════════════════════════════════════════════════
      // MOVIMIENTOS DE ESTADO PURO (sin daño)
      // ═══════════════════════════════════════════════════════════════
      if (movData.movimiento.categoria === 'estado') {
        // Solo intentar aplicar el estado, no hay daño
        const estadoAplicado = this.intentarAplicarEstado(movData.movimiento, this.enemigo);
        if (estadoAplicado) {
          // Actualizar indicador visual de estado
          this.enemigoHpBar.setEstado(this.enemigo.estadoAlterado);
          const config = getEstadoConfig(this.enemigo.estadoAlterado);
          if (config) {
            this.mostrarDialogo(
              `¡${this.enemigo.datos.nombre} ha sido ${config.nombre.toLowerCase()}!`,
              () => this.verificarFinBatalla()
            );
            return;
          }
        }
        // Si no se aplicó (ya tenía estado), mostrar mensaje
        this.mostrarDialogo('¡Pero falló!', () => this.verificarFinBatalla());
        return;
      }

      // ═══════════════════════════════════════════════════════════════
      // MOVIMIENTOS DE DAÑO (físico o especial)
      // ═══════════════════════════════════════════════════════════════
      const { daño, critico } = this.calcularDaño(this.jugador, this.enemigo, movData.movimiento);
      const efectividad = getEfectividad(movData.movimiento.tipo, this.enemigo.datos.tipo);
      const textoEfectividad = getTextoEfectividad(efectividad);

      // Pausar animación idle durante el ataque
      this.pausarAnimacionesIdle();

      // Animación de lunge del atacante, luego efecto de partículas
      this.animarAtaque(true).then(() => {
        // Efecto de ataque con partículas
        this.effects.atacar(
          movData.movimiento.tipo,
          { x: this.jugadorSprite.x, y: this.jugadorSprite.y },
          { x: this.enemigoSprite.x, y: this.enemigoSprite.y },
          () => {
            // Efecto de daño recibido
            this.effects.recibirDano(this.enemigoSprite);

            // Mostrar número de daño flotante (pasamos critico para el efecto visual)
            this.mostrarDañoFlotante(
              this.enemigoSprite.x,
              this.enemigoSprite.y,
              daño,
              efectividad,
              critico
            );

            this.enemigo.hpActual = Math.max(0, this.enemigo.hpActual - daño);
            this.enemigoHpBar.setHP(this.enemigo.hpActual);

            // Mostrar efecto de efectividad
            if (efectividad >= 2) {
              this.effects.superEfectivo(this.enemigoSprite.x, this.enemigoSprite.y);
            } else if (efectividad > 0 && efectividad < 1) {
              this.effects.pocoEfectivo(this.enemigoSprite.x, this.enemigoSprite.y);
            }

            // Función para verificar fin de batalla (paso final)
            const finalizarTurno = () => {
              this.verificarFinBatalla();
            };

            // Función para mostrar mensaje de estado alterado si se aplicó
            const continuarConEstado = () => {
              // Solo intentar aplicar estado si el enemigo sigue vivo
              if (this.enemigo.hpActual > 0) {
                const estadoAplicado = this.intentarAplicarEstado(movData.movimiento, this.enemigo);
                if (estadoAplicado) {
                  // Actualizar indicador visual de estado
                  this.enemigoHpBar.setEstado(this.enemigo.estadoAlterado);
                  const config = getEstadoConfig(this.enemigo.estadoAlterado);
                  if (config) {
                    this.mostrarDialogo(
                      `¡${this.enemigo.datos.nombre} ha sido ${config.nombre.toLowerCase()}!`,
                      finalizarTurno
                    );
                    return;
                  }
                }
              }
              finalizarTurno();
            };

            // Función para mostrar efectividad
            const continuarConEfectividad = () => {
              if (textoEfectividad) {
                this.mostrarDialogo(textoEfectividad, continuarConEstado);
              } else {
                continuarConEstado();
              }
            };

            // Si fue crítico, mostrar mensaje antes de continuar
            if (critico) {
              this.mostrarDialogo('¡Golpe crítico!', continuarConEfectividad);
            } else {
              continuarConEfectividad();
            }
          }
        );
      }); // Fin de animarAtaque().then()
    });
  }

  /**
   * Determina quién ataca primero basándose en la velocidad
   *
   * Reglas:
   * - El Kodamon con mayor velocidad ataca primero
   * - En caso de empate, se decide aleatoriamente (50/50)
   *
   * @returns 'jugador' si el jugador es más rápido, 'enemigo' si no
   */
  private determinarOrdenTurno(): 'jugador' | 'enemigo' {
    const velJugador = this.jugador.datos.estadisticas.velocidad;
    const velEnemigo = this.enemigo.datos.estadisticas.velocidad;

    console.log(
      `[Velocidad] ${this.jugador.datos.nombre}: ${velJugador} vs ${this.enemigo.datos.nombre}: ${velEnemigo}`
    );

    // Si las velocidades son iguales, decidir aleatoriamente
    if (velJugador === velEnemigo) {
      const resultado = Math.random() < 0.5 ? 'jugador' : 'enemigo';
      console.log(`[Velocidad] Empate! Decidido por azar: ${resultado}`);
      return resultado;
    }

    // El más rápido ataca primero
    const resultado = velJugador > velEnemigo ? 'jugador' : 'enemigo';
    console.log(`[Velocidad] Más rápido: ${resultado}`);
    return resultado;
  }

  /**
   * Determina si un ataque es crítico
   *
   * Probabilidad base: 6.25% (1/16)
   * Esto significa que aproximadamente 1 de cada 16 ataques será crítico
   *
   * @returns true si el ataque es crítico, false si no
   */
  private esCritico(): boolean {
    // Generar número aleatorio entre 0 y 1
    const roll = Math.random();

    // Comparar con la probabilidad de crítico (0.0625 = 6.25%)
    const esCrit = roll < BATTLE_CONSTANTS.CRITICAL_CHANCE;

    if (esCrit) {
      console.log(
        `[Crítico] ¡GOLPE CRÍTICO! (roll: ${roll.toFixed(4)} < ${BATTLE_CONSTANTS.CRITICAL_CHANCE})`
      );
    }

    return esCrit;
  }

  /**
   * Determina si un ataque acierta basándose en la precisión del movimiento
   *
   * @param movimiento - El movimiento a intentar
   * @returns true si el ataque acierta, false si falla
   */
  private intentarAtaque(movimiento: Movimiento): boolean {
    // Si precisión es 100 o más, siempre acierta (optimización)
    if (movimiento.precision >= 100) {
      return true;
    }

    // Generar número aleatorio entre 0 y 100
    const roll = Math.random() * 100;

    // El ataque acierta si el roll es menor que la precisión
    const acierta = roll < movimiento.precision;

    console.log(
      `[Precisión] ${movimiento.nombre}: roll ${roll.toFixed(1)} vs precision ${movimiento.precision} → ${acierta ? 'ACIERTA' : 'FALLA'}`
    );

    return acierta;
  }

  /**
   * Intenta aplicar el efecto de estado de un movimiento al defensor
   *
   * @param movimiento - El movimiento usado
   * @param defensor - El Kodamon que recibe el efecto
   * @returns true si se aplicó el estado, false si no
   */
  private intentarAplicarEstado(movimiento: Movimiento, defensor: KodamonBatalla): boolean {
    // Si el movimiento no tiene efecto de estado, no hacer nada
    if (!movimiento.efectoEstado) {
      return false;
    }

    // Si el defensor ya tiene un estado, no se puede aplicar otro
    if (defensor.estadoAlterado !== null) {
      console.log(
        `[Estado] ${defensor.datos.nombre} ya tiene ${defensor.estadoAlterado}, ` +
          `no se puede aplicar ${movimiento.efectoEstado.estado}`
      );
      return false;
    }

    // Tirar dado para ver si se aplica el estado
    const roll = Math.random() * 100;
    const aplica = roll < movimiento.efectoEstado.probabilidad;

    console.log(
      `[Estado] ${movimiento.nombre}: roll ${roll.toFixed(1)} vs ` +
        `prob ${movimiento.efectoEstado.probabilidad}% → ${aplica ? 'APLICA' : 'NO APLICA'}`
    );

    if (aplica) {
      aplicarEstado(defensor, movimiento.efectoEstado.estado);
      return true;
    }

    return false;
  }

  /**
   * Calcula el daño de un ataque
   *
   * @returns Objeto con el daño calculado y si fue crítico
   */
  private calcularDaño(
    atacante: KodamonBatalla,
    defensor: KodamonBatalla,
    movimiento: Movimiento
  ): { daño: number; critico: boolean } {
    const statsAtacante = atacante.datos.estadisticas;
    const statsDefensor = defensor.datos.estadisticas;

    // Usar ataque/defensa física o especial según categoría
    const ataque =
      movimiento.categoria === 'fisico' ? statsAtacante.ataque : statsAtacante.ataqueEspecial;
    const defensa =
      movimiento.categoria === 'fisico' ? statsDefensor.defensa : statsDefensor.defensaEspecial;

    // Fórmula simplificada de daño
    const nivel = BATTLE_CONSTANTS.NIVEL_BASE;
    const base = (((2 * nivel) / 5 + 2) * movimiento.poder * (ataque / defensa)) / 50 + 2;

    // Efectividad de tipo
    const efectividad = getEfectividad(movimiento.tipo, defensor.datos.tipo);

    // STAB (Same Type Attack Bonus)
    const stab = movimiento.tipo === atacante.datos.tipo ? BATTLE_CONSTANTS.STAB_MULTIPLIER : 1;

    // Variación aleatoria (85-100%)
    const random =
      BATTLE_CONSTANTS.RANDOM_MIN +
      Math.random() * (BATTLE_CONSTANTS.RANDOM_MAX - BATTLE_CONSTANTS.RANDOM_MIN);

    // Verificar si es golpe crítico
    const critico = this.esCritico();
    const multiplicadorCritico = critico ? BATTLE_CONSTANTS.CRITICAL_MULTIPLIER : 1;

    // Calcular daño final
    const dañoFinal = Math.floor(base * efectividad * stab * random * multiplicadorCritico);

    return { daño: dañoFinal, critico };
  }

  /**
   * Muestra el daño como número flotante animado
   *
   * @param x - Posición X del sprite
   * @param y - Posición Y del sprite
   * @param daño - Cantidad de daño a mostrar
   * @param efectividad - Multiplicador de efectividad (0, 0.5, 1, 2)
   * @param critico - Si el golpe fue crítico (prioridad visual máxima)
   */
  private mostrarDañoFlotante(
    x: number,
    y: number,
    daño: number,
    efectividad: number,
    critico: boolean = false
  ): void {
    // Determinar estilo visual según tipo de golpe
    // Prioridad: Crítico > Súper Efectivo > Normal > Poco Efectivo > Sin Efecto
    let color: string;
    let fontSize: string;
    let textoMostrar: string;
    let escalaFinal: number;

    if (critico) {
      // CRÍTICO: Máxima prioridad visual
      color = '#ff6644'; // Naranja brillante
      fontSize = '22px';
      textoMostrar = `-${daño}!`; // Añadir exclamación
      escalaFinal = 1.5;
    } else if (efectividad >= 2) {
      // Súper efectivo
      color = '#ffdd44'; // Dorado
      fontSize = '18px';
      textoMostrar = `-${daño}`;
      escalaFinal = 1.3;
    } else if (efectividad > 0 && efectividad < 1) {
      // Poco efectivo
      color = '#888888'; // Gris
      fontSize = '12px';
      textoMostrar = `-${daño}`;
      escalaFinal = 1.0;
    } else if (efectividad === 0) {
      // Sin efecto
      color = '#444444'; // Gris oscuro
      fontSize = '10px';
      textoMostrar = `-${daño}`;
      escalaFinal = 0.8;
    } else {
      // Normal
      color = '#ffffff'; // Blanco
      fontSize = '14px';
      textoMostrar = `-${daño}`;
      escalaFinal = 1.2;
    }

    const texto = this.add
      .text(x, y - 20, textoMostrar, {
        fontFamily: '"Press Start 2P"',
        fontSize: fontSize,
        color: color,
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Si es crítico, añadir efecto de sacudida inicial
    if (critico) {
      this.tweens.add({
        targets: texto,
        x: { from: x - 3, to: x + 3 },
        duration: 50,
        yoyo: true,
        repeat: 2,
      });
    }

    // Animación principal: sube y desaparece
    this.tweens.add({
      targets: texto,
      y: y - 60,
      alpha: 0,
      scale: escalaFinal,
      duration: critico ? 1200 : 1000, // Críticos duran más
      ease: 'Power2',
      onComplete: () => texto.destroy(),
    });
  }

  private verificarFinBatalla(): void {
    if (this.enemigo.hpActual <= 0) {
      this._estado = 'VICTORIA';
      // Detener animación idle del enemigo antes de la animación de derrota
      if (this.enemigoIdleTween) {
        this.enemigoIdleTween.stop();
        this.enemigoSprite.y = this.enemigoBaseY;
      }
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

    // Reanudar animaciones idle al inicio del turno
    this.reanudarAnimacionesIdle();

    // Procesar estado alterado al inicio del turno
    this.procesarEstadoTurno(this.enemigo, this.enemigoHpBar, () => {
      // Si el enemigo murió por daño de estado, verificar victoria
      if (this.enemigo.hpActual <= 0) {
        this.verificarFinBatalla();
        return;
      }

      // Verificar si puede atacar (dormido, congelado, paralizado)
      const { puedeAtacar, mensaje } = verificarPuedeAtacar(this.enemigo);
      if (!puedeAtacar) {
        this.mostrarDialogo(mensaje, () => {
          // Pasa el turno al jugador
          this.iniciarTurnoJugador();
        });
        return;
      }

      // Si se despertó o descongeló, mostrar mensaje primero
      if (mensaje) {
        this.mostrarDialogo(mensaje, () => {
          this.ejecutarAtaqueEnemigo();
        });
        return;
      }

      // Turno normal del enemigo
      this.ejecutarAtaqueEnemigo();
    });
  }

  /**
   * Ejecuta el ataque del enemigo (separado para poder llamar después del procesamiento de estado)
   */
  private ejecutarAtaqueEnemigo(): void {
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

    // Ocultar indicador antes de atacar
    this.time.delayedCall(800, () => this.ocultarIndicadorTurno());

    this.mostrarDialogo(`¡${this.enemigo.datos.nombre} usó ${movData.movimiento.nombre}!`, () => {
      // Verificar si el ataque acierta según la precisión
      const acierta = this.intentarAtaque(movData.movimiento);

      if (!acierta) {
        // El ataque falló - mostrar mensaje y pasar turno
        this.mostrarDialogo('¡El ataque falló!', () => {
          this.verificarDerrotaJugador();
        });
        return;
      }

      // ═══════════════════════════════════════════════════════════════
      // MOVIMIENTOS DE ESTADO PURO (sin daño)
      // ═══════════════════════════════════════════════════════════════
      if (movData.movimiento.categoria === 'estado') {
        // Solo intentar aplicar el estado, no hay daño
        const estadoAplicado = this.intentarAplicarEstado(movData.movimiento, this.jugador);
        if (estadoAplicado) {
          // Actualizar indicador visual de estado
          this.jugadorHpBar.setEstado(this.jugador.estadoAlterado);
          const config = getEstadoConfig(this.jugador.estadoAlterado);
          if (config) {
            this.mostrarDialogo(
              `¡${this.jugador.datos.nombre} ha sido ${config.nombre.toLowerCase()}!`,
              () => this.verificarDerrotaJugador()
            );
            return;
          }
        }
        // Si no se aplicó (ya tenía estado), mostrar mensaje
        this.mostrarDialogo('¡Pero falló!', () => this.verificarDerrotaJugador());
        return;
      }

      // ═══════════════════════════════════════════════════════════════
      // MOVIMIENTOS DE DAÑO (físico o especial)
      // ═══════════════════════════════════════════════════════════════
      const { daño, critico } = this.calcularDaño(this.enemigo, this.jugador, movData.movimiento);
      const efectividad = getEfectividad(movData.movimiento.tipo, this.jugador.datos.tipo);
      const textoEfectividad = getTextoEfectividad(efectividad);

      // Pausar animación idle durante el ataque
      this.pausarAnimacionesIdle();

      // Animación de lunge del atacante, luego efecto de partículas
      this.animarAtaque(false).then(() => {
        // Efecto de ataque con partículas
        this.effects.atacar(
          movData.movimiento.tipo,
          { x: this.enemigoSprite.x, y: this.enemigoSprite.y },
          { x: this.jugadorSprite.x, y: this.jugadorSprite.y },
          () => {
            // Efecto de daño recibido
            this.effects.recibirDano(this.jugadorSprite);

            // Mostrar número de daño flotante (pasamos critico para el efecto visual)
            this.mostrarDañoFlotante(
              this.jugadorSprite.x,
              this.jugadorSprite.y,
              daño,
              efectividad,
              critico
            );

            this.jugador.hpActual = Math.max(0, this.jugador.hpActual - daño);
            this.jugadorHpBar.setHP(this.jugador.hpActual);

            // Mostrar efecto de efectividad
            if (efectividad >= 2) {
              this.effects.superEfectivo(this.jugadorSprite.x, this.jugadorSprite.y);
            } else if (efectividad > 0 && efectividad < 1) {
              this.effects.pocoEfectivo(this.jugadorSprite.x, this.jugadorSprite.y);
            }

            // Función para verificar derrota (paso final)
            const finalizarTurno = () => {
              this.verificarDerrotaJugador();
            };

            // Función para mostrar mensaje de estado alterado si se aplicó
            const continuarConEstado = () => {
              // Solo intentar aplicar estado si el jugador sigue vivo
              if (this.jugador.hpActual > 0) {
                const estadoAplicado = this.intentarAplicarEstado(movData.movimiento, this.jugador);
                if (estadoAplicado) {
                  // Actualizar indicador visual de estado
                  this.jugadorHpBar.setEstado(this.jugador.estadoAlterado);
                  const config = getEstadoConfig(this.jugador.estadoAlterado);
                  if (config) {
                    this.mostrarDialogo(
                      `¡${this.jugador.datos.nombre} ha sido ${config.nombre.toLowerCase()}!`,
                      finalizarTurno
                    );
                    return;
                  }
                }
              }
              finalizarTurno();
            };

            // Función para mostrar efectividad
            const continuarConEfectividad = () => {
              if (textoEfectividad) {
                this.mostrarDialogo(textoEfectividad, continuarConEstado);
              } else {
                continuarConEstado();
              }
            };

            // Si fue crítico, mostrar mensaje antes de continuar
            if (critico) {
              this.mostrarDialogo('¡Golpe crítico!', continuarConEfectividad);
            } else {
              continuarConEfectividad();
            }
          }
        );
      }); // Fin de animarAtaque().then()
    });
  }

  private verificarDerrotaJugador(): void {
    if (this.jugador.hpActual <= 0) {
      this._estado = 'DERROTA';
      // Detener animación idle del jugador antes de la animación de derrota
      if (this.jugadorIdleTween) {
        this.jugadorIdleTween.stop();
        this.jugadorSprite.y = this.jugadorBaseY;
      }
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
