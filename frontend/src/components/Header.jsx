import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Header.css";

const navigationItems = [
  { label: "Inicio", to: "/" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Indicadores", href: "#indicadores" },
  { label: "Alertas", href: "#alertas" },
  { label: "Dicas", href: "#dicas" },
  { label: "Sobre", to: "/sobre" },
];

function Header() {
  const navLinkClass = ({ isActive }) =>
    isActive ? "header__nav-link header__nav-link--active" : "header__nav-link";

  return (
    <header className="header">
      <div className="header__inner">
        <NavLink className="header__brand" to="/" aria-label="PRADO inicio">
          <span className="header__brand-mark" aria-hidden="true" />
          <span className="header__brand-text">
            <strong>PRADO</strong>
            <span>Tecnologia que cultiva melhores resultados</span>
          </span>
        </NavLink>

        <nav className="header__nav" aria-label="Navegacao principal">
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
              <a key={item.label} className="header__nav-link" href={item.href}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="header__actions">
          <button className="header__farm-button" type="button">
            <span className="header__pin" aria-hidden="true" />
            Fazenda Boa Vista
            <span className="header__chevron" aria-hidden="true" />
          </button>
          <button
            className="header__icon-button"
            type="button"
            aria-label="Alertas"
          >
            <Bell className="header__bell-icon" aria-hidden="true" />
          </button>
          <button className="header__login-button" type="button">
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
