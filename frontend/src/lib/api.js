// api.js
// =============================================================================
// Ponto único de comunicação entre o front-end e o backend PRADO.
//
// Todas as chamadas de rede passam por aqui. Os componentes nunca falam
// diretamente com APIs externas: eles pedem ao backend, que faz o trabalho
// pesado e devolve dados já prontos. Este arquivo também cuida da "sessão"
// do usuário (login), guardando os dados no localStorage do navegador.
// =============================================================================

// Endereço onde o backend (uvicorn) está rodando localmente.
// Caso você rode o backend em outra porta/máquina, basta alterar aqui.
const API_URL = "http://localhost:8000";

// Chave usada para guardar os dados do usuário logado no navegador.
const CHAVE_SESSAO = "prado_usuario";

// -----------------------------------------------------------------------------
// Sessão do usuário (persistida no localStorage)
// -----------------------------------------------------------------------------

// Avisa o restante da aplicação (ex.: o cabeçalho) que o login mudou,
// para que a interface se atualize sem precisar recarregar a página.
function avisarMudancaDeSessao() {
  window.dispatchEvent(new Event("prado-sessao"));
}

// Salva os dados do usuário logado (nome, e-mail e token).
export function salvarSessao(usuario) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
  avisarMudancaDeSessao();
}

// Recupera o usuário logado, ou null se ninguém estiver logado.
export function obterUsuario() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// Indica se há um usuário logado no momento.
export function estaLogado() {
  const usuario = obterUsuario();
  return Boolean(usuario && usuario.token);
}

// Devolve apenas o token do usuário logado (string vazia se não houver).
export function obterToken() {
  const usuario = obterUsuario();
  return usuario && usuario.token ? usuario.token : "";
}

// Encerra a sessão (logout).
export function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  avisarMudancaDeSessao();
}

// -----------------------------------------------------------------------------
// Função genérica de requisição
// -----------------------------------------------------------------------------
// Centraliza o tratamento de erro: se o backend responder com erro, lançamos
// uma exceção já com a mensagem amigável vinda do servidor.
async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);

  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    // Algumas respostas (ex.: erro 204) não têm corpo JSON: seguimos com null.
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

// Cadastra um novo usuário e já deixa a sessão salva.
export async function cadastrar(nome, email, senha) {
  const usuario = await requisitar("/api/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  salvarSessao(usuario);
  return usuario;
}

// Faz login de um usuário existente e salva a sessão.
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

// Busca a previsão processada para uma coordenada. O backend já devolve a
// leitura no formato que o dashboard usa. Se houver usuário logado, o token
// é enviado para que a consulta seja salva no histórico dele.
export async function buscarClima(lat, lon, local = "Área selecionada") {
  const parametros = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    local,
    token: obterToken(),
  });
  return requisitar(`/api/clima?${parametros.toString()}`);
}

// Busca o clima atual de um ponto (usado no card do mapa).
export async function buscarClimaAtual(lat, lon) {
  const parametros = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  return requisitar(`/api/clima-atual?${parametros.toString()}`);
}

// Monta a URL de tiles (imagens) de uma camada do mapa servida pelo backend.
// O Leaflet substitui {z}/{x}/{y} automaticamente ao carregar o mapa.
export function urlTileMapa(camada) {
  return `${API_URL}/api/mapa/${camada}/{z}/{x}/{y}.png`;
}

// -----------------------------------------------------------------------------
// Dados pessoais do usuário (exigem login)
// -----------------------------------------------------------------------------

// Lista o histórico de consultas do usuário logado.
export async function buscarHistorico() {
  const parametros = new URLSearchParams({ token: obterToken() });
  const dados = await requisitar(`/api/historico?${parametros.toString()}`);
  return dados.historico;
}

// Lista os locais favoritos (áreas já analisadas) do usuário.
export async function buscarFavoritos() {
  const parametros = new URLSearchParams({ token: obterToken() });
  const dados = await requisitar(`/api/favoritos?${parametros.toString()}`);
  return dados.favoritos;
}

// Remove um favorito pelo id.
export async function removerFavorito(id) {
  const parametros = new URLSearchParams({ token: obterToken() });
  return requisitar(`/api/favoritos/${id}?${parametros.toString()}`, {
    method: "DELETE",
  });
}

// Lista os alertas gerados para o usuário logado.
export async function buscarAlertas() {
  const parametros = new URLSearchParams({ token: obterToken() });
  const dados = await requisitar(`/api/alertas?${parametros.toString()}`);
  return dados.alertas;
}

// Telemetria da cápsula Dragon (página Edge).
// O parâmetro "host" é o IP da VM; vazio = backend usa o do .env.
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