# Simulador de Venda Contemplada – Alavancagem Financeira (LFT Consórcios)

Aplicação web de página única (SPA) desenvolvida em **React + Vite + TypeScript + Tailwind CSS + Recharts** para simulação financeira de venda de cota contemplada de consórcio da **LFT Consórcios**.

## Como executar o projeto

```bash
npm install
npm run dev
```

Para rodar a suíte de testes unitários (Vitest):

```bash
npm test
```

Para gerar o build de produção:

```bash
npm run build
```

---

## Como alterar as premissas padrão

1. **Pela interface (em tempo de execução):**
   - Clique diretamente sobre o valor de **Crédito** (`Crédito: R$ 500.000,00`) para editar o valor da carta.
   - Clique no botão **Premissas** ou no ícone de **Calculadora** na base da caixa `RESULTADOS` para abrir o painel recolhível e ajustar:
     - Crédito inicial (`R$`)
     - Prazo do grupo (`meses`)
     - Taxa total de administração + fundo de reserva (`%`)
     - Reajuste anual a cada 12 meses (`%`)
     - Percentual da parcela reduzida até a contemplação (`%`)
     - Ágio de venda (`10%` a `40%`)

2. **Pelo código-fonte (valores iniciais padrão):**
   - Abra o arquivo `src/lib/consorcio.ts` e edite a constante `PREMISSAS_PADRAO`:
     ```ts
     export const PREMISSAS_PADRAO: PremissasConsorcio = {
       creditoInicial: 500000,
       prazo: 220,
       taxaTotal: 0.23,
       reajusteAnual: 0.05,
       percentualMeiaParcela: 0.5,
       agioVenda: 0.2,
     };
     ```

---

## Como trocar a logo

Substitua o arquivo localizado em:

```text
src/assets/logo-lft.png
```

Mantenha o mesmo nome (`logo-lft.png`) ou atualize a importação no componente `src/components/Header.tsx`.

