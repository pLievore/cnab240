import { useState, useCallback } from "react";

// ─── HELPERS ────────────────────────────────────────────────────────────────
const padLeft  = (v, n, c = "0") => String(v ?? "").padStart(n, c).slice(-n);
const padRight = (v, n, c = " ") => String(v ?? "").padEnd(n, c).slice(0, n);
const spaces   = (n) => " ".repeat(n);
const zeros    = (n) => "0".repeat(n);

function fmtDate(d) {
  if (!d) return zeros(8);
  const [y, m, dd] = d.split("-");
  return `${dd}${m}${y}`;
}
function nowDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}
function nowTime() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(x => padLeft(x,2)).join("");
}
function fmtValue(v, intDig, decDig) {
  const total = intDig + decDig;
  const num = parseFloat(v || "0");
  const cents = Math.round(num * Math.pow(10, decDig));
  return padLeft(cents, total);
}
function stripDoc(v) { return String(v || "").replace(/\D/g, ""); }
function encodeToLatin1(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i] = code > 255 ? 63 : code; // '?' para chars fora do Latin-1
  }
  return bytes;
}

// ─── CNAB 240 BUILDER ───────────────────────────────────────────────────────
function buildCNAB240(form) {
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
    padRight(empresa.dvAgencia, 1),                 // 58
    padLeft(empresa.conta, 12),                     // 59-70
    padRight(empresa.dvConta, 1),                   // 71
    padRight(empresa.dvAgConta, 1),                 // 72
    padRight(empresa.nome, 30),                     // 73-102
    padRight(empresa.nomeBanco, 30),                // 103-132
    spaces(10),                                     // 133-142
    "1",                                            // 143 (remessa)
    fmtDate(empresa.dataGeracao || nowDate()),      // 144-151
    empresa.horaGeracao || nowTime(),               // 152-157
    padLeft(empresa.nsa || "1", 6),                 // 158-163
    "103",                                          // 164-166
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
    "046",                                          // 14-16
    " ",                                            // 17
    padLeft(empresa.tipoInscricao, 1),              // 18
    padLeft(stripDoc(empresa.cnpj), 14),            // 19-32
    padRight(empresa.convenio, 20),                 // 33-52
    padLeft(empresa.agencia, 5),                    // 53-57
    padRight(empresa.dvAgencia, 1),                 // 58
    padLeft(empresa.conta, 12),                     // 59-70
    padRight(empresa.dvConta, 1),                   // 71
    padRight(empresa.dvAgConta, 1),                 // 72
    padRight(empresa.nome, 30),                     // 73-102
    padRight(loteInfo.mensagem || "", 40),           // 103-142
    padRight(empresa.logradouro || "", 30),          // 143-172
    padLeft(empresa.numero || "0", 5),              // 173-177
    padRight(empresa.complemento || "", 15),         // 178-192
    padRight(empresa.cidade || "", 20),              // 193-212
    padLeft(stripDoc(empresa.cep || ""), 5),        // 213-217
    padRight(empresa.cepComp || "", 3),              // 218-220
    padRight(empresa.estado || "", 2),               // 221-222
    padLeft(loteInfo.indicativoFormaPagamento || "01", 2), // 223-224 P014
    spaces(6),                                      // 225-230
    spaces(10),                                     // 231-240
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
      padRight(pgt.dvAgenciaFav || " ", 1),             // 29
      padLeft(pgt.contaFavorecido, 12),                 // 30-41
      padRight(pgt.dvContaFav || " ", 1),               // 42
      padRight(pgt.dvAgContaFav || " ", 1),             // 43
      padRight(pgt.nomeFavorecido, 30),                 // 44-73
      padRight(pgt.seuNumero || "", 20),                // 74-93
      fmtDate(pgt.dataPagamento),                       // 94-101
      padRight(pgt.tipoMoeda || "BRL", 3),              // 102-104
      padLeft("0", 15),                                // 105-119 (qtd moeda)
      fmtValue(pgt.valor, 13, 2),                       // 120-134
      padRight("", 20),                                 // 135-154 nosso numero
      zeros(8),                                         // 155-162 data real
      fmtValue("0", 13, 2),                             // 163-177 valor real
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
      const segB = [
        banco,                                            // 1-3
        lotePad,                                          // 4-7
        "3",                                              // 8
        padLeft(seqReg, 5),                               // 9-13
        "B",                                              // 14
        padRight(pgt.formaIniciacao || "   ", 3),         // 15-17
        padLeft(pgt.tipoInscricaoFav || "2", 1),          // 18
        padLeft(stripDoc(pgt.cpfCnpjFavorecido), 14),     // 19-32
        padRight(pgt.dadosCompl1 || "", 35),              // 33-67
        padRight(pgt.dadosCompl2 || "", 60),              // 68-127
        padRight(pgt.dadosCompl3 || "", 99),              // 128-226
        padLeft("0", 6),                                 // 227-232 UG SIAPE
        padLeft("0", 8),                                 // 233-240 ISPB
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
    padLeft("0", 18),                               // 42-59
    padLeft("0", 6),                                // 60-65
    spaces(165),                                    // 66-230
    spaces(10),                                     // 231-240
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

// ─── COMPONENTES UI ─────────────────────────────────────────────────────────
const styles = {
  app: {
    minHeight: "100vh",
    background: "#0a0e14",
    color: "#c9d1d9",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    padding: "0 0 60px 0",
  },
  header: {
    background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
    borderBottom: "1px solid #30363d",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    width: 40, height: 40,
    background: "linear-gradient(135deg, #00d4aa, #006644)",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: "bold", color: "#fff",
    flexShrink: 0,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: "#e6edf3", letterSpacing: "-0.5px" },
  subtitle: { margin: "2px 0 0", fontSize: 12, color: "#8b949e" },
  badge: {
    marginLeft: "auto",
    background: "#00d4aa22",
    border: "1px solid #00d4aa44",
    color: "#00d4aa",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 11,
    letterSpacing: "0.5px",
  },
  body: { maxWidth: 960, margin: "0 auto", padding: "32px 24px" },
  tabs: { display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #21262d" },
  tab: (active) => ({
    padding: "10px 20px",
    background: active ? "#161b22" : "transparent",
    border: "none",
    borderBottom: active ? "2px solid #00d4aa" : "2px solid transparent",
    color: active ? "#00d4aa" : "#8b949e",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    transition: "all 0.15s",
    marginBottom: -1,
    letterSpacing: "0.3px",
  }),
  card: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e6edf3",
    margin: "0 0 20px",
    paddingBottom: 12,
    borderBottom: "1px solid #21262d",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  grid: (cols = 3) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "16px",
  }),
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, color: "#8b949e", letterSpacing: "0.5px", textTransform: "uppercase" },
  input: {
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 6,
    color: "#e6edf3",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "8px 10px",
    outline: "none",
    transition: "border 0.15s",
  },
  select: {
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 6,
    color: "#e6edf3",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "8px 10px",
    outline: "none",
    width: "100%",
  },
  btn: (variant = "primary") => ({
    background: variant === "primary" ? "#00d4aa" : variant === "danger" ? "#da3633" : "#21262d",
    color: variant === "primary" ? "#0d1117" : "#e6edf3",
    border: "none",
    borderRadius: 6,
    padding: variant === "sm" ? "6px 14px" : "10px 20px",
    fontSize: variant === "sm" ? 12 : 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.3px",
    transition: "opacity 0.15s",
  }),
  pgtCard: {
    background: "#0d1117",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  pgtHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    cursor: "pointer",
  },
  pgtNum: { fontSize: 12, color: "#00d4aa", fontWeight: 600, letterSpacing: "1px" },
  preview: {
    background: "#0d1117",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 20,
    overflowX: "auto",
  },
  previewLine: {
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: "20px",
    whiteSpace: "pre",
    color: "#8b949e",
  },
  previewType: (t) => ({
    color: t === "0" ? "#58a6ff" : t === "1" ? "#d2a8ff" : t === "5" ? "#ffa657" : t === "9" ? "#f85149" : "#3fb950",
    fontWeight: t !== "3" ? "bold" : "normal",
  }),
  statusRow: { display: "flex", gap: 12, marginBottom: 24 },
  statusBadge: (color) => ({
    background: color + "22",
    border: `1px solid ${color}44`,
    color,
    padding: "6px 12px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
  }),
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#8b949e",
    fontSize: 13,
  },
};

const defaultEmpresa = {
  codigoBanco: "001",
  tipoInscricao: "2",
  cnpj: "",
  convenio: "",
  agencia: "",
  dvAgencia: "0",
  conta: "",
  dvConta: "0",
  dvAgConta: "0",
  nome: "",
  nomeBanco: "BANCO DO BRASIL",
  logradouro: "",
  numero: "",
  complemento: "",
  cidade: "",
  cep: "",
  cepComp: "000",
  estado: "",
  dataGeracao: nowDate(),
  horaGeracao: "",
  nsa: "1",
};

const defaultLote = {
  tipoServico: "98",
  formaLancamento: "01",
  indicativoFormaPagamento: "01",
  mensagem: "",
};

const defaultPagamento = {
  bancoFavorecido: "",
  agenciaFavorecido: "",
  dvAgenciaFav: "0",
  contaFavorecido: "",
  dvContaFav: "0",
  dvAgContaFav: "0",
  nomeFavorecido: "",
  cpfCnpjFavorecido: "",
  tipoInscricaoFav: "2",
  formaIniciacao: "   ",
  valor: "",
  dataPagamento: nowDate(),
  seuNumero: "",
  tipoMoeda: "BRL",
  camara: "000",
  tipoMovimento: "0",
  codInstrucao: "00",
  codFinalidadeTED: "00010",
  codFinalidadeDoc: "  ",
  codFinalidadeComp: "  ",
  aviso: "0",
  info2: "",
};

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...styles.input, ...style }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={styles.select}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = ["Empresa", "Lote", "Pagamentos", "Gerar Arquivo"];

export default function App() {
  const [tab, setTab] = useState(0);
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const [loteInfo, setLoteInfo] = useState(defaultLote);
  const [pagamentos, setPagamentos] = useState([{ ...defaultPagamento, id: Date.now() }]);
  const [expanded, setExpanded] = useState({});
  const [lines, setLines] = useState([]);
  const [generated, setGenerated] = useState(false);

  const setEmpField = (k) => (v) => setEmpresa(p => ({ ...p, [k]: v }));
  const setLoteField = (k) => (v) => setLoteInfo(p => ({ ...p, [k]: v }));
  const setPgtField = (id, k) => (v) => setPagamentos(ps => ps.map(p => p.id === id ? { ...p, [k]: v } : p));

  const addPgt = () => {
    const id = Date.now();
    setPagamentos(ps => [...ps, { ...defaultPagamento, id }]);
    setExpanded(ex => ({ ...ex, [id]: true }));
  };

  const removePgt = (id) => setPagamentos(ps => ps.filter(p => p.id !== id));

  const generate = useCallback(() => {
    const result = buildCNAB240({ empresa, pagamentos, loteInfo });
    // Validar tamanho das linhas
    const valid = result.every(l => l.length === 240);
    setLines(result.map((l, i) => ({ text: l, valid: l.length === 240, idx: i })));
    setGenerated(true);
    if (!valid) alert("⚠️ Algumas linhas não têm 240 posições. Verifique os dados!");
  }, [empresa, pagamentos, loteInfo]);

  const download = () => {
    const content = lines.map(l => l.text).join("\r\n");
    const blob = new Blob([encodeToLatin1(content)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cnab240_${empresa.cnpj.replace(/\D/g,"")}_${empresa.dataGeracao?.replace(/-/g,"")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeLabel = (t) => ({ "0": "HDR-ARQ", "1": "HDR-LOT", "5": "TRL-LOT", "9": "TRL-ARQ", "3": "DETALHE" }[t] || t);

  const totalValor = pagamentos.reduce((s, p) => s + parseFloat(p.valor || "0"), 0);

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>C2</div>
        <div>
          <h1 style={styles.title}>Gerador CNAB 240</h1>
          <p style={styles.subtitle}>Padrão FEBRABAN · Versão 10.11 · 240 posições</p>
        </div>
        <div style={styles.badge}>REMESSA</div>
      </div>

      <div style={styles.body}>
        {/* STATUS */}
        <div style={styles.statusRow}>
          <div style={styles.statusBadge("#58a6ff")}>{pagamentos.length} Pagamento{pagamentos.length !== 1 ? "s" : ""}</div>
          <div style={styles.statusBadge("#3fb950")}>
            R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div style={styles.statusBadge("#8b949e")}>{empresa.nome || "Empresa não definida"}</div>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          {TABS.map((t, i) => (
            <button key={t} style={styles.tab(tab === i)} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        {/* ── TAB 0: EMPRESA ── */}
        {tab === 0 && (
          <>
            <div style={styles.card}>
              <p style={styles.cardTitle}>Dados da Empresa (Pagadora)</p>
              <div style={{ ...styles.grid(3), marginBottom: 16 }}>
                <Field label="Código do Banco">
                  <Input value={empresa.codigoBanco} onChange={setEmpField("codigoBanco")} placeholder="001" />
                </Field>
                <Field label="Tipo de Inscrição">
                  <Select value={empresa.tipoInscricao} onChange={setEmpField("tipoInscricao")} options={[{ value: "1", label: "1 - CPF" }, { value: "2", label: "2 - CNPJ" }]} />
                </Field>
                <Field label="CNPJ / CPF">
                  <Input value={empresa.cnpj} onChange={setEmpField("cnpj")} placeholder="00.000.000/0001-00" />
                </Field>
              </div>
              <div style={{ ...styles.grid(2), marginBottom: 16 }}>
                <Field label="Nome da Empresa">
                  <Input value={empresa.nome} onChange={setEmpField("nome")} placeholder="RAZÃO SOCIAL LTDA" />
                </Field>
                <Field label="Nome do Banco">
                  <Input value={empresa.nomeBanco} onChange={setEmpField("nomeBanco")} placeholder="BANCO DO BRASIL" />
                </Field>
              </div>
              <div style={styles.grid(4)}>
                <Field label="Convênio">
                  <Input value={empresa.convenio} onChange={setEmpField("convenio")} placeholder="Código convênio" />
                </Field>
                <Field label="Agência">
                  <Input value={empresa.agencia} onChange={setEmpField("agencia")} placeholder="00001" />
                </Field>
                <Field label="DV Agência">
                  <Input value={empresa.dvAgencia} onChange={setEmpField("dvAgencia")} placeholder="0" />
                </Field>
                <Field label="NSA (Seq. Arquivo)">
                  <Input value={empresa.nsa} onChange={setEmpField("nsa")} placeholder="000001" />
                </Field>
              </div>
              <div style={{ ...styles.grid(4), marginTop: 16 }}>
                <Field label="Conta Corrente">
                  <Input value={empresa.conta} onChange={setEmpField("conta")} placeholder="000000000001" />
                </Field>
                <Field label="DV Conta">
                  <Input value={empresa.dvConta} onChange={setEmpField("dvConta")} placeholder="0" />
                </Field>
                <Field label="DV Ag/Conta">
                  <Input value={empresa.dvAgConta} onChange={setEmpField("dvAgConta")} placeholder="0" />
                </Field>
                <Field label="Data de Geração">
                  <Input type="date" value={empresa.dataGeracao} onChange={setEmpField("dataGeracao")} />
                </Field>
              </div>
            </div>
            <div style={styles.card}>
              <p style={styles.cardTitle}>Endereço da Empresa</p>
              <div style={{ ...styles.grid(3), marginBottom: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <Field label="Logradouro">
                    <Input value={empresa.logradouro} onChange={setEmpField("logradouro")} placeholder="RUA DAS FLORES" />
                  </Field>
                </div>
                <Field label="Número">
                  <Input value={empresa.numero} onChange={setEmpField("numero")} placeholder="123" />
                </Field>
              </div>
              <div style={styles.grid(4)}>
                <Field label="Complemento">
                  <Input value={empresa.complemento} onChange={setEmpField("complemento")} placeholder="SALA 1" />
                </Field>
                <Field label="Cidade">
                  <Input value={empresa.cidade} onChange={setEmpField("cidade")} placeholder="SÃO PAULO" />
                </Field>
                <Field label="CEP">
                  <Input value={empresa.cep} onChange={setEmpField("cep")} placeholder="01310" />
                </Field>
                <Field label="Estado (UF)">
                  <Input value={empresa.estado} onChange={setEmpField("estado")} placeholder="SP" />
                </Field>
              </div>
            </div>
          </>
        )}

        {/* ── TAB 1: LOTE ── */}
        {tab === 1 && (
          <div style={styles.card}>
            <p style={styles.cardTitle}>Configurações do Lote</p>
            <div style={styles.grid(2)}>
              <Field label="Tipo de Serviço">
                <Select value={loteInfo.tipoServico} onChange={setLoteField("tipoServico")} options={[
                  { value: "01", label: "01 - Cobrança" },
                  { value: "03", label: "03 - Bloqueto Eletrônico" },
                  { value: "20", label: "20 - Pgto Fornecedor" },
                  { value: "30", label: "30 - Pagamento de Salários" },
                  { value: "50", label: "50 - Pensão Alimentícia" },
                  { value: "60", label: "60 - Eletrônico" },
                  { value: "90", label: "90 - Pagamento Próprio" },
                  { value: "98", label: "98 - Pagamentos Diversos" },
                ]} />
              </Field>
              <Field label="Forma de Lançamento">
                <Select value={loteInfo.formaLancamento} onChange={setLoteField("formaLancamento")} options={[
                  { value: "01", label: "01 - Crédito em Conta Corrente/Salário" },
                  { value: "02", label: "02 - Cheque Pagamento/Administrativo" },
                  { value: "03", label: "03 - DOC/TED" },
                  { value: "05", label: "05 - Crédito em Conta Poupança" },
                  { value: "10", label: "10 - OP à Disposição" },
                  { value: "11", label: "11 - Pagto Contas/Tributos c/ Código de Barras" },
                  { value: "16", label: "16 - Tributo DARF Normal" },
                  { value: "20", label: "20 - Pagamento com Autenticação" },
                  { value: "30", label: "30 - Liquidação de Títulos do Próprio Banco" },
                  { value: "31", label: "31 - Pagamento de Títulos de Outros Bancos" },
                  { value: "41", label: "41 - TED – Outra Titularidade" },
                  { value: "43", label: "43 - TED – Mesma Titularidade" },
                  { value: "45", label: "45 - PIX Transferência" },
                  { value: "47", label: "47 - PIX QR-CODE" },
                ]} />
              </Field>
              <Field label="Indicativo Forma de Pagamento (P014)">
                <Select value={loteInfo.indicativoFormaPagamento} onChange={setLoteField("indicativoFormaPagamento")} options={[
                  { value: "01", label: "01 - Débito em Conta Corrente" },
                  { value: "02", label: "02 - Débito Empréstimo/Financiamento" },
                  { value: "03", label: "03 - Débito Cartão de Crédito" },
                ]} />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Mensagem do Lote (Informação 1)">
                  <Input value={loteInfo.mensagem} onChange={setLoteField("mensagem")} placeholder="Mensagem opcional – até 40 caracteres" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PAGAMENTOS ── */}
        {tab === 2 && (
          <>
            {pagamentos.length === 0 && (
              <div style={styles.card}>
                <div style={styles.emptyState}>
                  Nenhum pagamento adicionado.<br />
                  Clique em "+ Adicionar Pagamento" para começar.
                </div>
              </div>
            )}
            {pagamentos.map((pgt, idx) => (
              <div key={pgt.id} style={styles.pgtCard}>
                <div style={styles.pgtHeader} onClick={() => setExpanded(ex => ({ ...ex, [pgt.id]: !ex[pgt.id] }))}>
                  <span style={styles.pgtNum}>
                    PGTO #{String(idx + 1).padStart(3, "0")}
                    {pgt.nomeFavorecido && <span style={{ color: "#8b949e", fontWeight: 400, marginLeft: 12 }}>{pgt.nomeFavorecido}</span>}
                    {pgt.valor && <span style={{ color: "#3fb950", marginLeft: 12 }}>R$ {parseFloat(pgt.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#8b949e", fontSize: 12 }}>{expanded[pgt.id] ? "▲ recolher" : "▼ expandir"}</span>
                    {pagamentos.length > 1 && (
                      <button style={styles.btn("danger")} onClick={e => { e.stopPropagation(); removePgt(pgt.id); }}>✕</button>
                    )}
                  </div>
                </div>

                {(expanded[pgt.id] || pagamentos.length === 1) && (
                  <>
                    {/* Favorecido */}
                    <div style={{ fontSize: 11, color: "#00d4aa", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>Favorecido</div>
                    <div style={{ ...styles.grid(3), marginBottom: 14 }}>
                      <div style={{ gridColumn: "span 2" }}>
                        <Field label="Nome do Favorecido">
                          <Input value={pgt.nomeFavorecido} onChange={setPgtField(pgt.id, "nomeFavorecido")} placeholder="NOME COMPLETO OU RAZÃO SOCIAL" />
                        </Field>
                      </div>
                      <Field label="Banco do Favorecido">
                        <Input value={pgt.bancoFavorecido} onChange={setPgtField(pgt.id, "bancoFavorecido")} placeholder="341" />
                      </Field>
                    </div>
                    <div style={{ ...styles.grid(5), marginBottom: 14 }}>
                      <Field label="Agência">
                        <Input value={pgt.agenciaFavorecido} onChange={setPgtField(pgt.id, "agenciaFavorecido")} placeholder="00001" />
                      </Field>
                      <Field label="DV Ag.">
                        <Input value={pgt.dvAgenciaFav} onChange={setPgtField(pgt.id, "dvAgenciaFav")} placeholder="0" />
                      </Field>
                      <Field label="Conta Corrente">
                        <Input value={pgt.contaFavorecido} onChange={setPgtField(pgt.id, "contaFavorecido")} placeholder="000000000001" />
                      </Field>
                      <Field label="DV Conta">
                        <Input value={pgt.dvContaFav} onChange={setPgtField(pgt.id, "dvContaFav")} placeholder="0" />
                      </Field>
                      <Field label="DV Ag/Cta">
                        <Input value={pgt.dvAgContaFav} onChange={setPgtField(pgt.id, "dvAgContaFav")} placeholder="0" />
                      </Field>
                    </div>
                    <div style={{ ...styles.grid(3), marginBottom: 14 }}>
                      <Field label="CNPJ / CPF Favorecido">
                        <Input value={pgt.cpfCnpjFavorecido} onChange={setPgtField(pgt.id, "cpfCnpjFavorecido")} placeholder="Gera Segmento B" />
                      </Field>
                      <Field label="Tipo Inscrição Fav.">
                        <Select value={pgt.tipoInscricaoFav} onChange={setPgtField(pgt.id, "tipoInscricaoFav")} options={[{ value: "1", label: "1 - CPF" }, { value: "2", label: "2 - CNPJ" }]} />
                      </Field>
                      <Field label="Câmara Centralizadora (P001)">
                        <Select value={pgt.camara} onChange={setPgtField(pgt.id, "camara")} options={[
                          { value: "000", label: "000 - Mesmo Banco (Crédito Próprio)" },
                          { value: "018", label: "018 - TED (STR/CIP)" },
                          { value: "700", label: "700 - DOC (COMPE)" },
                          { value: "988", label: "988 - TED com ISPB Obrigatório" },
                          { value: "009", label: "009 - PIX (SPI)" },
                        ]} />
                      </Field>
                    </div>

                    {/* Pagamento */}
                    <div style={{ fontSize: 11, color: "#00d4aa", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase", borderTop: "1px solid #21262d", paddingTop: 12 }}>Dados do Pagamento</div>
                    <div style={{ ...styles.grid(4), marginBottom: 14 }}>
                      <Field label="Valor (R$)">
                        <Input value={pgt.valor} onChange={setPgtField(pgt.id, "valor")} placeholder="0.00" type="number" />
                      </Field>
                      <Field label="Data Pagamento">
                        <Input type="date" value={pgt.dataPagamento} onChange={setPgtField(pgt.id, "dataPagamento")} />
                      </Field>
                      <Field label="Seu Número (Ref)">
                        <Input value={pgt.seuNumero} onChange={setPgtField(pgt.id, "seuNumero")} placeholder="REF-0001" />
                      </Field>
                      <Field label="Aviso ao Favorecido (P006)">
                        <Select value={pgt.aviso} onChange={setPgtField(pgt.id, "aviso")} options={[
                          { value: "0", label: "0 - Não emite aviso" },
                          { value: "2", label: "2 - Aviso somente ao remetente" },
                          { value: "5", label: "5 - Aviso somente ao favorecido" },
                          { value: "6", label: "6 - Aviso ao remetente e favorecido" },
                          { value: "7", label: "7 - 2 vias remetente + aviso favorecido" },
                        ]} />
                      </Field>
                    </div>
                    <div style={styles.grid(3)}>
                      <Field label="Cód. Finalidade TED">
                        <Select value={pgt.codFinalidadeTED} onChange={setPgtField(pgt.id, "codFinalidadeTED")} options={[
                          { value: "00001", label: "00001 - Pagamento de Impostos/Taxas" },
                          { value: "00010", label: "00010 - Transferência entre Contas" },
                          { value: "00020", label: "00020 - Liquidação de Títulos" },
                          { value: "00030", label: "00030 - Pagamento de Salários" },
                          { value: "00040", label: "00040 - Pagamento de Fornecedores" },
                          { value: "00060", label: "00060 - Dividendos" },
                          { value: "00090", label: "00090 - Pagamento de Honorários" },
                          { value: "00100", label: "00100 - Pagamento de Aluguéis" },
                        ]} />
                      </Field>
                      <Field label="Info. Complementar">
                        <Input value={pgt.info2} onChange={setPgtField(pgt.id, "info2")} placeholder="Informações adicionais" />
                      </Field>
                      <Field label="Tipo de Movimento">
                        <Select value={pgt.tipoMovimento} onChange={setPgtField(pgt.id, "tipoMovimento")} options={[
                          { value: "0", label: "0 - Inclusão" },
                          { value: "5", label: "5 - Alteração" },
                          { value: "9", label: "9 - Exclusão" },
                        ]} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            ))}
            <button style={styles.btn()} onClick={addPgt}>+ Adicionar Pagamento</button>
          </>
        )}

        {/* ── TAB 3: GERAR ── */}
        {tab === 3 && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <button style={styles.btn("primary")} onClick={generate}>⚡ Gerar Arquivo CNAB 240</button>
              {generated && <button style={styles.btn()} onClick={download}>↓ Download .txt</button>}
            </div>

            {generated && (
              <>
                <div style={{ ...styles.statusRow, marginBottom: 16 }}>
                  <div style={styles.statusBadge("#58a6ff")}>{lines.length} registros</div>
                  <div style={styles.statusBadge(lines.every(l => l.valid) ? "#3fb950" : "#f85149")}>
                    {lines.every(l => l.valid) ? "✓ Todas as linhas com 240 posições" : "⚠ Erro no tamanho das linhas"}
                  </div>
                </div>
                <div style={styles.preview}>
                  <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 12, letterSpacing: "1px" }}>
                    PREVIEW DO ARQUIVO — {lines.length} LINHAS × 240 POSIÇÕES
                  </div>
                  {lines.map((l, i) => {
                    const tipo = l.text[7];
                    const seg = tipo === "3" ? l.text[13] : "";
                    return (
                      <div key={i} style={styles.previewLine}>
                        <span style={{ color: "#484f58", marginRight: 8, userSelect: "none" }}>{String(i+1).padStart(4,"0")}</span>
                        <span style={styles.previewType(tipo)}>[{typeLabel(tipo)}{seg ? `-${seg}` : ""}] </span>
                        <span style={{ color: l.valid ? "#c9d1d9" : "#f85149" }}>{l.text}</span>
                        <span style={{ color: l.valid ? "#3fb95066" : "#f8514966", marginLeft: 8 }}>
                          ({l.text.length}pos)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
