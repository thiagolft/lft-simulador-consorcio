import { jsPDF } from 'jspdf';
import {
  PremissasConsorcio,
  ResultadoSimulacaoMes,
  TipoRegua,
  calcularAlavancagemPatrimonial,
  calcularContempladaAplicada,
  calcularModalidadesFidelidade,
  formatarMoeda,
  formatarPercentual,
  obterRentabilidadeMensal,
  simularMes,
} from './consorcio';
import logoLftUrl from '../assets/logo-lft.png';

export interface OpcoesExportacaoPdf {
  nomeCliente: string;
  nomeConsultor: string;
  contatoConsultor: string;
  observacoes: string;
  modoRelatorio: 'completo' | 'regua_atual';
  reguaAtiva: TipoRegua;
  mesSelecionado: number;
  numeroCotas: number;
  premissas: PremissasConsorcio;
  resultadoAtual: ResultadoSimulacaoMes;
  usarLanceEmbutidoVenda?: boolean;
  usarMeioCreditoPatrimonial?: boolean;
  mesesCustomAplicada?: number | null;
}

const NOMES_REGUA: Record<TipoRegua, string> = {
  venda: 'Venda Contemplada — Alavancagem Financeira',
  patrimonial: 'Alavancagem Patrimonial — Imóveis & Renda Passiva',
  renda_fixa: 'Consórcio vs. Renda Fixa — Proteção do Poder de Compra',
  aplicada: 'Carta Contemplada Aplicada (14,31% ao ano)',
  fidelidade: 'Acelerador de Contemplação — Fidelidade & Multi-Cotas',
};

async function carregarLogoBase64(
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 659;
        canvas.height = img.naturalHeight || 329;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function desenharCabecalhoPagina(
  doc: jsPDF,
  logoData: { dataUrl: string; width: number; height: number } | null,
  opcoes: OpcoesExportacaoPdf,
  dataHoraStr: string,
  subtituloPagina: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Faixa superior escura (identidade visual LFT)
  doc.setFillColor(15, 16, 22);
  doc.rect(0, 0, pageWidth, 34, 'F');

  // Filete dourado inferior no cabeçalho
  doc.setFillColor(212, 165, 42);
  doc.rect(0, 34, pageWidth, 1.2, 'F');

  // Logo LFT à esquerda
  if (logoData) {
    const targetH = 17;
    const targetW = (logoData.width / logoData.height) * targetH;
    doc.addImage(logoData.dataUrl, 'PNG', 14, 8.5, targetW, targetH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('LFT CONSORCIOS', 14, 19);
  }

  // Títulos à direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(243, 198, 83);
  doc.text(
    'ESTUDO PERSONALIZADO DE ALAVANCAGEM FINANCEIRA',
    pageWidth - 14,
    13,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(210, 214, 224);
  doc.text(subtituloPagina, pageWidth - 14, 19, { align: 'right' });

  const infoLinha3: string[] = [`Emissão: ${dataHoraStr}`];
  if (opcoes.nomeCliente.trim()) {
    infoLinha3.unshift(`Cliente: ${opcoes.nomeCliente.trim()}`);
  }
  if (opcoes.nomeConsultor.trim()) {
    const consultorStr = opcoes.contatoConsultor.trim()
      ? `Especialista: ${opcoes.nomeConsultor.trim()} (${opcoes.contatoConsultor.trim()})`
      : `Especialista: ${opcoes.nomeConsultor.trim()}`;
    infoLinha3.push(consultorStr);
  }

  doc.setFontSize(7.8);
  doc.setTextColor(170, 175, 190);
  doc.text(infoLinha3.join('   |   '), pageWidth - 14, 26.5, {
    align: 'right',
  });
}

function desenharRodapePaginas(doc: jsPDF, opcoes: OpcoesExportacaoPdf) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(212, 165, 42);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 13, pageWidth - 14, pageHeight - 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 95, 110);
    doc.text(
      'LFT CONSÓRCIOS — Planejamento & Alavancagem Financeira',
      14,
      pageHeight - 8
    );

    if (opcoes.nomeConsultor.trim() || opcoes.contatoConsultor.trim()) {
      const textoMeio = [
        opcoes.nomeConsultor.trim(),
        opcoes.contatoConsultor.trim(),
      ]
        .filter(Boolean)
        .join(' • ');
      doc.setFont('helvetica', 'normal');
      doc.text(textoMeio, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: 'right' }
    );
  }
}

function desenharCardMetrica(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  rotulo: string,
  valor: string,
  subvalor?: string,
  destaqueDourado = false,
  corValor: [number, number, number] = [20, 22, 30]
) {
  if (destaqueDourado) {
    doc.setFillColor(251, 246, 232);
    doc.setDrawColor(196, 148, 35);
    doc.setLineWidth(0.5);
  } else {
    doc.setFillColor(247, 248, 250);
    doc.setDrawColor(222, 226, 234);
    doc.setLineWidth(0.3);
  }
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 105, 120);
  doc.text(rotulo, x + w / 2, y + 6, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(corValor[0], corValor[1], corValor[2]);
  doc.text(valor, x + w / 2, y + (subvalor ? 13 : 14.5), { align: 'center' });

  if (subvalor) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(115, 120, 135);
    doc.text(subvalor, x + w / 2, y + 18.5, { align: 'center' });
  }
}

function desenharTituloSecao(
  doc: jsPDF,
  y: number,
  numero: string,
  titulo: string,
  subtitulo?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Badge dourado com número
  doc.setFillColor(184, 137, 36);
  doc.roundedRect(14, y, 6.5, 6.5, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(numero, 17.25, y + 4.6, { align: 'center' });

  // Título da seção
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 25, 35);
  doc.text(titulo.toUpperCase(), 23, y + 4.7);

  if (subtitulo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(110, 115, 130);
    doc.text(subtitulo, pageWidth - 14, y + 4.7, { align: 'right' });
  }

  doc.setDrawColor(225, 228, 235);
  doc.setLineWidth(0.3);
  doc.line(14, y + 8.2, pageWidth - 14, y + 8.2);

  return y + 11.5;
}

export async function gerarPropostaPdf(
  opcoes: OpcoesExportacaoPdf
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 28; // 14mm margin each side

  const agora = new Date();
  const dataHoraStr = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const logoData = await carregarLogoBase64(logoLftUrl);

  const {
    premissas,
    resultadoAtual: res,
    mesSelecionado,
    numeroCotas,
    reguaAtiva,
    modoRelatorio,
  } = opcoes;

  const rentAnualPct = (premissas.rentabilidadeAnual ?? 0.1431) * 100;
  const rentMensalPct = obterRentabilidadeMensal(premissas) * 100;

  const patrimonialCalc = calcularAlavancagemPatrimonial(
    mesSelecionado,
    premissas,
    opcoes.usarMeioCreditoPatrimonial ?? false
  );
  const aplicadaCalc =
    opcoes.mesesCustomAplicada != null
      ? calcularContempladaAplicada(
          mesSelecionado,
          premissas,
          opcoes.mesesCustomAplicada
        )
      : res.aplicada;
  const fidelidadeCalc = calcularModalidadesFidelidade(
    mesSelecionado,
    numeroCotas,
    premissas
  );

  // =========================================================================
  // PÁGINA 1: RESUMO EXECUTIVO & ESTRATÉGIAS FINANCEIRAS NO MÊS ESCOLHIDO
  // =========================================================================
  desenharCabecalhoPagina(
    doc,
    logoData,
    opcoes,
    dataHoraStr,
    `Foco Principal: ${NOMES_REGUA[reguaAtiva]}`
  );

  let y = 40;

  // Bloco de identificação do cliente / consultor (se preenchido)
  if (opcoes.nomeCliente.trim() || opcoes.observacoes.trim()) {
    doc.setFillColor(250, 248, 242);
    doc.setDrawColor(212, 165, 42);
    doc.setLineWidth(0.35);
    const boxH = opcoes.observacoes.trim() ? 16 : 10;
    doc.roundedRect(14, y, contentWidth, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(138, 100, 20);
    const saudacao = opcoes.nomeCliente.trim()
      ? `PROPOSTA PREPARADA PARA: ${opcoes.nomeCliente.trim().toUpperCase()}`
      : 'OBSERVAÇÕES DO ESTUDO PERSONALIZADO';
    doc.text(saudacao, 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(70, 75, 90);
    doc.text(
      `Simulação na Contemplação do ${mesSelecionado}º Mês (${numeroCotas} ${
        numeroCotas === 1 ? 'Cota' : 'Cotas'
      })`,
      pageWidth - 18,
      y + 6,
      { align: 'right' }
    );

    if (opcoes.observacoes.trim()) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 85, 100);
      const notaCortada =
        opcoes.observacoes.trim().length > 125
          ? opcoes.observacoes.trim().slice(0, 122) + '...'
          : opcoes.observacoes.trim();
      doc.text(`Nota: "${notaCortada}"`, 18, y + 12.2);
    }

    y += boxH + 4.5;
  }

  // -------------------------------------------------------------------------
  // SEÇÃO 1: PARÂMETROS BASE DO PLANO CONFIGURADO
  // -------------------------------------------------------------------------
  y = desenharTituloSecao(
    doc,
    y,
    '1',
    'Parâmetros da Cota & Premissas do Grupo',
    `Prazo Total: ${premissas.prazo} meses | Reajuste Anual: ${formatarPercentual(
      premissas.reajusteAnual * 100,
      1
    )} a.a.`
  );

  const cardW4 = (contentWidth - 9) / 4;
  desenharCardMetrica(
    doc,
    14,
    y,
    cardW4,
    21,
    'Crédito Inicial Contratado',
    formatarMoeda(premissas.creditoInicial),
    numeroCotas > 1
      ? `Carteira com ${numeroCotas} cotas (${formatarMoeda(
          premissas.creditoInicial * numeroCotas
        )})`
      : `Prazo do grupo: ${premissas.prazo} meses`,
    true
  );
  desenharCardMetrica(
    doc,
    14 + (cardW4 + 3) * 1,
    y,
    cardW4,
    21,
    'Mês de Contemplação Simulado',
    `${mesSelecionado}º Mês`,
    `${res.nominal.numeroReajustes} ${
      res.nominal.numeroReajustes === 1 ? 'reajuste anual' : 'reajustes anuais'
    } até a data`,
    true
  );
  desenharCardMetrica(
    doc,
    14 + (cardW4 + 3) * 2,
    y,
    cardW4,
    21,
    `Meia Parcela (${Math.round(premissas.percentualMeiaParcela * 100)}%)`,
    formatarMoeda(res.meiaParcela),
    `Parcela cheia no mês: ${formatarMoeda(res.parcelaCheia)}`
  );
  desenharCardMetrica(
    doc,
    14 + (cardW4 + 3) * 3,
    y,
    cardW4,
    21,
    'Taxas & Indexadores',
    `Rentab.: ${formatarPercentual(rentAnualPct, 2)} a.a.`,
    `Taxa Adm.: ${formatarPercentual(
      premissas.taxaTotal * 100,
      1
    )} | Ágio: ${formatarPercentual(premissas.agioVenda * 100, 0)}`
  );

  y += 26;

  // -------------------------------------------------------------------------
  // SEÇÃO 2: DESTAQUE DA ESTRATÉGIA PRINCIPAL SELECIONADA
  // -------------------------------------------------------------------------
  y = desenharTituloSecao(
    doc,
    y,
    '2',
    `Cenário em Destaque: ${NOMES_REGUA[reguaAtiva]}`,
    `Resultados projetados para contemplação no ${mesSelecionado}º mês`
  );

  // Quadro escuro premium imitando a caixa RESULTADOS do simulador
  doc.setFillColor(20, 21, 28);
  doc.setDrawColor(196, 148, 35);
  doc.setLineWidth(0.6);
  doc.roundedRect(14, y, contentWidth, 32, 3, 3, 'FD');

  let p1Label = 'Crédito Corrigido';
  let p1Val = formatarMoeda(res.creditoCorrigido);
  let p2Label = 'Total Investido';
  let p2Val = formatarMoeda(res.totalInvestido);
  let p3Label = 'Valor da Venda (Ágio)';
  let p3Val = formatarMoeda(res.valorVenda);
  let p4Label = 'Lucro Líquido';
  let p4Val = formatarMoeda(res.lucro);
  let resumoDestaque = `Retorno sobre o capital investido: ${formatarPercentual(
    res.rentabilidade
  )} (${formatarPercentual(res.rentabilidadeMensalSimples)} ao mês simples)`;

  if (reguaAtiva === 'venda' && opcoes.usarLanceEmbutidoVenda) {
    const pctEmb = premissas.percentualLanceEmbutido ?? 0.3;
    const fator = 1 - pctEmb;
    const credLiq = res.creditoCorrigido * fator;
    const vendaLiq = res.valorVenda * fator;
    const lucroLiq = vendaLiq - res.totalInvestido;
    p1Label = `Crédito Líquido (-${Math.round(pctEmb * 100)}% Emb.)`;
    p1Val = formatarMoeda(credLiq);
    p3Val = formatarMoeda(vendaLiq);
    p4Val = formatarMoeda(lucroLiq);
    resumoDestaque = `Simulação considerando contemplação via Lance Embutido de ${Math.round(
      pctEmb * 100
    )}% descontado da própria carta.`;
  } else if (reguaAtiva === 'patrimonial') {
    p1Label = 'Crédito p/ Imóvel';
    p1Val = formatarMoeda(patrimonialCalc.creditoDisponivel);
    p2Label = 'Investido (Do Bolso)';
    p2Val = formatarMoeda(patrimonialCalc.totalInvestidoAteContemplacao);
    p3Label = `Aluguel (${formatarPercentual(rentMensalPct, 4)} a.m.)`;
    p3Val = formatarMoeda(patrimonialCalc.aluguelMensal);
    p4Label = 'Parcela Pós-Contemplar';
    p4Val = formatarMoeda(patrimonialCalc.parcelaPosContemplacao);
    resumoDestaque = `Renda Passiva Líquida Mensal (Aluguel - Parcela): ${
      patrimonialCalc.lucroMensalAluguel >= 0 ? '+' : ''
    }${formatarMoeda(patrimonialCalc.lucroMensalAluguel)}/mês | Alavancagem: ${
      patrimonialCalc.multiplicadorPatrimonial
    }x | Imóvel Quitado (Mês ${premissas.prazo}): ${formatarMoeda(
      patrimonialCalc.valorImovelNaQuitacao
    )}`;
  } else if (reguaAtiva === 'renda_fixa') {
    p1Label = 'Crédito Consórcio';
    p1Val = formatarMoeda(res.rendaFixa.creditoCorrigidoConsorcio);
    p2Label = 'Total Desembolsado';
    p2Val = formatarMoeda(res.totalInvestido);
    p3Label = 'Acumulado Renda Fixa';
    p3Val = formatarMoeda(res.rendaFixa.montanteRendaFixa);
    p4Label = 'Vantagem Consórcio';
    p4Val = `${res.rendaFixa.vantagemConsorcio >= 0 ? '+' : ''}${formatarMoeda(
      res.rendaFixa.vantagemConsorcio
    )}`;
    resumoDestaque = `Na Renda Fixa (${formatarPercentual(
      rentAnualPct,
      2
    )} a.a.), seriam necessários ${
      res.rendaFixa.mesEmQueRendaFixaAtingeCreditoInicial
    } meses para acumular o crédito inicial de ${formatarMoeda(
      premissas.creditoInicial
    )}.`;
  } else if (reguaAtiva === 'aplicada') {
    p1Label = `Crédito no ${mesSelecionado}º Mês`;
    p1Val = formatarMoeda(res.creditoCorrigido);
    p2Label = 'Investido até Contemplar';
    p2Val = formatarMoeda(res.totalInvestido);
    p3Label = `Após ${aplicadaCalc.mesesAplicado}m Aplicado`;
    p3Val = formatarMoeda(aplicadaCalc.montanteFinalPrazoEscolhido);
    p4Label = `No Fim do Grupo (${premissas.prazo}m)`;
    p4Val = formatarMoeda(aplicadaCalc.montanteFinalFimDoGrupo);
    resumoDestaque = `Crédito rendendo ${formatarPercentual(
      rentAnualPct,
      2
    )} ao ano (${formatarPercentual(
      rentMensalPct,
      4
    )} a.m.) | Lucro líquido acima de todas as 220 parcelas: +${formatarMoeda(
      aplicadaCalc.lucroLiquidoFinalGrupo
    )}`;
  } else if (reguaAtiva === 'fidelidade') {
    p1Label = `Crédito Total (${numeroCotas}x)`;
    p1Val = formatarMoeda(fidelidadeCalc.creditoTotalCarteira);
    p2Label = 'Meia Parcela Total';
    p2Val = `${formatarMoeda(fidelidadeCalc.parcelaMensalCarteira)}/mês`;
    p3Label = 'Lucro Venda Total';
    p3Val = formatarMoeda(fidelidadeCalc.lucroVendaTotalCarteira);
    p4Label = 'Chances na Assembleia';
    p4Val = `${fidelidadeCalc.chancesMensaisCarteira}x por mês`;
    resumoDestaque = `Total investido na carteira até o ${mesSelecionado}º mês: ${formatarMoeda(
      res.totalInvestido * numeroCotas
    )} | Modalidades ativas por cota: ${
      fidelidadeCalc.modalidadesAtivasCount
    } de 6`;
  }

  const pillW = (contentWidth - 18) / 4;
  const pills = [
    { label: p1Label, val: p1Val },
    { label: p2Label, val: p2Val },
    { label: p3Label, val: p3Val },
    { label: p4Label, val: p4Val },
  ];

  pills.forEach((p, idx) => {
    const px = 17 + idx * (pillW + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(210, 214, 224);
    doc.text(p.label, px + pillW / 2, y + 6.5, { align: 'center' });

    // Pílula dourada
    doc.setFillColor(122, 90, 18);
    doc.setDrawColor(212, 165, 42);
    doc.setLineWidth(0.4);
    doc.roundedRect(px, y + 9, pillW, 12, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.8);
    doc.setTextColor(255, 255, 255);
    doc.text(p.val, px + pillW / 2, y + 16.5, { align: 'center' });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(243, 198, 83);
  doc.text(resumoDestaque, pageWidth / 2, y + 27.8, { align: 'center' });

  y += 37;

  // -------------------------------------------------------------------------
  // SEÇÃO 3: PANORAMA COMPLETO DAS 4 VERTENTES FINANCEIRAS NO MÊS ESCOLHIDO
  // -------------------------------------------------------------------------
  y = desenharTituloSecao(
    doc,
    y,
    '3',
    modoRelatorio === 'completo'
      ? `Análise Comparativa das 4 Estratégias no ${mesSelecionado}º Mês`
      : `Detalhamento Técnico da Operação no ${mesSelecionado}º Mês`,
    'Valores nominais projetados conforme parâmetros configurados'
  );

  const boxW2 = (contentWidth - 4) / 2;
  const boxH2 = 44;

  // Quadrante 1: Venda Contemplada (Alavancagem Financeira)
  doc.setFillColor(252, 252, 254);
  doc.setDrawColor(reguaAtiva === 'venda' ? 196 : 220, reguaAtiva === 'venda' ? 148 : 224, reguaAtiva === 'venda' ? 35 : 232);
  doc.setLineWidth(reguaAtiva === 'venda' ? 0.55 : 0.3);
  doc.roundedRect(14, y, boxW2, boxH2, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(138, 100, 20);
  doc.text('A) VENDA CONTEMPLADA (GIRO DE ÁGIO)', 18, y + 6.5);

  const linhasA: [string, string][] = [
    ['Crédito Corrigido no Mês:', formatarMoeda(res.creditoCorrigido)],
    ['Total Investido (Meia Parcela):', formatarMoeda(res.totalInvestido)],
    [
      `Valor de Venda do Ágio (${formatarPercentual(
        premissas.agioVenda * 100,
        0
      )}):`,
      formatarMoeda(res.valorVenda),
    ],
    ['Lucro Líquido da Venda:', formatarMoeda(res.lucro)],
    [
      'Rentabilidade Total / Média Mês:',
      `${formatarPercentual(res.rentabilidade)} (${formatarPercentual(
        res.rentabilidadeMensalSimples
      )} a.m.)`,
    ],
    [
      'TIR Mensal / TIR Anual (CET):',
      res.cet.tirMensal !== null
        ? `${formatarPercentual(res.cet.tirMensal)} a.m. / ${
            res.cet.convergiu && res.cet.tirAnual !== null
              ? formatarPercentual(res.cet.tirAnual) + ' a.a.'
              : 'n/d'
          }`
        : 'n/d',
    ],
  ];

  linhasA.forEach(([k, v], i) => {
    const ly = y + 13 + i * 5.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(90, 95, 110);
    doc.text(k, 18, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 28, 38);
    doc.text(v, 14 + boxW2 - 4, ly, { align: 'right' });
  });

  // Quadrante 2: Alavancagem Patrimonial (Imóveis & Locação)
  const q2X = 14 + boxW2 + 4;
  doc.setFillColor(252, 252, 254);
  doc.setDrawColor(
    reguaAtiva === 'patrimonial' ? 196 : 220,
    reguaAtiva === 'patrimonial' ? 148 : 224,
    reguaAtiva === 'patrimonial' ? 35 : 232
  );
  doc.setLineWidth(reguaAtiva === 'patrimonial' ? 0.55 : 0.3);
  doc.roundedRect(q2X, y, boxW2, boxH2, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(138, 100, 20);
  doc.text('B) ALAVANCAGEM PATRIMONIAL & RENDA PASSIVA', q2X + 4, y + 6.5);

  const linhasB: [string, string][] = [
    ['Crédito p/ Aquisição do Imóvel:', formatarMoeda(patrimonialCalc.creditoDisponivel)],
    [
      'Investido do Bolso (Alavancagem):',
      `${formatarMoeda(patrimonialCalc.totalInvestidoAteContemplacao)} (${
        patrimonialCalc.multiplicadorPatrimonial
      }x)`,
    ],
    [
      `Receita de Aluguel (${formatarPercentual(rentAnualPct, 2)} a.a.):`,
      `${formatarMoeda(patrimonialCalc.aluguelMensal)}/mês`,
    ],
    [
      'Parcela Pós-Contemplação:',
      `${formatarMoeda(patrimonialCalc.parcelaPosContemplacao)}/mês`,
    ],
    [
      'Fluxo de Caixa Líquido Mensal:',
      `${patrimonialCalc.lucroMensalAluguel >= 0 ? '+' : ''}${formatarMoeda(
        patrimonialCalc.lucroMensalAluguel
      )}/mês`,
    ],
    [
      `Valor do Imóvel Quitado (Mês ${premissas.prazo}):`,
      formatarMoeda(patrimonialCalc.valorImovelNaQuitacao),
    ],
  ];

  linhasB.forEach(([k, v], i) => {
    const ly = y + 13 + i * 5.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(90, 95, 110);
    doc.text(k, q2X + 4, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 28, 38);
    doc.text(v, q2X + boxW2 - 4, ly, { align: 'right' });
  });

  y += boxH2 + 4;

  // Quadrante 3: Carta Contemplada Aplicada (14,31% ao ano)
  doc.setFillColor(252, 252, 254);
  doc.setDrawColor(
    reguaAtiva === 'aplicada' ? 196 : 220,
    reguaAtiva === 'aplicada' ? 148 : 224,
    reguaAtiva === 'aplicada' ? 35 : 232
  );
  doc.setLineWidth(reguaAtiva === 'aplicada' ? 0.55 : 0.3);
  doc.roundedRect(14, y, boxW2, boxH2, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(138, 100, 20);
  doc.text(
    `C) CONTEMPLADA APLICADA (${formatarPercentual(rentAnualPct, 2)} AO ANO)`,
    18,
    y + 6.5
  );

  const linhasC: [string, string][] = [
    [`Crédito Aplicado no ${mesSelecionado}º Mês:`, formatarMoeda(res.creditoCorrigido)],
    [
      'Taxa de Rendimento da Aplicação:',
      `${formatarPercentual(rentAnualPct, 2)} a.a. (${formatarPercentual(
        rentMensalPct,
        4
      )} a.m.)`,
    ],
    [
      `Montante após ${aplicadaCalc.mesesAplicado} Meses Aplicado:`,
      formatarMoeda(aplicadaCalc.montanteFinalPrazoEscolhido),
    ],
    [
      `Resgate em Espécie no Fim (${premissas.prazo}m):`,
      formatarMoeda(aplicadaCalc.montanteFinalFimDoGrupo),
    ],
    [
      'Custo Total das 220 Parcelas:',
      formatarMoeda(aplicadaCalc.custoTotalParcelas220Meses),
    ],
    [
      'Lucro Líquido Acima das Parcelas:',
      `+${formatarMoeda(aplicadaCalc.lucroLiquidoFinalGrupo)}`,
    ],
  ];

  linhasC.forEach(([k, v], i) => {
    const ly = y + 13 + i * 5.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(90, 95, 110);
    doc.text(k, 18, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 28, 38);
    doc.text(v, 14 + boxW2 - 4, ly, { align: 'right' });
  });

  // Quadrante 4: Consórcio vs. Renda Fixa
  doc.setFillColor(252, 252, 254);
  doc.setDrawColor(
    reguaAtiva === 'renda_fixa' ? 196 : 220,
    reguaAtiva === 'renda_fixa' ? 148 : 224,
    reguaAtiva === 'renda_fixa' ? 35 : 232
  );
  doc.setLineWidth(reguaAtiva === 'renda_fixa' ? 0.55 : 0.3);
  doc.roundedRect(q2X, y, boxW2, boxH2, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(138, 100, 20);
  doc.text('D) CONSÓRCIO VS. POUPAR NA RENDA FIXA', q2X + 4, y + 6.5);

  const linhasD: [string, string][] = [
    ['Aporte Mensal Equivalente:', formatarMoeda(res.rendaFixa.parcelaMensalAtual)],
    ['Total Depositado no Período:', formatarMoeda(res.totalInvestido)],
    [
      'Juros Acumulados na Renda Fixa:',
      `+${formatarMoeda(res.rendaFixa.rendimentoJurosRendaFixa)}`,
    ],
    [
      'Saldo Total Acumulado Renda Fixa:',
      formatarMoeda(res.rendaFixa.montanteRendaFixa),
    ],
    [
      'Crédito Corrigido no Consórcio:',
      formatarMoeda(res.rendaFixa.creditoCorrigidoConsorcio),
    ],
    [
      'Ganho de Poder de Compra:',
      `${res.rendaFixa.vantagemConsorcio >= 0 ? '+' : ''}${formatarMoeda(
        res.rendaFixa.vantagemConsorcio
      )}`,
    ],
  ];

  linhasD.forEach(([k, v], i) => {
    const ly = y + 13 + i * 5.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(90, 95, 110);
    doc.text(k, q2X + 4, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 28, 38);
    doc.text(v, q2X + boxW2 - 4, ly, { align: 'right' });
  });

  y += boxH2 + 5.5;

  // -------------------------------------------------------------------------
  // SEÇÃO 4: TABELA DE EVOLUÇÃO POR MARCOS DE CONTEMPLAÇÃO (CRONOGRAMA)
  // -------------------------------------------------------------------------
  if (y > 218) {
    doc.addPage();
    desenharCabecalhoPagina(
      doc,
      logoData,
      opcoes,
      dataHoraStr,
      'Cronograma de Evolução por Marcos & Aceleração Fidelidade'
    );
    y = 41;
  }

  y = desenharTituloSecao(
    doc,
    y,
    '4',
    'Evolução da Cota por Marcos de Contemplação',
    'Comparativo do retorno financeiro conforme o mês em que ocorrer a contemplação'
  );

  // Gera lista de meses-marco garantindo que o mês selecionado pelo usuário esteja presente e destacado
  const marcosBase = [1, 6, 12, 18, 24, 36, 48, 72, 120];
  const marcosValidos = Array.from(
    new Set(
      [...marcosBase, mesSelecionado].filter(
        (m) => m >= 1 && m <= premissas.prazo
      )
    )
  ).sort((a, b) => a - b);

  // Limita a 8 linhas para caber perfeitamente na primeira página se necessário
  const marcosExibidos =
    marcosValidos.length > 8
      ? marcosValidos.filter(
          (m) => m === mesSelecionado || [1, 6, 12, 24, 36, 48, 72].includes(m)
        )
      : marcosValidos;

  // Cabeçalho da Tabela
  const colWidths = [16, 26, 22, 25, 26, 20, 23, 24]; // soma = 182mm = contentWidth
  const colHeaders = [
    'Mês',
    'Crédito Corr.',
    'Meia Parc.',
    'Total Invest.',
    'Lucro Venda',
    'Rentab.',
    'Aluguel/Mês',
    'Aplicada Fim',
  ];

  doc.setFillColor(22, 24, 32);
  doc.rect(14, y, contentWidth, 6.8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.1);
  doc.setTextColor(243, 198, 83);

  let cx = 14;
  colHeaders.forEach((h, idx) => {
    doc.text(h, cx + colWidths[idx] / 2, y + 4.6, { align: 'center' });
    cx += colWidths[idx];
  });

  y += 6.8;

  marcosExibidos.forEach((m, rowIdx) => {
    const rMes = m === mesSelecionado ? res : simularMes(m, premissas);
    const isSelected = m === mesSelecionado;
    const rowH = 5.8;

    if (isSelected) {
      doc.setFillColor(253, 243, 215);
    } else if (rowIdx % 2 === 0) {
      doc.setFillColor(248, 249, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(14, y, contentWidth, rowH, 'F');

    doc.setDrawColor(230, 233, 240);
    doc.setLineWidth(0.2);
    doc.line(14, y + rowH, 14 + contentWidth, y + rowH);

    doc.setFont('helvetica', isSelected ? 'bold' : 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(
      isSelected ? 138 : 35,
      isSelected ? 95 : 40,
      isSelected ? 10 : 52
    );

    const vals = [
      isSelected ? `> ${m}º mês` : `${m}º mês`,
      formatarMoeda(rMes.creditoCorrigido),
      formatarMoeda(rMes.meiaParcela),
      formatarMoeda(rMes.totalInvestido),
      formatarMoeda(rMes.lucro),
      formatarPercentual(rMes.rentabilidade, 0),
      formatarMoeda(rMes.patrimonial.aluguelMensal),
      formatarMoeda(rMes.aplicada.montanteFinalFimDoGrupo),
    ];

    let rcx = 14;
    vals.forEach((v, idx) => {
      doc.text(v, rcx + colWidths[idx] / 2, y + 4.1, { align: 'center' });
      rcx += colWidths[idx];
    });

    y += rowH;
  });

  // Se for relatório completo ou se a régua ativa for fidelidade, adiciona resumo das 6 modalidades
  if (modoRelatorio === 'completo' || reguaAtiva === 'fidelidade') {
    if (y > 240) {
      doc.addPage();
      desenharCabecalhoPagina(
        doc,
        logoData,
        opcoes,
        dataHoraStr,
        'Modalidades de Aceleração de Contemplação & Carteira Multi-Cotas'
      );
      y = 41;
    } else {
      y += 4.5;
    }

    y = desenharTituloSecao(
      doc,
      y,
      '5',
      `Modalidades de Contemplação & Carteira (${numeroCotas} ${
        numeroCotas === 1 ? 'Cota' : 'Cotas'
      })`,
      `${fidelidadeCalc.chancesMensaisCarteira} oportunidades mensais na assembleia no ${mesSelecionado}º mês`
    );

    const modW = (contentWidth - 6) / 3;
    const modH = 14.5;

    fidelidadeCalc.modalidades.forEach((mod, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const mx = 14 + col * (modW + 3);
      const my = y + row * (modH + 2.5);

      if (mod.ativa) {
        doc.setFillColor(246, 253, 249);
        doc.setDrawColor(40, 167, 95);
      } else {
        doc.setFillColor(248, 249, 251);
        doc.setDrawColor(215, 220, 228);
      }
      doc.setLineWidth(0.35);
      doc.roundedRect(mx, my, modW, modH, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.3);
      doc.setTextColor(mod.ativa ? 20 : 90, mod.ativa ? 95 : 95, mod.ativa ? 55 : 110);
      doc.text(mod.nome, mx + 3, my + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(
        mod.ativa ? 'HABILITADO' : `A partir do ${mod.mesMinimo}º mês`,
        mx + modW - 3,
        my + 5,
        { align: 'right' }
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.6);
      doc.setTextColor(95, 100, 115);
      doc.text(
        `Concorrência: ~${mod.concorrenciaEstimadaPct}% do grupo (~${mod.contemplacoesMesEstimadas} contempl./mês)`,
        mx + 3,
        my + 10.8
      );
    });
  }

  // Rodapé em todas as páginas
  desenharRodapePaginas(doc, opcoes);

  // Nome amigável do arquivo PDF
  const slugCliente = opcoes.nomeCliente
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const creditoMil = Math.round(premissas.creditoInicial / 1000);
  const nomeArquivo = slugCliente
    ? `proposta-lft-${slugCliente}-${creditoMil}k-mes-${mesSelecionado}.pdf`
    : `proposta-lft-consorcios-${creditoMil}k-mes-${mesSelecionado}.pdf`;

  doc.save(nomeArquivo);
}
