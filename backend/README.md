# Backend PRADO — API em Python (FastAPI)

API que dá suporte ao site agroclimático do PRADO. Faz o cadastro e login
dos usuários, guarda os dados de cada um em arquivos JSON e intermedia as
consultas às APIs de clima (funcionando como uma ponte entre o site e os
serviços externos).

## Como executar

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

A API sobe em `http://localhost:8000`. A documentação interativa fica em
`http://localhost:8000/docs`.

## Estrutura de pastas

```
backend/
├── main.py              # Aplicação FastAPI: define todos os endpoints
├── services/
│   ├── climate.py       # Processa o clima e gera as recomendações
│   └── storage.py       # Lê e grava os arquivos JSON (banco do projeto)
├── data/
│   ├── users.json       # Lista de usuários cadastrados
│   └── usuarios/        # Um arquivo JSON por usuário (criado em tempo real)
├── requirements.txt     # Dependências
└── .env                 # Chave da API de clima (não versionar)
```

## Endpoints principais

| Método | Caminho                         | Descrição                                  |
|--------|---------------------------------|--------------------------------------------|
| GET    | `/`                             | Confirma que a API está no ar              |
| POST   | `/api/cadastro`                 | Cria um novo usuário                       |
| POST   | `/api/login`                    | Autentica e devolve um token de sessão     |
| GET    | `/api/clima`                    | Previsão processada de uma coordenada      |
| GET    | `/api/clima-atual`              | Clima atual de um ponto (card do mapa)     |
| GET    | `/api/mapa/{camada}/{z}/{x}/{y}.png` | Imagens das camadas de chuva/nuvens   |
| GET    | `/api/historico`                | Histórico de consultas do usuário          |
| GET    | `/api/favoritos`                | Locais favoritos do usuário                |
| DELETE | `/api/favoritos/{id}`           | Remove um favorito                         |
| GET    | `/api/alertas`                  | Alertas gerados para o usuário             |

Os endpoints de dados pessoais (histórico, favoritos e alertas) exigem o
token recebido no login, enviado como parâmetro `token` na URL.

## Como os dados são guardados

O projeto **não usa banco de dados SQL**. Toda a persistência é feita com
arquivos JSON, o que torna a "manipulação de arquivos" simples e visível:

- `data/users.json` guarda a lista de usuários.
- `data/usuarios/<email>.json` guarda o histórico, os favoritos e os alertas
  daquele usuário, criado automaticamente no primeiro acesso.

## Conceitos de Python aplicados

Este backend foi construído para exercitar os fundamentos da disciplina de
Pensamento Computacional com Python:

- **Variáveis e tipos de dados** — em todos os módulos.
- **Estruturas de controle** (`if/elif/else`) — nas regras de irrigação,
  fungos, pulverização etc. em `climate.py`.
- **Manipulação de listas e strings** — agregação dos valores horários do
  clima (médias, somas, máximos) em `climate.py`; sanitização de e-mail em
  nome de arquivo em `storage.py`.
- **Funções com parâmetros e retorno** — cada operação é uma função isolada
  e reutilizável.
- **Estruturas de dados** (listas, tuplas e dicionários) — a leitura do
  clima, os indicadores e os registros dos usuários são dicionários; a lista
  de parâmetros da API é uma tupla.
- **Manipulação de arquivos** — leitura e escrita dos arquivos JSON em
  `storage.py`.
- **Tratamento de exceções** — toda leitura/escrita de arquivo e toda chamada
  às APIs externas estão protegidas com `try/except`, de modo que um erro
  nunca derruba o servidor.
