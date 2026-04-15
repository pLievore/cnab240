import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Sparkles } from "lucide-react";
import useCnabForm from "./hooks/useCnabForm.js";
import useAuth from "./hooks/useAuth.js";
import useAdmin from "./hooks/useAdmin.js";
import LoginPage from "./components/LoginPage.jsx";
import Header from "./components/layout/Header.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Stepper from "./components/layout/Stepper.jsx";
import EmpresaTab from "./components/tabs/EmpresaTab.jsx";
import LoteTab from "./components/tabs/LoteTab.jsx";
import PagamentosTab from "./components/tabs/PagamentosTab.jsx";
import GerarTab from "./components/tabs/GerarTab.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import TokenManager from "./components/admin/TokenManager.jsx";
import FileHistory from "./components/admin/FileHistory.jsx";
import FileDetail from "./components/admin/FileDetail.jsx";
import { Button } from "./components/ui/index.js";

const tabVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export default function App() {
  const auth = useAuth();
  const form = useCnabForm();
  const admin = useAdmin();
  const [adminTab, setAdminTab] = useState("dashboard");
  const [detailFileId, setDetailFileId] = useState(null);

  const isAdmin = auth.user?.role === "admin";

  if (!auth.authed) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage
          onSubmit={auth.login}
          loading={auth.loading}
          error={auth.error}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#e4e4e7",
            border: "1px solid #27272a",
            fontSize: "13px",
            fontFamily: "Inter, system-ui, sans-serif",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#09090b" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#09090b" } },
        }}
      />

      <Header
        empresa={form.empresa}
        pagamentos={form.pagamentos}
        totalValor={form.totalValor}
        onToggleSidebar={() => form.setSidebarOpen(true)}
        onLogout={auth.logout}
        user={auth.user}
      />

      <div className="flex">
        <Sidebar
          activeTab={form.tab}
          onTabChange={form.setTab}
          completedSteps={form.completedSteps}
          errorSteps={form.errorSteps}
          open={form.sidebarOpen}
          onClose={() => form.setSidebarOpen(false)}
          isAdmin={isAdmin}
          adminTab={adminTab}
          onAdminTabChange={(t) => { setAdminTab(t); setDetailFileId(null); }}
        />

        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            {/* Stepper (mobile/tablet) + sample data button */}
            <div className="lg:hidden">
              <Stepper
                activeTab={form.tab}
                completedSteps={form.completedSteps}
                onTabChange={form.setTab}
              />
            </div>

            {/* Sample data fill buttons */}
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={form.fillSampleTED}
                icon={<Sparkles size={14} />}
              >
                Exemplo TED
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={form.fillSamplePIX}
                icon={<Sparkles size={14} />}
              >
                Exemplo PIX
              </Button>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={form.tab}
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {form.tab === 0 && (
                  <EmpresaTab
                    empresa={form.empresa}
                    setEmpField={form.setEmpField}
                  />
                )}

                {form.tab === 1 && (
                  <LoteTab
                    loteInfo={form.loteInfo}
                    setLoteField={form.setLoteField}
                  />
                )}

                {form.tab === 2 && (
                  <PagamentosTab
                    pagamentos={form.pagamentos}
                    setPgtField={form.setPgtField}
                    addPgt={form.addPgt}
                    removePgt={form.removePgt}
                    duplicatePgt={form.duplicatePgt}
                    movePgt={form.movePgt}
                    expanded={form.expanded}
                    toggleExpanded={form.toggleExpanded}
                    loteInfo={form.loteInfo}
                  />
                )}

                {form.tab === 3 && (
                  <GerarTab
                    empresa={form.empresa}
                    pagamentos={form.pagamentos}
                    totalValor={form.totalValor}
                    lines={form.lines}
                    generated={form.generated}
                    generate={form.generate}
                    download={form.download}
                    copyToClipboard={form.copyToClipboard}
                    validationErrors={form.validationErrors}
                    isValid={form.isValid}
                    onGoToTab={form.setTab}
                  />
                )}

                {/* Admin Tabs */}
                {isAdmin && form.tab === 10 && adminTab === "dashboard" && (
                  <AdminDashboard admin={admin} />
                )}
                {isAdmin && form.tab === 10 && adminTab === "tokens" && (
                  <TokenManager admin={admin} />
                )}
                {isAdmin && form.tab === 10 && adminTab === "files" && !detailFileId && (
                  <FileHistory admin={admin} onViewDetail={(id) => setDetailFileId(id)} />
                )}
                {isAdmin && form.tab === 10 && adminTab === "files" && detailFileId && (
                  <FileDetail admin={admin} fileId={detailFileId} onBack={() => setDetailFileId(null)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
