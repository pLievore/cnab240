# Gerador CNAB 240

Aplicação web para geração de arquivos de remessa no padrão **CNAB 240 FEBRABAN v10.11**.

## Funcionalidades

- Configuração dos dados da empresa pagadora
- Configuração do lote (tipo de serviço, forma de lançamento)
- Múltiplos pagamentos por arquivo (Segmento A + Segmento B opcional)
- Preview do arquivo com validação de 240 posições por linha
- Download em `.txt` com encoding ISO-8859-1 (Latin-1)

## Requisitos

- Node.js 18+
- npm 9+

## Instalação e uso

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Build para produção

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
  App.jsx      # Componente principal + builder CNAB240
  main.jsx     # Entry point React
docs/
  Layout_CNAB240_v10.11_FEBRABAN.pdf  # Especificação oficial FEBRABAN
```

## Padrão gerado

| Registro | Tipo | Posições |
|---|---|---|
| Header de Arquivo | 0 | 240 |
| Header de Lote | 1 | 240 |
| Segmento A | 3A | 240 |
| Segmento B (opcional) | 3B | 240 |
| Trailer de Lote | 5 | 240 |
| Trailer de Arquivo | 9 | 240 |
