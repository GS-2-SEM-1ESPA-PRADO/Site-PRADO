import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Edge from "../features/edge/Edge";
import Home from "../features/home/Home";
import AgroDashboard from "../features/dashboard/AgroDashboard";
import Dicas from "../features/dicas/Dicas";
import Sobre from "../features/sobre/Sobre";
import ErrorPage from "../features/error/Error";
import Auth from "../features/auth/Auth";
import MainLayout from "../layouts/MainLayout";
import Mapa from "../components/Mapa.jsx";
import { estaLogado } from "../lib/api.js";
import Alertas from "../features/alerts/Alertas.jsx";

// Componente que protege uma rota: se ninguém estiver logado, redireciona
// para a página de login, lembrando para onde o usuário queria ir.
function RotaProtegida({ children }) {
  const location = useLocation();

  if (!estaLogado()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Páginas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Auth />} />
          <Route path="dicas" element={<Dicas />} />
          <Route path="sobre" element={<Sobre />} />


          {/* Páginas que exigem login */}
          <Route
            path="dashboard"
            element={
              <RotaProtegida>
                <AgroDashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="alertas"
            element={
              <RotaProtegida>
                <Alertas />
              </RotaProtegida>
            }
          />

          <Route
            path="mapa"
            element={
              <RotaProtegida>
                <Mapa />
              </RotaProtegida>
            }
          />
          <Route
            path="edge"
            element={
              <RotaProtegida>
                <Edge />

              </RotaProtegida>
            }
          />
        </Route>
        <Route path="*" element={<ErrorPage />} />


      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
