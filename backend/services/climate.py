"""
climate.py
==========

Núcleo de lógica do PRADO em Python puro.

Este módulo recebe os dados climáticos brutos da API Open-Meteo (uma
grande lista de valores por hora) e transforma tudo em:

1. Uma "leitura" resumida (médias, somas e máximos das próximas horas).
2. Indicadores agronômicos com níveis de atenção (irrigação, fungos,
   pulverização, solo e radiação).
3. Alertas práticos quando alguma condição exige cuidado.

Conceitos da disciplina aplicados aqui:

- Variáveis e tipos de dados.
- Estruturas de controle: ``if/elif/else``.
- Manipulação de listas: filtragem, soma e iteração de valores horários.
- Funções com parâmetros e retorno de valores.
- Estruturas de dados: listas, tuplas e dicionários.

Observação importante: as chaves do dicionário de leitura usam o mesmo
nome (em inglês, ``camelCase``) que o front-end já espera. Isso garante
que a interface continue funcionando exatamente igual, apenas trocando a
origem dos dados (antes a API direto, agora o nosso backend).
"""

from datetime import datetime

# Parâmetros horários que pedimos para a Open-Meteo. Mantê-los em uma
# tupla deixa claro que essa lista é fixa e não deve ser alterada em
# tempo de execução.
PARAMETROS_HORARIOS = (
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "apparent_temperature",
    "precipitation_probability",
    "precipitation",
    "cloud_cover",
    "surface_pressure",
    "wind_speed_10m",
    "wind_gusts_10m",
    "direct_radiation",
    "evapotranspiration",
    "vapour_pressure_deficit",
    "soil_temperature_0cm",
    "soil_temperature_6cm",
    "soil_moisture_0_to_1cm",
    "soil_moisture_1_to_3cm",
    "soil_moisture_3_to_9cm",
)


# ---------------------------------------------------------------------------
# Funções auxiliares de cálculo (operam sobre listas de números)
# ---------------------------------------------------------------------------
def _numeros_validos(valores):
    """Filtra uma lista mantendo apenas números reais (descarta None/NaN).

    A API às vezes devolve ``null`` em algumas posições. Esta função
    percorre a lista e devolve uma nova lista só com valores numéricos
    utilizáveis.
    """
    validos = []
    for valor in valores or []:
        if isinstance(valor, (int, float)) and not _e_nan(valor):
            validos.append(valor)
    return validos


def _e_nan(valor):
    """Detecta NaN (Not a Number) sem depender de bibliotecas externas."""
    return valor != valor  # NaN é o único valor diferente de si mesmo.


def media(valores):
    """Calcula a média aritmética dos valores válidos. Retorna 0 se vazio."""
    validos = _numeros_validos(valores)
    if not validos:
        return 0
    return sum(validos) / len(validos)


def soma(valores):
    """Soma todos os valores válidos de uma lista."""
    return sum(_numeros_validos(valores))


def maximo(valores):
    """Devolve o maior valor válido de uma lista. Retorna 0 se vazio."""
    validos = _numeros_validos(valores)
    return max(validos) if validos else 0


def limitar(valor, minimo=0.0, maximo_valor=1.0):
    """Garante que um número fique dentro de um intervalo [min, max]."""
    return min(max(valor, minimo), maximo_valor)


def graus_dia(temperaturas, base=10):
    """Calcula os graus-dia de desenvolvimento (GDD) para 24 horas.

    Para cada temperatura horária, acumula o quanto ela passou da
    temperatura base (sem contar valores negativos) e divide por 24 para
    obter a média diária. É um indicador clássico do ritmo de
    crescimento das culturas.
    """
    validos = _numeros_validos(temperaturas)
    if not validos:
        return 0
    acumulado = 0
    for temperatura in validos:
        acumulado += max(temperatura - base, 0)
    return acumulado / 24


# ---------------------------------------------------------------------------
# Construção da leitura resumida
# ---------------------------------------------------------------------------
def construir_leitura(payload):
    """Transforma a resposta bruta da Open-Meteo em uma leitura resumida.

    Parâmetros:
        payload (dict): JSON retornado pela API, contendo a chave
            ``hourly`` com as listas de cada variável.

    Retorna:
        dict: leitura com médias, somas e máximos prontos para a interface.
    """
    horario = payload.get("hourly", {}) if isinstance(payload, dict) else {}

    temperaturas = horario.get("temperature_2m", [])

    return {
        "source": "Open-Meteo",
        "updatedAt": datetime.now().strftime("%H:%M"),
        "temperature": media(temperaturas),
        "humidity": media(horario.get("relative_humidity_2m")),
        "precipitation": soma(horario.get("precipitation")),
        "rainProbability": maximo(horario.get("precipitation_probability")),
        "wind": media(horario.get("wind_speed_10m")),
        "gust": maximo(horario.get("wind_gusts_10m")),
        "apparentTemperature": media(horario.get("apparent_temperature")),
        "dewPoint": media(horario.get("dew_point_2m")),
        "cloudCover": media(horario.get("cloud_cover")),
        "pressure": media(horario.get("surface_pressure")),
        "soilMoisture": media(horario.get("soil_moisture_0_to_1cm")),
        "soilMoisture1to3": media(horario.get("soil_moisture_1_to_3cm")),
        "soilMoisture3to9": media(horario.get("soil_moisture_3_to_9cm")),
        "soilTemperature": media(horario.get("soil_temperature_0cm")),
        "soilTemperature6": media(horario.get("soil_temperature_6cm")),
        "evapotranspiration": soma(horario.get("evapotranspiration")),
        "vapourPressureDeficit": media(horario.get("vapour_pressure_deficit")),
        "radiation": media(horario.get("direct_radiation")),
        "growingDegreeDays": graus_dia(temperaturas),
    }


# Leitura de demonstração usada quando a API externa não responde. Mantém
# o sistema utilizável mesmo offline, com valores plausíveis.
LEITURA_DEMONSTRACAO = {
    "source": "Demonstração local",
    "updatedAt": "Sem conexão com a API",
    "temperature": 27,
    "humidity": 74,
    "precipitation": 0.8,
    "rainProbability": 42,
    "wind": 11,
    "gust": 18,
    "apparentTemperature": 29,
    "dewPoint": 22,
    "cloudCover": 48,
    "pressure": 1014,
    "soilMoisture": 0.21,
    "soilMoisture1to3": 0.24,
    "soilMoisture3to9": 0.28,
    "soilTemperature": 24,
    "soilTemperature6": 23,
    "evapotranspiration": 1.9,
    "vapourPressureDeficit": 1.15,
    "radiation": 390,
    "growingDegreeDays": 17,
}


# ---------------------------------------------------------------------------
# Cálculo dos níveis de atenção (lógica agronômica)
# ---------------------------------------------------------------------------
def nivel_irrigacao(leitura):
    """Define a necessidade de irrigação a partir do solo e da demanda hídrica."""
    if (
        leitura["soilMoisture"] < 0.18
        or leitura["vapourPressureDeficit"] > 1.6
        or leitura["evapotranspiration"] > 3
    ):
        return "alto"
    if leitura["soilMoisture"] < 0.25 or leitura["vapourPressureDeficit"] > 1.1:
        return "moderado"
    return "baixo"


def nivel_fungos(leitura):
    """Estima o risco de proliferação de fungos pela umidade e temperatura."""
    if (
        leitura["humidity"] >= 82
        and 18 <= leitura["temperature"] <= 29
        and leitura["precipitation"] > 1
    ):
        return "alto"
    if leitura["humidity"] >= 70 and 16 <= leitura["temperature"] <= 31:
        return "moderado"
    return "baixo"


def nivel_pulverizacao(leitura):
    """Avalia a janela de pulverização com base em vento, rajadas e chuva."""
    if (
        leitura["wind"] > 15
        or leitura["gust"] > 28
        or leitura["precipitation"] > 1
    ):
        return "evitar"
    if leitura["wind"] > 10 or leitura["rainProbability"] > 45:
        return "atencao"
    return "seguro"


def nivel_solo(leitura):
    """Classifica a condição da camada superficial do solo."""
    if leitura["soilMoisture"] < 0.18:
        return "seco"
    if leitura["soilMoisture"] > 0.33:
        return "umido"
    return "estavel"


def nivel_radiacao(leitura):
    """Classifica a radiação solar direta disponível."""
    if leitura["radiation"] >= 520:
        return "alto"
    if leitura["radiation"] >= 260:
        return "moderado"
    return "baixo"


def calcular_indicadores(leitura):
    """Reúne todos os níveis de atenção em um único dicionário.

    Retorna um dicionário no formato ``{ "irrigation": "alto", ... }``.
    """
    return {
        "irrigation": nivel_irrigacao(leitura),
        "fungus": nivel_fungos(leitura),
        "spray": nivel_pulverizacao(leitura),
        "soil": nivel_solo(leitura),
        "radiation": nivel_radiacao(leitura),
    }


# ---------------------------------------------------------------------------
# Geração de alertas
# ---------------------------------------------------------------------------
# Mensagens associadas a cada combinação de indicador e nível crítico.
# Usar um dicionário deixa a regra de negócio organizada e fácil de ampliar.
MENSAGENS_ALERTA = {
    ("irrigation", "alto"): "Necessidade alta de irrigação nas próximas horas.",
    ("fungus", "alto"): "Risco alto de fungos: observe as folhas e evite excesso de água.",
    ("spray", "evitar"): "Condições desfavoráveis para pulverização: melhor aguardar.",
    ("soil", "seco"): "Solo seco na camada superficial: atenção hídrica.",
    ("radiation", "alto"): "Radiação solar alta: maior demanda hídrica esperada.",
}


def gerar_alertas(indicadores):
    """Monta a lista de alertas a partir dos indicadores calculados.

    Apenas as situações realmente críticas viram alerta. Cada alerta é um
    dicionário com tipo, nível e mensagem.

    Parâmetros:
        indicadores (dict): saída de ``calcular_indicadores``.

    Retorna:
        list: lista de alertas (pode ser vazia).
    """
    alertas = []
    for (tipo, nivel), mensagem in MENSAGENS_ALERTA.items():
        if indicadores.get(tipo) == nivel:
            alertas.append({"tipo": tipo, "nivel": nivel, "mensagem": mensagem})
    return alertas
