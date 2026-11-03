import React from 'react';
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
        <div className="relative pt-16 sm:pt-20 pb-7 sm:pb-8">
          <div className="flex items-center w-full gap-1 sm:gap-0">
            {/* Pílula esquerda: 1º mês */}
            <button
              type="button"
              onClick={() => onChangeMes(1)}
              className="gold-pill-endpoint shrink-0 h-10 sm:h-11 md:h-12 px-3 sm:px-5 md:px-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-normal tracking-wide transition-transform active:scale-95 z-10"
            >
              1º mês
            </button>

            {/* Trilha dourada central */}
            <div className="relative flex-1 h-12 sm:h-14 flex items-center">
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
                        className="mt-1.5 sm:mt-2 px-1 py-0.5 text-[10px] sm:text-xs md:text-[13px] font-normal whitespace-nowrap transition-colors text-[#8b90a0] hover:text-gray-200 active:text-[#f3c653]"
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
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-full bg-white shadow-md border-2 border-white will-change-transform"
              />

              {/* Input range nativo sobreposto com área de toque ampla para iPad/Mobile */}
              <input
                type="range"
                min={1}
                max={prazo}
                step={1}
                value={mes}
                aria-label="Mês de contemplação"
                aria-valuemin={1}
                aria-valuemax={prazo}
                aria-valuenow={mes}
                aria-valuetext={`${mes}º mês`}
                onChange={(e) => onChangeMes(Number(e.target.value))}
                className="slider-overlay absolute inset-0 w-full h-full z-30 m-0 opacity-0 cursor-grab active:cursor-grabbing"
              />
            </div>

            {/* Pílula direita: 220 meses */}
            <button
              type="button"
              onClick={() => onChangeMes(prazo)}
              className="gold-pill-endpoint shrink-0 h-10 sm:h-11 md:h-12 px-3 sm:px-5 md:px-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-normal tracking-wide transition-transform active:scale-95 z-10"
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
