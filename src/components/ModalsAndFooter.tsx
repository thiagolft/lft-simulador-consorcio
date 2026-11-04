import React, { useMemo } from 'react';
import { X, LineChart as LineChartIcon, HelpCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  PremissasConsorcio,
  gerarSerieCompleta,
  formatarMoeda,
  formatarPercentual,
} from '../lib/consorcio';

interface IndicadoresModalProps {
  aberto: boolean;
  onClose: () => void;
  premissas: PremissasConsorcio;
  mesAtual: number;
}

export const IndicadoresModal: React.FC<IndicadoresModalProps> = ({
  aberto,
  onClose,
  premissas,
  mesAtual,
}) => {
  const serie = useMemo(
    () => (aberto ? gerarSerieCompleta(premissas) : []),
    [aberto, premissas]
  );

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Indicadores Financeiros e Evolução"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl rounded-2xl border p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto bg-[#131317] border-[#8a6414] text-white">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <LineChartIcon className="w-5 h-5 text-[#d4a52a]" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
              Indicadores Financeiros &amp; Curva de Evolução
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cards de indicadores de referência */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-black/25 border border-white/10">
            <div className="text-[11px] text-gray-400">Reajuste Anual Grupo</div>
            <div className="text-base font-bold text-[#d4a52a] mt-0.5">
              {formatarPercentual(premissas.reajusteAnual * 100, 1)} a.a.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/25 border border-white/10">
            <div className="text-[11px] text-gray-400">Taxa Diluída Mensal</div>
            <div className="text-base font-bold text-[#d4a52a] mt-0.5">
              {formatarPercentual(
                ((premissas.taxaTotal * premissas.percentualMeiaParcela) /
                  premissas.prazo) *
                  100,
                3
              )}{' '}
              a.m.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/25 border border-white/10">
            <div className="text-[11px] text-gray-400">Ágio de Venda</div>
            <div className="text-base font-bold text-[#d4a52a] mt-0.5">
              {formatarPercentual(premissas.agioVenda * 100, 1)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/25 border border-white/10">
            <div className="text-[11px] text-gray-400">Mês Selecionado</div>
            <div className="text-base font-bold text-white mt-0.5">
              {mesAtual}º de {premissas.prazo} meses
            </div>
          </div>
        </div>

        {/* Gráfico Recharts */}
        <div className="h-72 sm:h-80 w-full bg-black/20 rounded-xl p-3 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={serie}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradVenda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a52a" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#d4a52a" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="mes"
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(v) => `${v}m`}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181c',
                  borderColor: '#8a6414',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatarMoeda(value)}
                labelFormatter={(label) => `Contemplação no ${label}º mês`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <ReferenceLine
                x={mesAtual}
                stroke="#ffffff"
                strokeDasharray="4 4"
                label={{
                  value: `${mesAtual}º mês`,
                  fill: '#ffffff',
                  fontSize: 11,
                  position: 'top',
                }}
              />
              <Area
                type="monotone"
                dataKey="creditoCorrigido"
                name="Crédito Corrigido"
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="valorVenda"
                name="Valor da Venda"
                stroke="#d4a52a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradVenda)"
              />
              <Area
                type="monotone"
                dataKey="totalInvestido"
                name="Total Investido"
                stroke="#94a3b8"
                strokeWidth={2}
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="lucro"
                name="Lucro Líquido Venda"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradLucro)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface AjudaModalProps {
  aberto: boolean;
  onClose: () => void;
}

export const AjudaModal: React.FC<AjudaModalProps> = ({ aberto, onClose }) => {
  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ajuda do Simulador"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl rounded-2xl border p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto bg-[#131317] border-[#8a6414] text-white">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#d4a52a]" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
              Guia das 5 Réguas de Simulação — LFT Consórcios
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar ajuda"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-gray-300">
          <p>
            O simulador reúne as <strong>5 réguas estratégicas</strong> para transformar uma carta de consórcio em lucro ou patrimônio em qualquer momento da contemplação:
          </p>

          <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 space-y-2.5">
            <div>
              <strong className="text-[#f3c653]">1. Venda Contemplada (Alavancagem Financeira):</strong>{' '}
              Projeta o ágio de comercialização da carta contemplada no mercado secundário (padrão 25,0% sobre o crédito corrigido), descontando as meias parcelas pagas até o mês escolhido.
            </div>
            <div>
              <strong className="text-[#f3c653]">2. Alavancagem Patrimonial (Imóveis &amp; Renda Passiva):</strong>{' '}
              Simula a compra de imóvel gerador de renda (14,31% a.a. / 1,1925% a.m.) onde o próprio aluguel paga a parcela pós-contemplação (com residual diluído no prazo restante) e ainda gera sobra mensal no bolso. Inclui a opção de meia parcela pós-contemplação (meio crédito) e valorização do imóvel até a quitação.
            </div>
            <div>
              <strong className="text-[#f3c653]">3. Consórcio vs. Renda Fixa:</strong>{' '}
              Compara guardar o mesmo valor de parcela mensal na Renda Fixa (14,31% a.a. / 1,1925% a.m.) versus a evolução do Crédito Corrigido do consórcio (5% a.a.), demonstrando a proteção contra a perda de poder de compra imobiliário.
            </div>
            <div>
              <strong className="text-[#f3c653]">4. Contemplada Aplicada (14,31% ao ano):</strong>{' '}
              Simula manter o crédito contemplado rendendo na administradora (14,31% ao ano / 1,1925% ao mês) por um período escolhido (ex: 40 meses) ou até o encerramento do grupo (220 meses), com resgate em espécie ao final.
            </div>
            <div>
              <strong className="text-[#f3c653]">5. Fidelidade &amp; Multi-Cotas:</strong>{' '}
              Demonstra o desbloqueio progressivo das 6 modalidades de contemplação (Sorteio, Lance Fixo Embutido 30%, Fidelidades 6m, 12m, 18m e 24m) e a multiplicação de chances mensais em carteiras multi-cotas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
