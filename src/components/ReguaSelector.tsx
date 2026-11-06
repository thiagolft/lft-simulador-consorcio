import React from 'react';
import {
  Banknote,
  Building2,
  Scale,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { TipoRegua } from '../lib/consorcio';

interface ReguaSelectorProps {
  reguaAtiva: TipoRegua;
  onSelectRegua: (regua: TipoRegua) => void;
}

const REGUAS: {
  id: TipoRegua;
  label: string;
  shortLabel: string;
  sublabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'venda',
    label: 'Venda Contemplada',
    shortLabel: 'Venda',
    sublabel: 'Alavancagem Financeira',
    icon: Banknote,
  },
  {
    id: 'patrimonial',
    label: 'Alavancagem Patrimonial',
    shortLabel: 'Patrimonial',
    sublabel: 'Imóveis & Renda Passiva',
    icon: Building2,
  },
  {
    id: 'renda_fixa',
    label: 'Consórcio vs. Renda Fixa',
    shortLabel: 'vs. Renda Fixa',
    sublabel: 'Poder de Compra & Inflação',
    icon: Scale,
  },
  {
    id: 'aplicada',
    label: 'Contemplada Aplicada',
    shortLabel: 'Aplicada',
    sublabel: '14,31% ao ano',
    icon: TrendingUp,
  },
  {
    id: 'fidelidade',
    label: 'Fidelidade & Multi-Cotas',
    shortLabel: 'Fidelidade',
    sublabel: '6 Modalidades de Contemplação',
    icon: Trophy,
  },
];

export const ReguaSelector: React.FC<ReguaSelectorProps> = ({
  reguaAtiva,
  onSelectRegua,
}) => {
  return (
    <nav
      aria-label="Seleção de régua de simulação"
      className="w-full max-w-5xl mx-auto mb-3 sm:mb-4 md:mb-5"
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5">
        {REGUAS.map((item) => {
          const Icon = item.icon;
          const ativo = reguaAtiva === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRegua(item.id)}
              aria-pressed={ativo}
              className={`group flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs md:text-[13px] font-medium transition-all border touch-manipulation ${
                ativo
                  ? 'gold-pill text-white border-[#d4a52a] shadow-[0_0_20px_rgba(212,165,42,0.25)]'
                  : 'bg-[#131318]/85 border-white/10 text-gray-300 hover:border-[#8a6414]/60 hover:text-white active:scale-95'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                  ativo
                    ? 'text-[#f3c653]'
                    : 'text-[#b88924] group-hover:text-[#d4a52a]'
                }`}
              />
              <span className="whitespace-nowrap sm:hidden">{item.shortLabel}</span>
              <span className="whitespace-nowrap hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
