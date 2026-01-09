import { getAllKodamons } from '@/data';
import Phaser from 'phaser';
import { AudioManager } from '@systems/AudioManager';

// Importar assets - Fondos de batalla
import battleBg1 from '@assets/sprites/backgrounds/battle-bg-1.png';
import battleBg2 from '@assets/sprites/backgrounds/battle-bg-2.png';
import battleBg3 from '@assets/sprites/backgrounds/battle-bg-3.png';
import battleBg4 from '@assets/sprites/backgrounds/battle-bg-4.png';

// Importar assets - Sprites de Kodamon (50+ Monsters Pack CC0 + Ansimuz CC0)
import pyrexSprite from '@assets/sprites/kodamons-cyber/pyrex.png';
import aquonSprite from '@assets/sprites/kodamons-cyber/aquon.png';
import florixSprite from '@assets/sprites/kodamons-cyber/florix.png';
import voltikSprite from '@assets/sprites/kodamons-cyber/voltik.png';
import terronSprite from '@assets/sprites/kodamons-cyber/terron.png';
import glaceonSprite from '@assets/sprites/kodamons-cyber/glaceon.png';
import aerixSprite from '@assets/sprites/kodamons-cyber/aerix.png';
import petrosSprite from '@assets/sprites/kodamons-cyber/petros.png';
import normexSprite from '@assets/sprites/kodamons-cyber/normex.png';
import spekterSprite from '@assets/sprites/kodamons-cyber/spekter.png';
// 10 nuevos Kodamon
import blazorSprite from '@assets/sprites/kodamons-cyber/blazor.png';
import drakonSprite from '@assets/sprites/kodamons-cyber/drakon.png';
import toxinSprite from '@assets/sprites/kodamons-cyber/toxin.png';
import zephyrSprite from '@assets/sprites/kodamons-cyber/zephyr.png';
import verdexSprite from '@assets/sprites/kodamons-cyber/verdex.png';
import fuzzleSprite from '@assets/sprites/kodamons-cyber/fuzzle.png';
import mechonSprite from '@assets/sprites/kodamons-cyber/mechon.png';
import krakosSprite from '@assets/sprites/kodamons-cyber/krakos.png';
import sparkySprite from '@assets/sprites/kodamons-cyber/sparky.png';
import thornixSprite from '@assets/sprites/kodamons-cyber/thornix.png';

// Mapa de fondos de batalla
const BATTLE_BACKGROUNDS: Record<string, string> = {
  'battle-bg-1': battleBg1,
  'battle-bg-2': battleBg2,
  'battle-bg-3': battleBg3,
  'battle-bg-4': battleBg4,
};

// Mapa de sprites por ID de Kodamon
const KODAMON_SPRITES: Record<string, string> = {
  pyrex: pyrexSprite,
  aquon: aquonSprite,
  florix: florixSprite,
  voltik: voltikSprite,
  terron: terronSprite,
  glaceon: glaceonSprite,
  aerix: aerixSprite,
  petros: petrosSprite,
  normex: normexSprite,
  spekter: spekterSprite,
  // 10 nuevos
  blazor: blazorSprite,
  drakon: drakonSprite,
  toxin: toxinSprite,
  zephyr: zephyrSprite,
  verdex: verdexSprite,
  fuzzle: fuzzleSprite,
  mechon: mechonSprite,
  krakos: krakosSprite,
  sparky: sparkySprite,
  thornix: thornixSprite,
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.crearBarraDeCarga();
    this.cargarAssets();
  }

  create(): void {
    console.log(`[BootScene] Assets cargados correctamente`);
    this.scene.start('MenuScene');
  }
  private crearBarraDeCarga(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const loadingText = this.add
      .text(centerX, centerY, 'Cargando...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(centerX - 100, centerY + 20, 200, 20);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(centerX - 96, centerY + 24, 192 * value, 12);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }
  private cargarAssets(): void {
    // Cargar fondos de batalla
    Object.entries(BATTLE_BACKGROUNDS).forEach(([key, url]) => {
      this.load.image(key, url);
    });

    // Cargar sprites de Kodamon
    const kodamons = getAllKodamons();
    kodamons.forEach((kodamon) => {
      const spriteUrl = KODAMON_SPRITES[kodamon.id];
      if (spriteUrl) {
        this.load.image(`kodamon-${kodamon.id}`, spriteUrl);
      }
    });

    // Cargar archivos de audio
    AudioManager.preloadAudio(this);

    console.log(
      `[BootScene] Cargando ${Object.keys(BATTLE_BACKGROUNDS).length} fondos, ${kodamons.length} sprites y audio...`
    );
  }
}

// Exportar lista de fondos disponibles para usar en otras escenas
export const FONDOS_DISPONIBLES = [
  { id: 'battle-bg-1', nombre: 'Ruinas' },
  { id: 'battle-bg-2', nombre: 'Bosque' },
  { id: 'battle-bg-3', nombre: 'Desierto' },
  { id: 'battle-bg-4', nombre: 'Castillo' },
];
