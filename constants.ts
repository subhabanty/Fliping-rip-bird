
import { GameConfig } from './types';

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const CONFIG: GameConfig = {
  gravity: 0.22,
  flapStrength: -5.2,
  pipeSpeed: 2.2,
  pipeSpawnInterval: 1600, 
  gapSize: 175 // Even friendlier gap size
};

export const BIRD_SIZE = 36;
export const PIPE_WIDTH = 64;
export const GROUND_HEIGHT = 100;

// Netlify Fresh Palette
export const COLORS = {
  sky: '#E0F7F6',     // Very light teal
  ground: '#F1F5F9',  // Slate 50
  groundTop: '#00C7B7', // Netlify Teal
  pipe: '#00C7B7',    // Netlify Teal
  pipeBorder: '#0E3E3E',
  bird: '#FFD43B'     // Maintain the friendly yellow bird
};
