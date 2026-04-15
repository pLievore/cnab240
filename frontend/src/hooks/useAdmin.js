import { useState, useCallback, useEffect } from "react";
import {
  apiGetStats,
  apiListTokens,
  apiCreateToken,
  apiRevokeToken,
  apiActivateToken,
  apiDeleteToken,
  apiListFiles,
  apiGetFile,
  apiDownloadFile,
} from "../utils/api.js";

export default function useAdmin() {
  const [stats, setStats] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [files, setFiles] = useState({ files: [], page: 1, total: 0, totalPages: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGetStats();
      setStats(data);
    } catch (err) {
      console.error("Erro ao buscar stats:", err);
    }
  }, []);

  const fetchTokens = useCallback(async () => {
    try {
      const data = await apiListTokens();
      setTokens(data);
    } catch (err) {
      console.error("Erro ao buscar tokens:", err);
    }
  }, []);

  const fetchFiles = useCallback(async (page = 1) => {
    try {
      const data = await apiListFiles(page);
      setFiles(data);
    } catch (err) {
      console.error("Erro ao buscar arquivos:", err);
    }
  }, []);

  const fetchFileDetail = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await apiGetFile(id);
      setSelectedFile(data);
    } catch (err) {
      console.error("Erro ao buscar detalhe:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createToken = useCallback(async (label, role) => {
    const data = await apiCreateToken(label, role);
    await fetchTokens();
    return data;
  }, [fetchTokens]);

  const revokeToken = useCallback(async (id) => {
    await apiRevokeToken(id);
    await fetchTokens();
  }, [fetchTokens]);

  const activateToken = useCallback(async (id) => {
    await apiActivateToken(id);
    await fetchTokens();
  }, [fetchTokens]);

  const deleteToken = useCallback(async (id) => {
    await apiDeleteToken(id);
    await fetchTokens();
  }, [fetchTokens]);

  const downloadFile = useCallback(async (id, filename) => {
    await apiDownloadFile(id, filename);
  }, []);

  return {
    stats, fetchStats,
    tokens, fetchTokens,
    files, fetchFiles,
    selectedFile, fetchFileDetail, setSelectedFile,
    createToken, revokeToken, activateToken, deleteToken,
    downloadFile,
    loading,
  };
}
