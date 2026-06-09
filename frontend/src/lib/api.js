// api.js
// =============================================================================
// Ponto único de comunicação entre o front-end e o backend PRADO.
//
// Todas as chamadas de rede passam por aqui. Os componentes nunca falam
// diretamente com APIs externas: eles pedem ao backend, que faz o trabalho
// pesado e devolve dados já prontos. Este arquivo também cuida da "sessão"
// do usuário (login), guardando os dados no localStorage do navegador.
// =============================================================================

// Endereço onde o backend está rodando.
// Em desenvolvimento usa localhost; em produção usa a variável VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Chave usada para guardar os dados do usuário logado no navegador.
const CHAVE_SESSAO = "prado_usuario";

// -----------------------------------------------------------------------------
// Sessão do usuário (persistida no localStorage)
// -----------------------------------------------------------------------------

function avisarMudancaDeSessao() {
  window.dispatchEvent(new Event("prado-sessao"));
}

export function salvarSessao(usuario) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
  avisarMudancaDeSessao();
}

export function obterUsuario() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function estaLogado() {
  const usuario = obterUsuario();
  return Boolean(usuario && usuario.token);
}

export function obterToken() {
  const usuario = obterUsuario();
  return usuario && usuario.token ? usuario.token : "";
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  avisarMudancaDeSessao();
}

// -----------------------------------------------------------------------------
// Função genérica de requisição
// -----------------------------------------------------------------------------
async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);

  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    // Algumas respostas (ex.: 204) não têm corpo JSON.
  }

  if (!resposta.ok) {
    const mensagem =
      (corpo && corpo.detail) || "Não foi possível concluir a operação.";
    throw new Error(mensagem);
  }

  return corpo;
}

// -----------------------------------------------------------------------------
// Autenticação
// -----------------------------------------------------------------------------

export async function cadastrar(nome, email, senha) {
  const usuario = await requisitar("/api/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  salvarSessao(usuario);
  return usuario;
}

export async function entrar(email, senha) {
  const usuario = await requisitar("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  salvarSessao(usuario);
  return usuario;
}

// -----------------------------------------------------------------------------
// Clima
// -----------------------------------------------------------------------------

export async function buscarClima(lat, lon, local = "Área selecionada") {
  const parametros = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    local,
    token: obterToken(),
  });
  return requisitar(`/api/clima?${parametros.toString()}`);
}

export async function buscarClimaAtual(lat, lon) {
  const parametros = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  return requisitar(`/api/clima-atual?${parametros.toString()}`);
}

export function urlTileMapa(camada) {
  return `${API_URL}/api/mapa/${camada}/{z}/{x}/{y}.png`;
}

// -----------------------------------------------------------------------------
// Dados pessoais do usuário (exigem login)
// -----------------------------------------------------------------------------

export async function buscarHistorico() {
  const parametros = new URLSearchParams({ token: obterToken() });
  const dados = await requisitar(`/api/historico?${parametros.toString()}`);
  return dados.historico;
}

export async function buscarFavoritos() {
  const parametros = new URLSearchParams({ token: obterToken() });
  const dados = await requisitar(`/api/favoritos?${parametros.toString()}`);
  return dados.favoritos;
}

export async function removerFavorito(id) {
  const parametros = new URLSearchParams({ token: obterToken() });
  return requisitar(`/api/favoritos/${id}?${parametros.toString()}`, {
    method: "DELETE",
  });
}

export async function buscarAlertas() {
  const parametros = new URLSearchParams({ token: obterToken() });
  const dados = await requisitar(`/api/alertas?${parametros.toString()}`);
  return dados.alertas;
}

// -----------------------------------------------------------------------------
// Telemetria da cápsula Dragon (página Edge)
// -----------------------------------------------------------------------------

export async function buscarDragonAtual(host = "") {
  const parametros = new URLSearchParams();
  if (host) parametros.set("host", host);
  return requisitar(`/api/dragon/atual?${parametros.toString()}`);
}

export async function buscarDragonHistorico(attr, host = "", lastN = 30) {
  const parametros = new URLSearchParams({ attr, lastN: String(lastN) });
  if (host) parametros.set("host", host);
  return requisitar(`/api/dragon/historico?${parametros.toString()}`);
}