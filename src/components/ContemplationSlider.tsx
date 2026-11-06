import React, { useCallback, useRef } from 'react';
import {
  TipoRegua,
  formatarMoeda,
  formatarPercentual,
} from '../lib/consorcio';

interface ContemplationSliderProps {
  mes: number;
  prazo: number;
  rentabilidade: number;
  lucroMensalAluguel: number;
  vantagemConsorcioRF: number;
  montanteFinalAplicada: number;
  chancesMensaisFidelidade: number;
  reguaAtiva: TipoRegua;
  onChangeMes: (novoMes: number) => void;
}

const MARCAS_PADRAO = [10, 50, 90, 130, 170, 210];

export const ContemplationSlider: React.FC<ContemplationSliderProps> = React.memo(
  ({
    mes,
    prazo,
    rentabilidade,
    lucroMensalAluguel,
    vantagemConsorcioRF,
    montanteFinalAplicada,
    chancesMensaisFidelidade,
    reguaAtiva,
    onChangeMes,
  }) => {
    const percentualPosicao =
      prazo > 1 ? ((mes - 1) / (prazo - 1)) * 100 : 0;

    const marcasVisiveis = MARCAS_PADRAO.filter((m) => m < prazo);

    // Pointer Events: mouse, dedo e Apple Pencil usam o mesmo caminho de arraste
    const trilhaRef = useRef<HTMLDivElement>(null);
    const arrastando = useRef(false);

    const mesDoPonteiro = useCallback(
      (clientX: number) => {
        const el = trilhaRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) return;
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        onChangeMes(Math.round(1 + ratio * (prazo - 1)));
      },
      [onChangeMes, prazo]
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      arrastando.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      mesDoPonteiro(e.clientX);
    };
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (arrastando.current) mesDoPonteiro(e.clientX);
    };
    const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
      arrastando.current = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const passos: Record<string, number> = {
        ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10,
      };
      if (e.key === 'Home') { e.preventDefault(); onChangeMes(1); return; }
      if (e.key === 'End') { e.preventDefault(); onChangeMes(prazo); return; }
      if (e.key in passos) {
        e.preventDefault();
        onChangeMes(Math.min(prazo, Math.max(1, mes + passos[e.key])));
      }
    };

    const renderTooltipMetric = () => {
      switch (reguaAtiva) {
        case 'venda':
          return (
            <>
              <span>RENTABILIDADE MÊS:</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {formatarPercentual(rentabilidade)}
              </span>
            </>
          );
        case 'patrimonial':
          return (
            <>
              <span>FLUXO LÍQUIDO/MÊS:</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                {formatarMoeda(lucroMensalAluguel)}
              </span>
            </>
          );
        case 'renda_fixa':
          return (
            <>
              <span>VANTAGEM PODER COMPRA:</span>
              <span className="font-bold text-[#f3c653] text-xs sm:text-sm">
                {vantagemConsorcioRF >= 0 ? '+' : ''}
                {formatarMoeda(vantagemConsorcioRF)}
              </span>
            </>
          );
        case 'aplicada':
          return (
            <>
              <span>CARTA APLICADA (FIM):</span>
              <span className="font-bold text-[#f3c653] text-xs sm:text-sm">
                {formatarMoeda(montanteFinalAplicada)}
              </span>
            </>
          );
        case 'fidelidade':
          return (
            <>
              <span>OPORTUNIDADES/MÊS:</span>
              <span className="font-bold text-[#f3c653] text-xs sm:text-sm">
                {chancesMensaisFidelidade}x na Assembleia
              </span>
            </>
          );
      }
    };

    return (
      <section
        aria-label="Seleção do mês de contemplação"
        className="w-full max-w-6xl mx-auto px-2 sm:px-6 md:px-8 mt-2 sm:mt-3 mb-6 sm:mb-7 select-none"
      >
        <div className="relative pt-16 sm:pt-20 pb-12 sm:pb-12">
          <div className="flex items-center w-full gap-1 sm:gap-0">
            {/* Pílula esquerda: 1º mês */}
            <button
              type="button"
              onClick={() => onChangeMes(1)}
              className="gold-pill-endpoint shrink-0 h-11 sm:h-12 md:h-12 px-3 sm:px-5 md:px-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-normal tracking-wide transition-transform active:scale-95 z-10"
            >
              1º mês
            </button>

            {/* Trilha dourada central */}
            <div ref={trilhaRef} className="relative flex-1 h-14 sm:h-16 flex items-center mx-2 sm:mx-3">
              {/* Tooltip flutuante leve sem backdrop-blur pesado */}
              <div
                style={{
                  left: `${percentualPosicao}%`,
                  transform: `translate3d(-${Math.min(88, Math.max(12, percentualPosicao))}%, 0, 0)`,
                }}
                className="pointer-events-none absolute -top-[68px] sm:-top-[74px] z-30 min-w-[195px] sm:min-w-[245px] md:min-w-[255px] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-md border bg-[#1c1c20] border-white/15 text-white shadow-xl will-change-transform"
              >
                <div className="text-center text-xs sm:text-sm md:text-[15px] font-normal text-gray-100 mb-0.5 sm:mb-1">
                  {mes}º mês
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs tracking-wider uppercase text-gray-300 whitespace-nowrap">
                  {renderTooltipMetric()}
                </div>
              </div>

              {/* Barra horizontal dourada */}
              <div className="w-full h-2.5 gold-track relative">
                {marcasVisiveis.map((marca) => {
                  const posMarca = ((marca - 1) / (prazo - 1)) * 100;
                  return (
                    <div
                      key={marca}
                      style={{ left: `${posMarca}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                    >
                      <div className="w-[3px] h-5 sm:h-6 bg-[#7c5c16] rounded-full" />
                      <button
                        type="button"
                        onClick={() => onChangeMes(marca)}
                        className="mt-1.5 sm:mt-2 px-2 py-2 min-h-[44px] text-[11px] sm:text-xs md:text-[13px] font-normal whitespace-nowrap transition-colors text-[#8b90a0] hover:text-gray-200 active:text-[#f3c653]"
                      >
                        <span className="sm:hidden">{marca}m</span>
                        <span className="hidden sm:inline">{marca} meses</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Thumb visual (círculo branco) */}
              <div
                style={{ left: `${percentualPosicao}%` }}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border-2 border-white will-change-transform"
              />

              {/* Área de arraste (mouse, toque e Apple Pencil via Pointer Events) */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Mês de contemplação"
                aria-valuemin={1}
                aria-valuemax={prazo}
                aria-valuenow={mes}
                aria-valuetext={`${mes}º mês`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onKeyDown={handleKeyDown}
                className="slider-overlay absolute -inset-y-3 inset-x-0 z-30 cursor-grab active:cursor-grabbing outline-none"
              />
            </div>

            {/* Pílula direita: 220 meses */}
            <button
              type="button"
              onClick={() => onChangeMes(prazo)}
              className="gold-pill-endpoint shrink-0 h-11 sm:h-12 md:h-12 px-3 sm:px-5 md:px-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-normal tracking-wide transition-transform active:scale-95 z-10"
            >
              {prazo} meses
            </button>
          </div>
        </div>

        {/* Aviso discreto para rentabilidades muito altas (Seção 6) */}
        {reguaAtiva === 'venda' && rentabilidade >= 500 && (
          <p
            role="status"
            className="text-center text-[11px] sm:text-xs mt-1 text-amber-200/70"
          >
            * Resultado teórico, sujeito a contemplação no mês indicado e a condições de mercado.
          </p>
        )}
      </section>
    );
  }
);
