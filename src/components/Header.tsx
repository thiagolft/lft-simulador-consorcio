import React from 'react';
import { LineChart, HelpCircle, FileDown } from 'lucide-react';
import logoLft from '../assets/logo-lft.png';

interface HeaderProps {
  onOpenIndicadores: () => void;
  onOpenAjuda: () => void;
  onOpenPdfModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIndicadores,
  onOpenAjuda,
  onOpenPdfModal,
}) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-3 sm:px-8 pt-4 pb-2">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Esquerda: Indicadores Financeiros */}
        <div className="flex-1 flex items-center justify-start gap-2 sm:gap-5">
          <button
            type="button"
            onClick={onOpenIndicadores}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#b88924] hover:text-[#d4a52a] transition-colors group px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <LineChart className="w-4 h-4 shrink-0 text-[#b88924] group-hover:text-[#d4a52a] transition-colors" />
            <span className="hidden xs:inline sm:inline">Indicadores Financeiros</span>
            <span className="xs:hidden sm:hidden">Indicadores</span>
          </button>
        </div>

        {/* Centro: Logo LFT inteira e sem cortes */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="flex items-center justify-center px-2 sm:px-3 py-1">
            <img
              src={logoLft}
              alt="LFT Consórcios"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain select-none"
            />
          </div>
        </div>

        {/* Direita: Gerar PDF + Ajuda */}
        <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white gold-pill px-3 sm:px-3.5 py-1.5 rounded-lg shadow hover:brightness-110 active:scale-95 transition-all"
            title="Gerar Proposta estruturada em PDF para enviar ao cliente"
          >
            <FileDown className="w-4 h-4 shrink-0 text-white" />
            <span className="hidden sm:inline">Gerar PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            type="button"
            onClick={onOpenAjuda}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#b88924] hover:text-[#d4a52a] transition-colors group px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-[#b88924] group-hover:text-[#d4a52a] transition-colors" />
            <span className="hidden sm:inline">Ajuda</span>
          </button>
        </div>
      </div>
    </header>
  );
};
