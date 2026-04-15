import { nowDate } from "./cnab240.js";

export const defaultEmpresa = {
  codigoBanco: "237",
  tipoInscricao: "2",
  cnpj: "",
  convenio: "",
  agencia: "",
  dvAgencia: "0",
  conta: "",
  dvConta: "0",
  dvAgConta: "",
  nome: "",
  nomeBanco: "BRADESCO",
  logradouro: "",
  numero: "",
  complemento: "",
  cidade: "",
  cep: "",
  estado: "",
  dataGeracao: nowDate(),
  horaGeracao: "",
  nsa: "1",
  versaoLayoutArquivo: "089",
};

export const defaultLote = {
  tipoServico: "20",
  formaLancamento: "41",
  indicativoFormaPagamento: "01",
  mensagem: "",
  versaoLayoutLote: "045",
};

export const defaultPagamento = {
  bancoFavorecido: "",
  agenciaFavorecido: "",
  dvAgenciaFav: "0",
  contaFavorecido: "",
  dvContaFav: "0",
  dvAgContaFav: "",
  nomeFavorecido: "",
  cpfCnpjFavorecido: "",
  tipoInscricaoFav: "2",
  formaIniciacao: "   ",
  valor: "",
  dataPagamento: nowDate(),
  seuNumero: "",
  tipoMoeda: "BRL",
  camara: "018",
  tipoMovimento: "0",
  codInstrucao: "00",
  codFinalidadeTED: "00005",
  codFinalidadeDoc: "  ",
  codFinalidadeComp: "CC",
  aviso: "0",
  info2: "",
  nossoNumero: "",
  dataRealPagamento: "",
  valorRealPagamento: "",
  quantidadeMoeda: "",
  ugSiape: "",
  ispb: "",
  // Segmento B - Endereco do Favorecido
  logradouroFav: "",
  numeroFav: "",
  complementoFav: "",
  bairroFav: "",
  cidadeFav: "",
  cepFav: "",
  estadoFav: "",
  // Segmento B - Valores
  dataVencimento: "",
  valorDocumento: "",
  valorAbatimento: "",
  valorDesconto: "",
  valorMora: "",
  valorMulta: "",
  codDocFavorecido: "",
  avisoFav: "0",
};

export const tipoServicoOptions = [
  { value: "01", label: "01 - Cobranca" },
  { value: "03", label: "03 - Bloqueto Eletronico" },
  { value: "20", label: "20 - Pgto Fornecedor" },
  { value: "30", label: "30 - Pagamento de Salarios" },
  { value: "50", label: "50 - Pensao Alimenticia" },
  { value: "60", label: "60 - Eletronico" },
  { value: "90", label: "90 - Pagamento Proprio" },
  { value: "98", label: "98 - Pagamentos Diversos" },
];

export const formaLancamentoOptions = [
  { value: "01", label: "01 - Credito em Conta Corrente/Salario" },
  { value: "02", label: "02 - Cheque Pagamento/Administrativo" },
  { value: "03", label: "03 - DOC/TED" },
  { value: "05", label: "05 - Credito em Conta Poupanca" },
  { value: "10", label: "10 - OP a Disposicao" },
  { value: "11", label: "11 - Pgto Contas/Tributos c/ Cod de Barras" },
  { value: "16", label: "16 - Tributo DARF Normal" },
  { value: "20", label: "20 - Pagamento com Autenticacao" },
  { value: "30", label: "30 - Liquidacao de Titulos do Proprio Banco" },
  { value: "31", label: "31 - Pagamento de Titulos de Outros Bancos" },
  { value: "41", label: "41 - TED - Outra Titularidade" },
  { value: "43", label: "43 - TED - Mesma Titularidade" },
  { value: "45", label: "45 - PIX Transferencia" },
  { value: "47", label: "47 - PIX QR-CODE" },
];

export const indicativoFormaPagamentoOptions = [
  { value: "01", label: "01 - Debito em Conta Corrente" },
  { value: "02", label: "02 - Debito Emprestimo/Financiamento" },
  { value: "03", label: "03 - Debito Cartao de Credito" },
];

export const camaraOptions = [
  { value: "000", label: "000 - Mesmo Banco (Credito Proprio)" },
  { value: "018", label: "018 - TED (STR/CIP)" },
  { value: "700", label: "700 - DOC (COMPE)" },
  { value: "988", label: "988 - TED com ISPB Obrigatorio" },
  { value: "009", label: "009 - PIX (SPI)" },
];

export const avisoOptions = [
  { value: "0", label: "0 - Nao emite aviso" },
  { value: "2", label: "2 - Aviso somente ao remetente" },
  { value: "5", label: "5 - Aviso somente ao favorecido" },
  { value: "6", label: "6 - Aviso ao remetente e favorecido" },
  { value: "7", label: "7 - 2 vias remetente + aviso favorecido" },
];

export const finalidadeTEDOptions = [
  { value: "00001", label: "00001 - Pgto Impostos, Tributos e Taxas" },
  { value: "00002", label: "00002 - Pgto Concessionarias Servico Publico" },
  { value: "00003", label: "00003 - Pgto de Dividendos" },
  { value: "00004", label: "00004 - Pgto de Salarios" },
  { value: "00005", label: "00005 - Pgto de Fornecedores" },
  { value: "00006", label: "00006 - Pgto de Honorarios" },
  { value: "00007", label: "00007 - Pgto de Alugueis e Condominio" },
  { value: "00008", label: "00008 - Pgto de Duplicatas e Titulos" },
  { value: "00009", label: "00009 - Pgto de Mensalidades Escolares" },
  { value: "00010", label: "00010 - Credito em Conta" },
  { value: "00011", label: "00011 - Pgto a Corretoras" },
  { value: "00012", label: "00012 - Pgto de Boleto Bancario" },
  { value: "00013", label: "00013 - Pgto de Tarifas Prestacao de Servicos" },
  { value: "00099", label: "00099 - Outros" },
];

export const codFinalidadeCompOptions = [
  { value: "CC", label: "CC - Conta Corrente" },
  { value: "PP", label: "PP - Conta Poupanca" },
  { value: "  ", label: "(em branco)" },
];

export const tipoMovimentoOptions = [
  { value: "0", label: "0 - Inclusao" },
  { value: "5", label: "5 - Alteracao" },
  { value: "9", label: "9 - Exclusao" },
];

export const tipoInscricaoOptions = [
  { value: "1", label: "1 - CPF" },
  { value: "2", label: "2 - CNPJ" },
];

export const tooltips = {
  camara: "Codigo da camara centralizadora. 000=mesmo banco, 018=TED, 700=DOC, 988=TED c/ ISPB, 009=PIX",
  ispb: "Identificador do Sistema de Pagamentos Brasileiro. Obrigatorio para PIX (camara 009) e TED c/ ISPB (988)",
  nsa: "Numero Sequencial do Arquivo. Deve ser incrementado a cada arquivo gerado. O banco usa para controle de duplicidade",
  dvAgConta: "Digito verificador da agencia + conta conjuntos. Deixar vazio para Bradesco (sera preenchido com espaco)",
  convenio: "Codigo do convenio firmado entre a empresa e o banco. Para Bradesco: numerico, 6 digitos. Alinhar a esquerda",
  seuNumero: "Numero de referencia interna da empresa para identificar o pagamento. Ate 20 caracteres",
  nossoNumero: "Numero atribuido pelo banco para rastreamento do pagamento",
  ugSiape: "Unidade Gestora do SIAPE. Obrigatorio apenas para folha de pagamento (servico 30)",
  formaLancamento: "Define como o pagamento sera liquidado (TED, DOC, PIX, credito em conta, etc.)",
  tipoServico: "Tipo de servico do lote. Define a natureza dos pagamentos (fornecedores, salarios, diversos, etc.)",
  indicativoFormaPagamento: "Indica a forma de debito na conta da empresa pagadora",
  valorReal: "Valor efetivo do pagamento incluindo acrescimos/descontos. Se nao informado, usa o valor nominal",
  versaoLayoutArquivo: "Versao do layout do arquivo. Bradesco Multipag: 089. FEBRABAN padrao: 103",
  versaoLayoutLote: "Versao do layout do lote. Credito/Cheque/OP/DOC/TED/Pgto Autenticacao: 045. Debito em CC: 030",
  codFinalidadeComp: "Finalidade complementar: CC=Conta Corrente, PP=Poupanca. Obrigatorio para TED",
  dataVencimento: "Data de vencimento do titulo/documento. Se nao informada, usa a data de pagamento",
  valorDocumento: "Valor nominal do documento. Se nao informado, usa o valor do pagamento (Seg A)",
  avisoFav: "Codigo de aviso ao favorecido no Segmento B",
};
