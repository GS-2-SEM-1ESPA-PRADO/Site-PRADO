import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleGauge,
  Cloud,
  CloudRain,
  Database,
  Droplets,
  Footprints,
  Gauge,
  Layers,
  LocateFixed,
  MapPin,
  MapPinned,
  MousePointer2,
  Radar,
  Satellite,
  SlidersHorizontal,
  Smartphone,
  Sprout,
  Sun,
  Thermometer,
  Tractor,
  TrendingUp,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";

const flowSteps = [
  {
    icon: MapPin,
    title: "1. Escolha a área",
    text: "Use uma região pronta, clique direto no mapa ou use sua localização atual para analisar o ponto da propriedade.",
  },
  {
    icon: Database,
    title: "2. O PRADO busca os dados",
    text: "A plataforma consulta informações de clima, solo, vento, radiação, umidade e pressão para as próximas 24 horas.",
  },
  {
    icon: Radar,
    title: "3. A camada pinta o mapa",
    text: "Cada indicador transforma a área em zonas de atenção: baixa, média ou alta, facilitando a leitura dos talhões.",
  },
  {
    icon: CheckCircle2,
    title: "4. Você toma a decisão",
    text: "Os cards traduzem os números em recomendações práticas para irrigação, pulverização, maquinário e risco da lavoura.",
  },
];

const dashboardTools = [
  {
    icon: Layers,
    title: "Base do mapa",
    text: "Alterne entre mapa comum, satélite e relevo. Use satélite para reconhecer a área e relevo para entender declividade.",
  },
  {
    icon: LocateFixed,
    title: "Minha localização",
    text: "Centraliza o painel na posição do navegador. É útil quando o produtor está dentro ou perto da lavoura.",
  },
  {
    icon: MousePointer2,
    title: "Clique no mapa",
    text: "Qualquer clique vira um novo ponto de análise. Use isso para comparar áreas diferentes da mesma propriedade.",
  },
  {
    icon: SlidersHorizontal,
    title: "Raio e opacidade",
    text: "Ajuste o raio analisado e a força da cor dos talhões para enxergar melhor a área no mapa.",
  },
];

const decisionLayers = [
  {
    icon: Droplets,
    title: "Irrigação",
    text: "Combina umidade do solo, evapotranspiração e VPD para indicar se há necessidade de água.",
    use: "Use quando quiser decidir se irriga agora ou espera.",
  },
  {
    icon: AlertTriangle,
    title: "Fungos",
    text: "Cruza umidade, temperatura e chuva para apontar condições favoráveis à proliferação.",
    use: "Use depois de períodos úmidos ou em culturas sensíveis.",
  },
  {
    icon: Wind,
    title: "Pulverização",
    text: "Avalia vento, rajadas e chuva para mostrar se a aplicação é segura.",
    use: "Use antes de aplicar defensivos ou fertilizantes foliares.",
  },
  {
    icon: Sprout,
    title: "Solo",
    text: "Observa umidade e temperatura nas camadas iniciais do solo.",
    use: "Use para manejo hídrico, entrada de maquinário e acompanhamento radicular.",
  },
  {
    icon: Sun,
    title: "Radiação",
    text: "Mostra energia solar disponível e possível aumento de demanda hídrica.",
    use: "Use para entender estresse da cultura e ritmo de desenvolvimento.",
  },
];

const farmReadings = [
  {
    icon: Tractor,
    title: "Entrada de maquinário",
    text: "Indica se o solo está favorável para trânsito ou se há risco de compactação.",
  },
  {
    icon: Thermometer,
    title: "Estresse térmico",
    text: "Mostra quando sensação térmica e VPD podem aumentar a perda de água da planta.",
  },
  {
    icon: Cloud,
    title: "Molhamento foliar",
    text: "Ajuda a entender risco de folha úmida por muito tempo, um sinal importante para fungos.",
  },
  {
    icon: Footprints,
    title: "Umidade radicular",
    text: "Lê a umidade em camadas mais profundas para avaliar reserva hídrica inicial.",
  },
  {
    icon: Activity,
    title: "Pressão atmosférica",
    text: "Pode indicar tendência de estabilidade ou instabilidade no período analisado.",
  },
  {
    icon: TrendingUp,
    title: "Graus-dia",
    text: "Resume acúmulo térmico para acompanhar o avanço do desenvolvimento da cultura.",
  },
];

const quickRules = [
  "Verde indica atenção baixa, mas não substitui a observação da lavoura.",
  "Amarelo pede checagem antes de agir, principalmente em irrigação e pulverização.",
  "Vermelho indica risco alto ou janela ruim para manejo.",
  "Compare talhões próximos antes de tomar uma decisão para a propriedade inteira.",
  "Use o dashboard como apoio diário, não como única fonte para decisões críticas.",
];

function Dicas() {
  return (
    <main className="bg-[#f8f7f3] text-[#182116]">
      <section className="bg-[#102417] px-4 py-16 text-white sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#acd494]/25 bg-white/[0.06] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
              <Satellite className="h-3.5 w-3.5" />
              Guia de uso do PRADO
            </span>
            <h1 className="mt-6 max-w-[720px] font-serif text-[clamp(2.35rem,5vw,4.8rem)] leading-none tracking-normal">
              Entenda o site e use o dashboard sem complicação.
            </h1>
            <p className="mt-6 max-w-[620px] text-base leading-7 text-white/76">
              O PRADO transforma dados agroclimáticos em uma leitura visual para pequenos
              e médios agricultores. Esta página mostra como navegar pelo site, escolher
              uma área no mapa e interpretar cada camada de decisão.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#71b549] px-5 text-sm font-extrabold text-white no-underline transition hover:bg-[#5f9e3a] max-[420px]:w-full"
                to="/dashboard"
              >
                Abrir dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/[0.06] px-5 text-sm font-bold text-white no-underline transition hover:bg-white/[0.1] max-[420px]:w-full"
                href="#passo-a-passo"
              >
                Ver passo a passo
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Tempo de leitura", value: "5 min", icon: Smartphone },
              { label: "Foco", value: "Dashboard", icon: Gauge },
              { label: "Dados", value: "Clima e solo", icon: CloudRain },
              { label: "Resultado", value: "Decisão prática", icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-5" key={item.label}>
                  <Icon className="h-7 w-7 text-[#acd494]" />
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-white/46">
                    {item.label}
                  </p>
                  <strong className="mt-2 block text-2xl font-black">{item.value}</strong>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10" id="passo-a-passo">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 max-w-[720px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
              <MapPinned className="h-3.5 w-3.5" />
              Como o PRADO funciona
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.35rem)] leading-none tracking-normal text-[#16281e]">
              Do ponto no mapa até a recomendação de manejo.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {flowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article className="rounded-2xl border border-[#ded8c3] bg-white p-5 shadow-sm" key={step.title}>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#71b549]/12 text-[#3b5e26]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-black text-[#16281e]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#3d4637]">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#edeada] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-[#f8f7f3] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
                <Layers className="h-3.5 w-3.5" />
                Ferramentas do mapa
              </span>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-normal text-[#16281e]">
                O que você pode mexer no dashboard.
              </h2>
            </div>
            <p className="max-w-[620px] text-base leading-7 text-[#3d4637]">
              O mapa não é só visual. Cada botão muda a forma de analisar a área e ajuda
              o produtor a comparar pontos, camadas e talhões antes de agir.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article className="rounded-2xl border border-[#d6ceb5] bg-[#f8f7f3] p-5" key={tool.title}>
                  <Icon className="h-8 w-8 text-[#3b5e26]" />
                  <h3 className="mt-5 text-lg font-black text-[#16281e]">{tool.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#3d4637]">{tool.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 max-w-[760px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
              <Radar className="h-3.5 w-3.5" />
              Camadas de decisão
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-normal text-[#16281e]">
              Como interpretar as cores e os indicadores.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {decisionLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <article className="rounded-2xl border border-[#ded8c3] bg-white p-5 shadow-sm" key={layer.title}>
                  <Icon className="h-8 w-8 text-[#3b5e26]" />
                  <h3 className="mt-5 text-lg font-black text-[#16281e]">{layer.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#3d4637]">{layer.text}</p>
                  <p className="mt-4 rounded-xl bg-[#f3f8ef] p-3 text-xs font-bold leading-5 text-[#3b5e26]">
                    {layer.use}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#102417] px-4 py-16 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 max-w-[760px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#acd494]/25 bg-white/[0.06] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
              <CircleGauge className="h-3.5 w-3.5" />
              Leituras agrícolas
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-normal">
              Dados extras que ajudam no manejo diário.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {farmReadings.map((reading) => {
              const Icon = reading.icon;
              return (
                <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-5" key={reading.title}>
                  <Icon className="h-8 w-8 text-[#acd494]" />
                  <h3 className="mt-5 text-lg font-black">{reading.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/74">{reading.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-8 rounded-[24px] bg-white p-5 shadow-sm sm:p-8 md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/25 bg-[#f3f8ef] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Boas práticas
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.2rem)] leading-none tracking-normal text-[#16281e]">
              Como usar o dashboard com segurança.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#3d4637]">
              O PRADO facilita a leitura, mas a decisão final ainda deve considerar a
              cultura, o estágio da planta, o solo real da propriedade e a experiência
              do produtor.
            </p>
          </div>

          <div className="grid content-center gap-3">
            {quickRules.map((rule) => (
              <div className="flex items-start gap-3 rounded-xl bg-[#f8f7f3] p-4" key={rule}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#71b549]" />
                <span className="text-sm font-semibold leading-6 text-[#3d4637]">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dicas;
