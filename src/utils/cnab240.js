// ─── HELPERS ────────────────────────────────────────────────────────────────
export const padLeft  = (v, n, c = "0") => String(v ?? "").padStart(n, c).slice(-n);
export const padRight = (v, n, c = " ") => String(v ?? "").padEnd(n, c).slice(0, n);
export const spaces   = (n) => " ".repeat(n);
export const zeros    = (n) => "0".repeat(n);

export function fmtDate(d) {
  if (!d) return zeros(8);
  const parts = d.split("-");
  if (parts.length !== 3 || parts[0].length !== 4) return zeros(8);
  const [y, m, dd] = parts;
  return `${dd}${m}${y}`;
}
export function nowDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}
export function nowTime() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(x => padLeft(x,2)).join("");
}
export function fmtValue(v, intDig, decDig) {
  const total = intDig + decDig;
  const num = Math.abs(parseFloat(v || "0"));
  const cents = Math.round(num * Math.pow(10, decDig));
  return padLeft(cents, total);
}
export function stripDoc(v) { return String(v || "").replace(/\D/g, ""); }
export function encodeToLatin1(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i] = code > 255 ? 63 : code; // '?' para chars fora do Latin-1
  }
  return bytes;
}

// ─── CNAB 240 BUILDER ───────────────────────────────────────────────────────
export function buildCNAB240(form) {
  const { empresa, pagamentos, loteInfo } = form;
  const banco = padLeft(empresa.codigoBanco, 3);
  const lines = [];

  // ── Header de Arquivo (Tipo 0) ──
  const hArq = [
    banco,                                          // 1-3
    "0000",                                         // 4-7
    "0",                                            // 8
    spaces(9),                                      // 9-17
    padLeft(empresa.tipoInscricao, 1),              // 18
    padLeft(stripDoc(empresa.cnpj), 14),            // 19-32
    padRight(empresa.convenio, 20),                 // 33-52
    padLeft(empresa.agencia, 5),                    // 53-57
    padLeft(empresa.dvAgencia, 1),                  // 58
    padLeft(empresa.conta, 12),                     // 59-70
    padLeft(empresa.dvConta, 1),                    // 71
    empresa.dvAgConta?.trim() ? padLeft(empresa.dvAgConta, 1) : " ",  // 72
    padRight(empresa.nome, 30),                     // 73-102
    padRight(empresa.nomeBanco, 30),                // 103-132
    spaces(10),                                     // 133-142
    "1",                                            // 143 (remessa)
    fmtDate(empresa.dataGeracao || nowDate()),      // 144-151
    empresa.horaGeracao || nowTime(),               // 152-157
    padLeft(empresa.nsa || "1", 6),                 // 158-163
    padLeft(empresa.versaoLayoutArquivo || "103", 3), // 164-166
    "01600",                                        // 167-171 (Densidade 1600 BPI)
    spaces(20),                                     // 172-191
    spaces(20),                                     // 192-211
    spaces(29),                                     // 212-240
  ].join("");
  lines.push(hArq);

  // ── Lote de Pagamentos ──
  const loteNum = 1;
  const lotePad = padLeft(loteNum, 4);

  // Header de Lote (Tipo 1)
  const hLote = [
    banco,                                          // 1-3
    lotePad,                                        // 4-7
    "1",                                            // 8
    "C",                                            // 9
    padLeft(loteInfo.tipoServico || "98", 2),       // 10-11
    padLeft(loteInfo.formaLancamento || "01", 2),   // 12-13
    padLeft(loteInfo.versaoLayoutLote || "045", 3), // 14-16
    " ",                                            // 17
    padLeft(empresa.tipoInscricao, 1),              // 18
    padLeft(stripDoc(empresa.cnpj), 14),            // 19-32
    padRight(empresa.convenio, 20),                 // 33-52
    padLeft(empresa.agencia, 5),                    // 53-57
    padLeft(empresa.dvAgencia, 1),                  // 58
    padLeft(empresa.conta, 12),                     // 59-70
    padLeft(empresa.dvConta, 1),                    // 71
    empresa.dvAgConta?.trim() ? padLeft(empresa.dvAgConta, 1) : " ",  // 72
    padRight(empresa.nome, 30),                     // 73-102
    padRight(loteInfo.mensagem || "", 40),           // 103-142
    padRight(empresa.logradouro || "", 30),          // 143-172
    padLeft(empresa.numero || "0", 5),              // 173-177
    padRight(empresa.complemento || "", 15),         // 178-192
    padRight(empresa.cidade || "", 20),              // 193-212
    padLeft(stripDoc(empresa.cep || "").slice(0, 5), 5), // 213-217
    padLeft(stripDoc(empresa.cep || "").slice(5, 8) || "000", 3), // 218-220
    padRight(empresa.estado || "", 2),               // 221-222
    padLeft(loteInfo.indicativoFormaPagamento || "01", 2), // 223-224 Indicativo Forma Pagamento
    spaces(6),                                      // 225-230 CNAB Brancos
    spaces(10),                                     // 231-240 Ocorrencias
  ].join("");
  lines.push(hLote);

  // Segmentos de detalhe
  let seqReg = 1;
  let somaValores = 0;

  for (const pgt of pagamentos) {
    // Segmento A
    const valorNum = parseFloat(pgt.valor || "0");
    somaValores += valorNum;

    const segA = [
      banco,                                            // 1-3
      lotePad,                                          // 4-7
      "3",                                              // 8
      padLeft(seqReg, 5),                               // 9-13
      "A",                                              // 14
      padLeft(pgt.tipoMovimento || "0", 1),             // 15
      padLeft(pgt.codInstrucao || "00", 2),             // 16-17
      padLeft(pgt.camara || "000", 3),                  // 18-20
      padLeft(pgt.bancoFavorecido, 3),                  // 21-23
      padLeft(pgt.agenciaFavorecido, 5),                // 24-28
      padLeft(pgt.dvAgenciaFav || "0", 1),               // 29
      padLeft(pgt.contaFavorecido, 12),                 // 30-41
      padLeft(pgt.dvContaFav || "0", 1),                // 42
      pgt.dvAgContaFav?.trim() ? padLeft(pgt.dvAgContaFav, 1) : " ",  // 43
      padRight(pgt.nomeFavorecido, 30),                 // 44-73
      padRight(pgt.seuNumero || "", 20),                // 74-93
      fmtDate(pgt.dataPagamento),                       // 94-101
      padRight(pgt.tipoMoeda || "BRL", 3),              // 102-104
      padLeft(pgt.quantidadeMoeda || "0", 15),           // 105-119 (qtd moeda)
      fmtValue(pgt.valor, 13, 2),                       // 120-134
      padRight(pgt.nossoNumero || "", 20),               // 135-154 nosso numero
      fmtDate(pgt.dataRealPagamento || pgt.dataPagamento), // 155-162 data real
      fmtValue(pgt.valorRealPagamento || pgt.valor || "0", 13, 2), // 163-177 valor real
      padRight(pgt.info2 || "", 40),                    // 178-217
      padRight(pgt.codFinalidadeDoc || "  ", 2),        // 218-219
      padRight(pgt.codFinalidadeTED || "     ", 5),     // 220-224
      padRight(pgt.codFinalidadeComp || "  ", 2),       // 225-226
      spaces(3),                                        // 227-229
      padLeft(pgt.aviso || "0", 1),                     // 230
      spaces(10),                                       // 231-240
    ].join("");
    lines.push(segA);
    seqReg++;

    // Segmento B (se CPF/CNPJ favorecido informado)
    if (pgt.cpfCnpjFavorecido) {
      const cepFav = stripDoc(pgt.cepFav || "");
      const segB = [
        banco,                                              // 1-3
        lotePad,                                            // 4-7
        "3",                                                // 8
        padLeft(seqReg, 5),                                 // 9-13
        "B",                                                // 14
        padRight(pgt.formaIniciacao || "   ", 3),           // 15-17
        padLeft(pgt.tipoInscricaoFav || "2", 1),            // 18
        padLeft(stripDoc(pgt.cpfCnpjFavorecido), 14),       // 19-32
        padRight(pgt.logradouroFav || "", 30),              // 33-62
        padLeft(pgt.numeroFav || "0", 5),                   // 63-67
        padRight(pgt.complementoFav || "", 15),             // 68-82
        padRight(pgt.bairroFav || "", 15),                  // 83-97
        padRight(pgt.cidadeFav || "", 20),                  // 98-117
        padLeft(cepFav.slice(0, 5), 5),                     // 118-122
        padLeft(cepFav.slice(5, 8) || "000", 3),            // 123-125
        padRight(pgt.estadoFav || "", 2),                   // 126-127
        fmtDate(pgt.dataVencimento || pgt.dataPagamento),   // 128-135
        fmtValue(pgt.valorDocumento || pgt.valor || "0", 13, 2), // 136-150
        fmtValue(pgt.valorAbatimento || "0", 13, 2),       // 151-165
        fmtValue(pgt.valorDesconto || "0", 13, 2),         // 166-180
        fmtValue(pgt.valorMora || "0", 13, 2),             // 181-195
        fmtValue(pgt.valorMulta || "0", 13, 2),            // 196-210
        padRight(pgt.codDocFavorecido || "", 15),           // 211-225
        padLeft(pgt.avisoFav || "0", 1),                    // 226
        padLeft(pgt.ugSiape || "0", 6),                     // 227-232
        padLeft(pgt.ispb || "0", 8),                        // 233-240
      ].join("");
      lines.push(segB);
      seqReg++;
    }
  }

  const qtdeRegs = seqReg - 1 + 2; // detalhes + header + trailer

  // Trailer de Lote (Tipo 5)
  const tLote = [
    banco,                                          // 1-3
    lotePad,                                        // 4-7
    "5",                                            // 8
    spaces(9),                                      // 9-17
    padLeft(qtdeRegs, 6),                           // 18-23
    fmtValue(somaValores.toString(), 16, 2),        // 24-41
    padLeft("0", 18),                               // 42-59 qtde débitos
    padLeft("0", 6),                                // 60-65 valor débitos
    spaces(175),                                    // 66-240 FEBRABAN uso futuro
  ].join("");
  lines.push(tLote);

  // Trailer de Arquivo (Tipo 9)
  const totalRegs = lines.length + 1; // +1 para o trailer
  const tArq = [
    banco,                                          // 1-3
    "9999",                                         // 4-7
    "9",                                            // 8
    spaces(9),                                      // 9-17
    padLeft("1", 6),                                // 18-23 qtde lotes
    padLeft(totalRegs, 6),                          // 24-29 qtde registros
    padLeft("0", 6),                                // 30-35
    spaces(205),                                    // 36-240
  ].join("");
  lines.push(tArq);

  return lines;
}
