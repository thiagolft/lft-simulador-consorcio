import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, Table2, List, ChevronDown } from 'lucide-react';
import {
  TABELA_IMOVEL_HS,
  formatarMoeda,
  obterItemTabelaHS,
} from '../lib/consorcio';

interface EditableCreditProps {
  credito: number;
  prazo: number;
  onChangeCredito: (novoCredito: number) => void;
  onSelectPresetGrupo?: (credito: number, prazo: number) => void;
}

export const EditableCredit: React.FC<EditableCreditProps> = ({
  credito,
  prazo,
  onChangeCredito,
  onSelectPresetGrupo,
}) => {
  const [editando, setEditando] = useState(false);
  const [textoInput, setTextoInput] = useState('');
  const [painelTabelaAberto, setPainelTabelaAberto] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState<'tabela' | 'lista'>('tabela');
  const inputRef = useRef<HTMLInputElement>(null);

  const itemAtualHS = obterItemTabelaHS(credito, prazo);

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

  const selecionarPlano = (c: number, p: number) => {
    if (onSelectPresetGrupo) {
      onSelectPresetGrupo(c, p);
    } else {
      onChangeCredito(c);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4 mb-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
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
            {itemAtualHS && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#d4a52a]/20 border border-[#d4a52a]/50 text-[#f3c653] self-center">
                {itemAtualHS.descricao} ({itemAtualHS.prazo}x)
              </span>
            )}
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

        <button
          type="button"
          onClick={() => setPainelTabelaAberto((prev) => !prev)}
          aria-expanded={painelTabelaAberto}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            painelTabelaAberto
              ? 'bg-[#d4a52a]/25 border-[#d4a52a] text-[#f3c653]'
              : 'bg-[#17171c]/90 border-white/15 text-gray-300 hover:border-[#d4a52a]/60 hover:text-white'
          }`}
        >
          <Table2 className="w-3.5 h-3.5 text-[#d4a52a]" />
          <span>Tabela IMÓVEL HS</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              painelTabelaAberto ? 'rotate-180 text-[#d4a52a]' : ''
            }`}
          />
        </button>
      </div>

      {/* Atalhos rápidos de todos os planos IMÓVEL HS 100 a HS 1100 */}
      {onSelectPresetGrupo && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-w-4xl px-2">
          {TABELA_IMOVEL_HS.map((g) => {
            const ativo = credito === g.credito && prazo === g.prazo;
            return (
              <button
                key={g.descricao}
                type="button"
                onClick={() => selecionarPlano(g.credito, g.prazo)}
                title={`${g.descricao} — Crédito: ${formatarMoeda(g.credito)} (${g.prazo}x) | 1/2 Parcela: ${formatarMoeda(g.meiaParcela)}`}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all border ${
                  ativo
                    ? 'bg-[#d4a52a]/25 border-[#d4a52a] text-[#f3c653] shadow-sm'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/25'
                }`}
              >
                {g.descricao.replace('IMÓVEL ', '')} ({g.prazo}x)
              </button>
            );
          })}
        </div>
      )}

      {/* Painel recolhível com a Tabela Completa e o Formato em Lista */}
      {painelTabelaAberto && (
        <div className="w-full max-w-4xl mt-3 rounded-2xl p-4 sm:p-5 border bg-[#131318]/95 border-[#8a6414]/60 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f3c653]">
                Tabela de Créditos — IMÓVEL HS (100 a 1100)
              </h3>
              <p className="text-[11px] text-gray-400">
                Clique em qualquer linha para carregar o crédito, prazo e parcelas na simulação.
              </p>
            </div>

            <div className="inline-flex items-center rounded-lg p-0.5 bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setModoVisualizacao('tabela')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modoVisualizacao === 'tabela'
                    ? 'bg-[#d4a52a]/25 text-[#f3c653] border border-[#d4a52a]/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVisualizacao('lista')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modoVisualizacao === 'lista'
                    ? 'bg-[#d4a52a]/25 text-[#f3c653] border border-[#d4a52a]/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          {modoVisualizacao === 'tabela' ? (
            <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-white/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-black/60 text-[#f3c653] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Descrição</th>
                    <th className="py-2.5 px-3 font-semibold">Crédito</th>
                    <th className="py-2.5 px-3 font-semibold">Prazo</th>
                    <th className="py-2.5 px-3 font-semibold">Parcela Integral</th>
                    <th className="py-2.5 px-3 font-semibold">1/2 Parcela</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {TABELA_IMOVEL_HS.map((item) => {
                    const selecionado =
                      credito === item.credito && prazo === item.prazo;
                    return (
                      <tr
                        key={item.descricao}
                        onClick={() => {
                          selecionarPlano(item.credito, item.prazo);
                          setPainelTabelaAberto(false);
                        }}
                        className={`cursor-pointer transition-colors ${
                          selecionado
                            ? 'bg-[#d4a52a]/20 text-white font-semibold'
                            : 'hover:bg-white/[0.04] text-gray-300'
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-white">
                          {item.descricao}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {formatarMoeda(item.credito)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {item.prazo} meses
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {formatarMoeda(item.parcelaIntegral)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-[#f3c653]">
                          {formatarMoeda(item.meiaParcela)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="space-y-1.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {TABELA_IMOVEL_HS.map((item) => {
                const selecionado =
                  credito === item.credito && prazo === item.prazo;
                return (
                  <li key={item.descricao}>
                    <button
                      type="button"
                      onClick={() => {
                        selecionarPlano(item.credito, item.prazo);
                        setPainelTabelaAberto(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors flex flex-wrap items-center justify-between gap-2 ${
                        selecionado
                          ? 'bg-[#d4a52a]/20 border-[#d4a52a] text-white'
                          : 'bg-black/25 border-white/5 text-gray-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <span>
                        <strong className="text-white">{item.descricao}</strong> — Crédito:{' '}
                        {formatarMoeda(item.credito)} ({item.prazo}x)
                      </span>
                      <span className="font-bold text-[#f3c653]">
                        1/2 Parcela: {formatarMoeda(item.meiaParcela)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
