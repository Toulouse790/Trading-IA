import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardIA from "./pages/DashboardIA";
import AgentDetailsPage from "./pages/AgentDetailsPage"; // Importation de la nouvelle page de détails
import AssistantManagement from "./pages/AssistantManagement"; // Importation de la page de gestion des assistants

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardIA />} />
          <Route path="/agent/:agentId" element={<AgentDetailsPage />} /> {/* Nouvelle route pour les détails de l'agent */}
          <Route path="/assistants" element={<AssistantManagement />} /> {/* Route pour la gestion des assistants */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
