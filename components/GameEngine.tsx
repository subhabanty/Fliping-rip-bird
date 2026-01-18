
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Bird, Pipe } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  CONFIG, 
  BIRD_SIZE, 
  PIPE_WIDTH, 
  GROUND_HEIGHT,
  COLORS 
} from '../constants';

interface GameEngineProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ gameState, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const birdRef = useRef<Bird>({
    x: 50,
    y: CANVAS_HEIGHT / 2,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    velocity: 0,
    rotation: 0
  });
  const pipesRef = useRef<Pipe[]>([]);
  const lastPipeSpawnRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const groundOffsetRef = useRef<number>(0);
  const cloudOffsetRef = useRef<number>(0);

  const resetGame = useCallback(() => {
    birdRef.current = {
      x: 50,
      y: CANVAS_HEIGHT / 2,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
      velocity: 0,
      rotation: 0
    };
    pipesRef.current = [];
    scoreRef.current = 0;
    lastPipeSpawnRef.current = performance.now();
    groundOffsetRef.current = 0;
    cloudOffsetRef.current = 0;
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const flap = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    birdRef.current.velocity = CONFIG.flapStrength;
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  const spawnPipe = (timestamp: number) => {
    if (timestamp - lastPipeSpawnRef.current > CONFIG.pipeSpawnInterval) {
      const minHeight = 50;
      const maxHeight = CANVAS_HEIGHT - GROUND_HEIGHT - CONFIG.gapSize - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      
      pipesRef.current.push({
        x: CANVAS_WIDTH,
        topHeight,
        width: PIPE_WIDTH,
        passed: false
      });
      lastPipeSpawnRef.current = timestamp;
    }
  };

  const update = (timestamp: number) => {
    if (gameState !== GameState.PLAYING) return;

    // Bird physics
    birdRef.current.velocity += CONFIG.gravity;
    birdRef.current.y += birdRef.current.velocity;
    
    // Rotation logic
    const targetRotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 4, birdRef.current.velocity * 0.1));
    birdRef.current.rotation = targetRotation;

    // Floor/Ceiling collision
    if (birdRef.current.y + birdRef.current.height > CANVAS_HEIGHT - GROUND_HEIGHT || birdRef.current.y < 0) {
      onGameOver(scoreRef.current);
    }

    // Pipes movement and spawn
    spawnPipe(timestamp);
    pipesRef.current.forEach(pipe => {
      pipe.x -= CONFIG.pipeSpeed;

      // Scoring
      if (!pipe.passed && pipe.x + pipe.width < birdRef.current.x) {
        pipe.passed = true;
        scoreRef.current += 1;
        onScoreUpdate(scoreRef.current);
      }

      // Collision detection
      const birdX = birdRef.current.x + 5;
      const birdY = birdRef.current.y + 5;
      const birdW = birdRef.current.width - 10;
      const birdH = birdRef.current.height - 10;

      // Top pipe
      if (
        birdX < pipe.x + pipe.width &&
        birdX + birdW > pipe.x &&
        birdY < pipe.topHeight
      ) {
        onGameOver(scoreRef.current);
      }

      // Bottom pipe
      if (
        birdX < pipe.x + pipe.width &&
        birdX + birdW > pipe.x &&
        birdY + birdH > pipe.topHeight + CONFIG.gapSize
      ) {
        onGameOver(scoreRef.current);
      }
    });

    // Cleanup offscreen pipes
    pipesRef.current = pipesRef.current.filter(pipe => pipe.x + pipe.width > -50);

    // Parallax
    groundOffsetRef.current = (groundOffsetRef.current + CONFIG.pipeSpeed) % CANVAS_WIDTH;
    cloudOffsetRef.current = (cloudOffsetRef.current + CONFIG.pipeSpeed * 0.2) % CANVAS_WIDTH;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Sky
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Clouds (Simple procedural clouds)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 2; i++) {
      const x = (CANVAS_WIDTH * i) - cloudOffsetRef.current;
      ctx.beginPath();
      ctx.arc(x + 100, 150, 40, 0, Math.PI * 2);
      ctx.arc(x + 150, 150, 50, 0, Math.PI * 2);
      ctx.arc(x + 200, 150, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Pipes
    pipesRef.current.forEach(pipe => {
      // Body
      ctx.fillStyle = COLORS.pipe;
      ctx.strokeStyle = COLORS.pipeBorder;
      ctx.lineWidth = 4;

      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
      // Top pipe cap
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);
      ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);

      // Bottom pipe
      const bottomY = pipe.topHeight + CONFIG.gapSize;
      const bottomH = CANVAS_HEIGHT - GROUND_HEIGHT - bottomY;
      ctx.fillRect(pipe.x, bottomY, pipe.width, bottomH);
      ctx.strokeRect(pipe.x, bottomY, pipe.width, bottomH);
      // Bottom pipe cap
      ctx.fillRect(pipe.x - 5, bottomY, pipe.width + 10, 20);
      ctx.strokeRect(pipe.x - 5, bottomY, pipe.width + 10, 20);
    });

    // 4. Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    // Ground top green strip
    ctx.fillStyle = COLORS.groundTop;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 15);
    // Ground patterns
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < CANVAS_WIDTH / 20 + 1; i++) {
        const x = (i * 20) - (groundOffsetRef.current % 20);
        ctx.fillRect(x, CANVAS_HEIGHT - GROUND_HEIGHT, 10, 15);
    }

    // 5. Bird
    ctx.save();
    ctx.translate(birdRef.current.x + birdRef.current.width / 2, birdRef.current.y + birdRef.current.height / 2);
    ctx.rotate(birdRef.current.rotation);
    
    // Body
    ctx.fillStyle = COLORS.bird;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, birdRef.current.width/2, birdRef.current.height/2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(12, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(24, 5);
    ctx.lineTo(12, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing
    const wingY = Math.sin(performance.now() * 0.02) * 5;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.ellipse(-10, wingY, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const render = (timestamp: number) => {
    if (gameState === GameState.PLAYING) {
      update(timestamp);
    }
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
    }
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, resetGame]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseDown={flap}
      onTouchStart={(e) => {
          e.preventDefault();
          flap();
      }}
      className="cursor-pointer"
    />
  );
};

export default GameEngine;
