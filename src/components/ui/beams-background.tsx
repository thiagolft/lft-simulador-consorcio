"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.4 - width * 0.2,
    y: Math.random() * height * 1.4 - height * 0.2,
    width: 45 + Math.random() * 70,
    length: height * 2.2,
    angle,
    speed: 0.45 + Math.random() * 0.75,
    opacity: 0.12 + Math.random() * 0.14,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.015 + Math.random() * 0.02,
  };
}

export function BeamsBackground({
  className,
  children,
  intensity = "strong",
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Quantidade enxuta de feixes e resolução interna reduzida (0.35x)
  // eliminam 90% do custo de GPU mantendo o mesmo visual difuso.
  const TOTAL_BEAMS = 12;
  const INTERNAL_SCALE = 0.35;

  const opacityMap = {
    subtle: 0.65,
    medium: 0.8,
    strong: 0.95,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    const updateCanvasSize = () => {
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(logicalWidth * INTERNAL_SCALE));
      canvas.height = Math.max(1, Math.floor(logicalHeight * INTERNAL_SCALE));
      ctx.setTransform(INTERNAL_SCALE, 0, 0, INTERNAL_SCALE, 0, 0);

      beamsRef.current = Array.from({ length: TOTAL_BEAMS }, () =>
        createBeam(logicalWidth, logicalHeight)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize, { passive: true });

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      const column = index % 3;
      const spacing = logicalWidth / 3;

      beam.y = logicalHeight + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 110 + Math.random() * 110;
      beam.speed = 0.45 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.16 + Math.random() * 0.08;
      return beam;
    }

    function drawBeam(context: CanvasRenderingContext2D, beam: Beam) {
      context.save();
      context.translate(beam.x, beam.y);
      context.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity];

      const gradient = context.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(
        0.15,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(
        0.5,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.85,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

      context.fillStyle = gradient;
      context.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      context.restore();
    }

    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30; // 30 FPS é ideal para feixes lentos e economiza metade da CPU/GPU

    function animate(now: number) {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (document.hidden) return;
      if (now - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = now;

      if (!canvas || !ctx) return;

      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      const totalBeams = beamsRef.current.length;
      for (let i = 0; i < totalBeams; i++) {
        const beam = beamsRef.current[i];
        beam.y -= beam.speed * 1.8;
        beam.pulse += beam.pulseSpeed * 1.8;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, i, totalBeams);
        }

        drawBeam(ctx, beam);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden bg-neutral-950",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{
          filter: "blur(22px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Camada estática leve de escurecimento sem backdrop-filter dinâmico */}
      <div className="fixed inset-0 bg-neutral-950/35 pointer-events-none" />

      {children ? (
        <div className="relative z-10 w-full min-h-screen">{children}</div>
      ) : (
        <div className="relative z-10 flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tighter">
              Beams
              <br />
              Background
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl text-white/70 tracking-tighter">
              For your pleasure
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
