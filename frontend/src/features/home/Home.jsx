import { MapPin, Play, Satellite, BarChart2, Leaf, Bell } from "lucide-react";
import Mapa from "../../components/Mapa.jsx"

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

function Home() {
  return (
    <>
    
      <section className="relative w-full overflow-hidden flex flex-col">
        {/* Imagem de fundo */}
        <img
          src="https://plus.unsplash.com/premium_photo-1661963442576-16ce45d2cd55?q=80&w=1623&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full object-cover -z-10"
        />
        {/* Overlay escuro geral para legibilidade */}
        <div className="absolute inset-0 bg-[#1a2e10]/60 -z-10" />
        {/* GRID PRINCIPAL */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 w-full max-w-[1440px] mx-auto px-10  gap-10 max-[980px]:px-6 max-sm:px-4 max-sm:pt-10">
          {/* COLUNA ESQUERDA */}
          <div className="relative flex flex-col justify-center gap-6 max-lg:items-start py-16">
            {/* Gradiente branco atrás dos textos */}
            {/* <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            /> */}
            {/* Badge */}
            <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3b5e26]/60 border border-[#acd494]/30 w-fit">
              <Satellite className="w-3.5 h-3.5 text-[#acd494]" strokeWidth={2} />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#acd494]">
                Tecnologia NASA para o campo
              </span>
            </div>
            {/* Headline */}
            <h1
              className="relative text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white max-w-[520px]"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Informações do espaço para melhores decisões{" "}
              <span className="text-[#71b549]">no seu plantio</span>
            </h1>
            {/* Subtítulo */}
            <p className="relative text-[15px] text-white/75 leading-relaxed max-w-[400px]">
              Dados de satélite da NASA transformados em recomendações simples
              para aumentar sua produtividade e cuidar melhor da sua lavoura.
            </p>
            {/* CTAs */}
            <div className="relative flex items-center gap-3 flex-wrap mt-1">
              <button
                type="button"
                className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-[#71b549] text-white text-sm font-bold shadow-[0_4px_24px_rgb(113_181_73_/_35%)] transition-all duration-200 hover:bg-[#5f9e3a] hover:shadow-[0_6px_28px_rgb(113_181_73_/_45%)] active:scale-[0.98]"
              >
                <MapPin className="w-4 h-4" strokeWidth={2.5} />
                Ver mapa da minha área
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-white/10 border border-white/25 text-white text-sm font-semibold transition-all duration-200 hover:bg-white/20 hover:border-white/40 active:scale-[0.98]"
              >
                <span className="grid place-items-center w-6 h-6 rounded-full bg-white/20">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </span>
                Como funciona
              </button>
            </div>
            {/* Separador */}
            <div className="relative w-full max-w-[420px]  bg-white/15 mt-2" />
            {/* Stats rápidos */}
            <div className="relative grid grid-cols-4 gap-4 max-w-[420px] max-sm:grid-cols-2">
              {bottomStats.map(({ icon, label, sub }) => (
                <div key={label} className="flex flex-col items-start gap-1.5">
                  <span className="text-[#71b549]">{icon}</span>
                  <span className="text-[12px] font-semibold text-white leading-tight">{label}</span>
                  <span className="text-[11px] text-white/55">{sub}</span>
                </div>
              ))}
            </div>
          </div>
          {/* COLUNA DIREITA — Card do mapa */}
          <div className="relative flex items-center justify-center max-lg:mt-2 max-lg:mb-4">
            <div className="relative w-full w-[700px] h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_64px_rgb(0_0_0_/_50%)]">
              {/* Mapa real da região do usuário */}
              <Mapa />
      
      
              {/* Barra inferior de métricas
              <div className="absolute bottom-0 left-0 right-0 bg-[#1a2e10]/90 backdrop-blur-sm border-t border-[#acd494]/15 px-4 py-3 z-[1000]">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: "", label: "Última atualização", value: "20/05/2024" },
                    { icon: "", label: "Cobertura de nuvens", value: "12%" },
                    { icon: "", label: "Próxima atualização", value: "23/05/2024" },
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
              </div> */}
            </div>
      
          </div>
        </div>
        {/* Gradiente no rodapé */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(26,46,16,0.85) 0%, transparent 100%)",
          }}
          aria-hidden="true"
          />
           {/* Card NDVI legenda
              <div className="absolute top-4 left-4 bg-[#1a2e10]/90 border border-[#acd494]/20 rounded-xl p-3 backdrop-blur-sm min-w-[130px] z-[1000]">
                <p className="text-[10px] font-bold text-[#acd494] tracking-wider uppercase mb-2">
                  Índice de Vegetação (NDVI)
                </p>
                <div className="flex flex-col gap-1.5">
                  {ndviLegend.map(({ label, sub, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="flex-none w-3 h-3 rounded-sm" style={{ background: color }} />
                      <span className="text-[11px] text-white/80 font-medium">{label}</span>
                      <span className="text-[10px] text-white/45 ml-auto">{sub}</span>
                    </div>
                  ))}
                </div>
              </div> */}
      
      
      </section>
    <section className="bg-[#ccc1a7]">

    </section>
    
    </>
  );
}

export default Home;
