# Calculadora de Salarios Portugal 2026 - Notas de Calculo

Documento com todas as regras fiscais, valores, fontes legais e discrepancias conhecidas.

> **Nota:** Valores indicativos. Consultar um contabilista para situacoes especificas.

---

## 1. Constantes Gerais

| Parametro | Valor 2026 | Fonte Legal |
|-----------|------------|-------------|
| IAS (Indexante dos Apoios Sociais) | **537,13 EUR** | Portaria n.o 480-A/2025, de 30/12 |
| Salario Minimo Nacional (RMMG) | **920 EUR/mes** | Decreto-Lei n.o 139/2025, de 29/12 |
| Deducao Especifica (Cat. A) | **4.587,09 EUR** (8,54 x IAS) | Art. 25.o CIRS, Lei 45-A/2024 |
| Minimo de Existencia | **12.880 EUR** (920 x 14) | Art. 70.o CIRS, Lei 73-A/2025 |

**Fontes:**
- [Decreto-Lei n.o 139/2025 (RMMG) - DRE](https://diariodarepublica.pt/dr/detalhe/decreto-lei/139-2025-992879809)
- [Lei n.o 73-A/2025 (OE 2026) - DRE](https://diariodarepublica.pt/dr/detalhe/lei/73-a-2025-993270096)

---

## 2. Escaloes de IRS 2026

Atualizados pelo coeficiente de 1,0351 (3,51%). Taxas dos escaloes 2-5 reduzidas em 0,3 p.p. face a 2025.

| Escalao | Rendimento Coletavel (EUR) | Taxa | Parcela a Abater (EUR) |
|---------|---------------------------|------|------------------------|
| 1.o | Ate 8.342 | 12,5% | 0,00 |
| 2.o | 8.342 - 12.587 | 15,7% | 266,94 |
| 3.o | 12.587 - 17.838 | 21,2% | 959,26 |
| 4.o | 17.838 - 23.089 | 24,1% | 1.476,45 |
| 5.o | 23.089 - 29.397 | 31,1% | 3.092,77 |
| 6.o | 29.397 - 43.090 | 34,9% | 4.209,94 |
| 7.o | 43.090 - 46.566 | 43,1% | 7.743,27 |
| 8.o | 46.566 - 86.634 | 44,6% | 8.441,48 |
| 9.o | Acima de 86.634 | 48,0% | 11.387,17 |

**Formula:** `IRS = Rendimento Coletavel x Taxa - Parcela a Abater`

**Quociente conjugal (casado unico titular):** `applyBrackets(RC / 2) * 2`

**Fonte legal:** Art. 68.o do CIRS, atualizado pela Lei n.o 73-A/2025 (OE 2026)
- [Lei n.o 73-A/2025 - DRE](https://diariodarepublica.pt/dr/detalhe/lei/73-a-2025-993270096)

---

## 3. Taxa Adicional de Solidariedade

| Rendimento Coletavel | Taxa Adicional |
|----------------------|----------------|
| 80.000 - 250.000 EUR | 2,5% |
| Acima de 250.000 EUR | 5,0% |

**Fonte legal:** Art. 68.o-A do CIRS
- [Portal das Financas - Art. 68.o CIRS](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx)

---

## 4. Seguranca Social

### Trabalho Dependente

| Contribuicao | Taxa |
|--------------|------|
| Trabalhador | **11,0%** |
| Entidade empregadora | **23,75%** |

### Trabalho Independente (Regime Simplificado)

- Base de incidencia: **70%** do rendimento bruto
- Taxa: **21,4%** sobre essa base
- Formula: `SS = Rendimento Bruto x 0,70 x 0,214`
- Isencao no 1.o ano de atividade

**Fonte legal:** Lei n.o 110/2009, de 16/09 (Codigo dos Regimes Contributivos), Art. 53, 54, 163, 168
- [Lei n.o 110/2009 (consolidada) - DRE](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34514575)

---

## 5. Subsidio de Alimentacao

Isento de IRS e SS ate aos seguintes limites diarios:

| Forma de Pagamento | Limite Isento/Dia | Calculo |
|--------------------|-------------------|---------|
| Dinheiro | **6,15 EUR** | Valor publicado |
| Cartao Refeicao | **10,46 EUR** | 6,15 x 1,70 (majoracao 70%) |

- Pago durante **11 meses** (exclui mes de ferias)
- O excesso acima do limite isento esta sujeito a IRS e SS

**Fonte legal:**
- Portaria n.o 51-B/2026/1, de 30/01 (valor referencia administracao publica)
- Art. 2.o, n.o 3, alinea b) do CIRS (majoracao 70% para cartao)
- [Portaria n.o 51-B/2026 - DRE](https://diariodarepublica.pt/dr/detalhe/portaria/51-b-2026-1031110274)

---

## 6. Deducoes por Dependentes

Valores de deducao a coleta por dependente:

| Situacao | Deducao |
|----------|---------|
| Cada dependente (geral, > 3 anos) | **600 EUR** |
| Cada dependente com idade <= 3 anos | **726 EUR** |
| 2.o dependente em diante com idade <= 6 anos | **900 EUR** |

> **Simplificacao na implementacao:** O codigo usa 726 EUR para todos os dependentes + 726 EUR extra para menores de 3 anos. Ver seccao "Discrepancias Conhecidas".

**Fonte legal:** Art. 78.o-A do CIRS
- [Portal das Financas - Art. 78.o-A CIRS](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78a.aspx)

---

## 7. IRS Jovem

Beneficio para trabalhadores com menos de 35 anos (Cat. A e Cat. B).

**Limite de rendimento isento:** 55 x IAS = 55 x 537,13 = **29.542,15 EUR/ano**

| Ano de Beneficio | Isencao |
|------------------|---------|
| 1.o ano | 100% |
| 2.o ao 4.o ano | 75% |
| 5.o ao 7.o ano | 50% |
| 8.o ao 10.o ano | 25% |

**Formula:** `Desconto = IRS x (min(Bruto, Limite) / Bruto) x Taxa_Isencao`

> **Simplificacao na implementacao:** O codigo usa IAS 522,50 (2025), resultando num limite de 28.737,50 em vez de 29.542,15. Ver seccao "Discrepancias Conhecidas".

**Fonte legal:** Art. 12.o-B do CIRS, introduzido pela Lei 24-D/2022, alargado pela Lei 45-A/2024 (OE 2025)
- [Portal das Financas - Art. 12.o-B CIRS](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs12b.aspx)

---

## 8. Regime Simplificado (Trabalho Independente - Cat. B)

| Parametro | Valor |
|-----------|-------|
| Coeficiente de tributacao (servicos) | **75%** (0,75) |
| Rendimento anual | Faturacao mensal x 12 |

- Rendimento tributavel = 75% do rendimento bruto
- Nao ha deducao especifica (substituida pelo coeficiente de 25% nao tributavel)

**Fonte legal:** Art. 31.o do CIRS, n.o 1, alinea b)
- [Portal das Financas - Art. 31.o CIRS](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs31.aspx)

---

## 9. Ajudas de Custo (Deslocacoes)

### Valores diarios isentos de IRS

| Tipo | Nacional (EUR/dia) | Internacional (EUR/dia) |
|------|-------------------|------------------------|
| Trabalhadores | **65,89** | **156,36** |
| Administradores / Dirigentes | **72,65** | **175,42** |

### Parcelas (dia incompleto)

| Componente | % da Diaria | Condicao |
|------------|-------------|----------|
| Almoco | 25% | Deslocacao cobre 13h-14h |
| Jantar | 25% | Deslocacao cobre 20h-21h |
| Dormida | 50% | Nao regressa ate 22h |

Valores nacionais atualizados em 5% pelo DL 1/2025 (face a 2024). Mantidos para 2026.

**Fonte legal:**
- Decreto-Lei n.o 1/2025, de 16/01 (atualizacao nacional 5%)
- Portaria n.o 1553-D/2008, de 31/12 (enquadramento base)
- Decreto-Lei n.o 106/98, de 24/04 (percentagens por componente, Art. 7-9)
- Art. 2.o, n.o 3, alinea d) do CIRS (tratamento fiscal)

---

## 10. Feriados Nacionais 2026

13 feriados obrigatorios (Art. 234.o do Codigo do Trabalho):

| Data | Dia da Semana | Feriado |
|------|---------------|---------|
| 01/01 | Quinta | Ano Novo |
| 03/04 | Sexta | Sexta-feira Santa |
| 05/04 | Domingo | Domingo de Pascoa |
| 25/04 | Sabado | Dia da Liberdade |
| 01/05 | Sexta | Dia do Trabalhador |
| 04/06 | Quinta | Corpo de Deus |
| 10/06 | Quarta | Dia de Portugal |
| 15/08 | Sabado | Assuncao de Nossa Senhora |
| 05/10 | Segunda | Implantacao da Republica |
| 01/11 | Domingo | Todos os Santos |
| 01/12 | Terca | Restauracao da Independencia |
| 08/12 | Terca | Imaculada Conceicao |
| 25/12 | Sexta | Natal |

> **Nota:** Carnaval (17/02) e feriado **facultativo**, nao obrigatorio. A calculadora inclui-o nos feriados por ser observado pela maioria dos empregadores.

**Fonte legal:** Art. 234.o do Codigo do Trabalho (Lei n.o 7/2009)
- [Codigo do Trabalho Art. 234.o - DRE](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475-73982045)

---

## 11. Formulas de Calculo

### Trabalho Dependente

```
Bruto Anual = Salario Mensal x 14

SS Anual (trabalhador) = Bruto Anual x 11%
SS Anual (empresa) = Bruto Anual x 23,75%

Deducao Especifica = max(4.587,09, SS anual trabalhador)

Rendimento Coletavel = max(0, Bruto Anual - Deducao Especifica)

IRS = aplicar escaloes ao RC (com quociente conjugal se unico titular)
    + sobretaxa de solidariedade
    - deducoes por dependentes
    - desconto IRS Jovem

Se (Bruto - SS - IRS) < 12.880:
  IRS = max(0, Bruto - SS - 12.880)

Mensal (14 ou 12 meses conforme duodecimos):
  Liquido Base = (Bruto Anual / meses) - (SS / meses) - (IRS / meses)
  Total Liquido = Liquido Base + Sub. Alimentacao (isento) + Sub. Transporte

Anual:
  Total Liquido = Bruto - SS - IRS + Sub. Alimentacao (11m) + Transporte (11m)

Custo Empresa = Bruto Anual + SS Empresa + Sub. Alimentacao Total (11m) + Transporte (11m)
```

### Trabalho Independente (Regime Simplificado)

```
Bruto Anual = Faturacao Mensal x 12

SS Anual = Bruto Anual x 70% x 21,4%  (isento no 1.o ano)

Rendimento Tributavel = Bruto Anual x 75%

IRS = aplicar escaloes ao RT (com quociente conjugal se unico titular)
    + sobretaxa de solidariedade
    - deducoes por dependentes
    - desconto IRS Jovem

Se (Bruto - SS - IRS) < 12.880:
  IRS = max(0, Bruto - SS - 12.880)

Liquido Mensal = Faturacao - SS Mensal - IRS Mensal
Liquido Anual = Bruto Anual - SS Anual - IRS Anual
```

---

## 12. Discrepancias Conhecidas na Implementacao

| # | Item | Valor no Codigo | Valor Correto 2026 | Impacto |
|---|------|----------------|--------------------|---------|
| 1 | IAS | 522,50 EUR | **537,13 EUR** | Baixo - so afeta o limite IRS Jovem |
| 2 | IRS Jovem limit | 28.737,50 EUR (55x522,50) | **29.542,15 EUR** (55x537,13) | Baixo - ligeira diferenca no cap |
| 3 | Deducao dependentes | 726 EUR (todos) + 726 extra (<3) | **600 / 726 / 900** conforme idade | Medio - sobreestima deducao para dependentes >3 anos |
| 4 | Carnaval | Incluido como feriado | Feriado facultativo | Baixo - 1 dia util a mais/menos em Fevereiro |

---

## 13. Correcoes Aplicadas (Marco 2026)

### Sobretaxa de solidariedade com quociente conjugal
- **Antes**: `applySobretaxa(rc)` ao RC total para casado unico titular
- **Depois**: `applySobretaxa(rc/2) * 2` para casado unico titular
- **Ficheiros**: `js/calculator.js`

### Excesso do subsidio alimentacao tributado
- **Antes**: Excesso acima do limite isento ignorado no calculo de IRS e SS
- **Depois**: Excesso adicionado ao rendimento coletavel; SS tambem incide
- **Ficheiro**: `js/calculator.js`

### Carnaval removido dos feriados
- **Antes**: 2026-02-17 incluido, reduzindo dias uteis de Fevereiro
- **Depois**: Removido (nao e feriado obrigatorio)
- **Ficheiro**: `js/travel-data.js`

---

## 14. Limitacoes Conhecidas

1. **IRS Jovem**: Usa metodo proporcional (`irs * proporcao * taxa`) em vez de recalcular o IRS sobre o rendimento nao-isento. Pode haver ligeira sobreestimacao do desconto para rendimentos altos.

2. **Regime simplificado**: Apenas coeficiente de 75% (prestacao de servicos). Nao inclui vendas (15%), alojamento local (35%) ou outras atividades.

3. **Retencao na fonte**: O calculo apresenta o IRS anual efetivo, nao a retencao mensal (que segue tabelas proprias da AT). O valor mensal e IRS anual / n.o meses.

4. **Deducoes por dependentes**: Simplificacao - usa 726 EUR para todos em vez de 600/726/900 conforme a idade. Ver seccao 6 e 12.

---

## Fontes Principais

| Assunto | Legislacao | Link |
|---------|-----------|------|
| OE 2026 (escaloes, minimo existencia) | Lei n.o 73-A/2025, 30/12 | [DRE](https://diariodarepublica.pt/dr/detalhe/lei/73-a-2025-993270096) |
| Salario Minimo 920 EUR | Decreto-Lei n.o 139/2025, 29/12 | [DRE](https://diariodarepublica.pt/dr/detalhe/decreto-lei/139-2025-992879809) |
| Sub. Alimentacao 6,15 EUR | Portaria n.o 51-B/2026, 30/01 | [DRE](https://diariodarepublica.pt/dr/detalhe/portaria/51-b-2026-1031110274) |
| Seguranca Social | Lei n.o 110/2009 (consolidada) | [DRE](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34514575) |
| Codigo do Trabalho (feriados) | Lei n.o 7/2009, Art. 234.o | [DRE](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475-73982045) |
| Ajudas de custo (nacional) | Decreto-Lei n.o 1/2025, 16/01 | DRE |
| Ajudas de custo (base) | Portaria n.o 1553-D/2008 | DRE |
| Ajudas de custo (parcelas) | Decreto-Lei n.o 106/98, Art. 7-9 | DRE |
| Deducao especifica reindexada | Lei n.o 45-A/2024 (OE 2025) | DRE |
| CIRS completo | Codigo do IRS | [Portal das Financas](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/default.aspx) |
| Guia Fiscal 2026 | PwC Portugal | [pwc.pt](https://www.pwc.pt/pt/pwcinforfisco/guia-fiscal/2026/irs.html) |
