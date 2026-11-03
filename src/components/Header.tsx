import React from 'react';
import { LineChart, HelpCircle } from 'lucide-react';
import logoLft from '../assets/logo-lft.png';

interface HeaderProps {
  onOpenIndicadores: () => void;
  onOpenAjuda: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIndicadores,
  onOpenAjuda,
}) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-2">
      <div className="flex items-center justify-between gap-4">
        {/* Esquerda: Indicadores Financeiros */}
        <div className="flex-1 flex items-center justify-start gap-3 sm:gap-5">
          <button
            type="button"
            onClick={onOpenIndicadores}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#b88924] hover:text-[#d4a52a] transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <LineChart className="w-4 h-4 shrink-0 text-[#b88924] group-hover:text-[#d4a52a] transition-colors" />
            <span>Indicadores Financeiros</span>
          </button>
        </div>

        {/* Centro: Logo LFT inteira e sem cortes */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="flex items-center justify-center px-3 py-1">
            <img
              src={logoLft}
              alt="LFT Consórcios"
              className="h-11 sm:h-14 md:h-16 w-auto object-contain select-none"
            />
          </div>
        </div>

        {/* Direita: Ajuda */}
        <div className="flex-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onOpenAjuda}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#b88924] hover:text-[#d4a52a] transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-[#b88924] group-hover:text-[#d4a52a] transition-colors" />
            <span>Ajuda</span>
          </button>
        </div>
      </div>
    </header>
  );
};
