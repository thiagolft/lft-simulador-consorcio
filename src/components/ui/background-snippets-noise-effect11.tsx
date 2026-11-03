import React, { useRef, useEffect } from "react";

/** Inline Noise overlay (no external imports). */
export interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number; // 0–255
}

export const Noise: React.FC<NoiseProps> = ({
  patternSize = 256,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 4,
  patternAlpha = 16,
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    const canvasSize = patternSize;

    // Pré-gera 4 quadros de granulação para rodar a 60/120Hz no iPad/Mobile sem custo de CPU
    const precomputedFrames: ImageData[] = Array.from({ length: 4 }, () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = (Math.random() * 255) | 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      return imageData;
    });

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
    };

    let frameIdx = 0;
    const drawGrain = () => {
      ctx.putImageData(precomputedFrames[frameIdx % precomputedFrames.length], 0, 0);
      frameIdx++;
    };

    const loop = () => {
      if (!document.hidden && frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize, { passive: true });
    resize();
    drawGrain();
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      ref={grainRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

/** Gradient + Grid + Noise background */
export default function BackgroundNoiseEffect() {
  return (
    <div className="fixed inset-0 -z-10 bg-slate-950 overflow-hidden">
      {/* SaaS Blue spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_620px_at_50%_200px,rgba(37,99,235,0.35),transparent_70%)]" />
      {/* Soft grid with top fade */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#94a3b81f_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81f_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_85%_55%_at_50%_15%,#000_75%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_85%_55%_at_50%_15%,#000_75%,transparent_100%)] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" />
      {/* Grain overlay */}
      <Noise patternRefreshInterval={4} patternAlpha={18} />
    </div>
  );
}

