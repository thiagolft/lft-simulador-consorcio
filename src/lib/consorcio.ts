export type TipoRegua =
  | 'venda'
  | 'patrimonial'
  | 'renda_fixa'
  | 'aplicada'
  | 'fidelidade';

export interface PremissasConsorcio {
  /** Crédito inicial em R$ (padrão: 500.000) */
  creditoInicial: number;
  /** Prazo do grupo em meses (padrão: 220) */
  prazo: number;
  /** Taxa total: administração + fundo de reserva em decimal (padrão: 0.23 = 23%) */
  taxaTotal: number;
  /** Reajuste anual do crédito e da parcela a cada 12 meses em decimal (padrão: 0.05 = 5%) */
  reajusteAnual: number;
  /** Percentual da parcela paga até a contemplação em decimal (padrão: 0.50 = 50%) */
  percentualMeiaParcela: number;
  /** Ágio de venda sobre o crédito corrigido em decimal (padrão: 0.25 = 25%, editável de 10% a 40%) */
  agioVenda: number;
  /** Rentabilidade anual em decimal (padrão: 0.1431 = 14,31% a.a., equivalente a 1,1925% a.m. dividido por 12) */
  rentabilidadeAnual: number;
  /** Taxa de aluguel mensal opcional em decimal (se omitida, usa rentabilidadeAnual / 12) */
  taxaAluguelMensal?: number;
  /** Taxa de rendimento mensal opcional em decimal (se omitida, usa rentabilidadeAnual / 12) */
  taxaCDIMensal?: number;
  /** Taxa de valorização anual estimada do imóvel em decimal (padrão: 0.089 = 8,9% a.a.) */
  taxaValorizacaoImovelAnual?: number;
  /** Percentual de lance fixo embutido em decimal (padrão: 0.30 = 30%) */
  percentualLanceEmbutido?: number;
}

export interface DetalhamentoNominal {
  creditoCorrigido: number;
  parcelaCheia: number;
  meiaParcela: number;
  numeroReajustes: number;
  fatorCorrecao: number;
  totalInvestidoNominal: number;
  valorVendaNominal: number;
  lucroNominal: number;
}

export interface ResultadoCET {
  /** TIR mensal em percentual (ex: 4.52 para 4,52% a.m.), ou null se não convergir */
  tirMensal: number | null;
  /** TIR anualizada em percentual (ex: 70.15 para 70,15% a.a.), ou null se não convergir */
  tirAnual: number | null;
  /** Indica se o cálculo convergiu */
  convergiu: boolean;
}

export interface ResultadoAlavancagemPatrimonial {
  mes: number;
  creditoCorrigido: number;
  creditoDisponivel: number;
  totalInvestidoAteContemplacao: number;
  dividaTotalCorrigida: number;
  saldoDevedorPosContemplacao: number;
  mesesRestantes: number;
  parcelaPosContemplacao: number;
  aluguelMensal: number;
  lucroMensalAluguel: number;
  valorImovelNaQuitacao: number;
  multiplicadorPatrimonial: number;
  usandoMeioCredito: boolean;
}

export interface ResultadoComparativoRendaFixa {
  mes: number;
  parcelaMensalAtual: number;
  totalDepositado: number;
  montanteRendaFixa: number;
  rendimentoJurosRendaFixa: number;
  creditoCorrigidoConsorcio: number;
  vantagemConsorcio: number;
  percentualPoderCompraRendaFixa: number;
  mesEmQueRendaFixaAtingeCreditoInicial: number;
}

export interface ResultadoContempladaAplicada {
  mes: number;
  creditoNaContemplacao: number;
  totalInvestidoAteContemplacao: number;
  mesesRestantesGrupo: number;
  mesesAplicado: number;
  montanteFinalFimDoGrupo: number;
  montanteFinalPrazoEscolhido: number;
  rendimentoBrutoAplicacao: number;
  custoTotalParcelas220Meses: number;
  lucroLiquidoFinalGrupo: number;
}

export interface ModalidadeInfo {
  id: string;
  nome: string;
  mesMinimo: number;
  ativa: boolean;
  concorrenciaEstimadaPct: number;
  contemplacoesMesEstimadas: number;
  descricao: string;
}

export interface ResultadoModalidadesFidelidade {
  mes: number;
  numeroCotas: number;
  modalidades: ModalidadeInfo[];
  modalidadesAtivasCount: number;
  chancesMensaisPorCota: number;
  chancesMensaisCarteira: number;
  creditoTotalCarteira: number;
  parcelaMensalCarteira: number;
  valorVendaTotalCarteira: number;
  lucroVendaTotalCarteira: number;
  creditoLiquidoComLanceEmbutido: number;
  valorVendaComLanceEmbutido: number;
}

export interface ResultadoSimulacaoMes {
  mes: number;
  anos: number;
  creditoCorrigido: number;
  parcelaCheia: number;
  meiaParcela: number;
  totalInvestido: number;
  valorVenda: number;
  lucro: number;
  rentabilidade: number;
  rentabilidadeMensalSimples: number;
  nominal: DetalhamentoNominal;
  cet: ResultadoCET;
  patrimonial: ResultadoAlavancagemPatrimonial;
  rendaFixa: ResultadoComparativoRendaFixa;
  aplicada: ResultadoContempladaAplicada;
  posContemplacao: ResultadoParcelaPosContemplacao;
}

export interface ItemTabelaImovelHS {
  descricao: string;
  credito: number;
  prazo: number;
  parcelaIntegral: number;
  meiaParcela: number;
}

export const TABELA_IMOVEL_HS: ItemTabelaImovelHS[] = [
  { descricao: 'IMÓVEL HS 100', credito: 100000, prazo: 180, parcelaIntegral: 683.20, meiaParcela: 341.50 },
  { descricao: 'IMÓVEL HS 120', credito: 120000, prazo: 180, parcelaIntegral: 819.84, meiaParcela: 409.80 },
  { descricao: 'IMÓVEL HS 150', credito: 150000, prazo: 180, parcelaIntegral: 1024.80, meiaParcela: 512.25 },
  { descricao: 'IMÓVEL HS 180', credito: 180000, prazo: 180, parcelaIntegral: 1229.76, meiaParcela: 614.70 },
  { descricao: 'IMÓVEL HS 200', credito: 200000, prazo: 200, parcelaIntegral: 1230.00, meiaParcela: 615.00 },
  { descricao: 'IMÓVEL HS 250', credito: 250000, prazo: 200, parcelaIntegral: 1537.50, meiaParcela: 768.75 },
  { descricao: 'IMÓVEL HS 300', credito: 300000, prazo: 200, parcelaIntegral: 1845.00, meiaParcela: 922.50 },
  { descricao: 'IMÓVEL HS 350', credito: 350000, prazo: 200, parcelaIntegral: 2152.50, meiaParcela: 1076.25 },
  { descricao: 'IMÓVEL HS 400', credito: 400000, prazo: 200, parcelaIntegral: 2460.00, meiaParcela: 1230.00 },
  { descricao: 'IMÓVEL HS 500', credito: 500000, prazo: 220, parcelaIntegral: 2795.00, meiaParcela: 1397.50 },
  { descricao: 'IMÓVEL HS 600', credito: 600000, prazo: 220, parcelaIntegral: 3354.00, meiaParcela: 1677.00 },
  { descricao: 'IMÓVEL HS 700', credito: 700000, prazo: 220, parcelaIntegral: 3913.00, meiaParcela: 1956.50 },
  { descricao: 'IMÓVEL HS 800', credito: 800000, prazo: 220, parcelaIntegral: 4472.00, meiaParcela: 2236.00 },
  { descricao: 'IMÓVEL HS 900', credito: 900000, prazo: 220, parcelaIntegral: 5031.00, meiaParcela: 2515.50 },
  { descricao: 'IMÓVEL HS 1000', credito: 1000000, prazo: 220, parcelaIntegral: 5590.90, meiaParcela: 2795.00 },
  { descricao: 'IMÓVEL HS 1100', credito: 1100000, prazo: 220, parcelaIntegral: 6149.00, meiaParcela: 3074.50 },
];

export function obterItemTabelaHS(
  credito: number,
  prazo?: number
): ItemTabelaImovelHS | undefined {
  return TABELA_IMOVEL_HS.find(
    (item) =>
      Math.abs(item.credito - credito) < 0.01 &&
      (prazo === undefined || item.prazo === prazo)
  );
}

export const PREMISSAS_PADRAO: PremissasConsorcio = {
  creditoInicial: 500000,
  prazo: 220,
  taxaTotal: 0.23,
  reajusteAnual: 0.05,
  percentualMeiaParcela: 0.5,
  agioVenda: 0.25, // 25,0% padrão em todo o sistema
  rentabilidadeAnual: 0.1431, // 14,31% a.a. -> dividido por 12 = 1,1925% a.m. (0.011925)
  taxaValorizacaoImovelAnual: 0.089,
  percentualLanceEmbutido: 0.3,
};

/**
 * Retorna a rentabilidade mensal (dividindo a rentabilidade anual por 12 mês a mês).
 * Padrão: 14,31% / 12 = 1,1925% ao mês (0.011925).
 */
export function obterRentabilidadeMensal(
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  return premissas.taxaAluguelMensal ?? (premissas.rentabilidadeAnual ?? 0.1431) / 12;
}

/**
 * Arredonda um número para 2 casas decimais (centavos/percentual padrão).
 */
export function round2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula o número de reajustes anuais aplicados no mês M (1 a prazo).
 * Fórmula: anos = floor((M - 1) / 12)
 */
export function calcularAnosReajuste(mes: number): number {
  const m = Math.max(1, Math.floor(mes));
  return Math.floor((m - 1) / 12);
}

/**
 * Calcula o crédito corrigido no mês M.
 * Fórmula: creditoCorrigido(M) = credito * (1 + reajuste)^anos
 */
export function calcularCreditoCorrigido(
  mes: number,
  creditoInicial: number,
  reajusteAnual: number
): number {
  const anos = calcularAnosReajuste(mes);
  return creditoInicial * Math.pow(1 + reajusteAnual, anos);
}

/**
 * Calcula a parcela cheia no mês M.
 * Se o crédito/prazo constar na TABELA_IMOVEL_HS (com taxa padrão), utiliza a Parcela Integral oficial da tabela corrigida anualmente.
 * Caso contrário, utiliza a fórmula: parcelaCheia(M) = creditoCorrigido(M) * (1 + taxaTotal) / prazo
 */
export function calcularParcelaCheia(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  const anos = calcularAnosReajuste(mes);
  const fatorCorrecao = Math.pow(1 + premissas.reajusteAnual, anos);
  const itemHS = obterItemTabelaHS(premissas.creditoInicial, premissas.prazo);

  if (itemHS && Math.abs(premissas.taxaTotal - PREMISSAS_PADRAO.taxaTotal) < 1e-6) {
    return itemHS.parcelaIntegral * fatorCorrecao;
  }

  const creditoCorrigido = premissas.creditoInicial * fatorCorrecao;
  return (creditoCorrigido * (1 + premissas.taxaTotal)) / premissas.prazo;
}

/**
 * Calcula a meia parcela (ou percentual reduzido configurado) no mês M.
 * Se o crédito/prazo constar na TABELA_IMOVEL_HS (com taxa e percentual de 50% padrão), utiliza a 1/2 Parcela oficial da tabela corrigida anualmente.
 * Caso contrário, utiliza: meiaParcela(M) = parcelaCheia(M) * percentualMeiaParcela
 */
export function calcularMeiaParcela(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  const anos = calcularAnosReajuste(mes);
  const fatorCorrecao = Math.pow(1 + premissas.reajusteAnual, anos);
  const itemHS = obterItemTabelaHS(premissas.creditoInicial, premissas.prazo);

  if (
    itemHS &&
    Math.abs(premissas.taxaTotal - PREMISSAS_PADRAO.taxaTotal) < 1e-6 &&
    Math.abs(premissas.percentualMeiaParcela - 0.5) < 1e-6
  ) {
    return itemHS.meiaParcela * fatorCorrecao;
  }

  return calcularParcelaCheia(mes, premissas) * premissas.percentualMeiaParcela;
}

/**
 * Calcula o total investido acumulado até o mês M (soma de meiaParcela(k) para k = 1..M).
 */
export function calcularTotalInvestido(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  const m = Math.max(1, Math.floor(mes));
  let soma = 0;
  for (let k = 1; k <= m; k++) {
    soma += calcularMeiaParcela(k, premissas);
  }
  return round2(soma);
}

/**
 * Calcula o custo total de todas as parcelas cheias ao longo de todo o prazo (ex: 220 meses -> ~R$ 970.349,12).
 */
export function calcularCustoTotalPlanoCompleto(
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  let soma = 0;
  for (let k = 1; k <= premissas.prazo; k++) {
    soma += calcularParcelaCheia(k, premissas);
  }
  return round2(soma);
}

/**
 * Calcula o valor da venda da carta contemplada no mês M.
 * Fórmula: valorVenda(M) = creditoCorrigido(M) * ágio
 */
export function calcularValorVenda(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  const creditoCorrigido = calcularCreditoCorrigido(
    mes,
    premissas.creditoInicial,
    premissas.reajusteAnual
  );
  return round2(creditoCorrigido * premissas.agioVenda);
}

/**
 * Calcula o lucro líquido da operação no mês M.
 * Fórmula: lucro(M) = valorVenda(M) - totalInvestido(M)
 */
export function calcularLucro(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  const valorVenda = calcularValorVenda(mes, premissas);
  const totalInvestido = calcularTotalInvestido(mes, premissas);
  return round2(valorVenda - totalInvestido);
}

/**
 * Calcula a rentabilidade percentual total no mês M.
 * Fórmula: rentabilidade(M) = lucro(M) / totalInvestido(M) * 100
 */
export function calcularRentabilidade(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): number {
  const totalInvestido = calcularTotalInvestido(mes, premissas);
  if (totalInvestido <= 0) return 0;
  const lucro = calcularLucro(mes, premissas);
  return round2((lucro / totalInvestido) * 100);
}

/**
 * Premissa a validar:
 * Detalhamento Nominal — exibe os valores nominais (sem desconto de inflação),
 * com detalhamento da conta (parcela cheia, meia parcela, crédito corrigido no mês,
 * nº de reajustes aplicados).
 */
export function calcularDetalhamentoNominal(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): DetalhamentoNominal {
  const numeroReajustes = calcularAnosReajuste(mes);
  const fatorCorrecao = Math.pow(1 + premissas.reajusteAnual, numeroReajustes);
  const creditoCorrigido = round2(
    calcularCreditoCorrigido(mes, premissas.creditoInicial, premissas.reajusteAnual)
  );
  const parcelaCheia = round2(calcularParcelaCheia(mes, premissas));
  const meiaParcela = round2(calcularMeiaParcela(mes, premissas));
  const totalInvestidoNominal = calcularTotalInvestido(mes, premissas);
  const valorVendaNominal = calcularValorVenda(mes, premissas);
  const lucroNominal = calcularLucro(mes, premissas);

  return {
    creditoCorrigido,
    parcelaCheia,
    meiaParcela,
    numeroReajustes,
    fatorCorrecao,
    totalInvestidoNominal,
    valorVendaNominal,
    lucroNominal,
  };
}

/**
 * Premissa a validar:
 * Cálculo do CET / Taxa Interna de Retorno (TIR) mensal e anualizada do fluxo de caixa:
 * - Saídas: meias parcelas pagas nos meses k = 1..M
 * - Entrada: valor da venda recebido no mês M
 * Para M muito baixo (ex: M = 1 onde saída e entrada ocorrem no mesmo único período,
 * ou quando a taxa mensal diverge / ultrapassa o limite numérico), retorna convergiu = false ("n/d").
 */
export function calcularCET(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): ResultadoCET {
  const m = Math.max(1, Math.floor(mes));

  if (m <= 1) {
    return { tirMensal: null, tirAnual: null, convergiu: false };
  }

  const fluxos: number[] = [];
  for (let k = 1; k <= m; k++) {
    const saida = -calcularMeiaParcela(k, premissas);
    if (k < m) {
      fluxos.push(saida);
    } else {
      const entrada = calcularValorVenda(m, premissas);
      fluxos.push(saida + entrada);
    }
  }

  const temNegativo = fluxos.some((v) => v < 0);
  const temPositivo = fluxos.some((v) => v > 0);
  if (!temNegativo || !temPositivo) {
    return { tirMensal: null, tirAnual: null, convergiu: false };
  }

  const npv = (rate: number): number => {
    let acc = 0;
    for (let t = 0; t < fluxos.length; t++) {
      acc += fluxos[t] / Math.pow(1 + rate, t);
    }
    return acc;
  };

  let low = -0.95;
  let high = 10.0;
  let fLow = npv(low);
  let fHigh = npv(high);

  if (isNaN(fLow) || isNaN(fHigh) || fLow * fHigh > 0) {
    return { tirMensal: null, tirAnual: null, convergiu: false };
  }

  let mid = 0;
  const maxIter = 200;
  const tol = 1e-7;
  let convergiu = false;

  for (let i = 0; i < maxIter; i++) {
    mid = (low + high) / 2;
    const fMid = npv(mid);

    if (Math.abs(fMid) < tol || (high - low) / 2 < tol) {
      convergiu = true;
      break;
    }

    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  if (!convergiu || !isFinite(mid)) {
    return { tirMensal: null, tirAnual: null, convergiu: false };
  }

  const tirMensalDecimal = mid;
  const tirAnualDecimal = Math.pow(1 + tirMensalDecimal, 12) - 1;

  if (!isFinite(tirAnualDecimal) || tirAnualDecimal > 1e6) {
    return {
      tirMensal: round2(tirMensalDecimal * 100),
      tirAnual: null,
      convergiu: false,
    };
  }

  return {
    tirMensal: round2(tirMensalDecimal * 100),
    tirAnual: round2(tirAnualDecimal * 100),
    convergiu: true,
  };
}

/**
 * RÉGUA 2: Alavancagem Patrimonial (Imóveis & Renda Passiva)
 * Calcula o crédito para compra do imóvel, aluguel mensal (padrão 1% a.m.),
 * parcela pós-contemplação com residual diluído no prazo restante (ex: M=25 -> R$ 3.292,88; M=69 -> R$ 4.478,00),
 * lucro líquido mensal de locação e valor estimado do imóvel na quitação.
 */
export function calcularAlavancagemPatrimonial(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO,
  usarMeioCredito = false
): ResultadoAlavancagemPatrimonial {
  const m = Math.max(1, Math.min(premissas.prazo, Math.floor(mes)));
  const taxaAluguel = obterRentabilidadeMensal(premissas);
  const taxaValAnual = premissas.taxaValorizacaoImovelAnual ?? 0.089;

  const creditoCorrigido = round2(
    calcularCreditoCorrigido(m, premissas.creditoInicial, premissas.reajusteAnual)
  );
  const totalInvestidoAteContemplacao = calcularTotalInvestido(m, premissas);
  const dividaTotalCorrigida = round2(creditoCorrigido * (1 + premissas.taxaTotal));
  const saldoDevedorPosContemplacao = round2(
    Math.max(0, dividaTotalCorrigida - totalInvestidoAteContemplacao)
  );
  const mesesRestantes = Math.max(1, premissas.prazo - m);

  const creditoDisponivel = usarMeioCredito
    ? round2(creditoCorrigido * 0.5)
    : creditoCorrigido;

  const parcelaPosContemplacao = usarMeioCredito
    ? round2(calcularMeiaParcela(m, premissas))
    : round2(saldoDevedorPosContemplacao / mesesRestantes);

  const aluguelMensal = round2(creditoDisponivel * taxaAluguel);
  const lucroMensalAluguel = round2(aluguelMensal - parcelaPosContemplacao);

  const taxaMensalImovel = Math.pow(1 + taxaValAnual, 1 / 12) - 1;
  const valorImovelNaQuitacao = round2(
    creditoDisponivel * Math.pow(1 + taxaMensalImovel, premissas.prazo - m)
  );

  const multiplicadorPatrimonial =
    totalInvestidoAteContemplacao > 0
      ? round2(creditoDisponivel / totalInvestidoAteContemplacao)
      : 0;

  return {
    mes: m,
    creditoCorrigido,
    creditoDisponivel,
    totalInvestidoAteContemplacao,
    dividaTotalCorrigida,
    saldoDevedorPosContemplacao,
    mesesRestantes,
    parcelaPosContemplacao,
    aluguelMensal,
    lucroMensalAluguel,
    valorImovelNaQuitacao,
    multiplicadorPatrimonial,
    usandoMeioCredito: usarMeioCredito,
  };
}

/**
 * RÉGUA 3: Consórcio vs. Renda Fixa (Combate à Inflação)
 * Simula guardar a mesma meia parcela mensal corrigida anualmente em uma aplicação
 * de Renda Fixa rendendo taxaCDIMensal (padrão 1% a.m.) e compara com o Crédito Corrigido do consórcio.
 */
export function calcularComparativoRendaFixa(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): ResultadoComparativoRendaFixa {
  const m = Math.max(1, Math.min(premissas.prazo, Math.floor(mes)));
  const taxaMensalRF = premissas.taxaCDIMensal ?? obterRentabilidadeMensal(premissas);

  let montanteRF = 0;
  let montanteAteMes = 0;
  let totalDepositado = 0;
  let mesAtingeCreditoInicial = premissas.prazo;
  let jaAtingiu = false;

  for (let k = 1; k <= premissas.prazo; k++) {
    const aporte = calcularMeiaParcela(k, premissas);
    montanteRF = (montanteRF + aporte) * (1 + taxaMensalRF);

    if (k <= m) {
      totalDepositado += aporte;
      montanteAteMes = montanteRF;
    }

    if (!jaAtingiu && montanteRF >= premissas.creditoInicial) {
      mesAtingeCreditoInicial = k;
      jaAtingiu = true;
    }
    if (k >= m && jaAtingiu) {
      break;
    }
  }

  const totalDepRounded = round2(totalDepositado);
  const montanteRFRounded = round2(montanteAteMes);
  const rendimentoJurosRendaFixa = round2(montanteRFRounded - totalDepRounded);
  const creditoCorrigidoConsorcio = round2(
    calcularCreditoCorrigido(m, premissas.creditoInicial, premissas.reajusteAnual)
  );
  const vantagemConsorcio = round2(creditoCorrigidoConsorcio - montanteRFRounded);
  const percentualPoderCompraRendaFixa =
    creditoCorrigidoConsorcio > 0
      ? round2((montanteRFRounded / creditoCorrigidoConsorcio) * 100)
      : 0;

  return {
    mes: m,
    parcelaMensalAtual: round2(calcularMeiaParcela(m, premissas)),
    totalDepositado: totalDepRounded,
    montanteRendaFixa: montanteRFRounded,
    rendimentoJurosRendaFixa,
    creditoCorrigidoConsorcio,
    vantagemConsorcio,
    percentualPoderCompraRendaFixa,
    mesEmQueRendaFixaAtingeCreditoInicial: mesAtingeCreditoInicial,
  };
}

/**
 * RÉGUA 4: Carta Contemplada Aplicada (Rendendo 100% do CDI na Administradora)
 * Calcula a evolução do crédito contemplado no mês M quando deixado aplicado a 100% do CDI (padrão 1% a.m.)
 * até o final do grupo (prazo - M meses) ou por um período customizado (ex: 40 meses).
 */
export function calcularContempladaAplicada(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO,
  mesesAplicadoCustom?: number
): ResultadoContempladaAplicada {
  const m = Math.max(1, Math.min(premissas.prazo, Math.floor(mes)));
  const taxaCDI = premissas.taxaCDIMensal ?? obterRentabilidadeMensal(premissas);

  const creditoNaContemplacao = round2(
    calcularCreditoCorrigido(m, premissas.creditoInicial, premissas.reajusteAnual)
  );
  const totalInvestidoAteContemplacao = calcularTotalInvestido(m, premissas);
  const mesesRestantesGrupo = Math.max(0, premissas.prazo - m);
  const mesesAplicado =
    mesesAplicadoCustom !== undefined
      ? Math.max(0, Math.floor(mesesAplicadoCustom))
      : mesesRestantesGrupo;

  // No mês 1, se deixar pelos 220 meses ou (prazo - m) meses restantes:
  const PeriodosFimGrupo = m === 1 ? premissas.prazo : mesesRestantesGrupo;
  const montanteFinalFimDoGrupo = round2(
    creditoNaContemplacao * Math.pow(1 + taxaCDI, PeriodosFimGrupo)
  );

  const montanteFinalPrazoEscolhido = round2(
    creditoNaContemplacao * Math.pow(1 + taxaCDI, mesesAplicado)
  );

  const rendimentoBrutoAplicacao = round2(
    montanteFinalPrazoEscolhido - creditoNaContemplacao
  );

  const custoTotalParcelas220Meses = calcularCustoTotalPlanoCompleto(premissas);
  const lucroLiquidoFinalGrupo = round2(
    montanteFinalFimDoGrupo - custoTotalParcelas220Meses
  );

  return {
    mes: m,
    creditoNaContemplacao,
    totalInvestidoAteContemplacao,
    mesesRestantesGrupo,
    mesesAplicado,
    montanteFinalFimDoGrupo,
    montanteFinalPrazoEscolhido,
    rendimentoBrutoAplicacao,
    custoTotalParcelas220Meses,
    lucroLiquidoFinalGrupo,
  };
}

/**
 * RÉGUA 5: Modalidades de Contemplação (Sorteio, Fixo/Embutido 30%, Fidelidades 6, 12, 18 e 24 meses) & Multi-Cotas
 */
export function calcularModalidadesFidelidade(
  mes: number,
  numeroCotas = 1,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): ResultadoModalidadesFidelidade {
  const m = Math.max(1, Math.min(premissas.prazo, Math.floor(mes)));
  const cotas = Math.max(1, Math.min(100, Math.floor(numeroCotas)));
  const pctEmbutido = premissas.percentualLanceEmbutido ?? 0.3;

  const modalidades: ModalidadeInfo[] = [
    {
      id: 'sorteio',
      nome: 'Sorteio Geral',
      mesMinimo: 1,
      ativa: m >= 1,
      concorrenciaEstimadaPct: 75,
      contemplacoesMesEstimadas: 1,
      descricao: 'Participam todos os consorciados com boleto pago em dia na assembleia.',
    },
    {
      id: 'fixo',
      nome: `Lance Fixo Embutido (${Math.round(pctEmbutido * 100)}%)`,
      mesMinimo: 1,
      ativa: m >= 1,
      concorrenciaEstimadaPct: 60,
      contemplacoesMesEstimadas: 2,
      descricao: `Utiliza ${Math.round(pctEmbutido * 100)}% do próprio crédito como lance, sem desembolso extra.`,
    },
    {
      id: 'fidelidade_6',
      nome: 'Lance Fidelidade 6 Meses',
      mesMinimo: 6,
      ativa: m >= 6,
      concorrenciaEstimadaPct: 45,
      contemplacoesMesEstimadas: 2,
      descricao: 'Exclusivo para quem pagou 6 parcelas consecutivas rigorosamente em dia.',
    },
    {
      id: 'fidelidade_12',
      nome: 'Lance Fidelidade 12 Meses',
      mesMinimo: 12,
      ativa: m >= 12,
      concorrenciaEstimadaPct: 30,
      contemplacoesMesEstimadas: 2,
      descricao: 'Exclusivo para quem completou 12 meses consecutivos sem nenhum atraso.',
    },
    {
      id: 'fidelidade_18',
      nome: 'Lance Fidelidade 18 Meses',
      mesMinimo: 18,
      ativa: m >= 18,
      concorrenciaEstimadaPct: 18,
      contemplacoesMesEstimadas: 2,
      descricao: 'Concorrência altamente filtrada: 1 ano e meio de pagamentos consecutivos em dia.',
    },
    {
      id: 'fidelidade_24',
      nome: 'Lance Fidelidade 24 Meses',
      mesMinimo: 24,
      ativa: m >= 24,
      concorrenciaEstimadaPct: 10,
      contemplacoesMesEstimadas: 3,
      descricao: 'Prioridade máxima de distribuição na assembleia para quem completou 24 meses em dia.',
    },
  ];

  const modalidadesAtivasCount = modalidades.filter((mod) => mod.ativa).length;
  const chancesMensaisPorCota = modalidadesAtivasCount;
  const chancesMensaisCarteira = modalidadesAtivasCount * cotas;

  const creditoUnitario = round2(
    calcularCreditoCorrigido(m, premissas.creditoInicial, premissas.reajusteAnual)
  );
  const meiaParcelaUnitaria = round2(calcularMeiaParcela(m, premissas));
  const valorVendaUnitario = calcularValorVenda(m, premissas);
  const lucroUnitario = calcularLucro(m, premissas);

  const creditoLiquidoComLanceEmbutido = round2(
    creditoUnitario * (1 - pctEmbutido)
  );
  const valorVendaComLanceEmbutido = round2(
    creditoLiquidoComLanceEmbutido * premissas.agioVenda
  );

  return {
    mes: m,
    numeroCotas: cotas,
    modalidades,
    modalidadesAtivasCount,
    chancesMensaisPorCota,
    chancesMensaisCarteira,
    creditoTotalCarteira: round2(creditoUnitario * cotas),
    parcelaMensalCarteira: round2(meiaParcelaUnitaria * cotas),
    valorVendaTotalCarteira: round2(valorVendaUnitario * cotas),
    lucroVendaTotalCarteira: round2(lucroUnitario * cotas),
    creditoLiquidoComLanceEmbutido,
    valorVendaComLanceEmbutido,
  };
}

export interface ResultadoParcelaPosContemplacao {
  mes: number;
  mesesRestantes: number;
  /** Soma (parcela cheia − meia parcela) dos meses 1..M: o que deixou de ser pago até contemplar */
  diferencaNaoPaga: number;
  /** Parcela cheia corrigida vigente após a contemplação */
  parcelaCheia: number;
  /** Parte da diferença rateada em cada parcela restante */
  acrescimoMensal: number;
  /** Parcela cheia + acréscimo mensal */
  parcelaFinal: number;
}

/**
 * Regra HS Consórcios: meia parcela até a contemplação. Após contemplar, a parcela
 * volta a ser cheia e a diferença não paga (cheia − meia nos meses 1..M) é diluída
 * nas parcelas restantes até o final do grupo.
 */
export function calcularParcelaPosContemplacao(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): ResultadoParcelaPosContemplacao {
  const m = Math.max(1, Math.min(premissas.prazo, Math.floor(mes)));
  let diferenca = 0;
  for (let k = 1; k <= m; k++) {
    diferenca += calcularParcelaCheia(k, premissas) - calcularMeiaParcela(k, premissas);
  }
  const mesesRestantes = Math.max(0, premissas.prazo - m);
  const parcelaCheia = calcularParcelaCheia(Math.min(m + 1, premissas.prazo), premissas);
  const acrescimoMensal = mesesRestantes > 0 ? diferenca / mesesRestantes : 0;
  return {
    mes: m,
    mesesRestantes,
    diferencaNaoPaga: round2(diferenca),
    parcelaCheia: round2(parcelaCheia),
    acrescimoMensal: round2(acrescimoMensal),
    parcelaFinal: round2(parcelaCheia + acrescimoMensal),
  };
}

/**
 * Simula todos os indicadores para um determinado mês M (1 a prazo).
 */
export function simularMes(
  mes: number,
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): ResultadoSimulacaoMes {
  const m = Math.max(1, Math.min(premissas.prazo, Math.floor(mes)));
  const anos = calcularAnosReajuste(m);
  const creditoCorrigido = round2(
    calcularCreditoCorrigido(m, premissas.creditoInicial, premissas.reajusteAnual)
  );
  const parcelaCheia = round2(calcularParcelaCheia(m, premissas));
  const meiaParcela = round2(calcularMeiaParcela(m, premissas));
  const totalInvestido = calcularTotalInvestido(m, premissas);
  const valorVenda = calcularValorVenda(m, premissas);
  const lucro = calcularLucro(m, premissas);
  const rentabilidade = calcularRentabilidade(m, premissas);
  const rentabilidadeMensalSimples = round2(rentabilidade / m);
  const nominal = calcularDetalhamentoNominal(m, premissas);
  const cet = calcularCET(m, premissas);
  const patrimonial = calcularAlavancagemPatrimonial(m, premissas, false);
  const rendaFixa = calcularComparativoRendaFixa(m, premissas);
  const aplicada = calcularContempladaAplicada(m, premissas);

  return {
    mes: m,
    anos,
    creditoCorrigido,
    parcelaCheia,
    meiaParcela,
    totalInvestido,
    valorVenda,
    lucro,
    rentabilidade,
    rentabilidadeMensalSimples,
    nominal,
    cet,
    patrimonial,
    rendaFixa,
    aplicada,
    posContemplacao: calcularParcelaPosContemplacao(m, premissas),
  };
}

/**
 * Gera a série completa de 1 até o prazo do grupo para gráficos e análises.
 */
export function gerarSerieCompleta(
  premissas: PremissasConsorcio = PREMISSAS_PADRAO
): ResultadoSimulacaoMes[] {
  const serie: ResultadoSimulacaoMes[] = [];
  for (let m = 1; m <= premissas.prazo; m++) {
    serie.push(simularMes(m, premissas));
  }
  return serie;
}

/**
 * Formata valor numérico para moeda BRL (R$ 500.000,00)
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata percentual no padrão pt-BR (ex: 7054,46%)
 */
export function formatarPercentual(valor: number, casas = 2): string {
  return `${valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}
