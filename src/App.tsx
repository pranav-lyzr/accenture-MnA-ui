import { Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Search from "./pages/Search";
import Analysis from "./pages/Analysis";
import Companies from "./pages/Companies";
import Candidates from "./pages/Candidates";
import Reports from "./pages/Reports";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import Chat from "./pages/Chat";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Search />} />
          {/* <Route path="/search" element={<Search />} /> */}
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/company/:id" element={<CompanyProfilePage />} />
          <Route path="/chat" element={<Chat />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;