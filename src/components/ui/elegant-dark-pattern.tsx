import React from "react";
import { cn } from "@/lib/utils";

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden bg-[#090a0f] text-white",
        className
      )}
    >
      {/* Camada 1: Gradiente escuro profundo e elegante */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(184,137,36,0.14),rgba(15,17,26,0.6)_55%,rgba(9,10,15,1)_100%)]"
      />

      {/* Camada 2: Iluminação radial secundária sutil nas laterais/base */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_650px_at_50%_45%,rgba(30,34,50,0.38),transparent_75%)]"
      />

      {/* Camada 3: Padrão geométrico sutil (micro-grid / losangos elegantes) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px",
          backgroundPosition: "0 0, 0 0, 0 0",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 35%, #000 35%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 35%, #000 35%, transparent 95%)",
        }}
      />

      {/* Camada 4: Textura fina estática em SVG (zero custo de CPU) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default DarkGradientBg;

