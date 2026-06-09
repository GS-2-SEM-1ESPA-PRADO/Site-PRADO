import { MapPin, Play, Satellite, BarChart2, Leaf, Bell } from "lucide-react";
import fieldLandscape from "../assets/field-landscape.avif";

// Imagem de fundo: foto do campo enviada pelo usuário
// Substitua o src abaixo pelo caminho real da imagem no projeto
const FARM_IMAGE = fieldLandscape;

// Dados do mapa NDVI simulado (gradiente de cor sobre área da lavoura)
const ndviLegend = [
  { label: "0.8", sub: "Alto", color: "#4ade80" },
  { label: "0.4", sub: "Médio", color: "#facc15" },
  { label: "0.0", sub: "Baixo", color: "#ef4444" },
];

const bottomStats = [
  { icon: <Satellite className="w-5 h-5" />, label: "Imagens de satélite", sub: "da NASA" },
  { icon: <BarChart2 className="w-5 h-5" />, label: "Indicadores", sub: "climáticos" },
  { icon: <Leaf className="w-5 h-5" />, label: "Recomendações", sub: "para sua lavoura" },
  { icon: <Bell className="w-5 h-5" />, label: "Alertas e avisos", sub: "importantes" },
];

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[calc(100vh-76px)] bg-[#1a2e10] overflow-hidden flex flex-col">

      {/* ── GRID PRINCIPAL ─────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 w-full max-w-[1440px] mx-auto px-10 pt-14 pb-6 gap-10 max-[980px]:px-6 max-sm:px-4 max-sm:pt-10">

        {/* ── COLUNA ESQUERDA ────────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-6 max-lg:items-start">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3b5e26]/60 border border-[#acd494]/30 w-fit">
            <Satellite className="w-3.5 h-3.5 text-[#acd494]" strokeWidth={2} />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#acd494]">
              Tecnologia NASA para o campo
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white max-w-[520px]"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Informações do espaço para melhores decisões{" "}
            <span className="text-[#71b549]">no seu plantio</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-[15px] text-white/60 leading-relaxed max-w-[400px]">
            Dados de satélite da NASA transformados em recomendações simples
            para aumentar sua produtividade e cuidar melhor da sua lavoura.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-[#71b549] text-white text-sm font-bold shadow-[0_4px_24px_rgb(113_181_73_/_35%)] transition-all duration-200 hover:bg-[#5f9e3a] hover:shadow-[0_6px_28px_rgb(113_181_73_/_45%)] active:scale-[0.98]"
            >
              <MapPin className="w-4 h-4" strokeWidth={2.5} />
              Ver mapa da minha área
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-white/8 border border-white/20 text-white text-sm font-semibold transition-all duration-200 hover:bg-white/14 hover:border-white/35 active:scale-[0.98]"
            >
              <span className="grid place-items-center w-6 h-6 rounded-full bg-white/20">
                <Play className="w-3 h-3 fill-white text-white ml-0.5" />
              </span>
              Como funciona
            </button>
          </div>

          {/* Linha separadora */}
          <div className="w-full max-w-[420px] h-px bg-white/10 mt-2" />

          {/* Stats rápidos */}
          <div className="grid grid-cols-4 gap-4 max-w-[420px] max-sm:grid-cols-2">
            {bottomStats.map(({ icon, label, sub }) => (
              <div key={label} className="flex flex-col items-start gap-1.5">
                <span className="text-[#71b549]">{icon}</span>
                <span className="text-[12px] font-semibold text-white leading-tight">{label}</span>
                <span className="text-[11px] text-white/45">{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── COLUNA DIREITA — Card do mapa ──────────────────────── */}
        <div className="relative flex items-center justify-center max-lg:mt-2 max-lg:mb-4">

          {/* Imagem de fundo do campo com overlay */}
          <div className="relative w-full max-w-[580px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_64px_rgb(0_0_0_/_50%)]">

            {/* Foto do campo */}
            <img
              src={FARM_IMAGE}
              alt="Vista aérea de lavoura com análise NDVI"
              className="w-full object-cover"
              style={{ height: "360px" }}
            />

            {/* Overlay escuro suave nas bordas */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(26,46,16,0.55) 0%, transparent 35%, transparent 65%, rgba(26,46,16,0.35) 100%)",
              }}
            />

            {/* Overlay NDVI simulado sobre a lavoura */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 55% at 58% 52%, rgba(239,68,68,0.38) 0%, rgba(250,204,21,0.32) 35%, rgba(74,222,128,0.22) 70%, transparent 100%)",
                mixBlendMode: "hard-light",
              }}
            />

            {/* ── Card NDVI legenda ── */}
            <div className="absolute top-4 left-4 bg-[#1a2e10]/90 border border-[#acd494]/20 rounded-xl p-3 backdrop-blur-sm min-w-[130px]">
              <p className="text-[10px] font-bold text-[#acd494] tracking-wider uppercase mb-2">
                Índice de Vegetação (NDVI)
              </p>
              <div className="flex flex-col gap-1.5">
                {ndviLegend.map(({ label, sub, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="flex-none w-3 h-3 rounded-sm"
                      style={{ background: color }}
                    />
                    <span className="text-[11px] text-white/80 font-medium">{label}</span>
                    <span className="text-[10px] text-white/45 ml-auto">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Card Saúde da Lavoura ── */}
            <div className="absolute top-4 right-4 bg-white/95 rounded-xl p-3 shadow-lg min-w-[168px]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold text-[#3b5e26]/70 tracking-wide">
                  Saúde da lavoura
                </p>
                <button
                  type="button"
                  className="text-[#ccc1a7] text-xs leading-none hover:text-[#5f3733] transition-colors"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-[#71b549]/15">
                  <Leaf className="w-4 h-4 text-[#3b5e26]" />
                </span>
                <span className="text-[22px] font-extrabold text-[#3b5e26] leading-none">
                  Boa
                </span>
              </div>
              <p className="text-[11px] text-[#6e9c6a] leading-snug mb-2">
                Sua lavoura apresenta bom desenvolvimento.
              </p>
              <button
                type="button"
                className="text-[11px] font-semibold text-[#71b549] hover:text-[#3b5e26] transition-colors"
              >
                Ver detalhes →
              </button>
            </div>

            {/* ── Barra inferior de métricas ── */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a2e10]/90 backdrop-blur-sm border-t border-[#acd494]/15 px-4 py-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🕐", label: "Última atualização", value: "20/05/2024" },
                  { icon: "☁", label: "Cobertura de nuvens", value: "12%" },
                  { icon: "🔄", label: "Próxima atualização", value: "23/05/2024" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-base leading-none">{icon}</span>
                    <div>
                      <p className="text-[9px] text-white/45 leading-tight">{label}</p>
                      <p className="text-[12px] font-semibold text-white leading-tight">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Elemento decorativo — círculo de órbita */}
          <div
            className="absolute -right-12 -top-12 w-64 h-64 rounded-full border border-[#71b549]/10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -right-6 -top-6 w-40 h-40 rounded-full border border-[#acd494]/8 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── FUNDO DECORATIVO ──────────────────────────────────── */}
      {/* Gradiente de fundo simulando horizonte do campo */}
      <div
        className="absolute inset-0 pointer-events-none -z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(113,181,73,0.12) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none -z-0"
        style={{
          background:
            "linear-gradient(to top, rgba(26,46,16,0.8) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
