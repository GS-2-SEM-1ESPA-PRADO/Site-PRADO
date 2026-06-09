# PRADO — Backend

**Tecnologia que cultiva melhores resultados**

API REST do projeto PRADO, plataforma agroclimática que consulta APIs
externas de clima (Open-Meteo, OpenWeatherMap), processa os dados com
lógica agronômica e os disponibiliza para o front-end React. Escrita em
Python com FastAPI.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Arquitetura da API](#arquitetura-da-api)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Endpoints](#endpoints)
- [Fluxo de uma consulta climática](#fluxo-de-uma-consulta-climática)
- [Módulo de clima](#módulo-de-clima)
- [Módulo de armazenamento](#módulo-de-armazenamento)
- [Estrutura dos dados](#estrutura-dos-dados)
- [Autenticação](#autenticação)
- [Tratamento de erros e fallbacks](#tratamento-de-erros-e-fallbacks)
- [Como rodar](#como-rodar)
- [Considerações técnicas](#considerações-técnicas)

---

## Tecnologias

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| **Python** | 3.12 | Linguagem de programação |
| **FastAPI** | 0.115.6 | Framework web — alta performance, validação automática com Pydantic |
| **Uvicorn** | 0.34.0 | Servidor ASGI para desenvolvimento |
| **Requests** | 2.32.3 | Cliente HTTP para consumir as APIs de clima |
| **python-dotenv** | 1.0.1 | Carregamento de variáveis de ambiente do arquivo `.env` |
| **Pydantic** | (via FastAPI) | Validação de dados de entrada (schemas de requisição) |

---

## Arquitetura da API

O backend segue uma arquitetura de **API REST** simples, sem banco de dados
relacional. Ele atua como:

1. **Proxy reverso**: o front-end nunca chama APIs externas diretamente. As
   chaves de acesso (OpenWeatherMap) ficam no servidor, fora do código
   client-side.

2. **Processador agronômico**: os dados brutos da Open-Meteo (listas de
   valores horários) são transformados em médias, somas, máximos e
   indicadores de risco (irrigação, fungos, pulverização, solo, radiação).

3. **Persistência JSON**: todo dado de usuário (histórico, favoritos,
   alertas) é armazenado em arquivos JSON no diretório `data/`.

### Diagrama simplificado

```
[Front-end React]
       │
       │ HTTP (localhost:8000)
       ▼
┌──────────────────────────────────────────────┐
│              FastAPI (main.py)               │
│                                              │
│  POST /api/cadastro     → storage.py         │
│  POST /api/login        → storage.py         │
│  GET  /api/clima        → climate.py         │
│  GET  /api/clima-atual  → OpenWeatherMap     │
│  GET  /api/mapa/{...}   → OpenWeatherMap     │
│  GET  /api/historico    → storage.py         │
│  GET  /api/favoritos    → storage.py         │
│  DELETE /api/favoritos  → storage.py         │
│  GET  /api/alertas      → storage.py         │
└──────────────────────────────────────────────┘
        │                          │
        ▼                          ▼
┌──────────────┐       ┌──────────────────────┐
│  Open-Meteo  │       │  OpenWeatherMap       │
│  (previsão)  │       │  (clima atual/tiles)  │
└──────────────┘       └──────────────────────┘
```

---

## Estrutura de diretórios

```
backend/
├── main.py                  ← Aplicação FastAPI (endpoints)
├── requirements.txt         ← Dependências Python
├── .env                     ← Chaves de API (não versionado)
├── .env.example             ← Modelo do .env
├── .gitignore
├── services/
│   ├── __init__.py          ← Declaração do pacote
│   ├── climate.py           ← Lógica agronômica (leitura, indicadores, alertas)
│   └── storage.py           ← Persistência em JSON (CRUD de usuários e dados)
└── data/
    ├── users.json           ← Lista de usuários cadastrados
    └── usuarios/            ← Dados individuais por usuário
        ├── .gitkeep
        └── felipe_gmail_com.json  ← Exemplo: histórico, favoritos, alertas
```

---

## Endpoints

### Status

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/` | — | Status da API e link para documentação |

### Autenticação

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `POST` | `/api/cadastro` | — | Cadastro de novo usuário (nome, email, senha) |
| `POST` | `/api/login` | — | Login e geração de token de sessão |

### Clima

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/clima` | Opcional (token) | Previsão 24h processada por coordenada |
| `GET` | `/api/clima-atual` | — | Clima atual de um ponto (proxy OpenWeatherMap) |
| `GET` | `/api/mapa/{camada}/{z}/{x}/{y}.png` | — | Tiles de chuva ou nuvens (proxy OpenWeatherMap) |

### Dados do usuário (exigem token)

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/historico` | Obrigatória | Histórico de consultas do usuário |
| `GET` | `/api/favoritos` | Obrigatória | Locais favoritos do usuário |
| `DELETE` | `/api/favoritos/{id}` | Obrigatória | Remove um favorito pelo ID |
| `GET` | `/api/alertas` | Obrigatória | Alertas gerados para o usuário |

---

## Fluxo de uma consulta climática

### `GET /api/clima?lat=...&lon=...&local=...&token=...`

```
Requisição do front-end
       │
       ▼
main.py: consultar_clima()
       │
       ├── 1. Monta parâmetros: { latitude, longitude, hourly, ... }
       │
       ├── 2. Chama Open-Meteo (requests.get)
       │      URL: https://api.open-meteo.com/v1/forecast
       │      Parâmetros: 18 variáveis horárias (temperatura, umidade,
       │      precipitação, vento, radiação, solo, etc.)
       │
       ├── 3. Se sucesso → climate.construir_leitura(payload)
       │      │
       │      │   Transforma listas horárias em médias/somas/máximos:
       │      │   - temperature  → média das 24h
       │      │   - precipitation → soma acumulada
       │      │   - rainProbability → máximo
       │      │   - growingDegreeDays → GDD (base 10°C)
       │      │   - etc.
       │      │
       │      └── origem = "online"
       │
       ├── 4. Se falha → usa LEITURA_DEMONSTRACAO (dados fixos)
       │      └── origem = "demonstracao"
       │
       ├── 5. climate.calcular_indicadores(leitura)
       │      │
       │      │   Avalia cada indicador:
       │      │   - irrigação: soilMoisture, VPD, evapotranspiração
       │      │   - fungos: umidade, temperatura, precipitação
       │      │   - pulverização: vento, rajadas, precipitação
       │      │   - solo: umidade superficial
       │      │   - radiação: radiação direta
       │      │
       │      └── Retorna { irrigation, fungus, spray, soil, radiation }
       │
       ├── 6. climate.gerar_alertas(indicadores)
       │      │
       │      │   Apenas níveis críticos viram alerta:
       │      │   - irrigation + alto
       │      │   - fungus + alto
       │      │   - spray + evitar
       │      │   - soil + seco
       │      │   - radiation + alto
       │      │
       │      └── Retorna lista de alertas (pode ser vazia)
       │
       ├── 7. Se token válido → storage persiste:
       │      ├── registrar_consulta()     → histórico
       │      ├── registrar_favorito_automatico() → favoritos
       │      └── registrar_alertas()      → alertas
       │
       └── 8. Retorna JSON:
              { leitura, indicadores, alertas, origem }
```

---

## Módulo de clima

**Arquivo:** `services/climate.py`

### Funções auxiliares

| Função | Descrição |
|--------|-----------|
| `_numeros_validos(valores)` | Filtra valores `None` e `NaN` de uma lista |
| `_e_nan(valor)` | Detecta NaN sem dependências externas |
| `media(valores)` | Média aritmética dos valores válidos |
| `soma(valores)` | Soma dos valores válidos |
| `maximo(valores)` | Maior valor válido |
| `limitar(valor, min, max)` | Restringe um número a um intervalo |
| `graus_dia(temperaturas, base)` | Graus-dia de desenvolvimento (GDD) — acumula temperatura acima da base |

### Parâmetros horários consultados

18 variáveis solicitadas à Open-Meteo:

```
temperature_2m, relative_humidity_2m, dew_point_2m,
apparent_temperature, precipitation_probability, precipitation,
cloud_cover, surface_pressure, wind_speed_10m, wind_gusts_10m,
direct_radiation, evapotranspiration, vapour_pressure_deficit,
soil_temperature_0cm, soil_temperature_6cm,
soil_moisture_0_to_1cm, soil_moisture_1_to_3cm, soil_moisture_3_to_9cm
```

### Leitura retornada

A função `construir_leitura()` transforma as listas horárias em um
dicionário de 18 campos (médias, somas e máximos), mais metadados
(`source` e `updatedAt`).

### Indicadores agronômicos

| Indicador | Níveis | Lógica |
|-----------|--------|--------|
| **Irrigação** | alto / moderado / baixo | Umidade do solo < 18%, VPD > 1.6, evapotranspiração > 3 |
| **Fungos** | alto / moderado / baixo | Umidade ≥ 82%, temperatura 18–29°C, precipitação > 1 mm |
| **Pulverização** | evitar / atencao / seguro | Vento > 15 km/h, rajadas > 28 km/h, chuva > 1 mm |
| **Solo** | seco / estavel / umido | Umidade superficial < 18% ou > 33% |
| **Radiação** | alto / moderado / baixo | Radiação ≥ 520, ≥ 260 ou < 260 W/m² |

### Alertas gerados

Apenas as combinações críticas viram alerta, cada um com tipo, nível e
mensagem em português:

| Indicador + Nível | Mensagem |
|-------------------|----------|
| irrigation + alto | "Necessidade alta de irrigação nas próximas horas." |
| fungus + alto | "Risco alto de fungos: observe as folhas e evite excesso de água." |
| spray + evitar | "Condições desfavoráveis para pulverização: melhor aguardar." |
| soil + seco | "Solo seco na camada superficial: atenção hídrica." |
| radiation + alto | "Radiação solar alta: maior demanda hídrica esperada." |

### Dados de demonstração

Quando a API externa não responde, o sistema utiliza `LEITURA_DEMONSTRACAO`,
um dicionário fixo com valores plausíveis (27°C, 74% umidade, 0.8 mm chuva,
etc.), para que a interface nunca fique quebrada.

---

## Módulo de armazenamento

**Arquivo:** `services/storage.py`

Camada de persistência baseada em arquivos JSON. Nenhum banco SQL é
utilizado.

### Estrutura de arquivos

```
backend/data/
├── users.json            ← Lista central de usuários
└── usuarios/
    └── <email>.json      ← Dados individuais de cada usuário
```

O nome do arquivo é derivado do e-mail: `felipe@gmail.com` →
`felipe_gmail_com.json`.

### Funções principais

| Função | Descrição |
|--------|-----------|
| `garantir_estrutura()` | Cria pastas e arquivo de usuários na inicialização |
| `carregar_json(caminho, padrao)` | Lê JSON com fallbacks para arquivo inexistente/vazio/corrompido |
| `salvar_json(caminho, dados)` | Escreve JSON com formatação `indent=2` |
| `carregar_usuarios()` | Retorna lista de todos os usuários |
| `buscar_usuario_por_email(email)` | Busca usuário por e-mail |
| `buscar_usuario_por_token(token)` | Busca usuário por token de sessão |
| `adicionar_usuario(nome, email, senha, token)` | Cria usuário e arquivo individual |
| `atualizar_token(email, token)` | Renova token no login |
| `carregar_dados_usuario(email)` | Carrega histórico, favoritos e alertas |
| `salvar_dados_usuario(email, dados)` | Salva dados individuais |
| `registrar_consulta(email, local, lat, lon, leitura)` | Adiciona ao histórico |
| `registrar_favorito_automatico(email, nome, lat, lon)` | Adiciona favorito (sem duplicar) |
| `remover_favorito(email, id)` | Remove favorito pelo ID |
| `registrar_alertas(email, local, alertas, lat, lon)` | Adiciona alertas (sem duplicar) |

### Limites de crescimento

| Coleção | Limite |
|---------|--------|
| Histórico | Últimos 50 registros |
| Alertas | Últimos 50 registros |

---

## Estrutura dos dados

### `data/users.json`

```json
[
  {
    "nome": "Felipe",
    "email": "felipe@gmail.com",
    "senha": "TEL123",
    "token": "d49f696c010b44f29a65b37131503813",
    "criado_em": "2026-06-05T19:57:06"
  }
]
```

> **Nota acadêmica:** a senha é armazenada em texto puro. Projetos
> profissionais devem usar hashing (bcrypt, argon2).

### `data/usuarios/<email>.json`

```json
{
  "email": "felipe@gmail.com",
  "nome": "Felipe",
  "historico": [
    {
      "id": 1,
      "local": "Ribeirão Preto, SP",
      "lat": -21.1775,
      "lon": -47.8103,
      "data_hora": "2026-06-05T19:57:07",
      "resumo": {
        "temperatura": 18.28,
        "umidade": 58.45,
        "precipitacao": 0.0,
        "vento": 6.72
      }
    }
  ],
  "favoritos": [
    {
      "id": 1,
      "nome": "Ribeirão Preto, SP",
      "lat": -21.1775,
      "lon": -47.8103,
      "adicionado_em": "2026-06-05T19:57:07"
    }
  ],
  "alertas": [
    {
      "id": 1,
      "tipo": "irrigation",
      "nivel": "alto",
      "mensagem": "Necessidade alta de irrigação nas próximas horas.",
      "local": "Ribeirão Preto, SP",
      "lat": -21.1775,
      "lon": -47.8103,
      "data_hora": "2026-06-05T19:57:07"
    }
  ]
}
```

---

## Autenticação

O sistema usa um esquema de **token de sessão** simples:

1. **Cadastro** (`POST /api/cadastro`): gera um `uuid.uuid4().hex` como
   token, armazena no `users.json` e retorna ao cliente.

2. **Login** (`POST /api/login`): verifica e-mail + senha, gera um **novo**
   token, atualiza no arquivo e retorna.

3. **Validação**: os endpoints de dados pessoais usam `exigir_usuario()`,
   que levanta HTTP 401 se o token for inválido ou ausente. Os endpoints
   de clima aceitam token opcional — se presente e válido, os dados são
   persistidos; se não, a consulta funciona normalmente sem salvamento.

### Por que token e não JWT?

O projeto é acadêmico. O token UUID é suficiente para o escopo: não há
refresh token, expiração ou claims. Um JWT traria complexidade
desnecessária.

---

## Tratamento de erros e fallbacks

### Falha na API externa (Open-Meteo / OpenWeatherMap)

```
main.py: consultar_clima()
  → requests.get() falha (timeout, conexão, JSON inválido)
  → usa LEITURA_DEMONSTRACAO (dados fixos)
  → origem = "demonstracao"
  → retorna dados normalmente
```

O front-end recebe o campo `origem` e pode exibir um aviso ("Dados
demonstrativos") sem quebrar a interface.

### Falha na leitura/escrita de arquivos

```
storage.py: carregar_json()
  → arquivo não existe → retorna padrão ([] ou {})
  → JSON inválido/corrompido → retorna padrão
  → erro de permissão → log + retorna padrão
```

Nenhuma falha de arquivo derruba o servidor.

### Chave de API não configurada

- `/api/clima-atual`: retorna HTTP 500 com mensagem clara.
- `/api/mapa/{...}`: retorna HTTP 204 (sem conteúdo) — o mapa simplesmente
  não mostra a camada.

---

## Como rodar

```bash
cd backend

# 1. Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate       # Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar chave da API
cp .env.example .env
# Edite .env com sua chave: OPENWEATHER_API_KEY=sua_chave

# 4. Iniciar servidor
uvicorn main:app --reload
```

A API sobe em `http://localhost:8000`. A documentação interativa (gerada
automaticamente pelo FastAPI) fica em `http://localhost:8000/docs`.

---

## Considerações técnicas

### Por que FastAPI?

- Validação automática de tipos com Pydantic (reduz boilerplate).
- Documentação OpenAPI interativa gratuita (`/docs`).
- Suporte nativo a async (embora o projeto use chamadas síncronas por
  simplicidade).
- Ideal para APIs de porte pequeno/médio como esta.

### Por que JSON e não SQL?

- Nenhuma configuração de banco necessária.
- Transparência total: qualquer editor de texto abre os dados.
- Volume pequeno: um agricultor individual gera dezenas, não milhares de
  registros.
- Projeto acadêmico com prazo definido.

### Segurança

- A chave da OpenWeatherMap fica no `.env`, **nunca** versionada ou
  exposta ao front-end.
- CORS está liberado (`allow_origins=["*"]`) por ser um projeto
  acadêmico local. Em produção, restrinja à origem do front-end.
- Senhas em texto puro (consciente — veja a seção de melhorias).

### Dependências mínimas

Apenas 4 bibliotecas externas (FastAPI, Uvicorn, Requests, python-dotenv).
Todo o resto é Python padrão (json, os, re, datetime, uuid).