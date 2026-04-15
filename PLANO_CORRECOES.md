# Plano de Correção — Gerador CNAB 240
**Data:** 13/04/2026 | **Arquivo alvo:** src/App.jsx | **Padrão:** FEBRABAN v10.11

---

## Diagnóstico do Código Real (`src/App.jsx`)

Após leitura direta do código-fonte, os problemas confirmados são:

### 🔴 CRÍTICOS

#### C1 — DV com `padRight` (Headers e Segmento A)
Afeta 6 campos. DV deveria usar `padLeft` com `"0"`, mas usa `padRight` com espaço `" "`.

| Linha | Campo | Código Atual (Errado) | Correto |
|-------|----|---|---|
| 54 | DV Agência (Hdr Arq) | `padRight(empresa.dvAgencia, 1)` | `padLeft(empresa.dvAgencia, 1)` |
| 56 | DV Conta (Hdr Arq) | `padRight(empresa.dvConta, 1)` | `padLeft(empresa.dvConta, 1)` |
| 57 | DV Ag/Conta (Hdr Arq) | `padRight(empresa.dvAgConta, 1)` | `padLeft(empresa.dvAgConta, 1)` |
| 91 | DV Agência (Hdr Lote) | `padRight(empresa.dvAgencia, 1)` | `padLeft(empresa.dvAgencia, 1)` |
| 93 | DV Conta (Hdr Lote) | `padRight(empresa.dvConta, 1)` | `padLeft(empresa.dvConta, 1)` |
| 94 | DV Ag/Conta (Hdr Lote) | `padRight(empresa.dvAgConta, 1)` | `padLeft(empresa.dvAgConta, 1)` |
| 130 | DV Agência Fav (Seg A) | `padRight(pgt.dvAgenciaFav \|\| " ", 1)` | `padLeft(pgt.dvAgenciaFav \|\| "0", 1)` |
| 132 | DV Conta Fav (Seg A) | `padRight(pgt.dvContaFav \|\| " ", 1)` | `padLeft(pgt.dvContaFav \|\| "0", 1)` |
| 133 | DV Ag/Conta Fav (Seg A) | `padRight(pgt.dvAgContaFav \|\| " ", 1)` | `padLeft(pgt.dvAgContaFav \|\| "0", 1)` |

#### C2 — Trailer de Lote (Tipo 5) — Estrutura semântica incorreta
Linhas 186–190. O bloco FEBRABAN pós-posição 65 tem 175 chars no total (correto), mas está dividido em `spaces(165) + spaces(10)` com comentários errados (`66-230` e `231-240`). Deve ser um único bloco `spaces(175)`.

```
// ATUAL (linhas 188-189):
spaces(165),   // 66-230  ← comentário errado, deveria ser 66-240
spaces(10),    // 231-240 ← DUPLICADO/INCORRETO

// CORRETO:
spaces(175),   // 66-240  FEBRABAN uso futuro
```

#### C3 — ISPB hardcoded em Segmento B (linha 169)
Campo crítico para PIX. Estado `defaultPagamento` não possui campo `ispb`.
```
// ATUAL: padLeft("0", 8)
// CORRETO: padLeft(pgt.ispb || "0", 8)
```

---

### 🟡 IMPORTANTES

#### I4 — Nosso Número vazio (linha 140)
Campo de rastreamento de pagamento. Ausente no `defaultPagamento`.
```
// ATUAL: padRight("", 20)
// CORRETO: padRight(pgt.nossoNumero || "", 20)
```

#### I5 — Data Real de Pagamento hardcoded (linha 141)
```
// ATUAL: zeros(8)
// CORRETO: fmtDate(pgt.dataRealPagamento || pgt.dataPagamento)
```

#### I6 — Valor Real de Pagamento hardcoded (linha 142)
```
// ATUAL: fmtValue("0", 13, 2)
// CORRETO: fmtValue(pgt.valorRealPagamento || pgt.valor || "0", 13, 2)
```

---

### 🟠 MELHORIAS

#### M7 — Quantidade de Moeda hardcoded (linha 138)
```
// ATUAL: padLeft("0", 15)
// CORRETO: padLeft(pgt.quantidadeMoeda || "0", 15)
```

#### M8 — UG SIAPE hardcoded (linha 168)
```
// ATUAL: padLeft("0", 6)
// CORRETO: padLeft(pgt.ugSiape || "0", 6)
```

---

## Plano de Execução (Ordenado por Impacto)

### Fase 1 — Correções Críticas (C1, C2, C3)

**Passo 1.1** — Corrigir todos os `padRight` → `padLeft` nos campos DV  
Impacto: 9 substituições em 2 funções (buildCNAB240)

**Passo 1.2** — Corrigir Trailer de Lote: unificar `spaces(165) + spaces(10)` → `spaces(175)`  
Impacto: 2 linhas, sem quebra funcional

**Passo 1.3** — Adicionar campo `ispb` ao `defaultPagamento` e corrigir Segmento B  
Impacto: 1 linha no estado + 1 linha no builder + 1 campo na UI

### Fase 2 — Campos Importantes (I4, I5, I6)

**Passo 2.1** — Adicionar `nossoNumero` ao `defaultPagamento`, corrigir Seg A e adicionar campo na UI  
**Passo 2.2** — Adicionar `dataRealPagamento` ao `defaultPagamento`, corrigir Seg A e adicionar campo na UI  
**Passo 2.3** — Adicionar `valorRealPagamento` ao `defaultPagamento`, corrigir Seg A e adicionar campo na UI

### Fase 3 — Melhorias (M7, M8)

**Passo 3.1** — Adicionar `quantidadeMoeda` ao `defaultPagamento` e corrigir Seg A  
**Passo 3.2** — Adicionar `ugSiape` ao `defaultPagamento` e corrigir Seg B

---

## Impacto Esperado por Fase

| Fase | Conformidade Estimada | Risco |
|------|-----------------------|-------|
| Antes | 76% | — |
| Após Fase 1 | ~90% | Baixo (só formatação) |
| Após Fase 2 | ~95% | Baixo (novos campos com fallback) |
| Após Fase 3 | ~98% | Mínimo |

---

## Prompt de Correção

O prompt abaixo pode ser usado para executar todas as correções:

```
Corrija o arquivo src/App.jsx do gerador CNAB 240 aplicando as seguintes mudanças:

### FASE 1 — CRÍTICO

1. Nos campos DV do Header de Arquivo (linhas ~54-57), trocar padRight → padLeft:
   - padRight(empresa.dvAgencia, 1)  → padLeft(empresa.dvAgencia, 1)
   - padRight(empresa.dvConta, 1)    → padLeft(empresa.dvConta, 1)
   - padRight(empresa.dvAgConta, 1)  → padLeft(empresa.dvAgConta, 1)

2. No Header de Lote (linhas ~91-94), mesma correção:
   - padRight(empresa.dvAgencia, 1)  → padLeft(empresa.dvAgencia, 1)
   - padRight(empresa.dvConta, 1)    → padLeft(empresa.dvConta, 1)
   - padRight(empresa.dvAgConta, 1)  → padLeft(empresa.dvAgConta, 1)

3. No Segmento A (linhas ~130-133), corrigir DV do favorecido com fallback "0":
   - padRight(pgt.dvAgenciaFav || " ", 1)  → padLeft(pgt.dvAgenciaFav || "0", 1)
   - padRight(pgt.dvContaFav || " ", 1)    → padLeft(pgt.dvContaFav || "0", 1)
   - padRight(pgt.dvAgContaFav || " ", 1)  → padLeft(pgt.dvAgContaFav || "0", 1)

4. No Trailer de Lote (linhas ~188-189), unificar bloco FEBRABAN:
   - Remover:  spaces(165),  // 66-230
               spaces(10),   // 231-240
   - Adicionar: spaces(175), // 66-240 FEBRABAN uso futuro

5. No defaultPagamento (linha ~404), adicionar campo ispb:
   ispb: "",

6. No Segmento B (linha ~169), usar campo ispb:
   - padLeft("0", 8)  → padLeft(pgt.ispb || "0", 8)

7. Na UI (Tab 2 - Pagamentos), adicionar campo ISPB visível apenas quando camara === "009":
   <Field label="ISPB (obrigatório para PIX)">
     <Input value={pgt.ispb} onChange={setPgtField(pgt.id, "ispb")} placeholder="00000000" />
   </Field>

### FASE 2 — IMPORTANTE

8. No defaultPagamento, adicionar campos:
   nossoNumero: "",
   dataRealPagamento: nowDate(),
   valorRealPagamento: "",

9. No Segmento A:
   - padRight("", 20)          → padRight(pgt.nossoNumero || "", 20)         // linha ~140
   - zeros(8)                  → fmtDate(pgt.dataRealPagamento || pgt.dataPagamento) // linha ~141
   - fmtValue("0", 13, 2)      → fmtValue(pgt.valorRealPagamento || pgt.valor || "0", 13, 2) // linha ~142

10. Na UI (Tab 2), adicionar campos:
    - "Nosso Número" (20 chars, rastreamento)
    - "Data Real Pgto" (type date)
    - "Valor Real (acrésc/desc)" (type number)

### FASE 3 — MELHORIAS

11. No defaultPagamento, adicionar:
    quantidadeMoeda: "",
    ugSiape: "",

12. No Segmento A, linha ~138:
    padLeft("0", 15)  → padLeft(pgt.quantidadeMoeda || "0", 15)

13. No Segmento B, linha ~168:
    padLeft("0", 6)   → padLeft(pgt.ugSiape || "0", 6)
```

---

## Checklist de Validação Pós-Correção

- [ ] Todos os registros ainda têm exatamente 240 caracteres
- [ ] DV aparece como `0` (não espaço) quando vazio
- [ ] Trailer de Lote tem exatamente 240 chars (sem duplicação)
- [ ] Campo ISPB aparece na UI quando câmara = 009 (PIX)
- [ ] Download do arquivo funciona normalmente
- [ ] Preview do arquivo não mostra linhas em vermelho

---

**Status:** Pronto para implementação após confirmação  
**Estimativa:** ~90 minutos para Fases 1+2+3