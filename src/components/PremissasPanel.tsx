import React from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { PremissasConsorcio, PREMISSAS_PADRAO } from '../lib/consorcio';

interface PremissasPanelProps {
  premissas: PremissasConsorcio;
  onChangePremissas: (novas: PremissasConsorcio) => void;
  onReset: () => void;
  aberto: boolean;
  onToggle: () => void;
}

export const PremissasPanel: React.FC<PremissasPanelProps> = ({
  premissas,
  onChangePremissas,
  onReset,
  aberto,
  onToggle,
}) => {
  const atualizarCampo = <K extends keyof PremissasConsorcio>(
    campo: K,
    valor: PremissasConsorcio[K]
  ) => {
    onChangePremissas({
      ...premissas,
      [campo]: valor,
    });
  };

  return (
    <section
      aria-label="Premissas da simulação"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-2 mb-8"
    >
      {/* Botão sutil para abrir/recolher Premissas */}
      <div className="flex justify-center mb-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={aberto}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full border transition-all bg-[#17171c]/90 border-white/10 text-gray-300 hover:border-[#d4a52a]/50 hover:text-white backdrop-blur-md"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4a52a]" />
          <span>Premissas</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              aberto ? 'rotate-180 text-[#d4a52a]' : ''
            }`}
          />
        </button>
      </div>

      {aberto && (
        <div className="rounded-2xl p-5 sm:p-7 border transition-all bg-[#131317]/95 border-[#8a6414]/60 text-white shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#d4a52a]">
                Premissas da Simulação
              </h3>
              <p className="text-xs mt-0.5 text-gray-400">
                Ajuste os parâmetros do grupo de consórcio, ágio de venda, locação patrimonial e CDI.
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#d4a52a]/40 text-[#d4a52a] hover:bg-[#d4a52a]/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Crédito Inicial */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-credito-inicial"
                className="text-xs font-medium text-gray-300"
              >
                Crédito inicial (R$)
              </label>
              <input
                id="input-credito-inicial"
                type="number"
                min={10000}
                max={50000000}
                step={10000}
                value={premissas.creditoInicial}
                onChange={(e) => {
                  const val = Math.max(1000, Number(e.target.value) || 0);
                  atualizarCampo('creditoInicial', val);
                }}
                className="w-full rounded-lg px-3.5 py-2 text-sm font-semibold border bg-[#1c1c22] border-white/15 text-white focus:outline-none focus:border-[#d4a52a]"
              />
            </div>

            {/* 2. Prazo do grupo */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-prazo"
                className="text-xs font-medium text-gray-300"
              >
                Prazo do grupo (meses)
              </label>
              <input
                id="input-prazo"
                type="number"
                min={12}
                max={360}
                step={1}
                value={premissas.prazo}
                onChange={(e) => {
                  const val = Math.min(
                    360,
                    Math.max(12, Number(e.target.value) || PREMISSAS_PADRAO.prazo)
                  );
                  atualizarCampo('prazo', val);
                }}
                className="w-full rounded-lg px-3.5 py-2 text-sm font-semibold border bg-[#1c1c22] border-white/15 text-white focus:outline-none focus:border-[#d4a52a]"
              />
            </div>

            {/* 3. Taxa total (administração + fundo de reserva) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-taxa-total"
                className="text-xs font-medium text-gray-300"
              >
                Taxa total adm. + reserva (%)
              </label>
              <input
                id="input-taxa-total"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={Math.round(premissas.taxaTotal * 10000) / 100}
                onChange={(e) => {
                  const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                  atualizarCampo('taxaTotal', pct / 100);
                }}
                className="w-full rounded-lg px-3.5 py-2 text-sm font-semibold border bg-[#1c1c22] border-white/15 text-white focus:outline-none focus:border-[#d4a52a]"
              />
            </div>

            {/* 4. Reajuste anual */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-reajuste-anual"
                className="text-xs font-medium text-gray-300"
              >
                Reajuste anual a cada 12m (%)
              </label>
              <input
                id="input-reajuste-anual"
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={Math.round(premissas.reajusteAnual * 10000) / 100}
                onChange={(e) => {
                  const pct = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                  atualizarCampo('reajusteAnual', pct / 100);
                }}
                className="w-full rounded-lg px-3.5 py-2 text-sm font-semibold border bg-[#1c1c22] border-white/15 text-white focus:outline-none focus:border-[#d4a52a]"
              />
            </div>

            {/* 5. Percentual da parcela até a contemplação */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-meia-parcela"
                className="text-xs font-medium text-gray-300"
              >
                Parcela até contemplar (% da cheia)
              </label>
              <input
                id="input-meia-parcela"
                type="number"
                min={10}
                max={100}
                step={5}
                value={Math.round(premissas.percentualMeiaParcela * 10000) / 100}
                onChange={(e) => {
                  const pct = Math.max(10, Math.min(100, Number(e.target.value) || 50));
                  atualizarCampo('percentualMeiaParcela', pct / 100);
                }}
                className="w-full rounded-lg px-3.5 py-2 text-sm font-semibold border bg-[#1c1c22] border-white/15 text-white focus:outline-none focus:border-[#d4a52a]"
              />
            </div>

            {/* 6. Ágio de venda (10% a 40%) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-agio-venda"
                  className="text-xs font-medium text-gray-300"
                >
                  Ágio de venda (10% a 40%)
                </label>
                <span className="text-xs font-bold text-[#d4a52a]">
                  {(premissas.agioVenda * 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}%
                </span>
              </div>
              <input
                id="input-agio-venda"
                type="range"
                min={10}
                max={40}
                step={0.5}
                value={Math.round(premissas.agioVenda * 1000) / 10}
                onChange={(e) => {
                  const pct = Math.max(10, Math.min(40, Number(e.target.value) || 25));
                  atualizarCampo('agioVenda', pct / 100);
                }}
                className="w-full accent-[#d4a52a] h-2 bg-gray-700 rounded-lg cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>10%</span>
                <span>25,0%</span>
                <span>40%</span>
              </div>
            </div>

            {/* 7. Rentabilidade (% a.a. dividido mês a mês) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-rentabilidade-anual"
                  className="text-xs font-medium text-gray-300"
                >
                  Rentabilidade
                </label>
                <span className="text-[11px] font-semibold text-[#d4a52a]">
                  {(((premissas.rentabilidadeAnual ?? 0.1431) / 12) * 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}% ao mês
                </span>
              </div>
              <input
                id="input-rentabilidade-anual"
                type="number"
                min={1}
                max={50}
                step={0.01}
                value={Math.round((premissas.rentabilidadeAnual ?? 0.1431) * 10000) / 100}
                onChange={(e) => {
                  const pctAnual = Math.max(0.5, Math.min(100, Number(e.target.value) || 14.31));
                  atualizarCampo('rentabilidadeAnual', pctAnual / 100);
                }}
                className="w-full rounded-lg px-3.5 py-2 text-sm font-semibold border bg-[#1c1c22] border-white/15 text-white focus:outline-none focus:border-[#d4a52a]"
              />
              <span className="text-[10px] text-gray-400">
                Ao ano ({((premissas.rentabilidadeAnual ?? 0.1431) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a. ÷ 12 meses)
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
