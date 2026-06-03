import { Link } from "react-router-dom";

function ErrorPage() {
  return (
    <main className="grid min-h-[60vh] place-items-center bg-[#f8f7f3] px-4 py-16 text-[#16281e]">
      <section className="w-full max-w-[560px] rounded-[24px] border border-[#ded8c3] bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#6e765f]">
          Erro 404
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2.4rem,8vw,4.4rem)] leading-none tracking-normal">
          Página não encontrada
        </h1>
        <Link
          className="mt-7 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#3b5e26] px-6 text-sm font-extrabold text-white no-underline transition hover:bg-[#27461f] max-[420px]:w-full"
          to="/"
        >
          Voltar para o início
        </Link>
      </section>
    </main>
  );
}

export default ErrorPage;
