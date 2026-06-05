"""
main.py
=======

Aplicação principal do backend PRADO (FastAPI).

Este arquivo expõe a API REST consumida pelo front-end React. Ele atua
como uma ponte entre a interface e o mundo externo:

- Faz o cadastro e o login simples dos usuários (cada um com seu JSON).
- Consulta as APIs de clima por baixo dos panos (proxy), de modo que as
  chaves de acesso e a complexidade fiquem no servidor, não no navegador.
- Processa os dados com o módulo ``climate`` e guarda histórico,
  favoritos e alertas de cada usuário com o módulo ``storage``.

Para rodar:

    uvicorn main:app --reload

A API sobe por padrão em http://localhost:8000.
"""

import os
import uuid

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services import climate, storage

# ---------------------------------------------------------------------------
# Configuração inicial
# ---------------------------------------------------------------------------
# Carrega as variáveis do arquivo .env (se existir) para o ambiente.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Chave da OpenWeatherMap. Fica no servidor, fora do código do front-end.
# Defina OPENWEATHER_API_KEY no arquivo .env local.
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# URLs das APIs externas usadas pelo backend.
URL_OPEN_METEO = "https://api.open-meteo.com/v1/forecast"
URL_OPENWEATHER_ATUAL = "https://api.openweathermap.org/data/2.5/weather"
URL_OPENWEATHER_TILE = "https://tile.openweathermap.org/map"

# Camadas de mapa que o front-end pode pedir, traduzidas para os nomes
# que a OpenWeatherMap entende.
CAMADAS_MAPA = {
    "chuva": "precipitation_new",
    "nuvens": "clouds_new",
}

# Garante que as pastas e o arquivo de usuários existam ao iniciar.
storage.garantir_estrutura()

app = FastAPI(title="PRADO API", version="1.0.0")

# Libera o acesso a partir do front-end rodando em outra porta (Vite).
# Em um projeto acadêmico, liberar todas as origens simplifica o uso.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Modelos de entrada (validação automática pelo Pydantic)
# ---------------------------------------------------------------------------
class DadosCadastro(BaseModel):
    """Dados enviados no cadastro de um novo usuário."""

    nome: str
    email: str
    senha: str


class DadosLogin(BaseModel):
    """Dados enviados no login."""

    email: str
    senha: str


# ---------------------------------------------------------------------------
# Função auxiliar de autenticação
# ---------------------------------------------------------------------------
def usuario_do_token(token):
    """Devolve o usuário dono de um token, ou ``None`` se o token for inválido.

    Diferente de uma exceção, aqui retornamos ``None`` para que os
    endpoints de clima possam funcionar mesmo sem login (apenas sem salvar
    dados pessoais).
    """
    return storage.buscar_usuario_por_token(token)


def exigir_usuario(token):
    """Versão que obriga login: levanta erro 401 se o token for inválido.

    Usada nos endpoints de dados pessoais (histórico, favoritos, alertas).
    """
    usuario = usuario_do_token(token)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    return usuario


# ---------------------------------------------------------------------------
# Rotas básicas
# ---------------------------------------------------------------------------
@app.get("/")
def raiz():
    """Endpoint simples para confirmar que a API está no ar."""
    return {
        "aplicacao": "PRADO API",
        "status": "online",
        "documentacao": "/docs",
    }


# ---------------------------------------------------------------------------
# Autenticação
# ---------------------------------------------------------------------------
@app.post("/api/cadastro")
def cadastrar(dados: DadosCadastro):
    """Cadastra um novo usuário.

    Valida os campos, verifica se o e-mail já existe e cria o arquivo de
    dados individual. Retorna o token de sessão para já deixar o usuário
    logado.
    """
    nome = dados.nome.strip()
    email = dados.email.strip().lower()
    senha = dados.senha

    # Validações simples de preenchimento.
    if not nome or not email or not senha:
        raise HTTPException(status_code=400, detail="Preencha nome, e-mail e senha.")

    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Informe um e-mail válido.")

    if len(senha) < 4:
        raise HTTPException(
            status_code=400, detail="A senha deve ter pelo menos 4 caracteres."
        )

    # Impede cadastro duplicado.
    if storage.buscar_usuario_por_email(email) is not None:
        raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado.")

    token = uuid.uuid4().hex
    usuario = storage.adicionar_usuario(nome, email, senha, token)

    return {
        "token": usuario["token"],
        "nome": usuario["nome"],
        "email": usuario["email"],
    }


@app.post("/api/login")
def login(dados: DadosLogin):
    """Autentica um usuário existente e renova o token de sessão."""
    email = dados.email.strip().lower()
    senha = dados.senha

    usuario = storage.buscar_usuario_por_email(email)
    if usuario is None or usuario.get("senha") != senha:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # Gera um novo token a cada login.
    token = uuid.uuid4().hex
    storage.atualizar_token(email, token)

    return {
        "token": token,
        "nome": usuario["nome"],
        "email": usuario["email"],
    }


# ---------------------------------------------------------------------------
# Clima (proxy + processamento + persistência)
# ---------------------------------------------------------------------------
@app.get("/api/clima")
def consultar_clima(
    lat: float = Query(..., description="Latitude da área"),
    lon: float = Query(..., description="Longitude da área"),
    local: str = Query("Área selecionada", description="Nome amigável do local"),
    token: str = Query("", description="Token de sessão (opcional)"),
):
    """Consulta a previsão para uma coordenada e devolve a leitura processada.

    Fluxo completo:
        1. Monta a requisição e chama a API Open-Meteo (proxy).
        2. Processa a resposta com ``climate.construir_leitura``.
        3. Calcula os indicadores agronômicos e os alertas.
        4. Se houver um usuário logado, salva histórico, favorito e alertas.
        5. Retorna a leitura no mesmo formato esperado pela interface.

    Em caso de falha na API externa, devolve uma leitura de demonstração,
    para que a interface nunca fique quebrada.
    """
    parametros = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(climate.PARAMETROS_HORARIOS),
        "forecast_hours": 24,
        "timezone": "auto",
    }

    try:
        resposta = requests.get(URL_OPEN_METEO, params=parametros, timeout=12)
        resposta.raise_for_status()
        payload = resposta.json()
        leitura = climate.construir_leitura(payload)
        origem = "online"
    except (requests.RequestException, ValueError):
        # Sem internet ou resposta inválida: usa dados de demonstração.
        leitura = dict(climate.LEITURA_DEMONSTRACAO)
        origem = "demonstracao"

    # Calcula os níveis de atenção e os alertas a partir da leitura.
    indicadores = climate.calcular_indicadores(leitura)
    alertas = climate.gerar_alertas(indicadores)

    # Se o usuário estiver logado, persiste os dados dele.
    usuario = usuario_do_token(token)
    if usuario is not None:
        email = usuario["email"]
        storage.registrar_consulta(email, local, lat, lon, leitura)
        storage.registrar_favorito_automatico(email, local, lat, lon)
        storage.registrar_alertas(email, local, alertas, lat, lon)

    return {
        "leitura": leitura,
        "indicadores": indicadores,
        "alertas": alertas,
        "origem": origem,
    }


@app.get("/api/clima-atual")
def clima_atual(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Devolve o clima atual de um ponto (proxy da OpenWeatherMap).

    Retorna um objeto simplificado e já em português, escondendo a chave
    de API e o formato original da OpenWeatherMap do front-end.
    """
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500, detail="OPENWEATHER_API_KEY nao configurada no backend."
        )

    parametros = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "lang": "pt_br",
        "appid": OPENWEATHER_API_KEY,
    }

    try:
        resposta = requests.get(URL_OPENWEATHER_ATUAL, params=parametros, timeout=12)
        resposta.raise_for_status()
        dados = resposta.json()

        clima = dados.get("weather", [{}])[0]
        principal = dados.get("main", {})
        vento = dados.get("wind", {})

        return {
            "temperatura": round(principal.get("temp", 0)),
            "descricao": clima.get("description", ""),
            "icone": clima.get("icon", "01d"),
            "umidade": principal.get("humidity", 0),
            "vento": round(vento.get("speed", 0)),
        }
    except (requests.RequestException, ValueError):
        raise HTTPException(
            status_code=502, detail="Não foi possível obter o clima atual."
        )


@app.get("/api/mapa/{camada}/{z}/{x}/{y}.png")
def proxy_tile(camada: str, z: int, x: int, y: int):
    """Repassa as imagens (tiles) das camadas de clima do mapa.

    O navegador pede cada quadradinho do mapa a este endpoint, que busca a
    imagem na OpenWeatherMap usando a chave guardada no servidor. Assim a
    chave nunca aparece no código do front-end.
    """
    nome_camada = CAMADAS_MAPA.get(camada)
    if nome_camada is None:
        raise HTTPException(status_code=404, detail="Camada de mapa desconhecida.")
    if not OPENWEATHER_API_KEY:
        return Response(status_code=204)

    url = f"{URL_OPENWEATHER_TILE}/{nome_camada}/{z}/{x}/{y}.png"
    parametros = {"appid": OPENWEATHER_API_KEY}

    try:
        resposta = requests.get(url, params=parametros, timeout=12)
        resposta.raise_for_status()
        return Response(content=resposta.content, media_type="image/png")
    except requests.RequestException:
        # Devolve um conteúdo vazio: o mapa simplesmente não mostra a camada.
        return Response(status_code=204)


# ---------------------------------------------------------------------------
# Dados pessoais: histórico, favoritos e alertas
# ---------------------------------------------------------------------------
@app.get("/api/historico")
def listar_historico(token: str = Query(..., description="Token de sessão")):
    """Lista o histórico de consultas do usuário logado."""
    usuario = exigir_usuario(token)
    dados = storage.carregar_dados_usuario(usuario["email"])
    return {"historico": dados["historico"]}


@app.get("/api/favoritos")
def listar_favoritos(token: str = Query(..., description="Token de sessão")):
    """Lista os locais favoritos (áreas já analisadas) do usuário."""
    usuario = exigir_usuario(token)
    dados = storage.carregar_dados_usuario(usuario["email"])
    return {"favoritos": dados["favoritos"]}


@app.delete("/api/favoritos/{favorito_id}")
def excluir_favorito(
    favorito_id: int,
    token: str = Query(..., description="Token de sessão"),
):
    """Remove um local favorito do usuário pelo seu id."""
    usuario = exigir_usuario(token)
    removeu = storage.remover_favorito(usuario["email"], favorito_id)
    if not removeu:
        raise HTTPException(status_code=404, detail="Favorito não encontrado.")
    return {"removido": True, "id": favorito_id}


@app.get("/api/alertas")
def listar_alertas(token: str = Query(..., description="Token de sessão")):
    """Lista os alertas gerados para o usuário logado."""
    usuario = exigir_usuario(token)
    dados = storage.carregar_dados_usuario(usuario["email"])
    return {"alertas": dados["alertas"]}
