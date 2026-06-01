import { Link } from "react-router-dom";

function ErrorPage() {
  return (
    <main>
      <h1>404 — Página não encontrada</h1>
      <Link to="/">Voltar para o início</Link>
    </main>
  );
}

export default ErrorPage;
