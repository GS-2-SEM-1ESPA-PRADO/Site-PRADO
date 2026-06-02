import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Inicio", to: "/" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Indicadores", href: "#indicadores" },
  { label: "Alertas", href: "#alertas" },
  { label: "Dicas", href: "#dicas" },
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
  const navLinkClass = ({ isActive }) => (isActive ? navActive : navInactive);

  return (
    <header className="sticky top-0 z-20 w-full text-white bg-primary-dark border-b border-[rgb(172_212_148_/_30%)] shadow-[0_10px_24px_rgb(59_94_38_/_26%)]">
      <div className="flex items-center gap-7 w-full max-w-[1440px] min-h-[76px] px-10 mx-auto max-[980px]:flex-wrap max-[980px]:gap-x-5 max-[980px]:gap-y-3 max-[980px]:px-6 max-[980px]:py-3 max-sm:px-4">

        <NavLink
          className="inline-flex items-center min-w-[260px] gap-3 text-inherit no-underline max-[980px]:min-w-0"
          to="/"
          aria-label="PRADO inicio"
        >
          <span
            className="relative inline-block flex-none w-[30px] h-[26px] bg-primary rounded-[70%_0_70%_45%] shadow-[inset_-6px_-4px_0_rgb(59_94_38_/_18%)] rotate-[-34deg] after:content-[''] after:absolute after:right-[7px] after:bottom-[3px] after:w-[2px] after:h-[23px] after:bg-[rgb(59_94_38_/_60%)] after:rounded-full after:rotate-[38deg] after:origin-bottom"
            aria-hidden="true"
          />
          <span className="grid gap-px leading-none">
            <strong className="text-[27px] font-extrabold tracking-normal max-sm:text-[23px]">
              PRADO
            </strong>
            <span className="text-[10px] font-semibold text-white/80 whitespace-nowrap max-sm:hidden">
              Tecnologia que cultiva melhores resultados
            </span>
          </span>
        </NavLink>

        <nav
          className="flex flex-1 justify-center gap-8 max-[980px]:order-3 max-[980px]:justify-start max-[980px]:w-full max-[980px]:gap-5 max-[980px]:pb-0.5 max-[980px]:overflow-x-auto"
          aria-label="Navegacao principal"
        >
          {navigationItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                className={navLinkClass}
                to={item.to}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ) : (
              <a key={item.label} className={navInactive} href={item.href}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center justify-end min-w-[324px] gap-4 max-[980px]:flex-1 max-[980px]:min-w-0 max-sm:gap-2.5">
          <button
            className="inline-flex items-center gap-2 h-10 px-3.5 text-xs font-bold text-white/90 bg-[rgb(59_94_38_/_70%)] border border-[rgb(172_212_148_/_25%)] rounded-lg transition-all duration-200 hover:text-white hover:bg-primary hover:border-[rgb(172_212_148_/_50%)] max-sm:hidden"
            type="button"
          >
            <span
              className="relative w-3.5 h-3.5 border-2 border-primary-light rounded-[50%_50%_50%_0] rotate-[-45deg] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-1 after:h-1 after:bg-primary-light after:rounded-full"
              aria-hidden="true"
            />
            Fazenda Boa Vista
            <span
              className="inline-block w-2 h-2 border-r-2 border-b-2 border-current rotate-45 -translate-y-0.5"
              aria-hidden="true"
            />
          </button>

          <button
            className="grid place-items-center w-10 h-10 bg-transparent border border-transparent rounded-full transition-all duration-200 hover:bg-[rgb(113_181_73_/_20%)]"
            type="button"
            aria-label="Alertas"
          >
            <Bell className="w-5 h-5 text-primary-light" strokeWidth={2.2} aria-hidden="true" />
          </button>

          <button
            className="h-10 px-6 text-xs font-bold text-white/90 bg-[rgb(59_94_38_/_70%)] border border-[rgb(172_212_148_/_25%)] rounded-lg transition-all duration-200 hover:text-white hover:bg-primary hover:border-[rgb(172_212_148_/_50%)] max-sm:px-4"
            type="button"
          >
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
