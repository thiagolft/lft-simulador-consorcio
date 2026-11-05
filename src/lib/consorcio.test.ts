import { describe, it, expect } from 'vitest';
import {
  PREMISSAS_PADRAO,
  TABELA_IMOVEL_HS,
  calcularAnosReajuste,
  calcularCreditoCorrigido,
  calcularMeiaParcela,
  calcularParcelaCheia,
  calcularTotalInvestido,
  calcularDetalhamentoNominal,
  calcularCET,
  calcularAlavancagemPatrimonial,
  calcularComparativoRendaFixa,
  calcularContempladaAplicada,
  calcularModalidadesFidelidade,
  calcularCustoTotalPlanoCompleto,
  obterRentabilidadeMensal,
  simularMes,
  round2,
} from './consorcio';

describe('Simulador LFT Consórcios - Todas as Réguas (consorcio.ts)', () => {
  describe('Tabela IMÓVEL HS (100 a 1100)', () => {
    it('deve conter os 16 planos oficiais com os valores exatos de Crédito, Prazo, Parcela Integral e 1/2 Parcela', () => {
      expect(TABELA_IMOVEL_HS).toHaveLength(16);

      for (const item of TABELA_IMOVEL_HS) {
        const premissasPlano = {
          ...PREMISSAS_PADRAO,
          creditoInicial: item.credito,
          prazo: item.prazo,
        };
        expect(round2(calcularParcelaCheia(1, premissasPlano))).toBe(item.parcelaIntegral);
        expect(round2(calcularMeiaParcela(1, premissasPlano))).toBe(item.meiaParcela);
      }
    });
  });

  describe('Régua 1: Teste de calibração (Mês 1, Crédito R$ 500.000 - IMÓVEL HS 500, Ágio padrão 25,0%)', () => {
    it('deve reproduzir exatamente os valores de referência no mês 1 com premissas padrão (ágio 25,0%)', () => {
      const resultado = simularMes(1, PREMISSAS_PADRAO);

      expect(PREMISSAS_PADRAO.agioVenda).toBe(0.25);
      expect(resultado.creditoCorrigido).toBe(500000.0);
      expect(resultado.parcelaCheia).toBe(2795.0);
      expect(resultado.meiaParcela).toBe(1397.5);
      expect(resultado.totalInvestido).toBe(1397.5);
      expect(resultado.valorVenda).toBe(125000.0);
      expect(resultado.lucro).toBe(123602.5);
      expect(resultado.rentabilidade).toBe(8844.54);
    });
  });

  describe('Reajuste anual e correção do crédito (Matemática do Consórcio)', () => {
    it('não deve aplicar reajuste nos meses 1 a 12 (anos = 0)', () => {
      for (let m = 1; m <= 12; m++) {
        expect(calcularAnosReajuste(m)).toBe(0);
        expect(calcularCreditoCorrigido(m, 500000, 0.05)).toBe(500000);
      }
    });

    it('deve aplicar 1 reajuste de 5% nos meses 13 a 24 (R$ 525.000)', () => {
      for (let m = 13; m <= 24; m++) {
        expect(calcularAnosReajuste(m)).toBe(1);
        expect(round2(calcularCreditoCorrigido(m, 500000, 0.05))).toBe(525000);
      }
    });

    it('deve aplicar 2 reajustes compostos no mês 25 (R$ 551.250)', () => {
      expect(calcularAnosReajuste(25)).toBe(2);
      expect(round2(calcularCreditoCorrigido(25, 500000, 0.05))).toBe(551250);
    });

    it('deve acumular R$ 34.378,50 ao final do 2º ano (mês 24) e R$ 52.867,43 no 3º ano (mês 36)', () => {
      expect(calcularTotalInvestido(24, PREMISSAS_PADRAO)).toBe(34378.5);
      expect(calcularTotalInvestido(36, PREMISSAS_PADRAO)).toBe(52867.43);
    });

    it('deve somar R$ 970.466,18 de custo total ao longo dos 220 meses', () => {
      expect(calcularCustoTotalPlanoCompleto(PREMISSAS_PADRAO)).toBe(970466.18);
    });
  });

  describe('Régua 2: Alavancagem Patrimonial (Imóveis & Renda Passiva)', () => {
    it('deve converter a rentabilidade anual padrão de 14,31% em 1,1925% ao mês (dividido por 12)', () => {
      expect(PREMISSAS_PADRAO.rentabilidadeAnual).toBe(0.1431);
      expect(obterRentabilidadeMensal(PREMISSAS_PADRAO)).toBeCloseTo(0.011925, 8);
    });

    it('deve calcular corretamente o aluguel mensal com 1,1925% a.m. (14,31% a.a.) no mês 25', () => {
      const pat25 = calcularAlavancagemPatrimonial(25, PREMISSAS_PADRAO, false);
      expect(pat25.creditoDisponivel).toBe(551250);
      expect(pat25.aluguelMensal).toBe(round2(551250 * 0.011925));
      expect(pat25.parcelaPosContemplacao).toBe(3292.91);
    });

    it('deve reproduzir a parcela pós-contemplação no mês 69', () => {
      const pat69 = calcularAlavancagemPatrimonial(69, PREMISSAS_PADRAO, false);
      expect(pat69.creditoDisponivel).toBe(638140.78);
      expect(pat69.aluguelMensal).toBe(round2(638140.78 * 0.011925));
      expect(pat69.parcelaPosContemplacao).toBe(4478.12);
    });

    it('deve permitir a flexibilidade de continuar pagando meia parcela pegando meio crédito', () => {
      const patMeio = calcularAlavancagemPatrimonial(69, PREMISSAS_PADRAO, true);
      expect(patMeio.usandoMeioCredito).toBe(true);
      expect(patMeio.creditoDisponivel).toBe(round2(638140.78 * 0.5));
      expect(patMeio.parcelaPosContemplacao).toBe(
        round2(calcularMeiaParcela(69, PREMISSAS_PADRAO))
      );
    });
  });

  describe('Régua 3: Consórcio vs. Renda Fixa (Combate à Inflação)', () => {
    it('deve demonstrar no mês 136 que o total depositado é R$ 247.808,62 e o Crédito Corrigido está em R$ 855.169,68', () => {
      const rf136 = calcularComparativoRendaFixa(136, PREMISSAS_PADRAO);
      expect(rf136.totalDepositado).toBe(247808.62);
      expect(rf136.creditoCorrigidoConsorcio).toBe(855169.68);
      expect(rf136.montanteRendaFixa).toBeGreaterThan(500000);
      expect(rf136.vantagemConsorcio).toBeGreaterThan(250000);
    });
  });

  describe('Régua 4: Carta Contemplada Aplicada (100% do CDI)', () => {
    it('deve projetar evolução com 1,1925% a.m. (14,31% a.a.) ao contemplar no mês 70 e aplicar até o fim do grupo', () => {
      const ap70 = calcularContempladaAplicada(70, PREMISSAS_PADRAO);
      expect(ap70.creditoNaContemplacao).toBe(638140.78);
      expect(ap70.mesesRestantesGrupo).toBe(150);
      expect(ap70.montanteFinalFimDoGrupo).toBe(
        round2(638140.78 * Math.pow(1 + 0.011925, 150))
      );
    });

    it('deve projetar evolução ao contemplar no mês 70 e deixar aplicado por 40 meses', () => {
      const ap70_40m = calcularContempladaAplicada(70, PREMISSAS_PADRAO, 40);
      expect(ap70_40m.montanteFinalPrazoEscolhido).toBe(
        round2(638140.78 * Math.pow(1 + 0.011925, 40))
      );
    });

    it('deve projetar evolução ao contemplar no 1º mês e aplicar pelos 220 meses', () => {
      const ap1 = calcularContempladaAplicada(1, PREMISSAS_PADRAO);
      expect(ap1.montanteFinalFimDoGrupo).toBe(
        round2(500000 * Math.pow(1 + 0.011925, 220))
      );
      expect(ap1.lucroLiquidoFinalGrupo).toBeGreaterThan(5000000);
    });
  });

  describe('Régua 5: Modalidades de Contemplação (Fidelidade) & Multi-Cotas', () => {
    it('deve habilitar 2 modalidades no mês 1 e todas as 6 modalidades a partir do mês 24', () => {
      const mod1 = calcularModalidadesFidelidade(1, 1, PREMISSAS_PADRAO);
      expect(mod1.modalidadesAtivasCount).toBe(2);

      const mod12 = calcularModalidadesFidelidade(12, 2, PREMISSAS_PADRAO);
      expect(mod12.modalidadesAtivasCount).toBe(4);
      expect(mod12.chancesMensaisCarteira).toBe(8);

      const mod24 = calcularModalidadesFidelidade(24, 10, PREMISSAS_PADRAO);
      expect(mod24.modalidadesAtivasCount).toBe(6);
      expect(mod24.chancesMensaisCarteira).toBe(60);
    });
  });

  describe('Seletores Nominal e CET', () => {
    it('deve retornar detalhamento nominal consistente (ágio 25,0%)', () => {
      const nom = calcularDetalhamentoNominal(15, PREMISSAS_PADRAO);
      expect(nom.numeroReajustes).toBe(1);
      expect(nom.creditoCorrigido).toBe(525000);
      expect(nom.valorVendaNominal).toBe(131250);
    });

    it('deve retornar convergiu = false ("n/d") para M muito baixo (M = 1)', () => {
      const cet1 = calcularCET(1, PREMISSAS_PADRAO);
      expect(cet1.convergiu).toBe(false);
      expect(cet1.tirMensal).toBeNull();
      expect(cet1.tirAnual).toBeNull();
    });

    it('deve convergir e calcular TIR mensal e anual positiva para meses intermediários (ex: M = 24)', () => {
      const cet24 = calcularCET(24, PREMISSAS_PADRAO);
      expect(cet24.convergiu).toBe(true);
      expect(cet24.tirMensal).not.toBeNull();
      expect(cet24.tirAnual).not.toBeNull();
    });
  });
});
