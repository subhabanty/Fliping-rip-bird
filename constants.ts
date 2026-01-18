
import { GameConfig } from './types';

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const CONFIG: GameConfig = {
  gravity: 0.22, // Slightly lighter gravity for a "friendlier" feel
  flapStrength: -5.2,
  pipeSpeed: 2.2, // Slightly slower base speed
  pipeSpawnInterval: 1600, 
  gapSize: 170 // Slightly larger gap for a friendlier difficulty curve
};

export const BIRD_SIZE = 36;
export const PIPE_WIDTH = 64;
export const GROUND_HEIGHT = 100;

// Friendly Pastel Palette
export const COLORS = {
  sky: '#A5D8FF',
  ground: '#F8F9FA',
  groundTop: '#51CF66',
  pipe: '#82C91E',
  pipeBorder: '#2B8A3E',
  bird: '#FFD43B'
};
