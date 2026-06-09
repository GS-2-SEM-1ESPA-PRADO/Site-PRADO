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
OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")

# URLs das APIs externas usadas pelo backend.
URL_OPEN_METEO: str = "https://api.open-meteo.com/v1/forecast"
URL_OPENWEATHER_ATUAL: str = "https://api.openweathermap.org/data/2.5/weather"
URL_OPENWEATHER_TILE: str = "https://tile.openweathermap.org/map"

# Camadas de mapa que o front-end pode pedir, traduzidas para os nomes
# que a OpenWeatherMap entende.
CAMADAS_MAPA: dict[str, str] = {
    "chuva": "precipitation_new",
    "nuvens": "clouds_new",
}

FIWARE_URL_PADRAO = os.getenv("FIWARE_URL", "")
FIWARE_SERVICE = "smart"
FIWARE_SERVICEPATH = "/"
PORTA_ORION = 1026
PORTA_STH = 8666
DRAGON_ID = "urn:ngsi-ld:Dragon:001"
DRAGON_TYPE = "Dragon"

ATRIBUTOS_DRAGON = (
    "temperature", "pressure", "gas", "heading", "mag_flag",
    "radiation", "propellant", "accel_x", "accel_y", "accel_z",
)

# Garante que as pastas e o arquivo de usuários existam ao iniciar.
storage.garantir_estrutura()

app: FastAPI = FastAPI(title="PRADO API", version="1.0.0")

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
def usuario_do_token(token: str) -> dict | None:
    """Devolve o usuário dono de um token, ou ``None`` se o token for inválido.

    Diferente de uma exceção, aqui retornamos ``None`` para que os
    endpoints de clima possam funcionar mesmo sem login (apenas sem salvar
    dados pessoais).
    """
    return storage.buscar_usuario_por_token(token)


def exigir_usuario(token: str) -> dict:
    """Versão que obriga login: levanta erro 401 se o token for inválido.

    Usada nos endpoints de dados pessoais (histórico, favoritos, alertas).
    """
    usuario: dict | None = usuario_do_token(token)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    return usuario


# ---------------------------------------------------------------------------
# Rotas básicas
# ---------------------------------------------------------------------------
@app.get("/")
def raiz() -> dict:
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
def cadastrar(dados: DadosCadastro) -> dict:
    """Cadastra um novo usuário.

    Valida os campos, verifica se o e-mail já existe e cria o arquivo de
    dados individual. Retorna o token de sessão para já deixar o usuário
    logado.
    """
    nome: str = dados.nome.strip()
    email: str = dados.email.strip().lower()
    senha: str = dados.senha

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

    token: str = uuid.uuid4().hex
    usuario: dict = storage.adicionar_usuario(nome, email, senha, token)

    return {
        "token": usuario["token"],
        "nome": usuario["nome"],
        "email": usuario["email"],
    }


@app.post("/api/login")
def login(dados: DadosLogin) -> dict:
    """Autentica um usuário existente e renova o token de sessão."""
    email: str = dados.email.strip().lower()
    senha: str = dados.senha

    usuario: dict | None = storage.buscar_usuario_por_email(email)
    if usuario is None or usuario.get("senha") != senha:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # Gera um novo token a cada login.
    token: str = uuid.uuid4().hex
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
) -> dict:
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
    parametros: dict = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(climate.PARAMETROS_HORARIOS),
        "forecast_hours": 24,
        "timezone": "auto",
    }

    try:
        resposta: requests.Response = requests.get(URL_OPEN_METEO, params=parametros, timeout=12)
        resposta.raise_for_status()
        payload: dict = resposta.json()
        leitura: dict = climate.construir_leitura(payload)
        origem: str = "online"
    except (requests.RequestException, ValueError):
        # Sem internet ou resposta inválida: usa dados de demonstração.
        leitura = dict(climate.LEITURA_DEMONSTRACAO)
        origem = "demonstracao"

    # Calcula os níveis de atenção e os alertas a partir da leitura.
    indicadores: dict = climate.calcular_indicadores(leitura)
    alertas: list[dict] = climate.gerar_alertas(indicadores)

    # Se o usuário estiver logado, persiste os dados dele.
    usuario: dict | None = usuario_do_token(token)
    if usuario is not None:
        email: str = usuario["email"]
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
) -> dict:
    """Devolve o clima atual de um ponto (proxy da OpenWeatherMap).

    Retorna um objeto simplificado e já em português, escondendo a chave
    de API e o formato original da OpenWeatherMap do front-end.
    """
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500, detail="OPENWEATHER_API_KEY nao configurada no backend."
        )

    parametros: dict = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "lang": "pt_br",
        "appid": OPENWEATHER_API_KEY,
    }

    try:
        resposta: requests.Response = requests.get(URL_OPENWEATHER_ATUAL, params=parametros, timeout=12)
        resposta.raise_for_status()
        dados: dict = resposta.json()

        clima_item: dict = dados.get("weather", [{}])[0]
        principal: dict = dados.get("main", {})
        vento: dict = dados.get("wind", {})

        return {
            "temperatura": round(principal.get("temp", 0)),
            "descricao": clima_item.get("description", ""),
            "icone": clima_item.get("icon", "01d"),
            "umidade": principal.get("humidity", 0),
            "vento": round(vento.get("speed", 0)),
        }
    except (requests.RequestException, ValueError):
        raise HTTPException(
            status_code=502, detail="Não foi possível obter o clima atual."
        )


@app.get("/api/mapa/{camada}/{z}/{x}/{y}.png")
def proxy_tile(camada: str, z: int, x: int, y: int) -> Response:
    """Repassa as imagens (tiles) das camadas de clima do mapa.

    O navegador pede cada quadradinho do mapa a este endpoint, que busca a
    imagem na OpenWeatherMap usando a chave guardada no servidor. Assim a
    chave nunca aparece no código do front-end.
    """
    nome_camada: str | None = CAMADAS_MAPA.get(camada)
    if nome_camada is None:
        raise HTTPException(status_code=404, detail="Camada de mapa desconhecida.")
    if not OPENWEATHER_API_KEY:
        return Response(status_code=204)

    url: str = f"{URL_OPENWEATHER_TILE}/{nome_camada}/{z}/{x}/{y}.png"
    parametros: dict = {"appid": OPENWEATHER_API_KEY}

    try:
        resposta: requests.Response = requests.get(url, params=parametros, timeout=12)
        resposta.raise_for_status()
        return Response(content=resposta.content, media_type="image/png")
    except requests.RequestException:
        # Devolve um conteúdo vazio: o mapa simplesmente não mostra a camada.
        return Response(status_code=204)


# ---------------------------------------------------------------------------
# Dados pessoais: histórico, favoritos e alertas
# ---------------------------------------------------------------------------
@app.get("/api/historico")
def listar_historico(token: str = Query(..., description="Token de sessão")) -> dict:
    """Lista o histórico de consultas do usuário logado."""
    usuario: dict = exigir_usuario(token)
    dados: dict = storage.carregar_dados_usuario(usuario["email"])
    return {"historico": dados["historico"]}


@app.get("/api/favoritos")
def listar_favoritos(token: str = Query(..., description="Token de sessão")) -> dict:
    """Lista os locais favoritos (áreas já analisadas) do usuário."""
    usuario: dict = exigir_usuario(token)
    dados: dict = storage.carregar_dados_usuario(usuario["email"])
    return {"favoritos": dados["favoritos"]}


@app.delete("/api/favoritos/{favorito_id}")
def excluir_favorito(
    favorito_id: int,
    token: str = Query(..., description="Token de sessão"),
) -> dict:
    """Remove um local favorito do usuário pelo seu id."""
    usuario: dict = exigir_usuario(token)
    removeu: bool = storage.remover_favorito(usuario["email"], favorito_id)
    if not removeu:
        raise HTTPException(status_code=404, detail="Favorito não encontrado.")
    return {"removido": True, "id": favorito_id}


@app.get("/api/alertas")
def listar_alertas(token: str = Query(..., description="Token de sessão")) -> dict:
    """Lista os alertas gerados para o usuário logado."""
    usuario: dict = exigir_usuario(token)
    dados: dict = storage.carregar_dados_usuario(usuario["email"])
    return {"alertas": dados["alertas"]}

def _resolver_host_fiware(host):
    """Usa o IP digitado na página; se vazio, cai no valor do .env."""
    endereco = (host or "").strip() or FIWARE_URL_PADRAO
    if not endereco:
        raise HTTPException(
            status_code=400,
            detail="Informe o IP da VM do FIWARE (na página ou no arquivo .env).",
        )
    return endereco


@app.get("/api/dragon/atual")
def dragon_atual(host: str = Query("", description="IP da VM do FIWARE (opcional)")):
    """Lê o estado atual da cápsula no Orion Context Broker (proxy)."""
    endereco = _resolver_host_fiware(host)
    url = f"http://{endereco}:{PORTA_ORION}/v2/entities/{DRAGON_ID}"
    cabecalhos = {
        "fiware-service": FIWARE_SERVICE,
        "fiware-servicepath": FIWARE_SERVICEPATH,
    }
    try:
        resposta = requests.get(url, headers=cabecalhos, timeout=8)
        resposta.raise_for_status()
        dados = resposta.json()
    except (requests.RequestException, ValueError):
        raise HTTPException(
            status_code=502,
            detail="Não foi possível ler a telemetria. Verifique o IP e se a VM está ativa.",
        )
    valores = {}
    for atributo in ATRIBUTOS_DRAGON:
        campo = dados.get(atributo)
        valores[atributo] = campo.get("value") if isinstance(campo, dict) else None
    return {"entidade": DRAGON_ID, "valores": valores}


@app.get("/api/dragon/historico")
def dragon_historico(
    attr: str = Query(..., description="Nome do atributo (ex.: temperature)"),
    host: str = Query("", description="IP da VM do FIWARE (opcional)"),
    lastN: int = Query(30, ge=1, le=100, description="Quantos pontos retornar"),
):
    """Lê o histórico de um sensor no STH-Comet (proxy)."""
    if attr not in ATRIBUTOS_DRAGON:
        raise HTTPException(status_code=404, detail="Atributo desconhecido.")
    endereco = _resolver_host_fiware(host)
    url = (
        f"http://{endereco}:{PORTA_STH}/STH/v1/contextEntities"
        f"/type/{DRAGON_TYPE}/id/{DRAGON_ID}/attributes/{attr}"
    )
    cabecalhos = {
        "fiware-service": FIWARE_SERVICE,
        "fiware-servicepath": FIWARE_SERVICEPATH,
    }
    try:
        resposta = requests.get(url, headers=cabecalhos, params={"lastN": lastN}, timeout=8)
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível ler o histórico. Verifique o IP e se a VM está ativa.",
        )
    if resposta.status_code == 404:
        return {"attr": attr, "pontos": []}
    try:
        dados = resposta.json()
        valores = dados["contextResponses"][0]["contextElement"]["attributes"][0]["values"]
    except (ValueError, KeyError, IndexError, TypeError):
        return {"attr": attr, "pontos": []}
    pontos = []
    for item in valores:
        if isinstance(item, dict):
            pontos.append({"tempo": item.get("recvTime"), "valor": item.get("attrValue")})
    return {"attr": attr, "pontos": pontos}