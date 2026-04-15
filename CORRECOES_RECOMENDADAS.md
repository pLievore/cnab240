# Correções Recomendadas - CNAB 240

Este arquivo contém os patches de código para corrigir os problemas identificados na análise.

## 🔴 CORREÇÃO 1 - DV (Dígitos Validadores) - PRIORITY 1

**Problema:** DV está usando `padRight` com espaço, deveria usar `padLeft` com "0"

**Arquivo:** src/App.jsx  
**Linhas Afetadas:** Header Arquivo (tipo 0), Header Lote (tipo 1), Segmento A (tipo 3A)

```javascript
// ANTES (ERRADO):
padRight(empresa.dvAgencia, 1),      // 58
padRight(empresa.dvConta, 1),        // 71  
padRight(empresa.dvAgConta, 1),      // 72
padRight(pgt.dvAgenciaFav || " ", 1) // 29
padRight(pgt.dvContaFav || " ", 1)   // 42
padRight(pgt.dvAgContaFav || " ", 1) // 43

// DEPOIS (CORRETO):
padLeft(empresa.dvAgencia, 1, "0"),      // 58
padLeft(empresa.dvConta, 1, "0"),        // 71  
padLeft(empresa.dvAgConta, 1, "0"),      // 72
padLeft(pgt.dvAgenciaFav || "0", 1),     // 29
padLeft(pgt.dvContaFav || "0", 1),       // 42
padLeft(pgt.dvAgContaFav || "0", 1),     // 43
```

---

## 🔴 CORREÇÃO 2 - Trailer de Lote (Tipo 5) - PRIORITY 1

**Problema:** Estrutura completamente incorreta a partir da posição 66

**Arquivo:** src/App.jsx  
**Função:** buildCNAB240 → Trailer de Lote (Tipo 5)

```javascript
// ANTES (ERRADO):
const tLote = [
  banco,                                          // 1-3
  lotePad,                                        // 4-7
  "5",                                            // 8
  spaces(9),                                      // 9-17
  padLeft(qtdeRegs, 6),                           // 18-23
  fmtValue(somaValores.toString(), 16, 2),        // 24-41
  padLeft("0", 18),                               // 42-59 ERRADO: 18 chars
  padLeft("0", 6),                                // 60-65 ERRADO: 6 chars
  spaces(165),                                    // 66-230 ERRADO: 165 chars (total da linha fica 240)
  spaces(10),                                     // 231-240 DUPLICADO
].join("");

// DEPOIS (CORRETO):
const qtdeDebitos = 0;  // Calcular conforme necessário
const valorDebitos = 0; // Calcular conforme necessário

const tLote = [
  banco,                                                      // 1-3
  lotePad,                                                    // 4-7
  "5",                                                        // 8
  spaces(9),                                                  // 9-17
  padLeft(qtdeRegs, 6),                                       // 18-23 (Qtde de registros: header + detalhes + trailer)
  fmtValue(somaValores.toString(), 16, 2),                    // 24-41 (Valor total contábil com 2 decimais)
  padLeft(qtdeDebitos.toString() || "0", 18),                 // 42-59 (Quantidade de débitos)
  padLeft(valorDebitos.toString() || "0", 6),                 // 60-65 (Valor total de débitos)
  spaces(175),                                                // 66-240 (Uso exclusivo FEBRABAN - 175 caracteres)
].join("");
```

---

## 🟡 CORREÇÃO 3 - ISPB no Segmento B - PRIORITY 1

**Problema:** ISPB está hardcoded em "0", crítico para PIX

**Arquivo:** src/App.jsx  
**Função:** buildCNAB240 → Segmento B

**Primeiro, adicionar ao estado do pagamento padrão:**

```javascript
// Em defaultPagamento:
const defaultPagamento = {
  // ... outros campos ...
  ispb: "",  // ADICIONAR: Código ISPB para PIX (8 dígitos)
};
```

**Depois, corrigir no buildCNAB240:**

```javascript
// ANTES (ERRADO):
const segB = [
  // ... outros campos ...
  padLeft("0", 8),                                 // 233-240 ISPB - HARDCODED
].join("");

// DEPOIS (CORRETO):
const segB = [
  // ... outros campos ...
  padLeft(pgt.ispb || "0", 8),                     // 233-240 ISPB
].join("");
```

**Adicionar campo na UI (em TAB 2: PAGAMENTOS):**

```javascript
<Field label="ISPB (PIX)">
  <Input 
    value={pgt.ispb} 
    onChange={setPgtField(pgt.id, "ispb")} 
    placeholder="00000000" 
  />
</Field>
```

---

## 🟡 CORREÇÃO 4 - Nosso Número (Rastreamento) - PRIORITY 2

**Problema:** Campo para rastreamento de pagamento está vazio

**Arquivo:** src/App.jsx

**Primeiro, adicionar ao estado:**

```javascript
const defaultPagamento = {
  // ... outros campos ...
  nossoNumero: "",  // ADICIONAR: Número de referência (20 chars max)
};
```

**Depois, corrigir no buildCNAB240:**

```javascript
// ANTES (ERRADO):
padRight("", 20),                                 // 135-154 nosso numero

// DEPOIS (CORRETO):
padRight(pgt.nossoNumero || "", 20),              // 135-154 nosso numero
```

**Adicionar campo na UI:**

```javascript
<Field label="Nosso Número">
  <Input 
    value={pgt.seuNumero} 
    onChange={setPgtField(pgt.id, "nossoNumero")} 
    placeholder="Número de rastreamento" 
    maxLength="20"
  />
</Field>
```

---

## 🟡 CORREÇÃO 5 - Data Real de Pagamento - PRIORITY 2

**Problema:** Data de pagamento real está fixa em "00000000"

**Arquivo:** src/App.jsx

**Primeiro, adicionar ao estado:**

```javascript
const defaultPagamento = {
  // ... outros campos ...
  dataRealPagamento: nowDate(),  // ADICIONAR: Data real de execução
};
```

**Depois, corrigir no buildCNAB240:**

```javascript
// ANTES (ERRADO):
zeros(8),                                         // 155-162 data real

// DEPOIS (CORRETO):
fmtDate(pgt.dataRealPagamento || pgt.dataPagamento),  // 155-162 data real
```

**Adicionar campo na UI (seção "Dados do Pagamento"):**

```javascript
<Field label="Data Real Pagamento">
  <Input 
    type="date" 
    value={pgt.dataRealPagamento} 
    onChange={setPgtField(pgt.id, "dataRealPagamento")} 
  />
</Field>
```

---

## 🟡 CORREÇÃO 6 - Valor Real de Pagamento - PRIORITY 2

**Problema:** Valor real (para acréscimos/descontos) está hardcoded em "0"

**Arquivo:** src/App.jsx

**Primeiro, adicionar ao estado:**

```javascript
const defaultPagamento = {
  // ... outros campos ...
  valorRealPagamento: "",  // ADICIONAR: Valor real com possíveis acréscimos/descontos
};
```

**Depois, corrigir no buildCNAB240:**

```javascript
// ANTES (ERRADO):
fmtValue("0", 13, 2),                             // 163-177 valor real

// DEPOIS (CORRETO):
fmtValue(pgt.valorRealPagamento || pgt.valor || "0", 13, 2),  // 163-177 valor real
```

**Adicionar campo na UI:**

```javascript
<Field label="Valor Real (com acréscimos/descontos)">
  <Input 
    value={pgt.valorRealPagamento} 
    onChange={setPgtField(pgt.id, "valorRealPagamento")} 
    placeholder="0.00" 
    type="number" 
  />
</Field>
```

---

## 🟠 CORREÇÃO 7 - Quantidade de Moeda - PRIORITY 3

**Problema:** Quantidade está hardcoded em "0" (necessário para moedas estrangeiras)

**Arquivo:** src/App.jsx

**Primeiro, adicionar ao estado:**

```javascript
const defaultPagamento = {
  // ... outros campos ...
  quantidadeMoeda: "",  // ADICIONAR: Quantidade (se moeda estrangeira)
};
```

**Depois, corrigir no buildCNAB240:**

```javascript
// ANTES (ERRADO):
padLeft("0", 15),                                // 105-119 (qtd moeda)

// DEPOIS (CORRETO):
padLeft(pgt.quantidadeMoeda || "0", 15),        // 105-119 (qtd moeda)
```

---

## 🟠 CORREÇÃO 8 - UG SIAPE (Folha de Pagamento) - PRIORITY 3

**Problema:** UG SIAPE está hardcoded em "0" (necessário para folha de pagamento)

**Arquivo:** src/App.jsx

**Primeiro, adicionar ao estado:**

```javascript
const defaultPagamento = {
  // ... outros campos ...
  ugSiape: "",  // ADICIONAR: UG geradora (para folha de pagamento)
};
```

**Depois, corrigir no buildCNAB240:**

```javascript
// ANTES (ERRADO):
padLeft("0", 6),                                 // 227-232 UG SIAPE

// DEPOIS (CORRETO):
padLeft(pgt.ugSiape || "0", 6),                  // 227-232 UG SIAPE
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Corrigir DV em todos os headers (fácil - 30 min)
- [ ] Corrigir estrutura Trailer Lote Tipo 5 (médio - 45 min)
- [ ] Adicionar ISPB ao Segmento B (fácil - 20 min)
- [ ] Adicionar Nosso Número (fácil - 25 min)
- [ ] Adicionar Data Real de Pagamento (fácil - 25 min)
- [ ] Adicionar Valor Real de Pagamento (fácil - 25 min)
- [ ] Adicionar Quantidade de Moeda (fácil - 15 min)
- [ ] Adicionar UG SIAPE (fácil - 15 min)
- [ ] Testes manuais com arquivo gerado (médio - 60 min)
- [ ] Validação com banco (médio - 2 horas)

**Tempo Total Estimado:** 4-5 horas

---

## 🧪 TESTE RECOMENDADO

Após implementar as correções, gerar um arquivo CNAB 240 e validar:

```bash
# Verificar tamanho das linhas
wc -c cnab240_*.txt  # Cada linha deve ter 240 caracteres

# Verificar estrutura com seu banco
# Usar a ferramenta de validação FEBRABAN se disponível
```

---

## 📚 REFERÊNCIAS DE IMPLEMENTAÇÃO FUTURA

### Validações Necessárias
- CEP deve ter 8 dígitos (5 + 3)
- CNPJ deve ter 14 dígitos
- CPF deve ter 11 dígitos
- Código bancário deve estar em tabela válida
- Data deve estar no formato DDMMYYYY

### Campos Opcionais por Tipo de Serviço
- Se Tipo de Serviço = 30 (Folha de Pagamento): UG SIAPE obrigatório
- Se Câmara = 009 (PIX): ISPB obrigatório
- Se Moeda ≠ BRL: Quantidade de Moeda obrigatória

---

**Versão:** 1.0  
**Data:** 13/04/2026  
**Status:** Pronto para implementação
