import { useState, useCallback, useEffect } from "react";
import { buildCNAB240, encodeToLatin1, nowDate } from "../utils/cnab240.js";
import { apiGenerateCnab, apiDownloadFile } from "../utils/api.js";
import {
  createDefaultEmpresa,
  createDefaultLote,
  createDefaultPagamento,
} from "../utils/constants.js";
import {
  sampleEmpresa,
  sampleLoteTED, samplePagamentosTED,
  sampleLotePIX, samplePagamentosPIX,
} from "../utils/sampleData.js";

export default function useCnabForm() {
  const [tab, setTab] = useState(0);
  const [empresa, setEmpresa] = useState(() => createDefaultEmpresa());
  const [loteInfo, setLoteInfo] = useState(() => createDefaultLote());
  const [pagamentos, setPagamentos] = useState(() => [{ ...createDefaultPagamento(), id: Date.now() }]);
  const [expanded, setExpanded] = useState({});
  const [lines, setLines] = useState([]);
  const [generated, setGenerated] = useState(false);
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

  const invalidateGenerated = useCallback(() => {
    setGenerated(false);
    setLines([]);
  }, []);

  const setEmpField = (k) => (v) => {
    invalidateGenerated();
    setEmpresa((p) => ({ ...p, [k]: v }));
  };

  const setLoteField = (k) => (v) => {
    invalidateGenerated();
    setLoteInfo((p) => ({ ...p, [k]: v }));
  };

  const setPgtField = (id, k) => (v) => {
    invalidateGenerated();
    setPagamentos((ps) => ps.map((p) => (p.id === id ? { ...p, [k]: v } : p)));
  };

  const addPgt = () => {
    invalidateGenerated();
    const id = Date.now();
    setPagamentos((ps) => [...ps, { ...createDefaultPagamento(), id }]);
    setExpanded((ex) => ({ ...ex, [id]: true }));
  };

  const removePgt = (id) => {
    invalidateGenerated();
    setPagamentos((ps) => ps.filter((p) => p.id !== id));
  };

  const duplicatePgt = (id) => {
    const source = pagamentos.find((p) => p.id === id);
    if (!source) return;
    invalidateGenerated();
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
    invalidateGenerated();
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

  const [lastGeneratedId, setLastGeneratedId] = useState(null);

  const generate = useCallback(async () => {
    // Local preview
    const result = buildCNAB240({ empresa, pagamentos, loteInfo });
    const valid = result.every((l) => l.length === 240);
    setLines(result.map((l, i) => ({ text: l, valid: l.length === 240, idx: i })));
    setGenerated(true);

    // Save to backend
    try {
      const response = await apiGenerateCnab({ empresa, loteInfo, pagamentos });
      setLastGeneratedId(response.id);
    } catch (err) {
      console.warn("Erro ao salvar no backend:", err);
    }

    return valid;
  }, [empresa, pagamentos, loteInfo]);

  const download = () => {
    if (lastGeneratedId) {
      const cnpjClean = empresa.cnpj.replace(/\D/g, "");
      const dateStr = (empresa.dataGeracao || nowDate()).replace(/-/g, "");
      apiDownloadFile(lastGeneratedId, `cnab240_${cnpjClean}_${dateStr}.rem`).catch(() => {
        // Fallback: download local
        downloadLocal();
      });
    } else {
      downloadLocal();
    }
  };

  const downloadLocal = () => {
    const content = lines.map((l) => l.text).join("\r\n") + "\r\n";
    const blob = new Blob([encodeToLatin1(content)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cnab240_${empresa.cnpj.replace(/\D/g, "")}_${(empresa.dataGeracao || nowDate()).replace(/-/g, "")}.rem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const content = lines.map((l) => l.text).join("\r\n") + "\r\n";
    await navigator.clipboard.writeText(content);
  };

  const fillSampleTED = () => {
    invalidateGenerated();
    setEmpresa({ ...sampleEmpresa, dataGeracao: nowDate(), horaGeracao: "" });
    setLoteInfo({ ...sampleLoteTED });
    setPagamentos(samplePagamentosTED.map((p, i) => ({
      ...p,
      id: Date.now() + i,
      dataPagamento: nowDate(),
      dataRealPagamento: "",
    })));
    setExpanded({});
  };

  const fillSamplePIX = () => {
    invalidateGenerated();
    setEmpresa({ ...sampleEmpresa, dataGeracao: nowDate(), horaGeracao: "" });
    setLoteInfo({ ...sampleLotePIX });
    setPagamentos(samplePagamentosPIX.map((p, i) => ({
      ...p,
      id: Date.now() + i,
      dataPagamento: nowDate(),
      dataRealPagamento: "",
    })));
    setExpanded({});
  };

  const totalValor = pagamentos.reduce((s, p) => s + parseFloat(p.valor || "0"), 0);

  const isEmpty = (v) => !v || String(v).trim() === "";

  const validationErrors = [];

  // Empresa (tab 0)
  const empresaRequired = [
    ["codigoBanco", "Banco"],
    ["cnpj", "CNPJ / CPF"],
    ["nome", "Nome da Empresa"],
    ["agencia", "Agencia"],
    ["conta", "Conta Corrente"],
  ];
  empresaRequired.forEach(([k, label]) => {
    if (isEmpty(empresa[k])) {
      validationErrors.push({ tab: 0, tabName: "Empresa", field: label });
    }
  });

  // Lote (tab 1)
  if (isEmpty(loteInfo.tipoServico)) {
    validationErrors.push({ tab: 1, tabName: "Lote", field: "Tipo de Servico" });
  }
  if (isEmpty(loteInfo.formaLancamento)) {
    validationErrors.push({ tab: 1, tabName: "Lote", field: "Forma de Lancamento" });
  }

  // Pagamentos (tab 2)
  if (pagamentos.length === 0) {
    validationErrors.push({ tab: 2, tabName: "Pagamentos", field: "Adicione ao menos 1 pagamento" });
  }
  pagamentos.forEach((p, idx) => {
    const prefix = `Pagamento #${idx + 1}`;
    const requiredFields = [
      ["nomeFavorecido", "Nome do Favorecido"],
      ["bancoFavorecido", "Banco do Favorecido"],
      ["agenciaFavorecido", "Agencia"],
      ["contaFavorecido", "Conta Corrente"],
      ["cpfCnpjFavorecido", "CNPJ / CPF Favorecido"],
      ["valor", "Valor"],
      ["dataPagamento", "Data Pagamento"],
    ];
    requiredFields.forEach(([k, label]) => {
      if (isEmpty(p[k])) {
        validationErrors.push({ tab: 2, tabName: "Pagamentos", field: `${prefix}: ${label}` });
      }
    });
  });

  const isValid = validationErrors.length === 0;

  // Determine completed / error steps
  const completedSteps = new Set();
  const errorSteps = new Set();

  const errorsByTab = { 0: 0, 1: 0, 2: 0 };
  validationErrors.forEach((e) => { errorsByTab[e.tab] = (errorsByTab[e.tab] || 0) + 1; });

  if (errorsByTab[0] === 0) completedSteps.add(0);
  else errorSteps.add(0);
  if (errorsByTab[1] === 0) completedSteps.add(1);
  else errorSteps.add(1);
  if (errorsByTab[2] === 0 && pagamentos.length > 0) completedSteps.add(2);
  else if (errorsByTab[2] > 0) errorSteps.add(2);

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
    sidebarOpen, setSidebarOpen,
    completedSteps, errorSteps,
    fillSampleTED, fillSamplePIX,
    validationErrors, isValid,
  };
}
