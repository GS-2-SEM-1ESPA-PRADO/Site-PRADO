"""
storage.py
==========

Camada de persistência do PRADO.

Este módulo concentra toda a manipulação de arquivos do projeto. Em vez
de um banco de dados SQL, o sistema utiliza arquivos JSON como forma
simples e transparente de guardar informações: um arquivo central com a
lista de usuários e um arquivo individual por usuário com o seu
histórico de consultas, locais favoritos e alertas gerados.

Conceitos da disciplina aplicados aqui:

- Manipulação de arquivos: abrir, ler, escrever e fechar arquivos JSON.
- Tratamento de exceções: toda leitura/escrita é protegida para que um
  arquivo inexistente, vazio ou corrompido nunca derrube o servidor.
- Estruturas de dados: os dados são organizados em dicionários e listas.
- Funções com parâmetros e retorno: cada operação é uma função isolada.
"""

import json
import os
import re
from datetime import datetime

# ---------------------------------------------------------------------------
# Caminhos base
# ---------------------------------------------------------------------------
# Calculamos os caminhos a partir da localização deste arquivo, assim o
# backend funciona independentemente de onde o terminal foi aberto.

PASTA_BASE: str = os.path.dirname(os.path.abspath(__file__))          # .../backend/services
PASTA_BACKEND: str = os.path.dirname(PASTA_BASE)                       # .../backend
PASTA_DADOS: str = os.path.join(PASTA_BACKEND, "data")                # .../backend/data
PASTA_USUARIOS: str = os.path.join(PASTA_DADOS, "usuarios")           # .../backend/data/usuarios
ARQUIVO_USUARIOS: str = os.path.join(PASTA_DADOS, "users.json")       # .../backend/data/users.json

# Limites para evitar que os arquivos cresçam sem controle.
LIMITE_HISTORICO: int = 50
LIMITE_ALERTAS: int = 50


# ---------------------------------------------------------------------------
# Utilidades genéricas de arquivo
# ---------------------------------------------------------------------------
def garantir_estrutura() -> None:
    """Cria as pastas e o arquivo de usuários caso ainda não existam.

    É chamada uma vez quando o servidor sobe. Usa ``exist_ok`` para não
    gerar erro se as pastas já existirem.
    """
    try:
        os.makedirs(PASTA_USUARIOS, exist_ok=True)
        if not os.path.exists(ARQUIVO_USUARIOS):
            salvar_json(ARQUIVO_USUARIOS, [])
    except OSError as erro:
        # Se nem a estrutura conseguimos criar, é um erro grave de ambiente.
        print(f"[storage] Falha ao preparar a estrutura de dados: {erro}")


def carregar_json(caminho: str, padrao: list | dict) -> list | dict:
    """Lê um arquivo JSON e devolve o conteúdo.

    Parâmetros:
        caminho (str): caminho completo do arquivo.
        padrao: valor retornado caso o arquivo não exista ou esteja
            inválido (normalmente ``[]`` ou ``{}``).

    Retorna:
        O conteúdo do arquivo já convertido em objeto Python, ou o valor
        ``padrao`` em caso de qualquer problema de leitura.
    """
    if not os.path.exists(caminho):
        return padrao

    try:
        with open(caminho, "r", encoding="utf-8") as arquivo:
            conteudo: str = arquivo.read().strip()
            if not conteudo:
                # Arquivo existe mas está vazio.
                return padrao
            return json.loads(conteudo)
    except (json.JSONDecodeError, ValueError):
        # Arquivo corrompido ou com JSON inválido: não derruba o sistema.
        print(f"[storage] Arquivo com JSON inválido, usando padrão: {caminho}")
        return padrao
    except OSError as erro:
        print(f"[storage] Erro ao ler o arquivo {caminho}: {erro}")
        return padrao


def salvar_json(caminho: str, dados: list | dict) -> bool:
    """Grava um objeto Python em um arquivo JSON.

    Parâmetros:
        caminho (str): caminho completo do arquivo.
        dados: objeto Python (lista ou dicionário) a ser salvo.

    Retorna:
        bool: ``True`` se gravou com sucesso, ``False`` caso contrário.
    """
    try:
        # Garante que a pasta de destino existe antes de escrever.
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, "w", encoding="utf-8") as arquivo:
            json.dump(dados, arquivo, ensure_ascii=False, indent=2)
        return True
    except (OSError, TypeError) as erro:
        print(f"[storage] Erro ao salvar o arquivo {caminho}: {erro}")
        return False


# ---------------------------------------------------------------------------
# Usuários
# ---------------------------------------------------------------------------
def carregar_usuarios() -> list:
    """Retorna a lista de todos os usuários cadastrados."""
    return carregar_json(ARQUIVO_USUARIOS, [])


def salvar_usuarios(usuarios: list) -> bool:
    """Salva a lista completa de usuários."""
    return salvar_json(ARQUIVO_USUARIOS, usuarios)


def buscar_usuario_por_email(email: str) -> dict | None:
    """Procura um usuário pelo e-mail (sem diferenciar maiúsculas).

    Retorna o dicionário do usuário ou ``None`` se não encontrar.
    """
    email = (email or "").strip().lower()
    for usuario in carregar_usuarios():
        if usuario.get("email", "").lower() == email:
            return usuario
    return None


def buscar_usuario_por_token(token: str) -> dict | None:
    """Procura um usuário a partir do seu token de sessão.

    Retorna o dicionário do usuário ou ``None`` se o token for inválido.
    """
    if not token:
        return None
    for usuario in carregar_usuarios():
        if usuario.get("token") == token:
            return usuario
    return None


def adicionar_usuario(nome: str, email: str, senha: str, token: str) -> dict:
    """Adiciona um novo usuário ao arquivo central e cria o arquivo de dados dele.

    Retorna o dicionário do usuário criado.
    """
    usuarios: list = carregar_usuarios()
    novo: dict = {
        "nome": nome.strip(),
        "email": email.strip().lower(),
        "senha": senha,  # Projeto acadêmico: senha simples, sem criptografia.
        "token": token,
        "criado_em": datetime.now().isoformat(timespec="seconds"),
    }
    usuarios.append(novo)
    salvar_usuarios(usuarios)

    # Cria o arquivo de dados individual já com a estrutura vazia.
    salvar_dados_usuario(
        novo["email"],
        {
            "email": novo["email"],
            "nome": novo["nome"],
            "historico": [],
            "favoritos": [],
            "alertas": [],
        },
    )
    return novo


def atualizar_token(email: str, token: str) -> bool:
    """Atualiza (ou renova) o token de sessão de um usuário no login."""
    usuarios: list = carregar_usuarios()
    for usuario in usuarios:
        if usuario.get("email", "").lower() == email.strip().lower():
            usuario["token"] = token
            salvar_usuarios(usuarios)
            return True
    return False


# ---------------------------------------------------------------------------
# Dados individuais de cada usuário
# ---------------------------------------------------------------------------
def _nome_arquivo_email(email: str) -> str:
    """Converte um e-mail em um nome de arquivo seguro.

    Exemplo: ``joao@gmail.com`` vira ``joao_gmail_com.json``. Qualquer
    caractere que não seja letra, número ou ``_`` é trocado por ``_``.
    """
    seguro: str = re.sub(r"[^a-z0-9]+", "_", (email or "").strip().lower())
    seguro = seguro.strip("_") or "anonimo"
    return f"{seguro}.json"


def caminho_dados_usuario(email: str) -> str:
    """Devolve o caminho completo do arquivo JSON de um usuário."""
    return os.path.join(PASTA_USUARIOS, _nome_arquivo_email(email))


def carregar_dados_usuario(email: str) -> dict:
    """Carrega o arquivo de dados de um usuário.

    Se o arquivo não existir, devolve uma estrutura vazia padrão, de modo
    que o restante do código sempre receba as chaves esperadas.
    """
    padrao: dict = {
        "email": (email or "").strip().lower(),
        "nome": "",
        "historico": [],
        "favoritos": [],
        "alertas": [],
    }
    dados: dict = carregar_json(caminho_dados_usuario(email), padrao)

    # Garante que todas as chaves existam mesmo em arquivos antigos.
    for chave in ("historico", "favoritos", "alertas"):
        if chave not in dados or not isinstance(dados[chave], list):
            dados[chave] = []
    return dados


def salvar_dados_usuario(email: str, dados: dict) -> bool:
    """Salva o arquivo de dados completo de um usuário."""
    return salvar_json(caminho_dados_usuario(email), dados)


# ---------------------------------------------------------------------------
# Operações de alto nível: histórico, favoritos e alertas
# ---------------------------------------------------------------------------
def _proximo_id(lista: list) -> int:
    """Calcula um id sequencial simples para uma lista de itens.

    Procura o maior id existente e soma 1. Funciona mesmo com a lista
    vazia (retorna 1).
    """
    maior: int = 0
    for item in lista:
        try:
            maior = max(maior, int(item.get("id", 0)))
        except (TypeError, ValueError):
            continue
    return maior + 1


def registrar_consulta(email: str, local: str, lat: float, lon: float, leitura: dict) -> dict:
    """Registra uma consulta climática no histórico do usuário.

    Cada registro guarda o local, as coordenadas, a data/hora e um resumo
    da leitura retornada pela API. O histórico é limitado aos registros
    mais recentes para não crescer indefinidamente.
    """
    dados: dict = carregar_dados_usuario(email)

    registro: dict = {
        "id": _proximo_id(dados["historico"]),
        "local": local,
        "lat": round(float(lat), 4),
        "lon": round(float(lon), 4),
        "data_hora": datetime.now().isoformat(timespec="seconds"),
        "resumo": {
            "temperatura": leitura.get("temperature"),
            "umidade": leitura.get("humidity"),
            "precipitacao": leitura.get("precipitation"),
            "vento": leitura.get("wind"),
        },
    }

    # Insere no início (mais recente primeiro) e corta o excedente.
    dados["historico"].insert(0, registro)
    dados["historico"] = dados["historico"][:LIMITE_HISTORICO]

    salvar_dados_usuario(email, dados)
    return registro


def registrar_favorito_automatico(email: str, nome: str, lat: float, lon: float) -> dict | None:
    """Guarda um local analisado na lista de favoritos, sem duplicar.

    Sempre que o usuário analisa uma área, o local é memorizado. Para
    evitar repetição, comparamos o nome e as coordenadas arredondadas: se
    o local já existir, nada é adicionado.

    Retorna o favorito (novo ou já existente) ou ``None`` em caso de erro.
    """
    dados: dict = carregar_dados_usuario(email)
    lat_r: float = round(float(lat), 3)
    lon_r: float = round(float(lon), 3)

    for favorito in dados["favoritos"]:
        mesmo_local: bool = (
            round(float(favorito.get("lat", 0)), 3) == lat_r
            and round(float(favorito.get("lon", 0)), 3) == lon_r
        )
        if mesmo_local:
            return favorito  # Já estava salvo.

    favorito: dict = {
        "id": _proximo_id(dados["favoritos"]),
        "nome": nome,
        "lat": round(float(lat), 4),
        "lon": round(float(lon), 4),
        "adicionado_em": datetime.now().isoformat(timespec="seconds"),
    }
    dados["favoritos"].append(favorito)
    salvar_dados_usuario(email, dados)
    return favorito


def remover_favorito(email: str, favorito_id: int) -> bool:
    """Remove um favorito pelo id. Retorna ``True`` se removeu algo."""
    dados: dict = carregar_dados_usuario(email)
    quantidade_antes: int = len(dados["favoritos"])

    dados["favoritos"] = [
        favorito for favorito in dados["favoritos"]
        if str(favorito.get("id")) != str(favorito_id)
    ]

    removeu: bool = len(dados["favoritos"]) < quantidade_antes
    if removeu:
        salvar_dados_usuario(email, dados)
    return removeu


def registrar_alertas(email: str, local: str, lista_alertas: list[dict], lat: float, lon: float) -> list[dict]:
    """Adiciona alertas relevantes ao usuário, evitando repetição imediata.

    Recebe uma lista de alertas já montados pela camada de clima. Antes de
    salvar, verifica se um alerta idêntico (mesmo tipo, nível e local) já
    foi registrado recentemente; em caso positivo, não duplica.

    Retorna a lista de alertas efetivamente adicionados.
    """
    if not lista_alertas:
        return []

    dados: dict = carregar_dados_usuario(email)
    recentes: list = dados["alertas"][:10]
    adicionados: list[dict] = []

    for alerta in lista_alertas:
        ja_existe: bool = any(
            existente.get("tipo") == alerta.get("tipo")
            and existente.get("nivel") == alerta.get("nivel")
            and existente.get("local") == local
            for existente in recentes
        )
        if ja_existe:
            continue

        registro: dict = {
            "id": _proximo_id(dados["alertas"]),
            "tipo": alerta.get("tipo"),
            "nivel": alerta.get("nivel"),
            "mensagem": alerta.get("mensagem"),
            "local": local,
            "lat": round(float(lat), 4) if lat is not None else None,
            "lon": round(float(lon), 4) if lon is not None else None,
            "data_hora": datetime.now().isoformat(timespec="seconds"),
        }
        dados["alertas"].insert(0, registro)
        adicionados.append(registro)

    if adicionados:
        dados["alertas"] = dados["alertas"][:LIMITE_ALERTAS]
        salvar_dados_usuario(email, dados)

    return adicionados
