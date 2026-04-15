import { useState, useCallback, useEffect } from "react";
import { buildCNAB240, encodeToLatin1, nowDate } from "../utils/cnab240.js";
import { defaultEmpresa, defaultLote, defaultPagamento } from "../utils/constants.js";
import { sampleEmpresa, sampleLote, samplePagamentos } from "../utils/sampleData.js";

export default function useCnabForm() {
  const [tab, setTab] = useState(0);
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const [loteInfo, setLoteInfo] = useState(defaultLote);
  const [pagamentos, setPagamentos] = useState([{ ...defaultPagamento, id: Date.now() }]);
  const [expanded, setExpanded] = useState({});
  const [lines, setLines] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);

  // Track unsaved data
  useEffect(() => {
    const hasData = empresa.cnpj || empresa.nome || pagamentos.some(p => p.nomeFavorecido || p.valor);
    setHasUnsavedData(!!hasData);
  }, [empresa, pagamentos]);

  // Warn before page close
  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedData]);

  // Theme management
  useEffect(() => {
    document.body.classList.toggle("light", !darkMode);
  }, [darkMode]);

  const setEmpField = (k) => (v) => setEmpresa((p) => ({ ...p, [k]: v }));
  const setLoteField = (k) => (v) => setLoteInfo((p) => ({ ...p, [k]: v }));
  const setPgtField = (id, k) => (v) =>
    setPagamentos((ps) => ps.map((p) => (p.id === id ? { ...p, [k]: v } : p)));

  const addPgt = () => {
    const id = Date.now();
    setPagamentos((ps) => [...ps, { ...defaultPagamento, id }]);
    setExpanded((ex) => ({ ...ex, [id]: true }));
  };

  const removePgt = (id) => setPagamentos((ps) => ps.filter((p) => p.id !== id));

  const duplicatePgt = (id) => {
    const source = pagamentos.find((p) => p.id === id);
    if (!source) return;
    const newId = Date.now();
    const clone = { ...source, id: newId, seuNumero: "" };
    setPagamentos((ps) => {
      const idx = ps.findIndex((p) => p.id === id);
      const copy = [...ps];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
    setExpanded((ex) => ({ ...ex, [newId]: true }));
  };

  const movePgt = (id, direction) => {
    setPagamentos((ps) => {
      const idx = ps.findIndex((p) => p.id === id);
      if (idx < 0) return ps;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= ps.length) return ps;
      const copy = [...ps];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const toggleExpanded = (id) => {
    setExpanded((ex) => ({ ...ex, [id]: !ex[id] }));
  };

  const generate = useCallback(() => {
    const result = buildCNAB240({ empresa, pagamentos, loteInfo });
    const valid = result.every((l) => l.length === 240);
    setLines(result.map((l, i) => ({ text: l, valid: l.length === 240, idx: i })));
    setGenerated(true);
    return valid;
  }, [empresa, pagamentos, loteInfo]);

  const download = () => {
    const content = lines.map((l) => l.text).join("\r\n") + "\r\n";
    const blob = new Blob([encodeToLatin1(content)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cnab240_${empresa.cnpj.replace(/\D/g, "")}_${empresa.dataGeracao?.replace(/-/g, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const content = lines.map((l) => l.text).join("\r\n") + "\r\n";
    await navigator.clipboard.writeText(content);
  };

  const fillSampleData = () => {
    setEmpresa(sampleEmpresa);
    setLoteInfo(sampleLote);
    setPagamentos(samplePagamentos.map((p, i) => ({ ...p, id: Date.now() + i })));
    setExpanded({});
  };

  const totalValor = pagamentos.reduce((s, p) => s + parseFloat(p.valor || "0"), 0);

  // Determine completed / error steps
  const completedSteps = new Set();
  const errorSteps = new Set();

  // Step 0: Empresa
  if (empresa.cnpj && empresa.nome && empresa.codigoBanco && empresa.agencia && empresa.conta) {
    completedSteps.add(0);
  } else if (empresa.cnpj || empresa.nome) {
    // started but incomplete - no error badge, just not complete
  }

  // Step 1: Lote
  if (loteInfo.tipoServico && loteInfo.formaLancamento) {
    completedSteps.add(1);
  }

  // Step 2: Pagamentos
  const allPgtsValid = pagamentos.length > 0 && pagamentos.every(
    (p) => p.nomeFavorecido && p.bancoFavorecido && p.contaFavorecido && p.valor
  );
  if (allPgtsValid) completedSteps.add(2);
  const somePgtsMissing = pagamentos.some(
    (p) => (p.nomeFavorecido || p.valor) && (!p.bancoFavorecido || !p.contaFavorecido)
  );
  if (somePgtsMissing) errorSteps.add(2);

  // Step 3: generated
  if (generated && lines.every((l) => l.valid)) {
    completedSteps.add(3);
  } else if (generated && !lines.every((l) => l.valid)) {
    errorSteps.add(3);
  }

  return {
    tab, setTab,
    empresa, setEmpField,
    loteInfo, setLoteField,
    pagamentos, setPgtField,
    addPgt, removePgt, duplicatePgt, movePgt,
    expanded, toggleExpanded,
    lines, generated, generate, download, copyToClipboard,
    totalValor,
    darkMode, setDarkMode: () => setDarkMode((d) => !d),
    sidebarOpen, setSidebarOpen,
    completedSteps, errorSteps,
    fillSampleData,
  };
}
