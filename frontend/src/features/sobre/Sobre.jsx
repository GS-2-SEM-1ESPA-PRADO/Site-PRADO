import {
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  CloudSun,
  Compass,
  DatabaseZap,
  Droplets,
  Gauge,
  HandCoins,
  Layers3,
  Leaf,
  LocateFixed,
  MapPinned,
  Radar,
  Route,
  Satellite,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/pexels-chayakorn-lotongkum-317178-1562271.jpg";
import handsImage from "../../assets/seedling-hands.jpg";
import "./sobre.css";

const heroSignals = [
  { icon: Satellite, label: "APIs NASA", value: "dados orbitais" },
  { icon: CloudSun, label: "Clima", value: "previsão prática" },
  { icon: Sprout, label: "Solo", value: "camadas da terra" },
  { icon: BellRing, label: "Alertas", value: "risco visível" },
];

const missionTiles = [
  {
    icon: LocateFixed,
    title: "Para propriedades reais",
    text: "O produtor escolhe sua área e recebe uma leitura direta do clima, solo e riscos próximos.",
  },
  {
    icon: DatabaseZap,
    title: "Dados sem complicar",
    text: "O PRADO transforma variáveis técnicas em indicadores compactos, visuais e fáceis de comparar.",
  },
  {
    icon: Smartphone,
    title: "Decisão no campo",
    text: "Tudo foi pensado para pequenos e médios agricultores consultarem pelo celular, sem excesso de tela.",
  },
];

const dataFlow = [
  {
    icon: MapPinned,
    title: "Localize a área",
    text: "A lavoura vira o ponto de partida para cruzar localização, clima e características do solo.",
  },
  {
    icon: Satellite,
    title: "Conecte aos dados",
    text: "APIs da NASA alimentam o painel com informações ambientais que antes ficavam distantes do produtor.",
  },
  {
    icon: Radar,
    title: "Leia os sinais",
    text: "O sistema organiza chuva, vento, radiação, umidade e risco em uma linguagem operacional.",
  },
  {
    icon: CheckCircle2,
    title: "Aja com confiança",
    text: "O resultado aparece como recomendação simples para irrigar, pulverizar, esperar ou monitorar.",
  },
];

const decisionMetrics = [
  { icon: Droplets, label: "Irrigação", value: "necessidade de água" },
  { icon: Wind, label: "Pulverização", value: "janela segura" },
  { icon: Sun, label: "Radiação", value: "energia disponível" },
  { icon: Leaf, label: "Fungos", value: "risco por umidade" },
  { icon: Gauge, label: "Estresse", value: "calor e VPD" },
  { icon: Route, label: "Manejo", value: "entrada na área" },
];

const promiseCards = [
  {
    icon: Layers3,
    title: "Mapa que explica",
    text: "Camadas visuais mostram onde existe atenção, sem exigir leitura técnica pesada.",
  },
  {
    icon: BarChart3,
    title: "Indicadores enxutos",
    text: "Os dados importantes aparecem em cards comparáveis, com unidade, status e recomendação.",
  },
  {
    icon: ShieldCheck,
    title: "Prevenção antes do prejuízo",
    text: "Alertas ajudam a perceber risco de clima, fungos e aplicação no momento certo.",
  },
  {
    icon: HandCoins,
    title: "Tecnologia acessível",
    text: "A proposta é aproximar inteligência agroclimática de quem mais precisa decidir rápido.",
  },
];

function Sobre() {
  return (
    <main className="sobre-page bg-[#f5f1e5] text-[#14251b]">
      <section className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden bg-[#07150f] text-white">
        <img
          className="absolute inset-0 z-0 h-full w-full object-cover object-[50%_48%]"
          src={heroImage}
          alt="Vista aérea de uma região agrícola ao amanhecer"
        />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgb(4_18_12_/_0.94),rgb(9_33_20_/_0.78)_42%,rgb(8_26_19_/_0.34)_74%,rgb(5_15_12_/_0.64))]" />
        <div className="absolute inset-0 z-0 sobre-grid-overlay" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 z-0 h-44 bg-[linear-gradient(0deg,#f5f1e5,transparent)]" />

        <div className="relative z-10 mx-auto max-w-[1320px] px-5 pb-12 pt-16 sm:px-8 lg:px-10 lg:pb-16 lg:pt-24">
          <div className="flex min-h-[560px] flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d7ef98]/24 bg-white/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#d7ef98] backdrop-blur">
              <Satellite className="h-3.5 w-3.5" />
              Sobre o PRADO
            </span>

            <h1 className="mt-7 max-w-[820px] font-serif text-[clamp(2.45rem,7vw,7.2rem)] font-black leading-[0.92] tracking-normal">
              PRADO transforma dados do espaço em decisões para a lavoura.
            </h1>

            <p className="mt-7 max-w-[640px] text-lg leading-8 text-white/78">
              Criamos uma ponte simples entre APIs da NASA e a rotina de pequenos e
              médios agricultores: mapas claros, indicadores compactos e recomendações
              práticas para cuidar melhor da terra.
            </p>
          </div>

          <div className="hidden">
            <div className="w-full overflow-hidden rounded-[30px] border border-white/14 bg-[#081811]/78 shadow-[0_34px_110px_rgb(0_0_0_/_38%)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#d7ef98]">
                    Leitura da propriedade
                  </p>
                  <p className="mt-1 text-sm text-white/58">Dados agrupados para ação rápida</p>
                </div>
                <span className="rounded-full border border-[#d7ef98]/22 bg-[#d7ef98]/10 px-3 py-1 text-xs font-black text-[#d7ef98]">
                  online
                </span>
              </div>

              <div className="relative h-[420px]">
                <img
                  className="h-full w-full object-cover opacity-70"
                  src={heroImage}
                  alt=""
                />
                <div className="absolute inset-0 sobre-scan-map" aria-hidden="true" />
                <div className="absolute left-[16%] top-[28%] h-[42%] w-[52%] rounded-[42%] border-2 border-[#d7ef98]/70 bg-[#71b549]/12 shadow-[0_0_0_999px_rgb(4_18_12_/_0.22)]" />
                <div className="absolute left-[46%] top-[45%] grid h-11 w-11 place-items-center rounded-full bg-[#71b549] text-white shadow-[0_14px_40px_rgb(0_0_0_/_35%)]">
                  <LocateFixed className="h-5 w-5" />
                </div>

                <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3">
                  {heroSignals.slice(1).map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        className="rounded-2xl border border-white/12 bg-[#081811]/86 p-4 shadow-xl backdrop-blur"
                        key={item.label}
                      >
                        <Icon className="h-5 w-5 text-[#d7ef98]" />
                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-white/42">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-black text-white">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-9 grid max-w-[1180px] gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {heroSignals.map((item) => {
          const Icon = item.icon;
          return (
            <article
              className="flex min-h-[96px] items-center gap-4 rounded-2xl border border-[#ded7bd] bg-[#fffaf0] p-4 shadow-[0_18px_44px_rgb(34_49_32_/_10%)]"
              key={item.label}
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#173f28] text-[#d7ef98]">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6c754f]">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-base font-black text-[#14251b]">{item.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/24 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#315c32]">
              <Compass className="h-3.5 w-3.5" />
              Nossa direção
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2.4rem,4vw,4.5rem)] leading-none tracking-normal">
              Informação rural precisa ser clara, rápida e útil.
            </h2>
          </div>
          <p className="max-w-[680px] text-base leading-8 text-[#3e4938]">
            O PRADO nasceu para remover a barreira entre dado técnico e decisão agrícola.
            Em vez de despejar números, o sistema compacta sinais ambientais em uma tela
            que mostra prioridade, risco e próxima ação.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1180px] gap-4 lg:grid-cols-3">
          {missionTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <article
                className="min-h-[250px] rounded-[26px] border border-[#ded7bd] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(32_45_30_/_12%)]"
                key={tile.title}
              >
                <span className="grid h-13 min-h-[52px] w-13 min-w-[52px] place-items-center rounded-2xl bg-[#eef3dc] text-[#315c32]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-7 text-2xl font-black text-[#14251b]">{tile.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#3e4938]">{tile.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden bg-[#102417] px-4 py-16 text-white sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-white/12 sm:min-h-[520px] sm:rounded-[32px]">
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={handsImage}
              alt="Mãos segurando terra com uma muda verde"
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(7_21_14_/_0.90),rgb(8_24_16_/_0.22)_58%,rgb(8_24_16_/_0.05))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/12 bg-[#081811]/82 p-5 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#d7ef98]">
                O foco nunca sai da terra
              </p>
              <p className="mt-3 text-xl font-black leading-snug">
                A tecnologia só faz sentido quando ajuda o produtor a agir melhor no próprio campo.
              </p>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7ef98]/22 bg-white/[0.06] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#d7ef98]">
              <ScanLine className="h-3.5 w-3.5" />
              Como funciona
            </span>
            <h2 className="mt-5 max-w-[680px] font-serif text-[clamp(2.3rem,4vw,4.4rem)] leading-none tracking-normal">
              Da órbita até uma recomendação simples.
            </h2>
            <div className="mt-8 grid gap-4">
              {dataFlow.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.055] p-5 sm:grid-cols-[76px_1fr]"
                    key={step.title}
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <span className="grid h-13 min-h-[52px] w-13 min-w-[52px] place-items-center rounded-2xl bg-[#d7ef98] text-[#102417]">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="font-serif text-4xl font-black leading-none text-white/20 sm:mt-4 sm:block">
                        0{index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/68">{step.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/24 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#315c32]">
                <Gauge className="h-3.5 w-3.5" />
                O que aparece no painel
              </span>
              <h2 className="mt-5 font-serif text-[clamp(2.1rem,4vw,3.9rem)] leading-none tracking-normal">
                Dados importantes, sem virar uma planilha.
              </h2>
            </div>
            <p className="max-w-[640px] text-base leading-8 text-[#3e4938]">
              O dashboard organiza decisões que fazem parte da rotina agrícola. Cada
              indicador nasce de dado técnico, mas chega ao produtor como leitura rápida.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decisionMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article
                  className="flex min-h-[118px] items-center gap-4 rounded-[24px] border border-[#ded7bd] bg-white p-5 shadow-sm"
                  key={metric.label}
                >
                  <span className="grid h-13 min-h-[52px] w-13 min-w-[52px] place-items-center rounded-2xl bg-[#173f28] text-[#d7ef98]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-[#14251b]">{metric.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#3e4938]">{metric.value}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#e8ead9] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/24 bg-[#f5f1e5] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#315c32]">
              <Leaf className="h-3.5 w-3.5" />
              Nossa promessa
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2.1rem,4vw,3.8rem)] leading-none tracking-normal">
              O produtor entende primeiro. A tecnologia trabalha em silêncio.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {promiseCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  className="rounded-[26px] border border-[#cfd4b9] bg-[#fffaf0] p-6"
                  key={card.title}
                >
                  <Icon className="h-8 w-8 text-[#315c32]" />
                  <h3 className="mt-5 text-xl font-black text-[#14251b]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#3e4938]">{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#07150f] px-4 py-16 text-white sm:px-6 lg:px-10">
        <img
          className="absolute inset-0 z-0 h-full w-full object-cover object-[50%_58%] opacity-[0.42]"
          src={heroImage}
          alt=""
        />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgb(7_21_14_/_0.98),rgb(12_44_25_/_0.82),rgb(7_21_14_/_0.72))]" />
        <div className="relative z-10 mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#d7ef98]">
              PRADO para pequenos e médios produtores
            </p>
            <h2 className="mt-4 max-w-[760px] font-serif text-[clamp(2.2rem,4vw,4rem)] leading-none tracking-normal">
              Menos distância entre ciência, campo e decisão.
            </h2>
            <p className="mt-5 max-w-[660px] text-base leading-8 text-white/72">
              O Sobre agora conta a essência do projeto: dados ambientais avançados
              convertidos em uma experiência simples para quem precisa decidir todos os dias.
            </p>
          </div>
          <Link
            className="inline-flex min-h-[54px] w-fit items-center justify-center gap-2 rounded-xl bg-[#d7ef98] px-6 text-sm font-black text-[#102417] no-underline transition hover:bg-[#c5e97a] max-[420px]:w-full"
            to="/dashboard"
          >
            Abrir painel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Sobre;
