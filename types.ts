
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  rotation: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  width: number;
  passed: boolean;
}

export interface GameConfig {
  gravity: number;
  flapStrength: number;
  pipeSpeed: number;
  pipeSpawnInterval: number;
  gapSize: number;
}
