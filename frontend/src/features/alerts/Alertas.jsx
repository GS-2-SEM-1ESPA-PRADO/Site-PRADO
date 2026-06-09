import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Clock,
  Droplets,
  Inbox,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";
import { buscarAlertas } from "../../lib/api.js";

// Cada tipo de alerta gerado pelo backend tem um ícone e um rótulo amigável.
// Os tipos vêm de climate.py: irrigation, fungus, spray, soil e radiation.
const TIPOS = {
  irrigation: { icon: Droplets, label: "Irrigação" },
  fungus: { icon: AlertTriangle, label: "Fungos" },
  spray: { icon: Wind, label: "Pulverização" },
  soil: { icon: Sprout, label: "Solo" },
  radiation: { icon: Sun, label: "Radiação" },
};

// Estilo de cada nível de atenção. Os alertas só são gerados para condições
// críticas, então a maioria cai em tons de alerta (laranja/vermelho).
const NIVEIS = {
  alto: { label: "Alto", cor: "#ef6b4a", texto: "#b23c20", fundo: "#ef6b4a14" },
  evitar: { label: "Evitar", cor: "#ef6b4a", texto: "#b23c20", fundo: "#ef6b4a14" },
  seco: { label: "Seco", cor: "#ef6b4a", texto: "#b23c20", fundo: "#ef6b4a14" },
  moderado: { label: "Moderado", cor: "#e0a72f", texto: "#ad7a16", fundo: "#e0a72f14" },
  baixo: { label: "Baixo", cor: "#71b549", texto: "#3b5e26", fundo: "#71b54914" },
};

// Converte a data ISO ("2026-06-05T18:27:08") em algo legível em pt-BR.
function formatarData(iso) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Usada pelo botão "Atualizar": recarrega a lista sob demanda.
  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const lista = await buscarAlertas();
      setAlertas(lista);
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setCarregando(false);
    }
  }

  // Carregamento inicial ao abrir a página. A busca acontece dentro de uma
  // função assíncrona própria e a flag "ativo" evita atualizar o estado caso
  // o usuário saia da página antes da resposta chegar.
  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const lista = await buscarAlertas();
        if (ativo) setAlertas(lista);
      } catch (problema) {
        if (ativo) setErro(problema.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f7f4ea] px-4 py-10 text-[#16281e] sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-[860px]">

        {/* Cabeçalho */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/30 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26] shadow-sm">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              Central de alertas
            </span>
            <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3rem)] leading-none tracking-normal">
              Seus alertas
            </h1>
            <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#3d4637]">
              Aqui ficam registradas as condições críticas detectadas nas áreas
              que você analisou no mapa, da mais recente para a mais antiga.
            </p>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3b5e26] bg-[#3b5e26] px-5 text-sm font-extrabold text-white transition hover:bg-[#27461f] disabled:opacity-60"
            type="button"
            onClick={carregar}
            disabled={carregando}
          >
            <RefreshCw
              className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Atualizar
          </button>
        </div>

        {/* Contador */}
        {!carregando && !erro && alertas.length > 0 && (
          <p className="mt-6 text-sm font-bold text-[#6e765f]">
            {alertas.length} alerta{alertas.length > 1 ? "s" : ""} registrado
            {alertas.length > 1 ? "s" : ""}
          </p>
        )}

        {/* Estado: carregando */}
        {carregando && (
          <div className="mt-10 grid place-items-center rounded-[20px] border border-[#ded8c3] bg-white p-12 text-center shadow-sm">
            <RefreshCw className="h-7 w-7 animate-spin text-[#71b549]" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-[#6e765f]">
              Carregando seus alertas...
            </p>
          </div>
        )}

        {/* Estado: erro */}
        {!carregando && erro && (
          <div className="mt-10 rounded-[20px] border border-[#ef6b4a]/30 bg-[#ef6b4a]/10 p-8 text-center">
            <AlertTriangle className="mx-auto h-7 w-7 text-[#b23c20]" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-[#b23c20]">{erro}</p>
            <p className="mt-1 text-sm text-[#3d4637]">
              Verifique se você está logado e se o servidor está ativo.
            </p>
          </div>
        )}

        {/* Estado: vazio */}
        {!carregando && !erro && alertas.length === 0 && (
          <div className="mt-10 grid place-items-center rounded-[20px] border border-[#ded8c3] bg-white p-12 text-center shadow-sm">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#71b549]/12 text-[#3b5e26]">
              <Inbox className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-black text-[#16281e]">
              Nenhum alerta por enquanto
            </h2>
            <p className="mt-2 max-w-[420px] text-sm leading-6 text-[#3d4637]">
              Analise áreas no mapa do dashboard. Quando alguma condição exigir
              atenção, o alerta aparecerá aqui automaticamente.
            </p>
          </div>
        )}

        {/* Lista de alertas */}
        {!carregando && !erro && alertas.length > 0 && (
          <div className="mt-5 grid gap-3">
            {alertas.map((alerta) => {
              const tipo = TIPOS[alerta.tipo] || {
                icon: AlertTriangle,
                label: alerta.tipo,
              };
              const nivel = NIVEIS[alerta.nivel] || NIVEIS.alto;
              const Icone = tipo.icon;

              return (
                <article
                  key={alerta.id}
                  className="flex gap-4 rounded-2xl border border-[#e1ddca] bg-white p-4 shadow-sm sm:p-5"
                >
                  {/* Ícone do tipo */}
                  <span
                    className="grid h-12 w-12 flex-none place-items-center rounded-xl"
                    style={{ backgroundColor: nivel.fundo, color: nivel.texto }}
                  >
                    <Icone className="h-6 w-6" aria-hidden="true" />
                  </span>

                  {/* Conteúdo */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-base font-black text-[#16281e]">
                        {tipo.label}
                      </strong>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-black"
                        style={{ backgroundColor: nivel.fundo, color: nivel.texto }}
                      >
                        {nivel.label}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-snug text-[#3d4637]">
                      {alerta.mensagem}
                    </p>

                    {/* Rodapé: local e data */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-[#6e765f]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {alerta.local}
                        {typeof alerta.lat === "number" &&
                          typeof alerta.lon === "number" && (
                            <span className="text-[#9aa089]">
                              ({alerta.lat.toFixed(2)}, {alerta.lon.toFixed(2)})
                            </span>
                          )}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatarData(alerta.data_hora)}
                      </span>
                    </div>
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

export default Alertas;