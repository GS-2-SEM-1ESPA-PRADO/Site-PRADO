import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  CloudRain,
  CloudSun,
  DatabaseZap,
  Droplets,
  Gauge,
  Layers,
  Leaf,
  MapPinned,
  MonitorSmartphone,
  MousePointer2,
  Orbit,
  Radar,
  Route,
  Satellite,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sprout,
  Sun,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";
import Mapa from "../../components/Mapa.jsx";
import fieldLandscape from "../../assets/field-landscape.avif";

const heroStats = [
  { label: "Solo", value: "camadas 0-9 cm", icon: Sprout },
  { label: "Clima", value: "próximas 24h", icon: CloudSun },
  { label: "Risco", value: "alertas práticos", icon: BellRing },
  { label: "Mapa", value: "talhões coloridos", icon: MapPinned },
];

const cockpitMetrics = [
  { label: "Irrigação", value: "Moderada", tone: "bg-[#e0a72f]" },
  { label: "Pulverização", value: "Aguardar", tone: "bg-[#ef6b4a]" },
  { label: "Radiação", value: "Alta", tone: "bg-[#71b549]" },
  { label: "Solo", value: "Estável", tone: "bg-[#2f80ed]" },
];

const signalFlow = [
  {
    icon: Satellite,
    title: "Dados do céu",
    text: "Satélites e modelos climáticos entregam variáveis de clima, solo, vento e radiação.",
  },
  {
    icon: DatabaseZap,
    title: "Processamento PRADO",
    text: "O sistema cruza os dados e calcula níveis de atenção para cada decisão agrícola.",
  },
  {
    icon: MonitorSmartphone,
    title: "Leitura no celular",
    text: "O produtor recebe uma explicação curta, visual e pronta para usar no campo.",
  },
];

const decisionCards = [
  {
    icon: Droplets,
    title: "Irrigar ou esperar",
    text: "Umidade do solo, evapotranspiração e VPD viram uma orientação simples para uso da água.",
  },
  {
    icon: Wind,
    title: "Pulverizar com segurança",
    text: "Vento, rajadas e chuva indicam quando a aplicação deve acontecer ou ser adiada.",
  },
  {
    icon: ShieldCheck,
    title: "Antecipar riscos",
    text: "Fungos, molhamento foliar e estresse térmico aparecem antes de virarem prejuízo.",
  },
  {
    icon: Activity,
    title: "Acompanhar vigor",
    text: "Radiação, graus-dia e temperatura ajudam a entender o ritmo da lavoura.",
  },
];

const dashboardFeatures = [
  { icon: Layers, label: "Camadas", text: "Mapa, satélite, relevo e talhões." },
  { icon: MousePointer2, label: "Clique no mapa", text: "Qualquer ponto vira análise." },
  { icon: ScanLine, label: "Grade visual", text: "Cores mostram onde olhar primeiro." },
  { icon: Gauge, label: "Indicadores", text: "Cards resumem a recomendação." },
];

const indicators = [
  { icon: CloudRain, label: "Chuva 24h", value: "mm acumulados" },
  { icon: ThermometerSun, label: "Estresse", value: "sensação e VPD" },
  { icon: Sun, label: "Radiação", value: "energia disponível" },
  { icon: Leaf, label: "Fungos", value: "risco por umidade" },
  { icon: Route, label: "Maquinário", value: "entrada na área" },
  { icon: Smartphone, label: "Campo", value: "consulta rápida" },
];

const fieldBenefits = [
  "Menos tempo decifrando números técnicos.",
  "Mais confiança para irrigar, pulverizar e manejar.",
  "Leitura visual para pequenos e médios produtores.",
  "Dashboard responsivo para usar no campo.",
];

function Home() {
  return (
    <main className="bg-[#f7f4ea] text-[#16281e]">
      <section className="relative isolate overflow-hidden bg-[#102417] text-white">
        <img
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={fieldLandscape}
          alt=""
        />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgb(8_30_18_/_0.94),rgb(14_45_25_/_0.72)_48%,rgb(13_42_26_/_0.28))]" />
        <div className="absolute inset-x-0 bottom-0 z-0 h-40 bg-[linear-gradient(0deg,#f7f4ea,transparent)]" />

        <div className="relative z-10 mx-auto max-w-[1320px] px-6 pb-10 pt-20 lg:px-10 lg:pb-16 lg:pt-24">
          <div className="max-w-[820px]">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#acd494]/25 bg-white/[0.08] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#dcefcf] backdrop-blur max-[420px]:items-start max-[420px]:whitespace-normal">
              <Orbit className="h-3.5 w-3.5" />
              Inteligência espacial para pequenos e médios produtores
            </span>

            <h1 className="mt-7 max-w-[920px] font-serif text-[clamp(2.55rem,8vw,7.6rem)] font-black leading-[0.9] tracking-normal text-white">
              O campo visto do alto.
              <span className="block text-[#acd494]">A decisão feita no chão.</span>
            </h1>

            <p className="mt-7 max-w-[660px] text-lg leading-8 text-white/78">
              O PRADO traduz dados de clima, solo, vento e radiação em recomendações
              simples para o produtor decidir melhor, sem precisar interpretar números
              brutos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-13 min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#71b549] px-6 text-sm font-extrabold text-white no-underline shadow-[0_18px_36px_rgb(113_181_73_/_32%)] transition hover:bg-[#5f9e3a] max-[420px]:w-full"
                to="/dashboard"
              >
                Abrir dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-13 min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/[0.08] px-6 text-sm font-bold text-white no-underline backdrop-blur transition hover:bg-white/[0.13] max-[420px]:w-full"
                to="/dicas"
              >
                Ver guia de uso
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="flex min-h-[92px] items-center gap-4 rounded-2xl border border-white/12 bg-[#102417]/68 p-4 text-white shadow-[0_18px_42px_rgb(0_0_0_/_18%)] backdrop-blur"
                  key={item.label}
                >
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#acd494]/12 text-[#acd494]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-base font-black">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
              <Radar className="h-3.5 w-3.5" />
              Cockpit da propriedade
            </span>
            <h2 className="mt-5 max-w-[620px] font-serif text-[clamp(2.2rem,4vw,4.3rem)] leading-none tracking-normal text-[#16281e]">
              Um mapa que mostra onde agir primeiro.
            </h2>
            <p className="mt-5 max-w-[610px] text-base leading-7 text-[#3d4637]">
              A tela do PRADO combina mapa, talhões coloridos e cartões de decisão.
              O produtor escolhe uma camada e entende rapidamente se a área pede água,
              espera, cuidado com vento ou atenção a risco.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {dashboardFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    className="rounded-2xl border border-[#ded8c3] bg-white p-5 shadow-sm"
                    key={feature.label}
                  >
                    <Icon className="h-7 w-7 text-[#3b5e26]" />
                    <h3 className="mt-4 text-lg font-black text-[#16281e]">
                      {feature.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#3d4637]">{feature.text}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#d9d4bd] bg-[#102417] p-2 shadow-[0_30px_90px_rgb(28_48_28_/_22%)] sm:rounded-[28px] sm:p-3">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#acd494]">
                  PRADO Live
                </p>
                <p className="mt-1 text-sm text-white/62">Prévia visual da análise</p>
              </div>
              <div className="flex gap-2">
                {cockpitMetrics.map((metric) => (
                  <span
                    className="hidden rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-white/80 sm:inline-flex"
                    key={metric.label}
                  >
                    <span className={`mr-2 mt-1 h-2 w-2 rounded-full ${metric.tone}`} />
                    {metric.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative h-[560px] overflow-hidden rounded-[18px] sm:h-[520px] sm:rounded-[20px]">
              <Mapa />
              <div className="absolute bottom-4 left-4 right-4 z-[1000] grid gap-3 sm:grid-cols-4">
                {cockpitMetrics.map((metric) => (
                  <div
                    className="rounded-2xl border border-white/12 bg-[#102417]/90 p-3 text-white shadow-xl backdrop-blur"
                    key={metric.label}
                  >
                    <span className={`block h-1.5 w-10 rounded-full ${metric.tone}`} />
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-white/45">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-lg font-black">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e9ecdc] px-4 py-16 sm:px-6 lg:px-10" id="como-funciona">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[780px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-[#f7f4ea] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
              <Route className="h-3.5 w-3.5" />
              Da órbita ao manejo
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.8rem)] leading-none tracking-normal text-[#16281e]">
              O PRADO encurta o caminho entre dado técnico e ação no campo.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {signalFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  className="relative rounded-3xl border border-[#d1c9ae] bg-[#f7f4ea] p-6"
                  key={step.title}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-13 min-h-[52px] w-13 min-w-[52px] place-items-center rounded-2xl bg-[#3b5e26] text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-serif text-5xl font-black leading-none text-[#3b5e26]/16">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-black text-[#16281e]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#3d4637]">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10" id="indicadores">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
                <Gauge className="h-3.5 w-3.5" />
                Decisões de lavoura
              </span>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.6rem)] leading-none tracking-normal text-[#16281e]">
                A interface fala a língua da rotina agrícola.
              </h2>
            </div>
            <p className="max-w-[620px] text-base leading-7 text-[#3d4637]">
              Cada cartão foi pensado para responder uma pergunta objetiva: devo irrigar,
              posso pulverizar, existe risco, a cultura está sob estresse?
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {decisionCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="rounded-3xl border border-[#ded8c3] bg-white p-6 shadow-sm" key={card.title}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#71b549]/12 text-[#3b5e26]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-black text-[#16281e]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#3d4637]">{card.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 grid gap-3 rounded-[28px] bg-[#102417] p-4 text-white sm:grid-cols-2 lg:grid-cols-3">
            {indicators.map((item) => {
              const Icon = item.icon;
              return (
                <div className="flex min-h-[84px] items-center gap-4 rounded-2xl bg-white/[0.06] p-4" key={item.label}>
                  <Icon className="h-6 w-6 flex-none text-[#acd494]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/42">
                      {item.label}
                    </p>
                    <p className="mt-1 text-base font-black">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-8 overflow-hidden rounded-[24px] bg-[#102417] p-5 text-white shadow-[0_30px_90px_rgb(16_36_23_/_22%)] sm:p-8 lg:grid-cols-[1fr_0.85fr] lg:rounded-[32px] lg:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#acd494]/25 bg-white/[0.06] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Por que isso muda o jogo
            </span>
            <h2 className="mt-5 max-w-[680px] font-serif text-[clamp(2.2rem,4vw,4rem)] leading-none tracking-normal">
              Menos ruído. Mais confiança para decidir.
            </h2>
            <p className="mt-5 max-w-[620px] text-base leading-7 text-white/74">
              O PRADO não tenta transformar o produtor em meteorologista. Ele organiza
              os dados e entrega uma resposta visual, compacta e acionável para a rotina
              da propriedade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/[0.06] px-6 text-sm font-bold text-white no-underline transition hover:bg-white/[0.1] max-[420px]:w-full"
                to="/sobre"
              >
                Conhecer o PRADO
              </Link>
            </div>
          </div>

          <div className="grid content-center gap-3">
            {fieldBenefits.map((benefit) => (
              <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4" key={benefit}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#acd494]" />
                <span className="text-sm font-semibold leading-6 text-white/84">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
