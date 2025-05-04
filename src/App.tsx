
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import FahrzeugePage from "./pages/FahrzeugePage";
import MitarbeiterPage from "./pages/MitarbeiterPage";
import UmsaetzePage from "./pages/UmsaetzePage";
import AbrechnungPage from "./pages/AbrechnungPage";
import StatistikPage from "./pages/StatistikPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/fahrzeuge" element={<Layout><FahrzeugePage /></Layout>} />
        <Route path="/mitarbeiter" element={<Layout><MitarbeiterPage /></Layout>} />
        <Route path="/umsaetze" element={<Layout><UmsaetzePage /></Layout>} />
        <Route path="/abrechnung" element={<Layout><AbrechnungPage /></Layout>} />
        <Route path="/statistik" element={<Layout><StatistikPage /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
