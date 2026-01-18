
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
    x: 60,
    y: CANVAS_HEIGHT / 2.5,
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
      x: 60,
      y: CANVAS_HEIGHT / 2.5,
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
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  const spawnPipe = (timestamp: number) => {
    if (timestamp - lastPipeSpawnRef.current > CONFIG.pipeSpawnInterval) {
      const minHeight = 80;
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

    birdRef.current.velocity += CONFIG.gravity;
    birdRef.current.y += birdRef.current.velocity;
    
    const targetRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 8, birdRef.current.velocity * 0.1));
    birdRef.current.rotation = targetRotation;

    if (birdRef.current.y + birdRef.current.height > CANVAS_HEIGHT - GROUND_HEIGHT || birdRef.current.y < 0) {
      onGameOver(scoreRef.current);
    }

    spawnPipe(timestamp);
    pipesRef.current.forEach(pipe => {
      pipe.x -= CONFIG.pipeSpeed;

      if (!pipe.passed && pipe.x + pipe.width < birdRef.current.x) {
        pipe.passed = true;
        scoreRef.current += 1;
        onScoreUpdate(scoreRef.current);
      }

      const hitBoxPadding = 6;
      const birdX = birdRef.current.x + hitBoxPadding;
      const birdY = birdRef.current.y + hitBoxPadding;
      const birdW = birdRef.current.width - (hitBoxPadding * 2);
      const birdH = birdRef.current.height - (hitBoxPadding * 2);

      if (birdX < pipe.x + pipe.width && birdX + birdW > pipe.x && birdY < pipe.topHeight) {
        onGameOver(scoreRef.current);
      }
      if (birdX < pipe.x + pipe.width && birdX + birdW > pipe.x && birdY + birdH > pipe.topHeight + CONFIG.gapSize) {
        onGameOver(scoreRef.current);
      }
    });

    pipesRef.current = pipesRef.current.filter(pipe => pipe.x + pipe.width > -100);
    groundOffsetRef.current = (groundOffsetRef.current + CONFIG.pipeSpeed) % CANVAS_WIDTH;
    cloudOffsetRef.current = (cloudOffsetRef.current + CONFIG.pipeSpeed * 0.3) % CANVAS_WIDTH;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Soft Sky
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Fluffy Clouds
    ctx.fillStyle = 'white';
    for (let i = 0; i < 4; i++) {
      const x = (CANVAS_WIDTH * i) - cloudOffsetRef.current - 50;
      const y = 80 + (i % 2 === 0 ? 40 : 120);
      ctx.beginPath();
      ctx.arc(x + 40, y, 25, 0, Math.PI * 2);
      ctx.arc(x + 80, y - 10, 35, 0, Math.PI * 2);
      ctx.arc(x + 120, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Friendly Pipes (More Rounded)
    pipesRef.current.forEach(pipe => {
      ctx.fillStyle = COLORS.pipe;
      ctx.strokeStyle = COLORS.pipeBorder;
      ctx.lineWidth = 4;

      const cornerRadius = 8;

      // Draw rounded pipe helper
      const drawPipePart = (px: number, py: number, pw: number, ph: number) => {
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, cornerRadius);
          ctx.fill();
          ctx.stroke();
      };

      // Top pipe
      drawPipePart(pipe.x, -cornerRadius, pipe.width, pipe.topHeight + cornerRadius);
      // Top pipe cap (larger/rounder)
      drawPipePart(pipe.x - 6, pipe.topHeight - 28, pipe.width + 12, 28);

      // Bottom pipe
      const bottomY = pipe.topHeight + CONFIG.gapSize;
      const bottomH = CANVAS_HEIGHT - GROUND_HEIGHT - bottomY;
      drawPipePart(pipe.x, bottomY, pipe.width, bottomH + cornerRadius);
      // Bottom pipe cap
      drawPipePart(pipe.x - 6, bottomY, pipe.width + 12, 28);
    });

    // 4. Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    ctx.fillStyle = COLORS.groundTop;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 12);
    
    // Tiny grass tufts
    ctx.fillStyle = COLORS.groundTop;
    for (let i = 0; i < (CANVAS_WIDTH / 30) + 2; i++) {
        const x = (i * 30) - (groundOffsetRef.current % 30);
        ctx.beginPath();
        ctx.arc(x, CANVAS_HEIGHT - GROUND_HEIGHT, 8, 0, Math.PI, true);
        ctx.fill();
    }

    // 5. Cute Bird Sprite
    ctx.save();
    ctx.translate(birdRef.current.x + birdRef.current.width / 2, birdRef.current.y + birdRef.current.height / 2);
    ctx.rotate(birdRef.current.rotation);
    
    // Body (Rounder/Cuter)
    ctx.fillStyle = COLORS.bird;
    ctx.strokeStyle = '#862E00'; // Softer brown border
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, birdRef.current.width/1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye (Bigger/Friendlier)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(10, -8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pupil (Blinking occasionally)
    const isBlinking = Math.floor(performance.now() / 2000) % 10 === 0;
    if (!isBlinking) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(14, -8, 4.5, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, -8);
        ctx.lineTo(18, -8);
        ctx.stroke();
    }

    // Tiny Blush
    ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(8, 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Beak (Small/Cute)
    ctx.fillStyle = '#FF922B';
    ctx.beginPath();
    ctx.moveTo(16, -2);
    ctx.lineTo(28, 4);
    ctx.lineTo(16, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing (Whimsical flap)
    const wingY = Math.sin(performance.now() * 0.012) * 8;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(-14, wingY, 12, 8, -Math.PI/8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const render = (timestamp: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      if (gameState === GameState.PLAYING) {
        update(timestamp);
      }
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING) resetGame();
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, resetGame]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseDown={flap}
      onTouchStart={(e) => { e.preventDefault(); flap(); }}
      className="cursor-pointer block"
    />
  );
};

export default GameEngine;
