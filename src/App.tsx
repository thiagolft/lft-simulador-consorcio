import { useState, useMemo } from 'react';
import {
  PREMISSAS_PADRAO,
  PremissasConsorcio,
  TipoRegua,
  calcularModalidadesFidelidade,
  formatarPercentual,
  simularMes,
} from './lib/consorcio';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { Header } from './components/Header';
import { ReguaSelector } from './components/ReguaSelector';
import { EditableCredit } from './components/EditableCredit';
import { ContemplationSlider } from './components/ContemplationSlider';
import { ResultsBox } from './components/ResultsBox';
import { PremissasPanel } from './components/PremissasPanel';
import {
  IndicadoresModal,
  AjudaModal,
} from './components/ModalsAndFooter';

export function App() {
  const [reguaAtiva, setReguaAtiva] = useState<TipoRegua>('venda');
  const [mes, setMes] = useState(1);
  const [numeroCotas, setNumeroCotas] = useState(1);
  const [premissas, setPremissas] = useState<PremissasConsorcio>(PREMISSAS_PADRAO);
  const [premissasAbertas, setPremissasAbertas] = useState(false);
  const [indicadoresAberto, setIndicadoresAberto] = useState(false);
  const [ajudaAberta, setAjudaAberta] = useState(false);

  const mesEfetivo = Math.min(mes, premissas.prazo);

  const resultado = useMemo(
    () => simularMes(mesEfetivo, premissas),
    [mesEfetivo, premissas]
  );

  const fidelidadeInfo = useMemo(
    () => calcularModalidadesFidelidade(mesEfetivo, numeroCotas, premissas),
    [mesEfetivo, numeroCotas, premissas]
  );

  const handleChangeCredito = (novoCredito: number) => {
    setPremissas((prev) => ({
      ...prev,
      creditoInicial: novoCredito,
    }));
  };

  const handleSelectPresetGrupo = (credito: number, prazo: number) => {
    setPremissas((prev) => ({
      ...prev,
      creditoInicial: credito,
      prazo,
    }));
  };

  const handleResetPremissas = () => {
    setPremissas(PREMISSAS_PADRAO);
    setMes(1);
    setNumeroCotas(1);
  };

  const rentabilidadeAnualFmt = formatarPercentual(
    (premissas.rentabilidadeAnual ?? 0.1431) * 100,
    2
  );

  const titulosRegua: Record<
    TipoRegua,
    { titulo: string; subtitulo: string }
  > = {
    venda: {
      titulo: 'VENDA CONTEMPLADA',
      subtitulo: 'ALAVANCAGEM FINANCEIRA',
    },
    patrimonial: {
      titulo: 'IMÓVEIS & LOCAÇÃO',
      subtitulo: 'ALAVANCAGEM PATRIMONIAL E RENDA PASSIVA',
    },
    renda_fixa: {
      titulo: 'CONSÓRCIO VS RENDA FIXA',
      subtitulo: 'PROTEÇÃO DO PODER DE COMPRA & COMBATE À INFLAÇÃO',
    },
    aplicada: {
      titulo: 'CONTEMPLADA APLICADA',
      subtitulo: `CRÉDITO RENDENDO ${rentabilidadeAnualFmt} AO ANO NA ADMINISTRADORA`,
    },
    fidelidade: {
      titulo: 'ACELERADOR DE CONTEMPLAÇÃO',
      subtitulo: 'LANCES FIDELIDADE (6, 12, 18 E 24M) & CARTEIRA MULTI-COTAS',
    },
  };

  const { titulo, subtitulo } = titulosRegua[reguaAtiva];

  return (
    <DarkGradientBg className="selection:bg-[#d4a52a]/30">
      <div className="min-h-screen flex flex-col justify-between pb-16 sm:pb-20">
        {/* Topo e Cabeçalho Secundário */}
        <div>
          <Header
            onOpenIndicadores={() => setIndicadoresAberto(true)}
            onOpenAjuda={() => setAjudaAberta(true)}
          />

          {/* Conteúdo Principal responsivo (Mobile, iPad Portrait/Landscape e Desktop) */}
          <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 pt-1 sm:pt-3">
            {/* Seletor das 5 Réguas de Simulação */}
            <ReguaSelector
              reguaAtiva={reguaAtiva}
              onSelectRegua={setReguaAtiva}
            />

            {/* 1. Título e Subtítulo dinâmicos conforme a régua */}
            <div className="text-center px-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold uppercase tracking-wide text-white leading-tight">
                {titulo}
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.12em] sm:tracking-[0.14em] mt-1 font-normal text-gray-300">
                {subtitulo}
              </p>
            </div>

            {/* 2. Crédito Editável + Presets de Grupos Oportunidade */}
            <EditableCredit
              credito={premissas.creditoInicial}
              prazo={premissas.prazo}
              onChangeCredito={handleChangeCredito}
              onSelectPresetGrupo={handleSelectPresetGrupo}
            />

            {/* 3. Slider Horizontal de Contemplação (1 a 220 meses) compartilhado entre todas as réguas */}
            <ContemplationSlider
              mes={mesEfetivo}
              prazo={premissas.prazo}
              rentabilidade={resultado.rentabilidade}
              lucroMensalAluguel={resultado.patrimonial.lucroMensalAluguel}
              vantagemConsorcioRF={resultado.rendaFixa.vantagemConsorcio}
              montanteFinalAplicada={resultado.aplicada.montanteFinalFimDoGrupo}
              chancesMensaisFidelidade={fidelidadeInfo.chancesMensaisCarteira}
              reguaAtiva={reguaAtiva}
              onChangeMes={setMes}
            />

            {/* 4, 5 e 6. Caixa RESULTADOS adaptativa + Ícone Calculadora */}
            <ResultsBox
              resultado={resultado}
              premissas={premissas}
              reguaAtiva={reguaAtiva}
              numeroCotas={numeroCotas}
              onChangeNumeroCotas={setNumeroCotas}
              onChangeMes={setMes}
              premissasAbertas={premissasAbertas}
              onTogglePremissas={() => setPremissasAbertas((prev) => !prev)}
            />

            {/* Painel recolhível de Premissas */}
            <PremissasPanel
              premissas={premissas}
              onChangePremissas={setPremissas}
              onReset={handleResetPremissas}
              aberto={premissasAbertas}
              onToggle={() => setPremissasAbertas((prev) => !prev)}
            />
          </main>
        </div>

        {/* Modais: Indicadores Financeiros (com gráfico Recharts) e Ajuda */}
        <IndicadoresModal
          aberto={indicadoresAberto}
          onClose={() => setIndicadoresAberto(false)}
          premissas={premissas}
          mesAtual={mesEfetivo}
        />

        <AjudaModal
          aberto={ajudaAberta}
          onClose={() => setAjudaAberta(false)}
        />
      </div>
    </DarkGradientBg>
  );
}

export default App;
