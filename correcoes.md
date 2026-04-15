# 📌 Correções Críticas — CNAB240 (Bradesco)

Este documento descreve duas correções obrigatórias na ferramenta de geração de CNAB240:

1. Implementação correta de pagamentos via PIX
2. Padronização da extensão do arquivo de saída (.rem)

---

# 1️⃣ IMPLEMENTAÇÃO CORRETA DO PIX (CNAB240)

## 🚨 Problema Atual

O sistema trata PIX como uma variação de TED, reutilizando:

* Segmento A ❌
* Segmento B ❌
* Estrutura bancária (agência/conta) ❌

Isso gera arquivos inválidos para o Bradesco.

---

## ✅ Correção Obrigatória

PIX deve ser implementado como um fluxo separado.

---

## 🧠 Regra Principal

> PIX ≠ TED

---

## 🏗️ Arquitetura

```ts
type PaymentType = 'TED' | 'PIX'
```

---

### TED (já existente)

* Segmento A
* Segmento B

---

### PIX (novo fluxo)

* Segmento J
* Segmento J52
* Forma de lançamento: 45
* Versão do layout do lote: 089

---

## 📦 Campos obrigatórios (PIX)

* valor
* data_pagamento
* nome_favorecido
* tipo_chave_pix
* chave_pix

---

## 🔑 Tipos de chave PIX

| Código | Tipo      |
| ------ | --------- |
| 1      | CPF       |
| 2      | CNPJ      |
| 3      | Email     |
| 4      | Telefone  |
| 5      | Aleatória |

---

## 🧩 Segmentos

### Segmento J

* Dados básicos do pagamento
* Valor
* Identificação do favorecido

---

### Segmento J52

* Tipo da chave PIX
* Valor da chave PIX
* Identificação no SPI

---

## ❌ Campos proibidos no PIX

Remover completamente:

* banco do favorecido
* agência
* conta
* DV
* ISPB (quando usar chave PIX)
* finalidade TED
* finalidade complementar
* Segmento B inteiro
* abatimento
* desconto
* mora
* multa

---

## 🎨 Regras de UI

Ao selecionar PIX:

### Esconder:

* dados bancários (agência/conta)
* endereço (Segmento B)
* valores adicionais

### Exibir:

* tipo de chave PIX
* chave PIX

---

## ⚙️ Lógica de geração

```ts
if (payment.type === 'PIX') {
  gerarHeaderLote(versao = 089, forma = 45)

  gerarSegmentoJ(payment)
  gerarSegmentoJ52(payment)
}
```

---

## 🧪 Validações

* chave PIX obrigatória
* tipo de chave válido
* valor > 0
* nome favorecido obrigatório

---

## 🎯 Critério de sucesso

* Arquivo aceito pelo Bradesco
* Sem rejeições por:

  * segmento inválido
  * layout incorreto
  * campos indevidos

---

# 2️⃣ PADRONIZAÇÃO DO OUTPUT (.rem)

## 🚨 Problema Atual

Arquivo pode estar sendo gerado sem padronização de extensão.

---

## 🧠 Conceito

CNAB240 é um arquivo texto posicional.
A extensão não é obrigatória tecnicamente, mas existe padrão de mercado.

---

## ✅ Correção

Padronizar geração de arquivos de remessa com extensão:

```
.rem
```

---

## 📂 Convenção de mercado

| Tipo de Arquivo | Extensão |
| --------------- | -------- |
| Remessa         | .rem     |
| Retorno         | .ret     |

---

## ⚙️ Implementação

```ts
const fileName = `${tipo}_${data}.rem`
```

Exemplo:

```
PAGAMENTOS_20260415.rem
```

---

## 🎯 Objetivo

* Garantir compatibilidade com sistemas financeiros
* Seguir padrão esperado por usuários e bancos
* Evitar confusão operacional

---

# ✅ RESULTADO FINAL ESPERADO

Após essas correções:

* PIX funcionando corretamente no CNAB240
* Separação clara entre TED e PIX
* Arquivos gerados no padrão de mercado (.rem)
* Redução de rejeições bancárias
* Sistema pronto para uso profissional / comercial

---

# ⚠️ RESUMO EXECUTIVO

| Item             | Antes ❌         | Depois ✅           |
| ---------------- | --------------- | ------------------ |
| PIX              | Adaptado de TED | Fluxo independente |
| Segmentos        | A + B           | J + J52            |
| Dados bancários  | Obrigatórios    | Não usados         |
| Segmento B       | Presente        | Removido           |
| Extensão arquivo | Variável        | .rem padrão        |

---

Implementar exatamente como descrito.
Evitar soluções parciais ou adaptações.
