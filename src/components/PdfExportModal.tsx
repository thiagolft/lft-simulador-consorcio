import React, { useState, useEffect } from 'react';
import {
  FileDown,
  X,
  User,
  Briefcase,
  Phone,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  PremissasConsorcio,
  ResultadoSimulacaoMes,
  TipoRegua,
  formatarMoeda,
  formatarPercentual,
} from '../lib/consorcio';
import { gerarPropostaPdf } from '../lib/pdfGenerator';

interface PdfExportModalProps {
  aberto: boolean;
  onClose: () => void;
  reguaAtiva: TipoRegua;
  mesSelecionado: number;
  numeroCotas: number;
  premissas: PremissasConsorcio;
  resultadoAtual: ResultadoSimulacaoMes;
}

const STORAGE_KEY_CONSULTOR = 'lft_simulador_consultor_info';

const LABELS_REGUA: Record<TipoRegua, string> = {
  venda: 'Venda Contemplada (Alavancagem Financeira)',
  patrimonial: 'Alavancagem Patrimonial (Imóveis & Locação)',
  renda_fixa: 'Consórcio vs. Renda Fixa',
  aplicada: 'Contemplada Aplicada (14,31% ao ano)',
  fidelidade: 'Fidelidade & Carteira Multi-Cotas',
};

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  aberto,
  onClose,
  reguaAtiva,
  mesSelecionado,
  numeroCotas,
  premissas,
  resultadoAtual,
}) => {
  const [nomeCliente, setNomeCliente] = useState('');
  const [nomeConsultor, setNomeConsultor] = useState('');
  const [contatoConsultor, setContatoConsultor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [modoRelatorio, setModoRelatorio] = useState<'completo' | 'regua_atual'>(
    'completo'
  );
  const [gerando, setGerando] = useState(false);

  // Carrega dados do consultor salvos anteriormente no navegador
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CONSULTOR);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.nomeConsultor) setNomeConsultor(parsed.nomeConsultor);
        if (parsed.contatoConsultor) setContatoConsultor(parsed.contatoConsultor);
      }
    } catch {
      // ignora erro de localStorage
    }
  }, []);

  if (!aberto) return null;

  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setGerando(true);
    try {
      try {
        localStorage.setItem(
          STORAGE_KEY_CONSULTOR,
          JSON.stringify({ nomeConsultor, contatoConsultor })
        );
      } catch {
        // ignora erro de localStorage
      }

      await gerarPropostaPdf({
        nomeCliente,
        nomeConsultor,
        contatoConsultor,
        observacoes,
        modoRelatorio,
        reguaAtiva,
        mesSelecionado,
        numeroCotas,
        premissas,
        resultadoAtual,
      });

      onClose();
    } finally {
      setGerando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Exportar Proposta em PDF"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl rounded-2xl border p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto bg-[#131318] border-[#8a6414] text-white">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gold-pill flex items-center justify-center text-white shadow">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
                Gerar Proposta em PDF
              </h2>
              <p className="text-[11px] text-gray-400">
                Documento estruturado pronto para enviar ao cliente no WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de PDF"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Cenário Atual que irá para o PDF */}
        <div className="mb-4 p-3.5 rounded-xl bg-black/35 border border-[#8a6414]/40">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#f3c653] font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Resumo Configurado na Tela
            </span>
            <span>{mesSelecionado}º Mês de Contemplação</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-gray-400">Crédito Inicial</div>
              <div className="font-bold text-white mt-0.5">
                {formatarMoeda(premissas.creditoInicial)}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-gray-400">Meia Parcela</div>
              <div className="font-bold text-white mt-0.5">
                {formatarMoeda(resultadoAtual.meiaParcela)}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-gray-400">Total Investido</div>
              <div className="font-bold text-white mt-0.5">
                {formatarMoeda(resultadoAtual.totalInvestido)}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-gray-400">Lucro Venda</div>
              <div className="font-bold text-emerald-400 mt-0.5">
                {formatarMoeda(resultadoAtual.lucro)}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-300">
            <span>
              Destaque: <strong className="text-white">{LABELS_REGUA[reguaAtiva]}</strong>
            </span>
            <span>
              Rentabilidade: <strong className="text-[#f3c653]">{formatarPercentual((premissas.rentabilidadeAnual ?? 0.1431) * 100, 2)} a.a.</strong>
            </span>
          </div>
        </div>

        {/* Formulário de Personalização da Proposta */}
        <form onSubmit={handleGerarPdf} className="space-y-3.5">
          <div>
            <label
              htmlFor="pdf-nome-cliente"
              className="block text-xs font-medium text-gray-300 mb-1"
            >
              Nome do Cliente <span className="text-gray-500">(opcional)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="pdf-nome-cliente"
                type="text"
                placeholder="Ex: João Henrique Silva"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[#0f0f13] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a52a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="pdf-nome-consultor"
                className="block text-xs font-medium text-gray-300 mb-1"
              >
                Consultor(a) LFT <span className="text-gray-500">(salvo auto.)</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="pdf-nome-consultor"
                  type="text"
                  placeholder="Ex: Thiago — Especialista LFT"
                  value={nomeConsultor}
                  onChange={(e) => setNomeConsultor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[#0f0f13] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a52a]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="pdf-contato-consultor"
                className="block text-xs font-medium text-gray-300 mb-1"
              >
                WhatsApp / Contato <span className="text-gray-500">(opcional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="pdf-contato-consultor"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={contatoConsultor}
                  onChange={(e) => setContatoConsultor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[#0f0f13] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a52a]"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="pdf-observacoes"
              className="block text-xs font-medium text-gray-300 mb-1"
            >
              Nota ou Observação para o Cliente{' '}
              <span className="text-gray-500">(opcional)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                id="pdf-observacoes"
                type="text"
                maxLength={125}
                placeholder="Ex: Condição exclusiva para o grupo em andamento com meia parcela."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[#0f0f13] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a52a]"
              />
            </div>
          </div>

          {/* Seleção do Tipo de Relatório */}
          <div>
            <span className="block text-xs font-medium text-gray-300 mb-1.5">
              Estrutura do Documento PDF
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setModoRelatorio('completo')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  modoRelatorio === 'completo'
                    ? 'bg-[#d4a52a]/15 border-[#d4a52a] text-white'
                    : 'bg-black/25 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    modoRelatorio === 'completo'
                      ? 'text-[#f3c653]'
                      : 'text-gray-600'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-white">
                    Dossiê Completo LFT (Recomendado)
                  </div>
                  <div className="text-[11px] text-gray-400 leading-snug mt-0.5">
                    Destaca a régua atual + comparativo das 4 estratégias, tabela de marcos e modalidades.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setModoRelatorio('regua_atual')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  modoRelatorio === 'regua_atual'
                    ? 'bg-[#d4a52a]/15 border-[#d4a52a] text-white'
                    : 'bg-black/25 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    modoRelatorio === 'regua_atual'
                      ? 'text-[#f3c653]'
                      : 'text-gray-600'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-white">
                    Resumido (1 Página Executiva)
                  </div>
                  <div className="text-[11px] text-gray-400 leading-snug mt-0.5">
                    Gera rigorosamente 1 única página com os resultados e a tabela de evolução.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={gerando}
              className="gold-pill px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{gerando ? 'Gerando PDF...' : 'Baixar Proposta em PDF'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

