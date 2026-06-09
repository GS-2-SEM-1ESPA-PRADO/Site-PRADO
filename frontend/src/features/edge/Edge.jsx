import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CircleGauge,
  Compass,
  Fuel,
  Move3d,
  Plug,
  RefreshCw,
  Satellite,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import { buscarDragonAtual, buscarDragonHistorico } from "../../lib/api.js";

// Chave usada para lembrar o último IP digitado, entre sessões.
const CHAVE_HOST = "prado_fiware_host";

// Intervalo de atualização automática (em milissegundos). O ESP publica a
// cada 5 segundos, então 8s evita sobrecarregar e mantém o painel fresco.
const INTERVALO_MS = 8000;

// Metadados de cada sensor: rótulo, unidade, ícone, casas decimais.
// A ordem aqui é a ordem em que os cards aparecem na tela.
const SENSORES = [
  { attr: "temperature", label: "Temperatura", unidade: "°C", icon: Thermometer, dec: 1 },
  { attr: "pressure", label: "Pressão", unidade: "hPa", icon: CircleGauge, dec: 1 },
  { attr: "gas", label: "Gás", unidade: "ADC", icon: Wind, dec: 0 },
  { attr: "heading", label: "Heading magnético", unidade: "°", icon: Compass, dec: 1 },
  { attr: "mag_flag", label: "Flag magnética", unidade: "", icon: AlertTriangle, dec: 0, flag: true },
  { attr: "radiation", label: "Radiação", unidade: "mSv/h", icon: Zap, dec: 2 },
  { attr: "propellant", label: "Propelente", unidade: "%", icon: Fuel, dec: 0 },
  { attr: "accel_x", label: "Aceleração X", unidade: "m/s²", icon: Move3d, dec: 2 },
  { attr: "accel_y", label: "Aceleração Y", unidade: "m/s²", icon: Activity, dec: 2 },
  { attr: "accel_z", label: "Aceleração Z", unidade: "m/s²", icon: Move3d, dec: 2 },
];

// Converte um valor qualquer em número, ou null se não der.
function paraNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

// Formata o valor de um sensor para exibição.
function formatarValor(valor, sensor) {
  const n = paraNumero(valor);
  if (n === null) return "--";
  if (sensor.flag) return n >= 1 ? "Desvio" : "Normal";
  return n.toFixed(sensor.dec);
}

// Gráfico de linha simples em SVG, sem nenhuma biblioteca externa.
// Recebe a lista de números (histórico) e desenha a linha com área preenchida.
function MiniGrafico({ valores }) {
  const nums = (valores || []).map(paraNumero).filter((v) => v !== null);

  if (nums.length < 2) {
    return (
      <div className="flex h-[60px] items-center justify-center rounded-lg bg-white/[0.03] text-[11px] text-white/30">
        aguardando histórico...
      </div>
    );
  }

  const largura = 260;
  const altura = 60;
  const margem = 5;
  const minimo = Math.min(...nums);
  const maximo = Math.max(...nums);
  const intervalo = maximo - minimo || 1;
  const passoX = (largura - margem * 2) / (nums.length - 1);

  const pontos = nums.map((v, i) => {
    const x = margem + i * passoX;
    const y = altura - margem - ((v - minimo) / intervalo) * (altura - margem * 2);
    return [x, y];
  });

  const linha = pontos.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const baseY = altura - margem;
  const area = `${margem},${baseY} ${linha} ${(margem + (nums.length - 1) * passoX).toFixed(1)},${baseY}`;

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      className="h-[60px] w-full"
      aria-hidden="true"
    >
      <polygon points={area} fill="#71b549" fillOpacity="0.14" />
      <polyline
        points={linha}
        fill="none"
        stroke="#71b549"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Edge() {
  const [host, setHost] = useState(() => localStorage.getItem(CHAVE_HOST) || "");
  const [conectado, setConectado] = useState(false);
  const [valores, setValores] = useState({});
  const [historicos, setHistoricos] = useState({});
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // Guarda o host efetivamente conectado, para o ciclo de atualização usar.
  const hostConectadoRef = useRef("");

  // Busca o estado atual + o histórico de todos os sensores de uma vez.
  const atualizar = useCallback(async () => {
    setAtualizando(true);
    const alvo = hostConectadoRef.current;

    try {
      const atual = await buscarDragonAtual(alvo);
      setValores(atual.valores || {});
      setErro("");

      // Históricos em paralelo (um por sensor).
      const respostas = await Promise.all(
        SENSORES.map((s) =>
          buscarDragonHistorico(s.attr, alvo, 30).catch(() => ({
            attr: s.attr,
            pontos: [],
          })),
        ),
      );

      const novo = {};
      for (const r of respostas) {
        novo[r.attr] = (r.pontos || []).map((p) => p.valor);
      }
      setHistoricos(novo);
      setUltimaAtualizacao(new Date());
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setAtualizando(false);
    }
  }, []);

  // Liga a atualização automática enquanto estiver conectado.
  useEffect(() => {
    if (!conectado) return undefined;

    // A primeira carga é disparada fora do corpo síncrono do efeito; depois
    // o setInterval cuida das atualizações periódicas.
    const inicial = setTimeout(atualizar, 0);
    const id = setInterval(atualizar, INTERVALO_MS);

    return () => {
      clearTimeout(inicial);
      clearInterval(id);
    };
  }, [conectado, atualizar]);

  function conectar() {
    const limpo = host.trim();
    localStorage.setItem(CHAVE_HOST, limpo);
    hostConectadoRef.current = limpo;
    setErro("");
    setConectado(true);
  }

  function desconectar() {
    setConectado(false);
    setValores({});
    setHistoricos({});
    setUltimaAtualizacao(null);
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#0b1e10] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-[1180px]">

        {/* Cabeçalho */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/30 bg-[#71b549]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
              <Satellite className="h-3.5 w-3.5" aria-hidden="true" />
              Edge · Telemetria orbital
            </span>
            <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3rem)] leading-none tracking-normal text-white">
              Cápsula Dragon
            </h1>
            <p className="mt-3 max-w-[620px] text-sm leading-6 text-white/60">
              Painel em tempo real dos sensores da cápsula, lidos do FIWARE.
              Os valores e os gráficos se atualizam automaticamente a cada
              poucos segundos.
            </p>
          </div>

          {conectado && (
            <div className="text-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#71b549]/15 px-3 py-1.5 text-xs font-bold text-[#acd494]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#71b549] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#71b549]" />
                </span>
                Conectado
              </span>
              {ultimaAtualizacao && (
                <p className="mt-2 text-[11px] text-white/40">
                  Atualizado às {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Barra de conexão */}
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
            IP da VM do FIWARE
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <span className="flex flex-1 items-center gap-2 rounded-xl border border-white/15 bg-[#0b1e10] px-3 focus-within:border-[#71b549]">
              <Plug className="h-4 w-4 flex-none text-white/40" aria-hidden="true" />
              <input
                className="h-12 w-full bg-transparent text-white outline-none placeholder:text-white/30"
                type="text"
                placeholder="Ex.: 34.39.176.77  (vazio = usar o IP do servidor)"
                value={host}
                onChange={(evento) => setHost(evento.target.value)}
              />
            </span>

            {!conectado ? (
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#71b549] px-6 text-sm font-extrabold text-[#0b1e10] transition hover:bg-[#80c456]"
                type="button"
                onClick={conectar}
              >
                <Satellite className="h-4 w-4" aria-hidden="true" />
                Conectar
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#71b549]/40 bg-[#71b549]/10 px-5 text-sm font-extrabold text-[#acd494] transition hover:bg-[#71b549]/20 disabled:opacity-60"
                  type="button"
                  onClick={atualizar}
                  disabled={atualizando}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${atualizando ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  Atualizar
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-extrabold text-white/70 transition hover:bg-white/5"
                  type="button"
                  onClick={desconectar}
                >
                  Desconectar
                </button>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-white/40">
            Deixe o campo vazio para usar o IP configurado no servidor
            (arquivo <code className="text-white/60">.env</code>). O valor
            digitado aqui tem prioridade.
          </p>
        </div>

        {/* Erro */}
        {conectado && erro && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#ef6b4a]/30 bg-[#ef6b4a]/10 p-4">
            <AlertTriangle className="h-5 w-5 flex-none text-[#ef8b6a]" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-[#ef8b6a]">{erro}</p>
              <p className="mt-1 text-xs text-white/50">
                Confira se o IP está correto, se a VM está ligada e se as portas
                1026 (Orion) e 8666 (STH-Comet) estão acessíveis.
              </p>
            </div>
          </div>
        )}

        {/* Estado inicial (antes de conectar) */}
        {!conectado && (
          <div className="mt-8 grid place-items-center rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#71b549]/12 text-[#acd494]">
              <Satellite className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-black text-white">
              Pronto para acompanhar a missão
            </h2>
            <p className="mt-2 max-w-[460px] text-sm leading-6 text-white/55">
              Informe o IP da VM (ou deixe vazio para usar o do servidor) e
              clique em Conectar para ver a telemetria da cápsula ao vivo.
            </p>
          </div>
        )}

        {/* Grade de sensores */}
        {conectado && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SENSORES.map((sensor) => {
              const Icone = sensor.icon;
              const valorAtual = formatarValor(valores[sensor.attr], sensor);
              const serie = historicos[sensor.attr] || [];

              // Destaque visual quando a flag magnética acusa desvio.
              const emAlerta =
                sensor.flag && paraNumero(valores[sensor.attr]) >= 1;

              return (
                <article
                  key={sensor.attr}
                  className={`rounded-2xl border bg-white/[0.04] p-5 transition ${
                    emAlerta ? "border-[#ef6b4a]/50" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
                      <Icone className="h-4 w-4" aria-hidden="true" />
                      {sensor.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-end gap-2">
                    <strong
                      className={`text-3xl font-black leading-none ${
                        emAlerta ? "text-[#ef8b6a]" : "text-white"
                      }`}
                    >
                      {valorAtual}
                    </strong>
                    {sensor.unidade && !sensor.flag && (
                      <span className="text-sm font-semibold text-white/45">
                        {sensor.unidade}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <MiniGrafico valores={serie} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Edge;