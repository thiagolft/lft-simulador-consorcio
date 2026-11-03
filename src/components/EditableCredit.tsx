import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import { formatarMoeda } from '../lib/consorcio';

interface EditableCreditProps {
  credito: number;
  prazo: number;
  onChangeCredito: (novoCredito: number) => void;
  onSelectPresetGrupo?: (credito: number, prazo: number) => void;
}

const GRUPOS_OPORTUNIDADE = [
  { label: 'Cota R$ 100 mil (180m)', credito: 100000, prazo: 180 },
  { label: 'Cota R$ 200 mil (200m)', credito: 200000, prazo: 200 },
  { label: '2x R$ 200 mil (R$ 400 mil)', credito: 400000, prazo: 200 },
  { label: 'Cota R$ 500 mil (220m)', credito: 500000, prazo: 220 },
];

export const EditableCredit: React.FC<EditableCreditProps> = ({
  credito,
  prazo,
  onChangeCredito,
  onSelectPresetGrupo,
}) => {
  const [editando, setEditando] = useState(false);
  const [textoInput, setTextoInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editando]);

  const iniciarEdicao = () => {
    setTextoInput(
      credito.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
    setEditando(true);
  };

  const confirmarEdicao = () => {
    const limpo = textoInput.trim().replace(/[R$\s]/g, '');
    let valorNumerico: number;

    if (limpo.includes(',')) {
      valorNumerico = parseFloat(limpo.replace(/\./g, '').replace(',', '.'));
    } else {
      const partes = limpo.split('.');
      if (partes.length > 1 && partes[partes.length - 1].length === 3) {
        valorNumerico = parseFloat(limpo.replace(/\./g, ''));
      } else {
        valorNumerico = parseFloat(limpo);
      }
    }

    if (!isNaN(valorNumerico) && valorNumerico >= 1000) {
      const limitado = Math.min(100000000, Math.round(valorNumerico * 100) / 100);
      onChangeCredito(limitado);
    }
    setEditando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      confirmarEdicao();
    } else if (e.key === 'Escape') {
      setEditando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4 mb-2">
      {!editando ? (
        <button
          type="button"
          onClick={iniciarEdicao}
          title="Clique para editar o valor do crédito"
          className="group inline-flex items-baseline gap-2 px-3 py-1 rounded-lg transition-all border border-transparent hover:border-[#d4a52a]/40 hover:bg-white/[0.03]"
        >
          <span className="text-lg sm:text-xl font-normal text-gray-300">
            Crédito:
          </span>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#d4a52a] transition-colors">
            {formatarMoeda(credito)}
          </span>
          <Pencil className="w-3.5 h-3.5 text-[#d4a52a] opacity-0 group-hover:opacity-100 transition-opacity self-center ml-0.5" />
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 bg-[#1a1a1f] border border-[#d4a52a] rounded-lg px-3 py-1 shadow-lg">
          <span className="text-base sm:text-lg font-normal text-gray-300">
            Crédito: R$
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
            onBlur={confirmarEdicao}
            onKeyDown={handleKeyDown}
            aria-label="Editar valor do crédito"
            className="w-36 sm:w-44 bg-transparent text-white text-lg sm:text-xl font-bold focus:outline-none border-b border-[#d4a52a]/60 pb-0.5"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              confirmarEdicao();
            }}
            className="p-1 rounded bg-[#d4a52a]/20 text-[#d4a52a] hover:bg-[#d4a52a]/30 transition-colors"
            title="Confirmar valor"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Atalhos rápidos dos Grupos Oportunidade apresentados na aula */}
      {onSelectPresetGrupo && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
          {GRUPOS_OPORTUNIDADE.map((g) => {
            const ativo = credito === g.credito && prazo === g.prazo;
            return (
              <button
                key={g.label}
                type="button"
                onClick={() => onSelectPresetGrupo(g.credito, g.prazo)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all border ${
                  ativo
                    ? 'bg-[#d4a52a]/20 border-[#d4a52a]/70 text-[#f3c653]'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/25'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
