import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Calculator,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Building2,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import {
  PremissasConsorcio,
  ResultadoSimulacaoMes,
  TipoRegua,
  calcularAlavancagemPatrimonial,
  calcularContempladaAplicada,
  calcularModalidadesFidelidade,
  calcularMeiaParcela,
  calcularParcelaCheia,
  obterRentabilidadeMensal,
  formatarMoeda,
  formatarPercentual,
  round2,
} from '../lib/consorcio';

interface ResultsBoxProps {
  resultado: ResultadoSimulacaoMes;
  premissas: PremissasConsorcio;
  reguaAtiva: TipoRegua;
  numeroCotas: number;
  onChangeNumeroCotas: (cotas: number) => void;
  onChangeMes?: (mes: number) => void;
  premissasAbertas: boolean;
  onTogglePremissas: () => void;
  onOpenPdfModal?: () => void;
}

export const ResultsBox: React.FC<ResultsBoxProps> = React.memo(
  ({
    resultado,
    premissas,
    reguaAtiva,
    numeroCotas,
    onChangeNumeroCotas,
    onChangeMes,
    premissasAbertas,
    onTogglePremissas,
    onOpenPdfModal,
  }) => {
    // Estado compartilhado: detalhe da parcela corrigida antes da contemplação
    const [detalheParcelaAberto, setDetalheParcelaAberto] = useState(false);

    // Estados Régua 1 (Venda)
    const [nominalAberto, setNominalAberto] = useState(false);
    const [cetAberto, setCetAberto] = useState(false);
    const [usarLanceEmbutidoVenda, setUsarLanceEmbutidoVenda] = useState(false);

    // Estados Régua 2 (Patrimonial)
    const [usarMeioCredito, setUsarMeioCredito] = useState(false);
    const [mostrarValorizacaoImovel, setMostrarValorizacaoImovel] = useState(false);

    // Estados Régua 4 (Contemplada Aplicada)
    const [modoPrazoAplicada, setModoPrazoAplicada] = useState<'fim_grupo' | 'custom'>('fim_grupo');
    const [mesesCustomAplicada, setMesesCustomAplicada] = useState(40);

    const pctEmbutido = premissas.percentualLanceEmbutido ?? 0.3;
    const fatorEmbutido = usarLanceEmbutidoVenda ? 1 - pctEmbutido : 1;

    const creditoVendaExibido = resultado.creditoCorrigido * fatorEmbutido;
    const valorVendaExibido = resultado.valorVenda * fatorEmbutido;
    const lucroVendaExibido = valorVendaExibido - resultado.totalInvestido;

    const patrimonialCalc = useMemo(
      () =>
        reguaAtiva === 'patrimonial'
          ? calcularAlavancagemPatrimonial(resultado.mes, premissas, usarMeioCredito)
          : resultado.patrimonial,
      [reguaAtiva, resultado.mes, resultado.patrimonial, premissas, usarMeioCredito]
    );

    const aplicadaCalc = useMemo(
      () =>
        reguaAtiva === 'aplicada' && modoPrazoAplicada === 'custom'
          ? calcularContempladaAplicada(resultado.mes, premissas, mesesCustomAplicada)
          : resultado.aplicada,
      [reguaAtiva, modoPrazoAplicada, resultado.mes, resultado.aplicada, premissas, mesesCustomAplicada]
    );

    const fidelidadeCalc = useMemo(
      () =>
        reguaAtiva === 'fidelidade'
          ? calcularModalidadesFidelidade(resultado.mes, numeroCotas, premissas)
          : null,
      [reguaAtiva, resultado.mes, numeroCotas, premissas]
    );

    const meiaParcelaInicial = useMemo(
      () => round2(calcularMeiaParcela(1, premissas)),
      [premissas]
    );
    const parcelaCheiaInicial = useMemo(
      () => round2(calcularParcelaCheia(1, premissas)),
      [premissas]
    );

    // Anima os valores da aba ativa
    const v1Target =
      reguaAtiva === 'venda'
        ? creditoVendaExibido
        : reguaAtiva === 'patrimonial'
        ? patrimonialCalc.creditoDisponivel
        : reguaAtiva === 'fidelidade' && fidelidadeCalc
        ? fidelidadeCalc.creditoTotalCarteira
        : resultado.creditoCorrigido;

    const vMeiaParcelaTarget =
      reguaAtiva === 'fidelidade' && fidelidadeCalc
        ? fidelidadeCalc.parcelaMensalCarteira
        : resultado.meiaParcela;

    const v2Target =
      reguaAtiva === 'fidelidade'
        ? round2(resultado.totalInvestido * numeroCotas)
        : resultado.totalInvestido;

    const v3Target =
      reguaAtiva === 'venda'
        ? valorVendaExibido
        : reguaAtiva === 'patrimonial'
        ? patrimonialCalc.aluguelMensal
        : reguaAtiva === 'renda_fixa'
        ? resultado.rendaFixa.montanteRendaFixa
        : reguaAtiva === 'aplicada'
        ? aplicadaCalc.montanteFinalPrazoEscolhido
        : fidelidadeCalc
        ? fidelidadeCalc.lucroVendaTotalCarteira
        : 0;

    const v4Target =
      reguaAtiva === 'venda'
        ? lucroVendaExibido
        : reguaAtiva === 'patrimonial'
        ? patrimonialCalc.parcelaPosContemplacao
        : reguaAtiva === 'renda_fixa'
        ? resultado.rendaFixa.vantagemConsorcio
        : reguaAtiva === 'aplicada'
        ? aplicadaCalc.montanteFinalFimDoGrupo
        : 0;

    const anim1 = useAnimatedNumber(v1Target, 150);
    const animMeiaParcela = useAnimatedNumber(vMeiaParcelaTarget, 150);
    const anim2 = useAnimatedNumber(v2Target, 150);
    const anim3 = useAnimatedNumber(v3Target, 150);
    const anim4 = useAnimatedNumber(v4Target, 150);

    const renderPainelDetalheParcela = () => {
      if (!detalheParcelaAberto) return null;
      const mult = reguaAtiva === 'fidelidade' ? numeroCotas : 1;
      return (
        <div className="mt-4 rounded-xl p-4 border text-xs bg-[#17171c] border-[#d4a52a]/50 text-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <span className="font-semibold uppercase tracking-wider text-[#f3c653]">
              Detalhamento da Parcela Corrigida Antes da Contemplação ({resultado.mes}º Mês
              {mult > 1 ? ` • ${mult} Cotas` : ''})
            </span>
            <span className="text-[11px] text-gray-400">
              Reajustes anuais aplicados: {resultado.nominal.numeroReajustes} (
              {formatarPercentual((resultado.nominal.fatorCorrecao - 1) * 100, 1)})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
              <div className="text-[11px] text-gray-400">
                1/2 Parcela Inicial (1º ao 12º mês)
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatarMoeda(round2(meiaParcelaInicial * mult))}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/30 border border-[#d4a52a]/40">
              <div className="text-[11px] text-[#f3c653]">
                Meia Parcela Corrigida ({resultado.mes}º mês)
              </div>
              <div className="text-sm font-bold text-[#f3c653] mt-0.5">
                {formatarMoeda(round2(resultado.meiaParcela * mult))}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
              <div className="text-[11px] text-gray-400">
                Parcela Integral Corrigida ({resultado.mes}º mês)
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatarMoeda(round2(resultado.parcelaCheia * mult))}
                <span className="block text-[10px] font-normal text-gray-400">
                  Inicial (1º ano): {formatarMoeda(round2(parcelaCheiaInicial * mult))}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
              <div className="text-[11px] text-gray-400">
                Total Pago até Contemplar ({resultado.mes}x)
              </div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {formatarMoeda(round2(resultado.totalInvestido * mult))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <section
        aria-label="Resultados da simulação"
        className="w-full max-w-5xl mx-auto px-3 sm:px-6 mt-1 mb-10"
      >
        <div className="relative gold-border-box rounded-2xl px-4 sm:px-7 md:px-9 pt-6 sm:pt-7 pb-11 bg-[#111115]/95">
          {/* =========================================================
              RÉGUA 1: VENDA CONTEMPLADA (ALAVANCAGEM FINANCEIRA)
             ========================================================= */}
          {reguaAtiva === 'venda' && (
            <>
              <h2 className="text-center text-lg sm:text-xl md:text-2xl font-normal tracking-wider uppercase mb-5 sm:mb-6 text-white">
                RESULTADOS
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 items-stretch">
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Crédito:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium tracking-tight whitespace-nowrap">
                      {formatarMoeda(anim1)}
                    </span>
                  </div>
                </div>

                {/* Botão Meia Parcela Corrigida antes da contemplação (ao lado depois do Crédito) */}
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Meia Parcela Corrigida:
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetalheParcelaAberto((p) => !p)}
                    title="Clique para ver o detalhamento da parcela corrigida antes da contemplação"
                    className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center gap-1 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium tracking-tight whitespace-nowrap">
                      {formatarMoeda(animMeiaParcela)}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#f3c653] shrink-0 transition-transform ${
                        detalheParcelaAberto ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Total investido:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium tracking-tight whitespace-nowrap">
                      {formatarMoeda(anim2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Valor da venda:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium tracking-tight whitespace-nowrap">
                      {formatarMoeda(anim3)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full col-span-2 sm:col-span-1">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Lucro:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span
                      className={`text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium tracking-tight whitespace-nowrap ${
                        lucroVendaExibido >= 0 ? 'text-white' : 'text-red-300'
                      }`}
                    >
                      {formatarMoeda(anim4)}
                    </span>
                  </div>
                </div>
              </div>

              {renderPainelDetalheParcela()}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setUsarLanceEmbutidoVenda((p) => !p)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    usarLanceEmbutidoVenda
                      ? 'bg-[#d4a52a]/20 border-[#d4a52a] text-[#f3c653]'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a52a]" />
                  <span>
                    Simular Contemplação por Lance Embutido ({Math.round(pctEmbutido * 100)}% descontado da carta)
                  </span>
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto w-full">
                  <button
                    type="button"
                    onClick={() => setNominalAberto((prev) => !prev)}
                    aria-expanded={nominalAberto}
                    className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white hover:text-[#d4a52a] hover:bg-white/[0.03] transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        nominalAberto ? 'rotate-180 text-[#d4a52a]' : ''
                      }`}
                    />
                    <span>Nominal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCetAberto((prev) => !prev)}
                    aria-expanded={cetAberto}
                    className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white hover:text-[#d4a52a] hover:bg-white/[0.03] transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        cetAberto ? 'rotate-180 text-[#d4a52a]' : ''
                      }`}
                    />
                    <span>CET</span>
                  </button>
                </div>

                {nominalAberto && (
                  <div className="rounded-xl p-4 sm:p-5 border text-xs sm:text-sm bg-[#17171c] border-[#8a6414]/40 text-gray-200">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <span className="font-semibold uppercase tracking-wider text-[#d4a52a]">
                        Detalhamento Nominal — {resultado.mes}º Mês
                      </span>
                      <span className="text-[11px] opacity-75">
                        Sem desconto de inflação
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="p-2.5 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          Crédito corrigido no mês
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5">
                          {formatarMoeda(resultado.nominal.creditoCorrigido)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          Parcela cheia ({resultado.mes}º mês)
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5">
                          {formatarMoeda(resultado.nominal.parcelaCheia)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          Meia parcela ({Math.round(premissas.percentualMeiaParcela * 100)}%)
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5">
                          {formatarMoeda(resultado.nominal.meiaParcela)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          Nº de reajustes aplicados
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5">
                          {resultado.nominal.numeroReajustes}{' '}
                          {resultado.nominal.numeroReajustes === 1 ? 'reajuste' : 'reajustes'}{' '}
                          ({formatarPercentual((resultado.nominal.fatorCorrecao - 1) * 100, 1)})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {cetAberto && (
                  <div className="rounded-xl p-4 sm:p-5 border text-xs sm:text-sm bg-[#17171c] border-[#8a6414]/40 text-gray-200">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <span className="font-semibold uppercase tracking-wider text-[#d4a52a]">
                        CET / Taxa Interna de Retorno (TIR) — {resultado.mes}º Mês
                      </span>
                      <span className="text-[11px] opacity-75">
                        Fluxo de caixa da operação
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="p-3 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          Rentabilidade Média Simples
                        </div>
                        <div className="text-base font-bold text-[#f3c653] mt-0.5">
                          {formatarPercentual(resultado.rentabilidadeMensalSimples)} a.m.
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          TIR Mensal Composta ({resultado.mes}m)
                        </div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {resultado.cet.tirMensal !== null
                            ? `${formatarPercentual(resultado.cet.tirMensal)} a.m.`
                            : 'n/d'}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-black/25 border border-white/5">
                        <div className="text-[11px] text-gray-400">
                          TIR Anualizada Equivalente
                        </div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {resultado.cet.convergiu && resultado.cet.tirAnual !== null
                            ? `${formatarPercentual(resultado.cet.tirAnual)} a.a.`
                            : 'n/d'}
                        </div>
                      </div>
                    </div>

                    {!resultado.cet.convergiu && (
                      <p className="text-[11px] text-gray-400 mt-2.5">
                        Nota: Para meses de contemplação muito baixos, a TIR periódica composta não converge em escala anualizada padrão (&quot;n/d&quot;) devido à concentração da entrada no início do fluxo.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              RÉGUA 2: ALAVANCAGEM PATRIMONIAL (IMÓVEIS & RENDA PASSIVA)
             ========================================================= */}
          {reguaAtiva === 'patrimonial' && (
            <>
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-center text-xl sm:text-2xl font-normal tracking-wider uppercase text-white">
                  ALAVANCAGEM PATRIMONIAL &amp; RENDA PASSIVA
                </h2>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Aquisição de imóvel gerador de renda ({formatarPercentual((premissas.rentabilidadeAnual ?? 0.1431) * 100, 2)} a.a. / {formatarPercentual(obterRentabilidadeMensal(premissas) * 100, 4)} a.m.) pago pelo próprio inquilino
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 items-stretch">
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Crédito p/ Imóvel:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(anim1)}
                    </span>
                  </div>
                </div>

                {/* Botão Meia Parcela Corrigida antes da contemplação (ao lado depois do Crédito) */}
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Meia Parcela Corrigida:
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetalheParcelaAberto((p) => !p)}
                    title="Clique para ver o detalhamento da parcela corrigida antes da contemplação"
                    className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center gap-1 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(animMeiaParcela)}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#f3c653] shrink-0 transition-transform ${
                        detalheParcelaAberto ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Investido (Do Bolso):
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(anim2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Aluguel ({formatarPercentual(obterRentabilidadeMensal(premissas) * 100, 4)}):
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-emerald-300 text-sm sm:text-base md:text-[15px] lg:text-[16px] font-semibold whitespace-nowrap">
                      {formatarMoeda(anim3)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full col-span-2 sm:col-span-1">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Parcela Pós-Contemplar:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(anim4)}
                    </span>
                  </div>
                </div>
              </div>

              {renderPainelDetalheParcela()}

              <div className="mt-5 p-4 rounded-xl bg-black/35 border border-[#8a6414]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#d4a52a] font-semibold">
                    Renda Passiva Líquida Mensal (Aluguel − Parcela)
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Você adquire um imóvel de <strong className="text-white">{formatarMoeda(patrimonialCalc.creditoDisponivel)}</strong> tendo desembolsado apenas <strong className="text-white">{formatarMoeda(patrimonialCalc.totalInvestidoAteContemplacao)}</strong> ({patrimonialCalc.multiplicadorPatrimonial}x de alavancagem).
                  </div>
                </div>
                <div className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-300">
                    Sobra no Bolso Todo Mês
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-400">
                    {patrimonialCalc.lucroMensalAluguel >= 0 ? '+' : ''}
                    {formatarMoeda(patrimonialCalc.lucroMensalAluguel)}/mês
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setUsarMeioCredito((p) => !p)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    usarMeioCredito
                      ? 'bg-[#d4a52a]/20 border-[#d4a52a] text-[#f3c653]'
                      : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#d4a52a]" />
                  <span>
                    {usarMeioCredito
                      ? 'Ativo: Continuar pagando Meia Parcela (50% do Crédito)'
                      : 'Flexibilidade: Simular Meia Parcela até o final (Meio Crédito)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarValorizacaoImovel((p) => !p)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    mostrarValorizacaoImovel
                      ? 'bg-[#d4a52a]/20 border-[#d4a52a] text-[#f3c653]'
                      : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#d4a52a]" />
                  <span>
                    {mostrarValorizacaoImovel
                      ? 'Ocultar Valorização do Imóvel até a Quitação'
                      : 'Ver Valorização do Imóvel na Quitação'}
                  </span>
                </button>
              </div>

              {mostrarValorizacaoImovel && (
                <div className="mt-4 rounded-xl p-4 bg-[#17171c] border border-[#8a6414]/40 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-3 rounded-lg bg-black/25 border border-white/5">
                    <div className="text-gray-400">Valor do Imóvel na Compra ({resultado.mes}º mês)</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {formatarMoeda(patrimonialCalc.creditoDisponivel)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/25 border border-white/5">
                    <div className="text-gray-400">Prazo Restante Pago pelo Inquilino</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {patrimonialCalc.mesesRestantes} meses ({round2(patrimonialCalc.mesesRestantes / 12)} anos)
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/25 border border-[#d4a52a]/40">
                    <div className="text-[#f3c653]">Valor Estimado do Imóvel Quitado (Mês {premissas.prazo})</div>
                    <div className="text-base font-bold text-[#f3c653] mt-0.5">
                      {formatarMoeda(patrimonialCalc.valorImovelNaQuitacao)}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* =========================================================
              RÉGUA 3: CONSÓRCIO VS. RENDA FIXA (COMBATE À INFLAÇÃO)
             ========================================================= */}
          {reguaAtiva === 'renda_fixa' && (
            <>
              <div className="flex flex-col items-center mb-5">
                <h2 className="text-center text-xl sm:text-2xl font-normal tracking-wider uppercase text-white">
                  CONSÓRCIO VS. GUARDAR NA RENDA FIXA
                </h2>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Comparativo depositando a mesma parcela mensal ({formatarMoeda(resultado.rendaFixa.parcelaMensalAtual)}) com reajuste anual de {formatarPercentual(premissas.reajusteAnual * 100, 0)}
                </p>
              </div>

              <div className="mb-4 p-4 rounded-xl bg-black/30 border border-[#8a6414]/60">
                <div className="text-xs font-bold uppercase tracking-wider text-[#f3c653] mb-3 flex items-center justify-between">
                  <span>1. Linha do Consórcio (Proteção do Poder de Compra)</span>
                  <span>{resultado.mes}º Mês</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-xs text-gray-300 block mb-1.5">Crédito Corrigido Disponível:</span>
                    <div className="gold-pill h-11 px-3 rounded-xl flex items-center justify-center text-[#f3c653] font-bold">
                      {formatarMoeda(anim1)}
                    </div>
                  </div>

                  {/* Botão Meia Parcela Corrigida antes da contemplação (ao lado depois do Crédito) */}
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-xs text-gray-300 block mb-1.5">Meia Parcela Corrigida:</span>
                    <button
                      type="button"
                      onClick={() => setDetalheParcelaAberto((p) => !p)}
                      title="Clique para ver o detalhamento da parcela corrigida antes da contemplação"
                      className="gold-pill h-11 px-3 rounded-xl flex items-center justify-center gap-1.5 text-white font-medium hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>{formatarMoeda(animMeiaParcela)}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#f3c653] shrink-0 transition-transform ${
                          detalheParcelaAberto ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col justify-between h-full">
                    <span className="text-xs text-gray-300 block mb-1.5">Total Desembolsado:</span>
                    <div className="gold-pill h-11 px-3 rounded-xl flex items-center justify-center text-white font-medium">
                      {formatarMoeda(anim2)}
                    </div>
                  </div>
                </div>
              </div>

              {renderPainelDetalheParcela()}

              <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center justify-between">
                  <span>
                    2. Linha da Renda Fixa ({formatarPercentual((premissas.rentabilidadeAnual ?? 0.1431) * 100, 2)} a.a. / {formatarPercentual(obterRentabilidadeMensal(premissas) * 100, 4)} a.m.)
                  </span>
                  <span>Sem Imposto de Renda descontado</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-xs text-gray-400 block mb-1.5">Total Depositado:</span>
                    <div className="h-11 px-3 rounded-xl bg-[#1c1c24] border border-white/10 flex items-center justify-center text-gray-200 font-medium">
                      {formatarMoeda(anim2)}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-xs text-gray-400 block mb-1.5">Rendimento de Juros:</span>
                    <div className="h-11 px-3 rounded-xl bg-[#1c1c24] border border-white/10 flex items-center justify-center text-gray-200 font-medium">
                      +{formatarMoeda(resultado.rendaFixa.rendimentoJurosRendaFixa)}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-xs text-gray-400 block mb-1.5">Total Acumulado Renda Fixa:</span>
                    <div className="h-11 px-3 rounded-xl bg-[#1c1c24] border border-white/15 flex items-center justify-center text-white font-bold">
                      {formatarMoeda(anim3)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-[#17171c] border border-[#8a6414]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-gray-300 leading-relaxed">
                  Na Renda Fixa, você leva{' '}
                  <strong className="text-white">
                    {resultado.rendaFixa.mesEmQueRendaFixaAtingeCreditoInicial} meses (~
                    {round2(resultado.rendaFixa.mesEmQueRendaFixaAtingeCreditoInicial / 12)} anos)
                  </strong>{' '}
                  para juntar os {formatarMoeda(premissas.creditoInicial)} iniciais — momento em que o imóvel e a carta já corrigiram para{' '}
                  <strong className="text-[#f3c653]">
                    {formatarMoeda(resultado.rendaFixa.creditoCorrigidoConsorcio)}
                  </strong>
                  . Diferença atual:{' '}
                  <strong className="text-emerald-400">
                    {anim4 >= 0 ? '+' : ''}
                    {formatarMoeda(anim4)}
                  </strong>
                  .
                </div>
                {onChangeMes && (
                  <button
                    type="button"
                    onClick={() => onChangeMes(136)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#d4a52a]/20 border border-[#d4a52a]/60 text-[#f3c653] hover:bg-[#d4a52a]/30 font-semibold transition-colors"
                  >
                    Ver Mês 136 (11 anos)
                  </button>
                )}
              </div>
            </>
          )}

          {/* =========================================================
              RÉGUA 4: CONTEMPLADA APLICADA (14,31% AO ANO)
             ========================================================= */}
          {reguaAtiva === 'aplicada' && (
            <>
              <div className="flex flex-col items-center mb-5 sm:mb-6">
                <h2 className="text-center text-lg sm:text-xl md:text-2xl font-normal tracking-wider uppercase text-white">
                  CARTA CONTEMPLADA APLICADA ({formatarPercentual((premissas.rentabilidadeAnual ?? 0.1431) * 100, 2)} AO ANO)
                </h2>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Crédito contemplado no {resultado.mes}º mês mantido aplicado na administradora rendendo {formatarPercentual((premissas.rentabilidadeAnual ?? 0.1431) * 100, 2)} ao ano ({formatarPercentual(obterRentabilidadeMensal(premissas) * 100, 4)} ao mês)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 items-stretch">
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Crédito no {resultado.mes}º Mês:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(anim1)}
                    </span>
                  </div>
                </div>

                {/* Botão Meia Parcela Corrigida antes da contemplação (ao lado depois do Crédito) */}
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Meia Parcela Corrigida:
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetalheParcelaAberto((p) => !p)}
                    title="Clique para ver o detalhamento da parcela corrigida antes da contemplação"
                    className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center gap-1 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(animMeiaParcela)}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#f3c653] shrink-0 transition-transform ${
                        detalheParcelaAberto ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Investido até Contemplar:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base md:text-[15px] lg:text-[16px] font-medium whitespace-nowrap">
                      {formatarMoeda(anim2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Após {aplicadaCalc.mesesAplicado} Meses Aplicado:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-[#f3c653] text-sm sm:text-base md:text-[15px] lg:text-[16px] font-bold whitespace-nowrap">
                      {formatarMoeda(anim3)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full col-span-2 sm:col-span-1">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    No Fim do Grupo ({premissas.prazo}m):
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-emerald-300 text-sm sm:text-base md:text-[15px] lg:text-[16px] font-bold whitespace-nowrap">
                      {formatarMoeda(anim4)}
                    </span>
                  </div>
                </div>
              </div>

              {renderPainelDetalheParcela()}

              <div className="mt-5 p-4 rounded-xl bg-black/30 border border-[#8a6414]/40 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#d4a52a]">
                    Simular Tempo Deixando o Crédito Aplicado Após Contemplar:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModoPrazoAplicada('fim_grupo')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        modoPrazoAplicada === 'fim_grupo'
                          ? 'bg-[#d4a52a]/25 border-[#d4a52a] text-[#f3c653]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      Até o Fim do Plano ({aplicadaCalc.mesesRestantesGrupo}m)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoPrazoAplicada('custom');
                        setMesesCustomAplicada(40);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        modoPrazoAplicada === 'custom' && mesesCustomAplicada === 40
                          ? 'bg-[#d4a52a]/25 border-[#d4a52a] text-[#f3c653]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      40 Meses (Exemplo da Aula)
                    </button>
                    {onChangeMes && (
                      <button
                        type="button"
                        onClick={() => {
                          onChangeMes(70);
                          setModoPrazoAplicada('fim_grupo');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium border bg-white/5 border-white/10 text-gray-300 hover:border-[#d4a52a]/50 hover:text-white transition-colors"
                      >
                        Testar Mês 70 (R$ 2,83 Mi)
                      </button>
                    )}
                  </div>
                </div>

                {modoPrazoAplicada === 'custom' && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      Meses aplicado: <strong className="text-white">{mesesCustomAplicada}m</strong>
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={Math.max(1, premissas.prazo - resultado.mes)}
                      value={mesesCustomAplicada}
                      onChange={(e) => setMesesCustomAplicada(Number(e.target.value))}
                      className="w-full accent-[#d4a52a] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs items-stretch">
                  <div className="p-3 rounded-lg bg-black/25 border border-white/5 flex flex-col justify-between">
                    <span className="text-gray-400">Custo Total {premissas.prazo} Parcelas (Corrigidas):</span>
                    <div className="text-sm font-bold text-white mt-1">
                      {formatarMoeda(aplicadaCalc.custoTotalParcelas220Meses)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/25 border border-white/5 flex flex-col justify-between">
                    <span className="text-gray-400">Resgate em Espécie no Fim do Grupo:</span>
                    <div className="text-sm font-bold text-[#f3c653] mt-1">
                      {formatarMoeda(anim4)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/25 border border-white/5 flex flex-col justify-between">
                    <span className="text-gray-400">Lucro Líquido Acima de Todas as Parcelas:</span>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      +{formatarMoeda(aplicadaCalc.lucroLiquidoFinalGrupo)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              RÉGUA 5: FIDELIDADE & CARTEIRA MULTI-COTAS
             ========================================================= */}
          {reguaAtiva === 'fidelidade' && fidelidadeCalc && (
            <>
              <div className="flex flex-col items-center mb-5">
                <h2 className="text-center text-xl sm:text-2xl font-normal tracking-wider uppercase text-white">
                  MODALIDADES DE CONTEMPLAÇÃO &amp; MULTI-COTAS
                </h2>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Aceleração matemática via Lances Fidelidade (6, 12, 18 e 24 meses) para quem paga rigorosamente em dia
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                <span className="text-xs text-gray-300 mr-1">
                  Quantidade de Cotas na Carteira:
                </span>
                {[1, 2, 5, 10, 20, 30].map((qtd) => (
                  <button
                    key={qtd}
                    type="button"
                    onClick={() => onChangeNumeroCotas(qtd)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      numeroCotas === qtd
                        ? 'gold-pill text-white border-[#d4a52a]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {qtd} {qtd === 1 ? 'Cota' : 'Cotas'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-4 items-stretch">
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Crédito Total ({numeroCotas}x):
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base font-medium whitespace-nowrap">
                      {formatarMoeda(anim1)}
                    </span>
                  </div>
                </div>

                {/* Botão Meia Parcela Corrigida antes da contemplação (ao lado depois do Crédito) */}
                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Meia Parcela Corrigida:
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetalheParcelaAberto((p) => !p)}
                    title="Clique para ver o detalhamento da parcela corrigida antes da contemplação"
                    className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center gap-1 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span className="text-white text-sm sm:text-base font-medium whitespace-nowrap">
                      {formatarMoeda(animMeiaParcela)}/mês
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#f3c653] shrink-0 transition-transform ${
                        detalheParcelaAberto ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Total Investido ({numeroCotas}x):
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base font-medium whitespace-nowrap">
                      {formatarMoeda(anim2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Lucro Venda Total:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-emerald-300 text-sm sm:text-base font-semibold whitespace-nowrap">
                      {formatarMoeda(anim3)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-full col-span-2 sm:col-span-1">
                  <span className="text-xs sm:text-sm font-normal mb-2 text-gray-200 text-center min-h-[2.25rem] flex items-end justify-center leading-snug">
                    Chances na Assembleia:
                  </span>
                  <div className="gold-pill w-full h-12 sm:h-[52px] px-2 sm:px-3 rounded-2xl flex items-center justify-center">
                    <span className="text-[#f3c653] text-sm sm:text-base font-bold whitespace-nowrap">
                      {fidelidadeCalc.chancesMensaisCarteira}x por mês
                    </span>
                  </div>
                </div>
              </div>

              {renderPainelDetalheParcela()}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fidelidadeCalc.modalidades.map((mod) => (
                  <div
                    key={mod.id}
                    className={`p-3.5 rounded-xl border ${
                      mod.ativa
                        ? 'bg-[#1a1812] border-[#d4a52a]/60 text-white'
                        : 'bg-black/25 border-white/10 text-gray-500 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                        {mod.ativa ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                        {mod.nome}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          mod.ativa
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {mod.ativa ? 'HABILITADO' : `A partir do ${mod.mesMinimo}º mês`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-snug mb-2">
                      {mod.descricao}
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/10 text-gray-400">
                      <span>Concorrência: ~{mod.concorrenciaEstimadaPct}% do grupo</span>
                      <span className="text-[#f3c653] font-semibold">
                        ~{mod.contemplacoesMesEstimadas} contempl./mês
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d4a52a] shrink-0" />
                  <span>
                    Cumprindo todas as modalidades em dia: <strong className="text-white">~84% de probabilidade</strong> histórica de contemplação nos primeiros 48 meses.
                  </span>
                </div>
                {resultado.mes >= 72 && (
                  <span className="text-emerald-400 font-semibold">
                    ✓ Marco de 72 meses atingido (Elegível à Garantia de Recompra 100% Fundo Comum)
                  </span>
                )}
              </div>
            </>
          )}

          {/* Barra de exportação de Proposta em PDF para o Cliente */}
          {onOpenPdfModal && (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-400 text-center sm:text-left">
                Simulação pronta? Gere o documento estruturado para enviar ao cliente:
              </div>
              <button
                type="button"
                onClick={onOpenPdfModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white gold-pill shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <FileDown className="w-4 h-4" />
                <span>Gerar Proposta em PDF</span>
              </button>
            </div>
          )}

          {/* Ícone de calculadora centralizado ao pé da caixa (abre/fecha Premissas) */}
          <button
            type="button"
            onClick={onTogglePremissas}
            title={
              premissasAbertas
                ? 'Recolher painel de Premissas'
                : 'Configurar Premissas da Simulação'
            }
            aria-expanded={premissasAbertas}
            aria-label="Configurar premissas da simulação"
            className={`absolute left-1/2 -bottom-6 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-colors border shadow-lg ${
              premissasAbertas
                ? 'bg-[#8a6414] border-[#d4a52a] text-white'
                : 'bg-[#2a2a30] border-white/15 text-gray-200 hover:bg-[#35353d] hover:border-[#d4a52a]/60 hover:text-white'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </button>
        </div>
      </section>
    );
  }
);
