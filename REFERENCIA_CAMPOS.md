# Referência Rápida - Mapeamento de Campos CNAB 240

## 📋 Tipo 0 - Header de Arquivo (240 pos)

| Pos | Campo | Tamanho | Tipo | Implementação | Status | Notas |
|-----|-------|---------|------|---------------|--------|-------|
| 1-3 | Banco | 3 | Num | `padLeft(banco, 3)` | ✅ | Código do banco |
| 4-7 | Lote | 4 | Num | `"0000"` | ✅ | Sempre 0000 |
| 8 | Tipo | 1 | Num | `"0"` | ✅ | Header de arquivo |
| 9-17 | FEBRABAN | 9 | Alfa | `spaces(9)` | ✅ | Branco |
| 18 | Tipo Inscrição | 1 | Num | `padLeft(tipo, 1)` | ✅ | 1=CPF, 2=CNPJ |
| 19-32 | Inscrição | 14 | Num | `padLeft(stripDoc(cnpj), 14)` | ✅ | CPF ou CNPJ (com máscara) |
| 33-52 | Convênio | 20 | Alfa | `padRight(convenio, 20)` | ✅ | Código convênio |
| 53-57 | Agência | 5 | Num | `padLeft(agencia, 5)` | ✅ | Agência (com máscara) |
| 58 | DV Agência | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") |
| 59-70 | Conta | 12 | Num | `padLeft(conta, 12)` | ✅ | Conta (com máscara) |
| 71 | DV Conta | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") |
| 72 | DV Ag/Conta | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") |
| 73-102 | Nome Empresa | 30 | Alfa | `padRight(nome, 30)` | ✅ | Razão social |
| 103-132 | Nome Banco | 30 | Alfa | `padRight(nomeBanco, 30)` | ✅ | Nome do banco |
| 133-142 | FEBRABAN | 10 | Alfa | `spaces(10)` | ✅ | Branco |
| 143 | Remessa | 1 | Num | `"1"` | ✅ | 1=Remessa |
| 144-151 | Data Geração | 8 | Num | `fmtDate()` | ✅ | DDMMYYYY (com validação) |
| 152-157 | Hora Geração | 6 | Num | `nowTime()` | ✅ | HHMMSS |
| 158-163 | NSA | 6 | Num | `padLeft(nsa, 6)` | ✅ | Número sequencial (com máscara) |
| 164-166 | Versão Layout | 3 | Num | `"103"` | ✅ | v10.11 |
| 167-171 | Densidade | 5 | Num | `"01600"` | ✅ | BPI |
| 172-191 | FEBRABAN | 20 | Alfa | `spaces(20)` | ✅ | Branco |
| 192-211 | FEBRABAN | 20 | Alfa | `spaces(20)` | ✅ | Branco |
| 212-240 | FEBRABAN | 29 | Alfa | `spaces(29)` | ✅ | Branco |

---

## 📋 Tipo 1 - Header de Lote (240 pos)

| Pos | Campo | Tamanho | Tipo | Implementação | Status | Notas |
|-----|-------|---------|------|---------------|--------|-------|
| 1-3 | Banco | 3 | Num | `padLeft(banco, 3)` | ✅ | Código do banco |
| 4-7 | Lote | 4 | Num | `padLeft(lote, 4)` | ✅ | Número do lote |
| 8 | Tipo | 1 | Num | `"1"` | ✅ | Header de lote |
| 9 | Tipo Operação | 1 | Alfa | `"C"` | ✅ | Crédito |
| 10-11 | Tipo Serviço | 2 | Num | `padLeft(tipo, 2)` | ✅ | 01-98 |
| 12-13 | Forma Lançamento | 2 | Num | `padLeft(forma, 2)` | ✅ | 01-47 |
| 14-16 | Versão Layout | 3 | Num | `"046"` | ✅ | v10.11 |
| 17 | FEBRABAN | 1 | Alfa | `" "` | ✅ | Espaço |
| 18 | Tipo Inscrição | 1 | Num | `padLeft(tipo, 1)` | ✅ | 1=CPF, 2=CNPJ |
| 19-32 | Inscrição | 14 | Num | `padLeft(stripDoc(cnpj), 14)` | ✅ | CPF ou CNPJ |
| 33-52 | Convênio | 20 | Alfa | `padRight(convenio, 20)` | ✅ | Código convênio |
| 53-57 | Agência | 5 | Num | `padLeft(agencia, 5)` | ✅ | Agência |
| 58 | DV Agência | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") |
| 59-70 | Conta | 12 | Num | `padLeft(conta, 12)` | ✅ | Conta |
| 71 | DV Conta | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") |
| 72 | DV Ag/Conta | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") |
| 73-102 | Nome Empresa | 30 | Alfa | `padRight(nome, 30)` | ✅ | Razão social |
| 103-142 | Mensagem | 40 | Alfa | `padRight(msg, 40)` | ✅ | Opcional (maxLength=40) |
| 143-172 | Logradouro | 30 | Alfa | `padRight(logr, 30)` | ✅ | Endereço (maxLength=30) |
| 173-177 | Número | 5 | Num | `padLeft(num, 5)` | ✅ | Número endereço (maxLength=5) |
| 178-192 | Complemento | 15 | Alfa | `padRight(compl, 15)` | ✅ | Apto, sala, etc (maxLength=15) |
| 193-212 | Cidade | 20 | Alfa | `padRight(cidade, 20)` | ✅ | Município (maxLength=20) |
| 213-217 | CEP | 5 | Num | `padLeft(stripDoc(cep).slice(0,5), 5)` | ✅ | CEP (com máscara XXXXX-XXX) |
| 218-220 | CEP Compl. | 3 | Num | `padLeft(stripDoc(cep).slice(5,8), 3)` | ✅ | Corrigido: padLeft, extraído da máscara |
| 221-222 | UF | 2 | Alfa | `padRight(uf, 2)` | ✅ | Estado (maxLength=2) |
| 223-224 | Indicativa Pgto | 2 | Num | `padLeft(ind, 2)` | ✅ | 01-03 |
| 225-230 | FEBRABAN | 6 | Alfa | `spaces(6)` | ✅ | Branco |
| 231-240 | FEBRABAN | 10 | Alfa | `spaces(10)` | ✅ | Branco |

**Tipos de Serviço (10-11):**
- 01 = Cobrança
- 03 = Bloqueto Eletrônico
- 20 = Pgto Fornecedor
- 30 = Pgto Salários
- 50 = Pensão Alimentícia
- 60 = Eletrônico
- 90 = Pgto Próprio
- 98 = Pgto Diversos

**Formas de Lançamento (12-13):**
- 01 = Crédito Cc/Salário
- 02 = Cheque
- 03 = DOC/TED
- 05 = Crédito Poupança
- 10 = OP à Disposição
- 11 = Contas/Tributos c/ Código de Barras
- 16 = DARF Normal
- 20 = Pgto com Autenticação
- 30 = Liquidação Títulos Próprio Banco
- 31 = Pgto Títulos Outros Bancos
- 41 = TED - Outra Titularidade
- 43 = TED - Mesma Titularidade
- 45 = PIX Transferência
- 47 = PIX QR-CODE

---

## 📋 Tipo 3A - Segmento A (240 pos)

| Pos | Campo | Tamanho | Tipo | Implementação | Status | Notas |
|-----|-------|---------|------|---------------|--------|-------|
| 1-3 | Banco | 3 | Num | `padLeft(banco, 3)` | ✅ | |
| 4-7 | Lote | 4 | Num | `padLeft(lote, 4)` | ✅ | |
| 8 | Tipo | 1 | Num | `"3"` | ✅ | Detalhe |
| 9-13 | Seq. Registro | 5 | Num | `padLeft(seq, 5)` | ✅ | Sequencial |
| 14 | Segmento | 1 | Alfa | `"A"` | ✅ | Segmento A |
| 15 | Tipo Movimento | 1 | Num | `padLeft(tipo, 1)` | ✅ | 0/5/9 |
| 16-17 | Código Instrução | 2 | Num | `padLeft(cod, 2)` | ✅ | Default 00 |
| 18-20 | Câmara | 3 | Num | `padLeft(cam, 3)` | ✅ | 000/018/700/988/009 |
| 21-23 | Banco Fav. | 3 | Num | `padLeft(banco, 3)` | ✅ | Banco favorecido (com máscara) |
| 24-28 | Agência Fav. | 5 | Num | `padLeft(ag, 5)` | ✅ | Com máscara |
| 29 | DV Ag. Fav. | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") + máscara |
| 30-41 | Conta Fav. | 12 | Num | `padLeft(conta, 12)` | ✅ | Com máscara |
| 42 | DV Conta Fav. | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") + máscara |
| 43 | DV Ag/Fav. | 1 | Num | `padLeft(dv, 1)` | ✅ | Corrigido: padLeft("0") + máscara |
| 44-73 | Nome Fav. | 30 | Alfa | `padRight(nome, 30)` | ✅ | maxLength=30 |
| 74-93 | Seu Número | 20 | Alfa | `padRight(num, 20)` | ✅ | Referência cliente (maxLength=20) |
| 94-101 | Data Pgto | 8 | Num | `fmtDate()` | ✅ | DDMMYYYY (com validação) |
| 102-104 | Tipo Moeda | 3 | Alfa | `padRight(moeda, 3)` | ✅ | Default BRL |
| 105-119 | Qtde Moeda | 15 | Num | `padLeft(pgt.quantidadeMoeda, 15)` | ✅ | Corrigido: dinâmico (UI condicional moeda != BRL) |
| 120-134 | Valor Pgto | 15 | Num | `fmtValue(val, 13, 2)` | ✅ | Com Math.abs (seguro p/ negativos) |
| 135-154 | Nosso Número | 20 | Alfa | `padRight(pgt.nossoNumero, 20)` | ✅ | Corrigido: dinâmico + máscara (maxLength=20) |
| 155-162 | Data Real | 8 | Num | `fmtDate(pgt.dataRealPagamento \|\| pgt.dataPagamento)` | ✅ | Corrigido: com fallback |
| 163-177 | Valor Real | 15 | Num | `fmtValue(pgt.valorRealPagamento \|\| pgt.valor, 13, 2)` | ✅ | Corrigido: com fallback |
| 178-217 | Seu Número Cont. | 40 | Alfa | `padRight(info, 40)` | ✅ | Info complementar (maxLength=40) |
| 218-219 | Cod Final. Doc | 2 | Alfa | `padRight(cod, 2)` | ✅ | |
| 220-224 | Cod Final. TED | 5 | Num | `padLeft(cod, 5)` | ✅ | 00001-00100 |
| 225-226 | Cod Final. Compl | 2 | Alfa | `padRight(cod, 2)` | ✅ | |
| 227-229 | Marcação Tipo | 3 | Alfa | `spaces(3)` | ✅ | FEBRABAN reservado |
| 230 | Aviso | 1 | Num | `padLeft(avi, 1)` | ✅ | 0-7 |
| 231-240 | FEBRABAN | 10 | Alfa | `spaces(10)` | ✅ | Branco |

**Câmaras (18-20):**
- 000 = Mesmo Banco (Crédito Próprio)
- 018 = TED (STR/CIP)
- 700 = DOC (COMPE)
- 988 = TED com ISPB Obrigatório
- 009 = PIX (SPI)

**Códigos Finalidade TED (220-224):**
- 00001 = Impostos/Taxas
- 00010 = Transferência entre Contas
- 00020 = Liquidação de Títulos
- 00030 = Salários
- 00040 = Fornecedores
- 00060 = Dividendos
- 00090 = Honorários
- 00100 = Aluguéis

---

## 📋 Tipo 3B - Segmento B (240 pos)

| Pos | Campo | Tamanho | Tipo | Implementação | Status | Notas |
|-----|-------|---------|------|---------------|--------|-------|
| 1-3 | Banco | 3 | Num | `padLeft(banco, 3)` | ✅ | |
| 4-7 | Lote | 4 | Num | `padLeft(lote, 4)` | ✅ | |
| 8 | Tipo | 1 | Num | `"3"` | ✅ | Detalhe |
| 9-13 | Seq. Registro | 5 | Num | `padLeft(seq, 5)` | ✅ | |
| 14 | Segmento | 1 | Alfa | `"B"` | ✅ | Segmento B |
| 15-17 | Forma Iniciação | 3 | Alfa | `padRight(forma, 3)` | ✅ | |
| 18 | Tipo Inscrição Fav. | 1 | Num | `padLeft(tipo, 1)` | ✅ | 1=CPF, 2=CNPJ |
| 19-32 | Inscrição Fav. | 14 | Num | `padLeft(stripDoc(cpf), 14)` | ✅ | Com máscara CPF/CNPJ |
| 33-67 | Compl. A1 | 35 | Alfa | `padRight(compl1, 35)` | ✅ | Dados complementares |
| 68-127 | Compl. A2 | 60 | Alfa | `padRight(compl2, 60)` | ✅ | Dados complementares |
| 128-226 | Compl. A3 | 99 | Alfa | `padRight(compl3, 99)` | ✅ | Dados complementares |
| 227-232 | UG SIAPE | 6 | Num | `padLeft(pgt.ugSiape, 6)` | ✅ | Corrigido: dinâmico + máscara (UI condicional tipoServico=30) |
| 233-240 | ISPB | 8 | Num | `padLeft(pgt.ispb, 8)` | ✅ | Corrigido: dinâmico + máscara (UI condicional camara=009) |

---

## 📋 Tipo 5 - Trailer de Lote (240 pos)

| Pos | Campo | Tamanho | Tipo | Implementação | Status | Notas |
|-----|-------|---------|------|---------------|--------|-------|
| 1-3 | Banco | 3 | Num | `padLeft(banco, 3)` | ✅ | |
| 4-7 | Lote | 4 | Num | `padLeft(lote, 4)` | ✅ | |
| 8 | Tipo | 1 | Num | `"5"` | ✅ | Trailer de lote |
| 9-17 | FEBRABAN | 9 | Alfa | `spaces(9)` | ✅ | Branco |
| 18-23 | Qtde Registros | 6 | Num | `padLeft(qtde, 6)` | ✅ | Header + Det + Trailer |
| 24-41 | Valor Total | 18 | Num | `fmtValue(val, 16, 2)` | ✅ | Contábil |
| 42-59 | Qtde Débitos | 18 | Num | `padLeft("0", 18)` | ⚠️ | Hardcoded 0 (melhoria futura) |
| 60-65 | Valor Débitos | 6 | Num | `padLeft("0", 6)` | ⚠️ | Hardcoded 0 (melhoria futura) |
| 66-240 | FEBRABAN | 175 | Alfa | `spaces(175)` | ✅ | Corrigido: bloco unificado 175 chars |

---

## 📋 Tipo 9 - Trailer de Arquivo (240 pos)

| Pos | Campo | Tamanho | Tipo | Implementação | Status | Notas |
|-----|-------|---------|------|---------------|--------|-------|
| 1-3 | Banco | 3 | Num | `padLeft(banco, 3)` | ✅ | |
| 4-7 | Lote | 4 | Num | `"9999"` | ✅ | Lote trailer |
| 8 | Tipo | 1 | Num | `"9"` | ✅ | Trailer arquivo |
| 9-17 | FEBRABAN | 9 | Alfa | `spaces(9)` | ✅ | Branco |
| 18-23 | Qtde Lotes | 6 | Num | `padLeft("1", 6)` | ✅ | Sempre 1 |
| 24-29 | Qtde Registros | 6 | Num | `padLeft(qtde, 6)` | ✅ | Total da remessa |
| 30-35 | Qtde Contas | 6 | Num | `padLeft("0", 6)` | ⚠️ | Hardcoded 0 (melhoria futura) |
| 36-240 | FEBRABAN | 205 | Alfa | `spaces(205)` | ✅ | Branco |

---

## 🔧 Função de Formatação - Exemplos de Uso

```javascript
// Valor monetário: 1234.56 em 15 posições (13 inteiros + 2 decimais)
fmtValue("1234.56", 13, 2)  // → "000000012345600" (123456 centavos)
// Seguro para negativos: Math.abs aplicado internamente

// Data: DDMMYYYY (com validação de formato YYYY-MM-DD)
fmtDate("2026-04-13")  // → "13042026"
fmtDate("invalido")    // → "00000000" (fallback seguro)

// Padding à esquerda: número com zeros
padLeft("123", 5)      // → "00123"

// Padding à direita: texto com espaços
padRight("JOÃO", 30)   // → "JOÃO                          "

// Strip documento: remove máscara
stripDoc("12.345.678/0001-90")  // → "12345678000190"
stripDoc("123.456.789-01")      // → "12345678901"
```

---

## 🎭 Máscaras de Entrada (UI)

| Campo | Máscara | Exemplo | Max |
|-------|---------|---------|-----|
| CPF | `XXX.XXX.XXX-XX` | 123.456.789-01 | 14 dígitos |
| CNPJ | `XX.XXX.XXX/XXXX-XX` | 12.345.678/0001-90 | 14 dígitos |
| CEP | `XXXXX-XXX` | 01310-100 | 8 dígitos |
| Banco | `XXX` | 001 | 3 dígitos |
| Agência | `XXXXX` | 01234 | 5 dígitos |
| Conta | `XXXXXXXXXXXX` | 000000123456 | 12 dígitos |
| DV | `X` | 5 | 1 dígito |
| NSA | `XXXXXX` | 000001 | 6 dígitos |
| ISPB | `XXXXXXXX` | 00000000 | 8 dígitos |
| UG SIAPE | `XXXXXX` | 000000 | 6 dígitos |
| Nosso Número | Livre | REF-2026-001 | 20 chars |

---

## ✅ Checklist de Campos Obrigatórios

### Por Tipo de Serviço

**Tipo 30 (Folha de Pagamento):**
- Segmento B obrigatório
- UG SIAPE obrigatório (227-232) — campo visível na UI quando tipoServico=30
- CPF Favorecido obrigatório

**Tipo 98 (Pgto Diversos):**
- Todos os campos básicos obrigatórios
- CPF/CNPJ Favorecido opcional (se preenchido → Segmento B)

**Câmara 009 (PIX):**
- ISPB obrigatório (233-240) — campo visível na UI quando camara=009
- CPF/CNPJ Favorecido obrigatório
- Conta Favorecida obrigatória

---

## 📞 Tabela de Códigos de Bancos Principais

| Código | Banco |
|--------|-------|
| 001 | Banco do Brasil |
| 033 | Santander |
| 041 | Banco do Nordeste |
| 104 | Caixa Econômica Federal |
| 237 | Bradesco |
| 341 | Itaú |
| 389 | Banco Mercantil |
| 422 | Banco Safra |
| 655 | Banco Votorantim |
| 745 | Banco Citibank |

---

**Documento atualizado:** 13/04/2026
**Versão:** 2.0 — Reflete todas as correções aplicadas (DV, Trailer, ISPB, UG SIAPE, máscaras, validações)
**Para:** Referência técnica rápida
