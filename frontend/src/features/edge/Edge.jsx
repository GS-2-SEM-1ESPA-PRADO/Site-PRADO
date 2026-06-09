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
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { buscarDragonAtual, buscarDragonHistorico } from "../../lib/api.js";

const CHAVE_HOST = "prado_fiware_host";
const INTERVALO_MS = 3000;

// Thresholds e mensagens de risco por sensor.
// criticidade: "critico" | "atencao" | null
const THRESHOLDS = {
  temperature: (v) => {
    if (v < 10 || v > 40) return { criticidade: "critico",  msg: "Temperatura fora do suporte à vida" };
    if (v < 15 || v > 35) return { criticidade: "atencao", msg: "Temperatura em zona de atenção" };
    return null;
  },
  pressure: (v) => {
    if (v < 700 || v > 1060) return { criticidade: "critico",  msg: "Risco de despressurização" };
    if (v < 850 || v > 1050) return { criticidade: "atencao", msg: "Pressão em zona de atenção" };
    return null;
  },
  gas: (v) => {
    if (v > 1500) return { criticidade: "critico",  msg: "Risco de explosão" };
    if (v > 1003) return { criticidade: "atencao", msg: "Concentração de gás elevada" };
    return null;
  },
  radiation: (v) => {
    if (v > 2.0) return { criticidade: "critico",  msg: "Radiação ionizante perigosa" };
    if (v > 1.0) return { criticidade: "atencao", msg: "Radiação acima do nominal" };
    return null;
  },
  mag_flag: (v) => {
    if (v >= 1) return { criticidade: "atencao", msg: "Interferência magnética detectada" };
    return null;
  },
  propellant: (v) => {
    if (v < 15) return { criticidade: "critico",  msg: "Propelente crítico" };
    if (v < 30) return { criticidade: "atencao", msg: "Propelente em nível baixo" };
    return null;
  },
  accel_x: (v) => {
    if (Math.abs(v) > 50) return { criticidade: "critico",  msg: "Aceleração crítica — risco de perda de consciência" };
    if (Math.abs(v) > 30) return { criticidade: "atencao", msg: "Aceleração elevada" };
    return null;
  },
  accel_y: (v) => {
    if (Math.abs(v) > 50) return { criticidade: "critico",  msg: "Aceleração crítica — risco de perda de consciência" };
    if (Math.abs(v) > 30) return { criticidade: "atencao", msg: "Aceleração elevada" };
    return null;
  },
  accel_z: (v) => {
    if (Math.abs(v) > 50) return { criticidade: "critico",  msg: "Aceleração crítica — risco de perda de consciência" };
    if (Math.abs(v) > 30) return { criticidade: "atencao", msg: "Aceleração elevada" };
    return null;
  },
};

// Ordem de criticidade para o banner (maior prioridade primeiro).
const ORDEM_CRITICIDADE = ["gas", "radiation", "pressure", "temperature", "accel_x", "accel_y", "accel_z", "mag_flag", "propellant"];

const SENSORES = [
  { attr: "temperature", label: "Temperatura",       unidade: "°C",   icon: Thermometer, dec: 1 },
  { attr: "pressure",    label: "Pressão",            unidade: "hPa",  icon: CircleGauge, dec: 1 },
  { attr: "gas",         label: "Gás",                unidade: "ADC",  icon: Wind,        dec: 0 },
  { attr: "heading",     label: "Heading magnético",  unidade: "°",    icon: Compass,     dec: 1 },
  { attr: "mag_flag",    label: "Flag magnética",     unidade: "",     icon: AlertTriangle, dec: 0, flag: true },
  { attr: "radiation",   label: "Radiação",           unidade: "mSv/h",icon: Zap,         dec: 2 },
  { attr: "propellant",  label: "Propelente",         unidade: "%",    icon: Fuel,        dec: 0 },
  { attr: "accel_x",     label: "Aceleração X",       unidade: "m/s²", icon: Move3d,      dec: 2 },
  { attr: "accel_y",     label: "Aceleração Y",       unidade: "m/s²", icon: Activity,    dec: 2 },
  { attr: "accel_z",     label: "Aceleração Z",       unidade: "m/s²", icon: Move3d,      dec: 2 },
];

function paraNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function formatarValor(valor, sensor) {
  const n = paraNumero(valor);
  if (n === null) return "--";
  if (sensor.flag) return n >= 1 ? "Desvio" : "Normal";
  return n.toFixed(sensor.dec);
}

function verificarAlerta(attr, valor) {
  const fn = THRESHOLDS[attr];
  if (!fn) return null;
  const n = paraNumero(valor);
  if (n === null) return null;
  return fn(n);
}

function MiniGrafico({ valores, criticidade }) {
  const nums = (valores || []).map(paraNumero).filter((v) => v !== null);
  const cor = criticidade === "critico" ? "#ef4444" : criticidade === "atencao" ? "#f97316" : "#71b549";

  if (nums.length < 2) {
    return (
      <div className="flex h-[60px] items-center justify-center rounded-lg bg-[#f7f4ea] text-[11px] text-[#9aa089]">
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
    <svg viewBox={`0 0 ${largura} ${altura}`} preserveAspectRatio="none" className="h-[60px] w-full" aria-hidden="true">
      <polygon points={area} fill={cor} fillOpacity="0.14" />
      <polyline points={linha} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Edge() {
  const [host, setHost]                     = useState(() => localStorage.getItem(CHAVE_HOST) || "");
  const [conectado, setConectado]           = useState(false);
  const [valores, setValores]               = useState({});
  const [historicos, setHistoricos]         = useState({});
  const [erro, setErro]                     = useState("");
  const [atualizando, setAtualizando]       = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const hostConectadoRef = useRef("");

  const atualizar = useCallback(async () => {
    setAtualizando(true);
    const alvo = hostConectadoRef.current;
    try {
      const atual = await buscarDragonAtual(alvo);
      setValores(atual.valores || {});
      setErro("");
      const respostas = await Promise.all(
        SENSORES.map((s) =>
          buscarDragonHistorico(s.attr, alvo, 30).catch(() => ({ attr: s.attr, pontos: [] }))
        )
      );
      const novo = {};
      for (const r of respostas) novo[r.attr] = (r.pontos || []).map((p) => p.valor);
      setHistoricos(novo);
      setUltimaAtualizacao(new Date());
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    if (!conectado) return undefined;
    const inicial = setTimeout(atualizar, 0);
    const id = setInterval(atualizar, INTERVALO_MS);
    return () => { clearTimeout(inicial); clearInterval(id); };
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

  // Calcula alertas ativos para o banner
  const alertasAtivos = ORDEM_CRITICIDADE
    .map((attr) => {
      const alerta = verificarAlerta(attr, valores[attr]);
      if (!alerta) return null;
      const sensor = SENSORES.find((s) => s.attr === attr);
      return { attr, label: sensor?.label || attr, ...alerta };
    })
    .filter(Boolean);

  const alertaCritico = alertasAtivos.find((a) => a.criticidade === "critico");

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f7f4ea] px-4 py-10 text-[#16281e] sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-[1180px]">

        {/* Cabeçalho */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/30 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26] shadow-sm">
              <Satellite className="h-3.5 w-3.5" aria-hidden="true" />
              Edge · Telemetria orbital
            </span>
            <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3rem)] leading-none tracking-normal text-[#16281e]">
              Cápsula Dragon
            </h1>
            <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#3d4637]">
              Painel em tempo real dos sensores da cápsula, lidos do FIWARE.
              Os valores e os gráficos se atualizam automaticamente a cada
              poucos segundos.
            </p>
          </div>

          {conectado && (
            <div className="text-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#71b549]/12 px-3 py-1.5 text-xs font-bold text-[#3b5e26]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#71b549] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#71b549]" />
                </span>
                Conectado
              </span>
              {ultimaAtualizacao && (
                <p className="mt-2 text-[11px] text-[#6e765f]">
                  Atualizado às {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Barra de conexão */}
        <div className="mt-7 rounded-2xl border border-[#ded8c3] bg-white p-4 shadow-sm sm:p-5">
          <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#6e765f]">
            IP da VM do FIWARE
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <span className="flex flex-1 items-center gap-2 rounded-xl border border-[#e1ddca] bg-[#f7f4ea] px-3 focus-within:border-[#71b549]">
              <Plug className="h-4 w-4 flex-none text-[#9aa089]" aria-hidden="true" />
              <input
                className="h-12 w-full bg-transparent text-[#16281e] outline-none placeholder:text-[#9aa089]"
                type="text"
                placeholder="Ex.: 34.39.176.77  (vazio = usar o IP do servidor)"
                value={host}
                onChange={(e) => setHost(e.target.value)}
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#71b549]/40 bg-[#71b549]/10 px-5 text-sm font-extrabold text-[#3b5e26] transition hover:bg-[#71b549]/20 disabled:opacity-60"
                  type="button"
                  onClick={atualizar}
                  disabled={atualizando}
                >
                  <RefreshCw className={`h-4 w-4 ${atualizando ? "animate-spin" : ""}`} aria-hidden="true" />
                  Atualizar
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#e1ddca] px-5 text-sm font-extrabold text-[#3d4637] transition hover:bg-[#f7f4ea]"
                  type="button"
                  onClick={desconectar}
                >
                  Desconectar
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-[#6e765f]">
            Deixe o campo vazio para usar o IP configurado no servidor
            (arquivo <code className="text-[#3d4637]">.env</code>). O valor digitado aqui tem prioridade.
          </p>
        </div>

        {/* Erro */}
        {conectado && erro && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#ef6b4a]/30 bg-[#ef6b4a]/10 p-4">
            <AlertTriangle className="h-5 w-5 flex-none text-[#ef8b6a]" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-[#ef8b6a]">{erro}</p>
              <p className="mt-1 text-xs text-white/50">
                Confira se o IP está correto, se a VM está ligada e se as portas 1026 e 8666 estão acessíveis.
              </p>
            </div>
          </div>
        )}

        {/* Banner de alerta crítico */}
        {conectado && alertaCritico && (
          <div className="mt-6 flex animate-pulse items-center gap-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
            <ShieldAlert className="h-6 w-6 flex-none text-red-400" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-extrabold uppercase tracking-wider text-red-400">
                Alerta crítico — {alertaCritico.label}
              </p>
              <p className="mt-0.5 text-xs text-red-300/80">{alertaCritico.msg}</p>
            </div>
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-[11px] font-extrabold uppercase text-red-400">
              {alertasAtivos.filter((a) => a.criticidade === "critico").length} crítico(s)
            </span>
          </div>
        )}

        {/* Banner nominal */}
        {conectado && !alertaCritico && alertasAtivos.length === 0 && Object.keys(valores).length > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#71b549]/30 bg-[#71b549]/10 p-4">
            <CheckCircle2 className="h-5 w-5 flex-none text-[#acd494]" aria-hidden="true" />
            <p className="text-sm font-bold text-[#acd494]">Todos os parâmetros nominais</p>
          </div>
        )}

        {/* Estado inicial */}
        {!conectado && (
          <div className="mt-8 grid place-items-center rounded-2xl border border-[#ded8c3] bg-white p-12 text-center shadow-sm">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#71b549]/12 text-[#3b5e26]">
              <Satellite className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-black text-[#16281e]">Pronto para acompanhar a missão</h2>
            <p className="mt-2 max-w-[460px] text-sm leading-6 text-[#3d4637]">
              Informe o IP da VM (ou deixe vazio para usar o do servidor) e clique em Conectar para ver a telemetria da cápsula ao vivo.
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
              const alerta = verificarAlerta(sensor.attr, valores[sensor.attr]);
              const critico  = alerta?.criticidade === "critico";
              const atencao  = alerta?.criticidade === "atencao";

              const borderClass = critico
                ? "border-red-500/50"
                : atencao
                ? "border-orange-400/50"
                : "border-[#e1ddca]";

              const valorClass = critico
                ? "text-red-400"
                : atencao
                ? "text-orange-400"
                : "text-[#16281e]";

              return (
                <article
                  key={sensor.attr}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${borderClass} ${critico ? "shadow-[0_0_16px_rgba(239,68,68,0.15)]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#6e765f]">
                      <Icone className="h-4 w-4" aria-hidden="true" />
                      {sensor.label}
                    </span>
                    {alerta && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        critico
                          ? "bg-red-500/20 text-red-400"
                          : "bg-orange-400/20 text-orange-400"
                      }`}>
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {critico ? "Crítico" : "Atenção"}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-end gap-2">
                    <strong className={`text-3xl font-black leading-none ${valorClass}`}>
                      {valorAtual}
                    </strong>
                    {sensor.unidade && !sensor.flag && (
                      <span className="text-sm font-semibold text-[#6e765f]">{sensor.unidade}</span>
                    )}
                  </div>

                  {alerta && (
                    <p className={`mt-2 text-[11px] font-semibold ${critico ? "text-red-400/80" : "text-orange-400/80"}`}>
                      {alerta.msg}
                    </p>
                  )}

                  <div className="mt-4">
                    <MiniGrafico valores={serie} criticidade={alerta?.criticidade} />
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