import { useEffect, useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { encerrarSessao, obterUsuario } from "../lib/api.js";

const navigationItems = [
  { label: "Inicio", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Alertas", to: "/alertas" },
  { label: "Dicas", to: "/dicas" },
  { label: "Edge", to: "/edge" },
  { label: "Sobre", to: "/sobre" },
];

const navBase =
  "relative inline-flex items-center min-h-[40px] text-sm font-bold no-underline transition-colors duration-200 " +
  "after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] " +
  "after:bg-primary-light after:rounded-full after:transition-all after:duration-200";

const navInactive =
  navBase +
  " text-white/80 hover:text-white after:opacity-0 after:scale-x-50 hover:after:opacity-100 hover:after:scale-x-100";

const navActive = navBase + " text-white after:opacity-100 after:scale-x-100";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinkClass = ({ isActive }) => (isActive ? navActive : navInactive);
  const closeMenu = () => setIsMenuOpen(false);

  const navigate = useNavigate();

  // Mantém o cabeçalho sabendo quem está logado. O api.js dispara o evento
  // "prado-sessao" sempre que alguém entra ou sai, então o botão se atualiza
  // sozinho, sem recarregar a página.
  const [usuario, setUsuario] = useState(obterUsuario());

  useEffect(() => {
    function atualizar() {
      setUsuario(obterUsuario());
    }
    window.addEventListener("prado-sessao", atualizar);
    return () => window.removeEventListener("prado-sessao", atualizar);
  }, []);

  // Clique no botão de acesso: se já estiver logado, sai e volta ao início;
  // se não, abre a página de login.
  function aoClicarAcesso() {
    if (usuario) {
      encerrarSessao();
      navigate("/");
    } else {
      navigate("/login");
    }
  }

  // Mostra apenas o primeiro nome no botão quando logado.
  const primeiroNome = usuario ? usuario.nome.split(" ")[0] : "";

  return (
    <header className="sticky top-0 z-[2000] w-full border-b border-[rgb(172_212_148_/_30%)] bg-primary-dark text-white shadow-[0_10px_24px_rgb(59_94_38_/_26%)]">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-7 lg:px-10 lg:py-0">
        <NavLink
          className="inline-flex min-w-0 flex-1 items-center gap-3 text-inherit no-underline lg:min-w-[260px] lg:flex-none"
          to="/"
          aria-label="PRADO inicio"
          onClick={closeMenu}
        >
          <span
            className="relative inline-block flex-none w-[30px] h-[26px] bg-primary rounded-[70%_0_70%_45%] shadow-[inset_-6px_-4px_0_rgb(59_94_38_/_18%)] rotate-[-34deg] after:content-[''] after:absolute after:right-[7px] after:bottom-[3px] after:w-[2px] after:h-[23px] after:bg-[rgb(59_94_38_/_60%)] after:rounded-full after:rotate-[38deg] after:origin-bottom"
            aria-hidden="true"
          />
          <span className="grid gap-px leading-none">
            <strong className="text-[27px] font-extrabold tracking-normal max-sm:text-[23px]">
              PRADO
            </strong>
            <span className="hidden whitespace-nowrap text-[10px] font-semibold text-white/80 sm:inline">
              Tecnologia que cultiva melhores resultados
            </span>
          </span>
        </NavLink>

        <nav
          className={`order-3 w-full gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-2 shadow-inner lg:order-none lg:flex lg:flex-1 lg:justify-center lg:gap-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            isMenuOpen ? "grid" : "hidden"
          }`}
          aria-label="Navegacao principal"
        >
          {navigationItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                className={(state) =>
                  `${navLinkClass(state)} w-full justify-start rounded-xl px-3 lg:w-auto lg:justify-center lg:rounded-none lg:px-0`
                }
                to={item.to}
                end={item.to === "/"}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ) : (
              <a
                key={item.label}
                className={`${navInactive} w-full justify-start rounded-xl px-3 lg:w-auto lg:justify-center lg:rounded-none lg:px-0`}
                href={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3 lg:min-w-[324px] lg:gap-4">
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-transparent bg-transparent transition-all duration-200 hover:bg-[rgb(113_181_73_/_20%)]"
            type="button"
            aria-label="Alertas"
            onClick={() => navigate("/alertas")}
          >
            <Bell className="w-5 h-5 text-primary-light" strokeWidth={2.2} aria-hidden="true" />
          </button>

          <button
            className="hidden h-10 rounded-lg border border-[rgb(172_212_148_/_25%)] bg-[rgb(59_94_38_/_70%)] px-5 text-xs font-bold text-white/90 transition-all duration-200 hover:border-[rgb(172_212_148_/_50%)] hover:bg-primary hover:text-white sm:inline-block"
            type="button"
            onClick={aoClicarAcesso}
            title={usuario ? "Sair da conta" : "Entrar"}
          >
            {usuario ? primeiroNome : "Entrar"}
          </button>

          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-[rgb(172_212_148_/_24%)] bg-white/[0.06] text-primary-light transition hover:bg-white/[0.1] lg:hidden"
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;