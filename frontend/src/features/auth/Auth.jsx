import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Leaf, Lock, Mail, Sprout, User } from "lucide-react";
import { cadastrar, entrar } from "../../lib/api.js";

// Página de login e cadastro do PRADO.
// Alterna entre os dois modos (entrar / criar conta) na mesma tela e segue
// a mesma identidade visual do restante do site.
function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  // Para onde voltar depois do login: a página que o usuário tentou abrir
  // antes de ser redirecionado, ou o dashboard por padrão.
  const destino = location.state?.from || "/dashboard";

  const [modo, setModo] = useState("login"); // "login" ou "cadastro"
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const ehCadastro = modo === "cadastro";

  function alternarModo() {
    setModo(ehCadastro ? "login" : "cadastro");
    setErro("");
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (ehCadastro) {
        await cadastrar(nome, email, senha);
      } else {
        await entrar(email, senha);
      }
      // Login/cadastro deram certo: vai para a página de destino.
      navigate(destino, { replace: true });
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-76px)] place-items-center bg-[#f7f4ea] px-4 py-12 text-[#16281e]">
      <section className="w-full max-w-[460px] rounded-[24px] border border-[#ded8c3] bg-white p-6 shadow-[0_28px_80px_rgb(30_52_29_/_14%)] sm:p-9">
        <div className="flex items-center gap-2">
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#71b549]/12 text-[#3b5e26]"
            aria-hidden="true"
          >
            <Sprout className="h-6 w-6" />
          </span>
          <div className="leading-none">
            <strong className="font-serif text-2xl tracking-normal">PRADO</strong>
            <p className="mt-1 text-xs font-semibold text-[#6e765f]">
              Tecnologia que cultiva resultados
            </p>
          </div>
        </div>

        <h1 className="mt-7 font-serif text-[clamp(1.9rem,5vw,2.6rem)] leading-none tracking-normal">
          {ehCadastro ? "Criar conta" : "Entrar"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#3d4637]">
          {ehCadastro
            ? "Cadastre-se para acompanhar suas áreas e manter seu histórico de consultas."
            : "Acesse sua conta para abrir o dashboard e ver seus dados salvos."}
        </p>

        <form className="mt-7 grid gap-4" onSubmit={aoEnviar}>
          {ehCadastro && (
            <label className="grid gap-2 text-sm font-bold text-[#3d4637]">
              Nome
              <span className="flex items-center gap-2 rounded-xl border border-[#e1ddca] bg-[#faf9f3] px-3 focus-within:border-[#71b549]">
                <User className="h-4 w-4 flex-none text-[#6e765f]" aria-hidden="true" />
                <input
                  className="h-12 w-full bg-transparent text-[#16281e] outline-none placeholder:text-[#9aa089]"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  autoComplete="name"
                  required
                />
              </span>
            </label>
          )}

          <label className="grid gap-2 text-sm font-bold text-[#3d4637]">
            E-mail
            <span className="flex items-center gap-2 rounded-xl border border-[#e1ddca] bg-[#faf9f3] px-3 focus-within:border-[#71b549]">
              <Mail className="h-4 w-4 flex-none text-[#6e765f]" aria-hidden="true" />
              <input
                className="h-12 w-full bg-transparent text-[#16281e] outline-none placeholder:text-[#9aa089]"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#3d4637]">
            Senha
            <span className="flex items-center gap-2 rounded-xl border border-[#e1ddca] bg-[#faf9f3] px-3 focus-within:border-[#71b549]">
              <Lock className="h-4 w-4 flex-none text-[#6e765f]" aria-hidden="true" />
              <input
                className="h-12 w-full bg-transparent text-[#16281e] outline-none placeholder:text-[#9aa089]"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                autoComplete={ehCadastro ? "new-password" : "current-password"}
                required
              />
            </span>
          </label>

          {erro && (
            <p className="rounded-xl border border-[#ef6b4a]/30 bg-[#ef6b4a]/10 px-4 py-3 text-sm font-semibold text-[#b23c20]">
              {erro}
            </p>
          )}

          <button
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3b5e26] px-6 text-sm font-extrabold text-white transition hover:bg-[#27461f] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={carregando}
          >
            <Leaf className="h-4 w-4" aria-hidden="true" />
            {carregando
              ? "Aguarde..."
              : ehCadastro
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#3d4637]">
          {ehCadastro ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <button
            className="font-extrabold text-[#3b5e26] underline-offset-2 hover:underline"
            type="button"
            onClick={alternarModo}
          >
            {ehCadastro ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default Auth;
