import Phaser from 'phaser';
import { BootScene } from '@scenes/BootScene';
import { MenuScene } from '@scenes/MenuScene';
import { BattleScene } from '@scenes/BattleScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 512,
  height: 384,
  parent: 'game-container',
  backgroundColor: '#202040',
  pixelArt: true,
  zoom: 2,
  scene: [BootScene, MenuScene, BattleScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
};
