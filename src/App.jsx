import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Sparkles } from "lucide-react";
import useCnabForm from "./hooks/useCnabForm.js";
import Header from "./components/layout/Header.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Stepper from "./components/layout/Stepper.jsx";
import EmpresaTab from "./components/tabs/EmpresaTab.jsx";
import LoteTab from "./components/tabs/LoteTab.jsx";
import PagamentosTab from "./components/tabs/PagamentosTab.jsx";
import GerarTab from "./components/tabs/GerarTab.jsx";
import { Button } from "./components/ui/index.js";

const tabVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export default function App() {
  const form = useCnabForm();

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
        darkMode={form.darkMode}
        onToggleTheme={form.setDarkMode}
        onToggleSidebar={() => form.setSidebarOpen(true)}
      />

      <div className="flex">
        <Sidebar
          activeTab={form.tab}
          onTabChange={form.setTab}
          completedSteps={form.completedSteps}
          errorSteps={form.errorSteps}
          open={form.sidebarOpen}
          onClose={() => form.setSidebarOpen(false)}
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

            {/* Sample data fill button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={form.fillSampleData}
                icon={<Sparkles size={14} />}
              >
                Preencher exemplo
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
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
