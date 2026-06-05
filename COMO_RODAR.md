# PRADO — Como rodar o projeto

Projeto agroclimático da equipe **PRADO** (Global Solution 2026 — FIAP).
O sistema é dividido em duas partes que rodam juntas:

- **backend/** — API em Python (FastAPI) que faz login, guarda os dados de
  cada usuário em arquivos JSON e conversa com as APIs de clima.
- **frontend/** — site em React (Vite) que o usuário acessa no navegador.

> É necessário deixar **as duas partes rodando ao mesmo tempo**, cada uma em
> seu próprio terminal.

---

## Pré-requisitos

- **Python 3.10 ou superior** (para o backend)
- **Node.js 18 ou superior** (para o frontend)

Para conferir se já tem tudo instalado:

```bash
python --version
node --version
```

---

## 1) Backend (API em Python)

Abra um terminal **dentro da pasta `backend`**:

```bash
cd backend
```

Instale as dependências (recomendado criar um ambiente virtual antes):

```bash
pip install -r requirements.txt
```

Inicie o servidor:

```bash
uvicorn main:app --reload
```

Se aparecer algo como `Uvicorn running on http://127.0.0.1:8000`, o backend
está no ar. Deixe esse terminal aberto.

- A API fica em: http://localhost:8000
- A documentação automática (para testar os endpoints) fica em:
  http://localhost:8000/docs

---

## 2) Frontend (site em React)

Abra **outro terminal**, agora dentro da pasta `frontend`:

```bash
cd frontend
```

Instale as dependências (apenas na primeira vez):

```bash
npm install
```

Inicie o site:

```bash
npm run dev
```

O Vite vai mostrar um endereço local (geralmente
http://localhost:5173). Abra esse endereço no navegador.

---

## Como usar

1. Com as duas partes rodando, acesse o site no navegador.
2. Clique em **Entrar** (canto superior direito) e crie uma conta na opção
   **Criar conta**.
3. Após entrar, o **Dashboard** e o **Mapa** ficam liberados.
4. Cada área que você analisar é registrada automaticamente no seu histórico
   e nos seus favoritos, e os alertas relevantes são guardados — tudo salvo
   no seu arquivo pessoal dentro de `backend/data/usuarios/`.

---

## Onde ficam os dados

O projeto **não usa banco de dados SQL**: tudo é guardado em arquivos JSON,
de forma simples e transparente.

- `backend/data/users.json` — lista de usuários cadastrados.
- `backend/data/usuarios/<email>.json` — histórico, favoritos e alertas de
  cada usuário (criado automaticamente no primeiro acesso).

---

## Observações

- A **chave da API de clima** fica apenas no backend (no arquivo
  `backend/.env`), e não no código do site. O navegador nunca vê essa chave.
- Se o backend estiver fora do ar, o site continua abrindo, apenas sem os
  dados climáticos em tempo real.
- A aparência do site não foi alterada: o backend mudou apenas a **forma como
  os dados são obtidos e guardados**.
