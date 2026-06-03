import { ArrowRight, Camera, Leaf, Mail, MessageCircle, Play } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-primary-dark text-[#fff8df]" id="contato">
      <div className="w-full max-w-[1120px] px-6 py-9 mx-auto">
        <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] gap-12 max-[980px]:grid-cols-2 max-sm:grid-cols-1">
          <section>
            <Link className="inline-flex items-center gap-2 no-underline" to="/" aria-label="PRADO início">
              <Leaf className="w-7 h-7 text-[#f2dfa4]" strokeWidth={2} aria-hidden="true" />
              <strong className="font-serif text-[34px] leading-none">PRADO</strong>
            </Link>
            <p className="max-w-[210px] mt-5 text-[17px] leading-snug text-[#fff8df]/90">
              A força do campo, o futuro de todos.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { label: "Instagram", icon: Camera },
                { label: "Comunidade", icon: MessageCircle },
                { label: "Vídeos", icon: Play },
                { label: "E-mail", icon: Mail },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    className="grid w-8 h-8 place-items-center text-[#f2dfa4] border border-[#f2dfa4]/70 rounded-full transition-colors hover:bg-white/10"
                    href="#contato"
                    aria-label={item.label}
                    key={item.label}
                  >
                    <Icon size={17} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </section>

          <FooterColumn
            title="Navegação"
            links={["Início", "Sobre", "Produtos", "Blog", "Comunidade", "Contato"]}
          />
          <FooterColumn
            title="Para produtores"
            links={["Seja um produtor", "Benefícios", "Como funciona", "Dúvidas frequentes"]}
          />
          <FooterColumn
            title="Ajuda"
            links={["Central de ajuda", "Políticas", "Termos de uso", "Privacidade"]}
          />

          <section>
            <h2 className="mb-4 text-xs font-extrabold tracking-normal uppercase text-[#f2dfa4]">
              Newsletter
            </h2>
            <p className="max-w-[230px] text-sm leading-snug text-[#fff8df]/86">
              Receba novidades do campo e do PRADO.
            </p>
            <form className="flex w-full max-w-[250px] h-11 mt-4 overflow-hidden border border-[#fff8df]/38 rounded-lg">
              <label className="sr-only" htmlFor="footer-email">
                Seu e-mail
              </label>
              <input
                className="w-full min-w-0 px-4 text-sm text-[#fff8df] bg-transparent outline-none placeholder:text-[#fff8df]/55"
                id="footer-email"
                type="email"
                placeholder="Seu e-mail"
              />
              <button
                className="grid w-12 flex-none place-items-center text-primary-dark bg-primary-light transition-colors hover:bg-[#f2dfa4]"
                type="submit"
                aria-label="Assinar newsletter"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          </section>
        </div>

        <div className="pt-5 mt-9 text-center text-sm text-[#fff8df]/76 border-t border-[#fff8df]/20">
          © 2024 PRADO. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-extrabold tracking-normal uppercase text-[#f2dfa4]">
        {title}
      </h2>
      <nav className="grid gap-2.5 text-sm text-[#fff8df]/86" aria-label={title}>
        {links.map((link) => (
          <a className="no-underline transition-colors hover:text-white" href="#contato" key={link}>
            {link}
          </a>
        ))}
      </nav>
    </section>
  );
}

export default Footer;
