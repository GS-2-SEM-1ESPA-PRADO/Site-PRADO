# PRADO

**Tecnologia que cultiva melhores resultados**

Projeto agroclimático da equipe **PRADO** (Global Solution 2026 — FIAP).  
Transforma dados de satélite da NASA e APIs de clima em recomendações práticas para pequenos e médios agricultores.

## Sistema

O projeto é dividido em duas partes que rodam juntas:

| Parte | Tecnologia | Porta |
|-------|-----------|-------|
| `backend/` | Python (FastAPI) | `8000` |
| `frontend/` | React (Vite) + Tailwind CSS 4 | `5173` |

> As duas partes precisam estar rodando **ao mesmo tempo**, cada uma em seu terminal.

## Pré-requisitos

- Python 3.10+
- Node.js 18+

```bash
python --version
node --version
```

## Como rodar

### 1) Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Linux/Mac
# venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env           # configure sua chave OpenWeatherMap
uvicorn main:app --reload
```

A API fica em `http://localhost:8000` e a documentação interativa em `http://localhost:8000/docs`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Como usar

1. Acesse o site no navegador com as duas partes rodando.
2. Clique em **Entrar** (canto superior direito) e **Criar conta**.
3. Explore o **Dashboard** e o **Mapa** — clique no mapa para analisar áreas.
4. Histórico, favoritos e alertas são salvos automaticamente.

## Estrutura

```
PRADO/
├── backend/
│   ├── main.py              # Endpoints da API
│   ├── services/
│   │   ├── climate.py       # Lógica agronômica e alertas
│   │   └── storage.py       # Persistência em JSON
│   ├── data/                # Dados gerados em runtime
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Componente raiz
│   │   ├── components/      # Header, Footer, Mapa
│   │   ├── features/        # Dashboard, Auth, Dicas, Sobre, Edge
│   │   ├── layouts/         # MainLayout
│   │   ├── lib/api.js       # Comunicação com o backend
│   │   └── routes/          # Configuração de rotas
│   └── package.json
├── docs/
│   ├── cores.md             # Paleta de cores
│   └── integrantes.md       # Equipe
└── COMO_RODAR.md            # Guia de execução (português)
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Status da API |
| POST | `/api/cadastro` | Cadastro de usuário |
| POST | `/api/login` | Login |
| GET | `/api/clima` | Previsão processada por coordenada |
| GET | `/api/clima-atual` | Clima atual de um ponto |
| GET | `/api/mapa/{camada}/{z}/{x}/{y}.png` | Tiles de chuva/nuvens |
| GET | `/api/historico` | Histórico do usuário |
| GET | `/api/favoritos` | Favoritos do usuário |
| DELETE | `/api/favoritos/{id}` | Remove favorito |
| GET | `/api/alertas` | Alertas do usuário |

## Dados

O projeto **não usa banco SQL**. Tudo é armazenado em arquivos JSON:

- `backend/data/users.json` — usuários cadastrados
- `backend/data/usuarios/<email>.json` — histórico, favoritos e alertas por usuário

## Observações

- A chave da API de clima fica apenas em `backend/.env` (não versionado).
- Se o backend estiver fora do ar, o site funciona com dados de demonstração.
- Indicadores analisados: irrigação, fungos, pulverização, solo e radiação.


## Integrantes 
| Nome | Função |
|------|--------|
| Prof. Fábio Henrique Cabrini | Código base e FIWARE Descomplicado |
| Gabriel Ardito | Desenvolvimento |
| Felipe Menezes | Desenvolvimento |
| João Sarracine | Desenvolvimento |
| João Gonzales | Desenvolvimento |
| Roger Paiva | Desenvolvimento |