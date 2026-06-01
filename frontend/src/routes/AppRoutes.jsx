import { BrowserRouter, Routes, Route } from "react-router-dom";
import Edge from "../features/edge/Edge";
import Home from "../features/home/Home";
import Sobre from "../features/sobre/Sobre";
import ErrorPage from "../features/error/Error";
import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="edge" element={<Edge />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
