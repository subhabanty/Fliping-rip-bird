
import { GameConfig } from './types';

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const CONFIG: GameConfig = {
  gravity: 0.25,
  flapStrength: -5.5,
  pipeSpeed: 2.5,
  pipeSpawnInterval: 1500, // ms
  gapSize: 160
};

export const BIRD_SIZE = 34;
export const PIPE_WIDTH = 60;
export const GROUND_HEIGHT = 100;

// Pixel Art Colors
export const COLORS = {
  sky: '#70c5ce',
  ground: '#ded895',
  groundTop: '#73bf2e',
  pipe: '#73bf2e',
  pipeBorder: '#543847',
  bird: '#f7d010'
};
