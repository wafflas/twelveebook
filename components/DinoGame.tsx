"use client";
import React, { useEffect, useRef, useState } from "react";

interface DinoGameProps {
  onUnlock: () => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function DinoGame({ onUnlock }: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "won" | "lost"
  >("waiting");
  const [score, setScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const gameDataRef = useRef({
    dino: {
      x: 50,
      y: 0,
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
    },
    obstacles: [] as GameObject[],
    ground: 0,
    speed: 3,
    score: 0,
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive canvas sizing
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = Math.min(container.clientWidth, 800);
        canvas.height = 200;
        gameDataRef.current.ground = canvas.height - 50;
        gameDataRef.current.dino.y =
          gameDataRef.current.ground - gameDataRef.current.dino.height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const GRAVITY = 0.5;
    const JUMP_STRENGTH = -12;
    const WIN_SCORE = 100;

    const startGame = () => {
      if (gameState !== "waiting") return;
      setGameState("playing");
    };

    const jump = () => {
      if (gameState === "waiting") {
        startGame();
        return;
      }
      if (gameState !== "playing") return;
      const { dino } = gameDataRef.current;
      if (!dino.isJumping) {
        dino.velocityY = JUMP_STRENGTH;
        dino.isJumping = true;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("touchstart", handleTouch);

    const checkCollision = (a: GameObject, b: GameObject): boolean => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    };

    const spawnObstacle = () => {
      const { obstacles, ground } = gameDataRef.current;
      const height = 30 + Math.random() * 20;
      obstacles.push({
        x: canvas.width,
        y: ground - height,
        width: 20,
        height,
      });
    };

    const drawPreview = () => {
      // Clear canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = "#333";
      ctx.fillRect(0, gameDataRef.current.ground, canvas.width, 2);

      // Draw dino (standing on ground)
      const { dino, ground } = gameDataRef.current;
      ctx.fillStyle = "#4a5568";
      ctx.fillRect(dino.x, ground - dino.height, dino.width, dino.height);

      // Draw sample obstacles (static preview)
      const sampleObstacles = [
        { x: canvas.width - 100, y: ground - 40, width: 20, height: 40 },
        { x: canvas.width - 50, y: ground - 30, width: 20, height: 30 },
      ];

      ctx.fillStyle = "#e53e3e";
      sampleObstacles.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });

      // Draw instructions
      ctx.fillStyle = "#666";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Press SPACE or TAP to start", canvas.width / 2, 80);
      ctx.fillText("Goal: 100 points to unlock!", canvas.width / 2, 105);
      ctx.textAlign = "left";
    };

    const gameLoop = () => {
      if (gameState === "waiting") {
        drawPreview();
        requestAnimationFrame(gameLoop);
        return;
      }

      if (gameState !== "playing") {
        requestAnimationFrame(gameLoop);
        return;
      }

      const game = gameDataRef.current;
      const { dino, obstacles, ground, speed } = game;

      // Clear canvas
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = "#333";
      ctx.fillRect(0, ground, canvas.width, 2);

      // Update and draw dino
      dino.velocityY += GRAVITY;
      dino.y += dino.velocityY;

      if (dino.y >= ground - dino.height) {
        dino.y = ground - dino.height;
        dino.velocityY = 0;
        dino.isJumping = false;
      }

      ctx.fillStyle = "#4a5568";
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      // Update and draw obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= speed;

        ctx.fillStyle = "#e53e3e";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Check collision
        if (checkCollision(dino, obstacle)) {
          setGameState("lost");
          return;
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(i, 1);
          game.score += 10;
          setScore(game.score);
        }
      }

      // Spawn obstacles
      game.frameCount++;
      if (game.frameCount % 150 === 0) {
        spawnObstacle();
      }

      // Increase difficulty
      if (game.frameCount % 500 === 0 && game.speed < 8) {
        game.speed += 0.3;
      }

      // Check win condition
      if (game.score >= WIN_SCORE) {
        setGameState("won");
        onUnlock();
        return;
      }

      // Draw score
      ctx.fillStyle = "#2d3748";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${game.score}`, 10, 30);
      ctx.fillText(`Goal: ${WIN_SCORE}`, 10, 55);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("touchstart", handleTouch);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [onUnlock, gameKey, gameState]);

  const resetGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    gameDataRef.current = {
      dino: {
        x: 50,
        y: 0,
        width: 40,
        height: 40,
        velocityY: 0,
        isJumping: false,
      },
      obstacles: [],
      ground: 0,
      speed: 3,
      score: 0,
      frameCount: 0,
    };
    setScore(0);
    setGameState("waiting");
    setGameKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h2 className="mb-2 text-2xl font-bold">Unlock Demos</h2>
      </div>

      <div className="relative w-full max-w-4xl">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ touchAction: "none" }}
        />

        {gameState === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center"></div>
        )}

        {gameState === "won" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
            <div className="rounded-lg bg-white p-6 text-center">
              <h3 className="mb-2 text-2xl font-bold text-green-600">
                🎉 You Win!
              </h3>
              <p className="mb-4 text-gray-700">Demos Unlocked!</p>
              <button
                onClick={resetGame}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameState === "lost" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
            <div className="rounded-lg bg-white p-6 text-center">
              <h3 className="mb-2 text-2xl font-bold text-red-600">
                Game Over!
              </h3>
              <p className="mb-4 text-gray-700">Score: {score}</p>
              <button
                onClick={resetGame}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">Score: {score} / 100</p>
      </div>
    </div>
  );
}
