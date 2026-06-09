# PRADO — Frontend

**Tecnologia que cultiva melhores resultados**

Interface web do projeto PRADO, plataforma agroclimática que traduz dados de
satélite, clima e solo em recomendações práticas para pequenos e médios
agricultores. Consome a API REST do backend FastAPI (`backend/`).

---

## Sumário

- [Tecnologias](#tecnologias)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Fluxo de dados](#fluxo-de-dados)
- [Árvore de componentes](#árvore-de-componentes)
- [Rotas](#rotas)
- [Autenticação e sessão](#autenticação-e-sessão)
- [Estilização](#estilização)
- [Como rodar](#como-rodar)
- [Build de produção](#build-de-produção)
- [Considerações técnicas](#considerações-técnicas)

---

## Tecnologias

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| **React** | ^19.2.6 | Biblioteca principal de UI — componentes declarativos com estado |
| **Vite** | ^8.0.12 | Bundler e dev server — HMR instantâneo, build otimizado |
| **Tailwind CSS** | ^4.3.0 | Framework CSS utility-first — estilização direto no JSX |
| **@tailwindcss/vite** | ^4.3.0 | Plugin Vite que integra o Tailwind v4 ao build |
| **React Router** | ^7.16.0 | Roteamento SPA — navegação sem recarregar a página |
| **Leaflet** | ^1.9.4 | Biblioteca de mapas interativos — tiles, marcadores, polígonos |
| **react-leaflet** | ^5.0.0 | Wrapper React para Leaflet — componentes declarativos de mapa |
| **lucide-react** | ^1.17.0 | Biblioteca de ícones — substitui SVGs avulsos |
| **ESLint** | ^10.3.0 | Linter — mantém consistência no código |

---

## Arquitetura da aplicação

A aplicação segue uma arquitetura de **SPA (Single Page Application)** com
roteamento baseado em componentes e separação por funcionalidades (feature
folders). O estado global é mínimo: a maior parte do estado vive dentro dos
próprios componentes ou é persistida no `localStorage` (sessão do usuário).

A comunicação com o backend é centralizada em um único módulo (`lib/api.js`),
que expõe funções assíncronas para cada endpoint. Nenhum componente faz
`fetch` diretamente para APIs externas — tudo passa pelo backend, que atua
como proxy.

### Camadas da aplicação

```
main.jsx                ← Ponto de entrada, renderiza <App />
  └─ app/App.jsx        ← Componente raiz, simplesmente renderiza <AppRoutes />
       └─ routes/AppRoutes.jsx  ← Configuração de rotas e layout
            └─ layouts/MainLayout.jsx  ← Layout comum (Header + Outlet + Footer)
                 ├─ components/Header.jsx    ← Navegação, login/logout
                 ├─ components/Footer.jsx    ← Rodapé institucional
                 └─ features/               ← Páginas da aplicação
                      ├─ home/Home.jsx       ← Landing page
                      ├─ dashboard/AgroDashboard.jsx  ← Painel principal com mapa
                      ├─ dicas/Dicas.jsx     ← Guia de uso
                      ├─ sobre/Sobre.jsx     ← Página institucional
                      ├─ auth/Auth.jsx       ← Login/cadastro
                      ├─ error/Error.jsx     ← Página 404
                      └─ edge/Edge.jsx       ← Placeholder (em branco)
```

---

## Estrutura de diretórios

```
frontend/
├── index.html                 ← HTML de entrada (Vite)
├── vite.config.js             ← Configuração do Vite (React + Tailwind)
├── package.json               ← Dependências e scripts
├── eslint.config.js           ← Configuração do ESLint flat config
├── .gitignore
├── public/                    ← Arquivos estáticos servidos na raiz
└── src/
    ├── main.jsx               ← Ponto de entrada React
    ├── app/
    │   └── App.jsx            ← Componente raiz
    ├── routes/
    │   └── AppRoutes.jsx      ← Definição de rotas e RotaProtegida
    ├── layouts/
    │   └── MainLayout.jsx     ← Layout padrão (Header + Outlet + Footer)
    ├── components/
    │   ├── Header.jsx         ← Cabeçalho com navegação e login
    │   ├── Footer.jsx         ← Rodapé com links e newsletter
    │   └── Mapa.jsx           ← Componente de mapa reutilizável
    ├── features/
    │   ├── home/
    │   │   ├── Home.jsx       ← Página inicial (landing page)
    │   │   └── home.css       ← Estilos específicos (vazio)
    │   ├── dashboard/
    │   │   └── AgroDashboard.jsx  ← Dashboard agroclimático
    │   ├── auth/
    │   │   └── Auth.jsx       ← Login e cadastro
    │   ├── dicas/
    │   │   └── Dicas.jsx      ← Guia de uso
    │   ├── sobre/
    │   │   ├── Sobre.jsx      ← Página institucional
    │   │   └── sobre.css      ← Estilos específicos
    │   ├── error/
    │   │   └── Error.jsx      ← Página 404
    │   └── edge/
    │       ├── Edge.jsx       ← Placeholder
    │       └── edge.css       ← (vazio)
    ├── lib/
    │   └── api.js             ← Comunicação com o backend
    └── styles/
        ├── theme.css          ← Tema Tailwind + CSS base
        └── global.css         ← Estilos globais (body, root)
```

---

## Fluxo de dados

### 1. Requisição climática

```
Usuário clica no mapa (ou seleciona região)
       │
       ▼
AgroDashboard.jsx
  → pickMapPoint(latlng)           ← captura coordenadas
  → busca endereço via Nominatim    ← reverse geocoding (API pública)
  → setSelectedArea({ lat, lon })   ← atualiza estado
       │
       ▼
useEffect [selectedArea]
  → buscarClima(lat, lon, local)    ← lib/api.js
       │
       ▼
api.js: buscarClima()
  → fetch GET http://localhost:8000/api/clima?lat=...&lon=...&local=...&token=...
       │
       ▼
Backend FastAPI
  → consulta Open-Meteo
  → processa leitura (climate.py)
  → calcula indicadores e alertas
  → persiste histórico/favoritos/alertas (se logado)
  → retorna { leitura, indicadores, alertas, origem }
       │
       ▼
AgroDashboard.jsx
  → setReadings(resposta.leitura)
  → recalcula métricas via buildMetrics(readings)
  → atualiza grade de talhões (gridCells)
  → atualiza cards de decisão (farmData)
```

### 2. Autenticação

```
Auth.jsx
  → entrar(email, senha) ou cadastrar(nome, email, senha)
       │
       ▼
api.js
  → POST /api/login ou /api/cadastro
  → salvarSessao({ nome, email, token })    ← localStorage
  → window.dispatchEvent("prado-sessao")    ← notifica Header
       │
       ▼
Header.jsx
  → escuta evento "prado-sessao"
  → atualiza estado local (setUsuario)
  → botão mostra "Entrar" ou primeiro nome
```

### 3. Mapa e tiles

```
Mapa.jsx / AgroDashboard.jsx
  → TileLayer url={urlTileMapa("chuva")}
       │
       ▼
api.js: urlTileMapa(camada)
  → retorna "http://localhost:8000/api/mapa/chuva/{z}/{x}/{y}.png"
       │
       ▼
Backend: proxy_tile()
  → busca em https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png
  → repassa imagem ao navegador (chave nunca exposta)
```

---

## Árvore de componentes

```
<BrowserRouter>
  <Routes>
    <Route element={<MainLayout />}>         ← Header + Outlet + Footer
      ├── "/"         → <Home />             ← Landing page (estática)
      ├── "/login"    → <Auth />             ← Login/cadastro
      ├── "/dicas"    → <Dicas />            ← Guia de uso (estática)
      ├── "/sobre"    → <Sobre />            ← Institucional (estática)
      │
      ├── "/dashboard" →                     ← Rota protegida
      │   <RotaProtegida>
      │     <AgroDashboard />
      │       ├── <MapContainer>             ← Leaflet
      │       │   ├── <MapUpdater />         ← flyTo ao trocar centro
      │       │   ├── <MapClickHandler />    ← captura cliques no mapa
      │       │   ├── <TileLayer />          ← base do mapa
      │       │   ├── <Circle />             ← raio analisado
      │       │   ├── <Polygon />            ← contorno da propriedade
      │       │   ├── <Rectangle />[]        ← grade de talhões (25 células)
      │       │   ├── <Marker />             ← marcador central
      │       │   └── <Popup /> / <Tooltip />
      │       └── (seção de cards + métricas + controles)
      │
      ├── "/mapa"    →                       ← Rota protegida
      │   <RotaProtegida>
      │     <Mapa />
      │       ├── <MapContainer>
      │       │   ├── <TileLayer />          ← OpenStreetMap
      │       │   ├── <TileLayer />          ← chuva (proxy)
      │       │   ├── <TileLayer />          ← nuvens (proxy)
      │       │   └── <Marker />
      │       └── Card de clima atual
      │
      └── "/edge"    →                       ← Rota protegida (placeholder)
          <RotaProtegida>
            <Edge />
    </Route>
    <Route path="*" → <ErrorPage />          ← 404
  </Routes>
</BrowserRouter>
```

---

## Rotas

| Caminho | Componente | Protegida | Descrição |
|---------|-----------|-----------|-----------|
| `/` | `Home` | Não | Landing page do projeto |
| `/login` | `Auth` | Não | Login e cadastro de usuário |
| `/dicas` | `Dicas` | Não | Guia de uso do dashboard |
| `/sobre` | `Sobre` | Não | Página institucional |
| `/dashboard` | `AgroDashboard` | Sim | Painel agroclimático interativo |
| `/mapa` | `Mapa` | Sim | Mapa com camadas de chuva/nuvens |
| `/edge` | `Edge` | Sim | Placeholder (página em branco) |
| `*` | `ErrorPage` | Não | Página 404 |

### RotaProtegida

O componente `RotaProtegida` verifica se `estaLogado()` retorna `true`. Caso
contrário, redireciona para `/login` preservando a rota de destino no
`location.state.from`, para que após o login o usuário volte exatamente para
onde tentou ir.

---

## Autenticação e sessão

A sessão do usuário é gerenciada inteiramente no navegador via `localStorage`:

- **Chave**: `prado_usuario`
- **Estrutura**: `{ nome: string, email: string, token: string }`
- **Evento**: `"prado-sessao"` é disparado no `window` sempre que o login
  muda, permitindo que o `Header` se atualize sem recarregar a página

### Funções em `lib/api.js`

| Função | Descrição |
|--------|-----------|
| `salvarSessao(usuario)` | Persiste dados no localStorage e dispara evento |
| `obterUsuario()` | Recupera dados salvos (ou null) |
| `estaLogado()` | Verifica se há token salvo |
| `obterToken()` | Retorna token (string vazia se não logado) |
| `encerrarSessao()` | Remove dados e dispara evento |
| `cadastrar(nome, email, senha)` | POST `/api/cadastro` + salva sessão |
| `entrar(email, senha)` | POST `/api/login` + salva sessão |

> A senha **não** é armazenada no navegador. O token é gerado pelo backend
> a cada login e serve como identificador de sessão.

---

## Estilização

### Tailwind CSS v4

O projeto usa **Tailwind CSS 4** com o novo sistema de temas via diretiva
`@theme`:

```css
/* theme.css */
@import "tailwindcss";

@theme {
  --color-primary: #71b549;
  --color-primary-light: #acd494;
  --color-primary-dark: #3b5e26;
  --color-primary-muted: #6e9c6a;
  --color-accent: #5f3733;
  --color-off: #f8f7f3;
}
```

**Paleta:**

| Token | Cor | Uso |
|-------|-----|-----|
| `primary` | `#71b549` | Verde principal (CTAs, destaques) |
| `primary-light` | `#acd494` | Verde claro (ícones, bordas, tags) |
| `primary-dark` | `#3b5e26` | Verde escuro (header, footer, seções) |
| `primary-muted` | `#6e9c6a` | Verde suave (apoio) |
| `accent` | `#5f3733` | Acento terroso |
| `off` | `#f8f7f3` | Fundo claro principal |

### Abordagem

- **100% utility-first**: não há arquivos CSS de componentes. Toda estilização
  é feita com classes Tailwind inline no JSX.
- **Cores consistentes**: os valores hexadecimais são aplicados diretamente
  (ex.: `bg-[#102417]`, `text-[#acd494]`) quando fogem do tema, o que ocorre
  com frequência devido à riqueza visual do layout.
- **Dark/light**: não há suporte a modo escuro — o design já é escuro nas
  seções de destaque e claro no conteúdo.
- **Responsividade**: usa os breakpoints `sm`, `md`, `lg`, `xl` e `max-*` do
  Tailwind, com adaptações manuais para `max-[420px]` e `min-[440px]`.

---

## Componentes em destaque

### `AgroDashboard.jsx` (~1300 linhas)

O componente mais complexo da aplicação. Centraliza:

1. **Mapa interativo** (Leaflet) com:
   - Três bases: mapa comum, satélite (Esri) e relevo (OpenTopoMap)
   - Grade de 5×5 = 25 talhões coloridos por intensidade do indicador ativo
   - Círculo de raio analisado (ajustável: 4–16 km)
   - Polígono irregular simulando contorno de propriedade
   - Clique para reposicionar (reverse geocoding via Nominatim)
   - Botão de geolocalização do navegador

2. **Métricas de decisão** (5 cartões):
   - Irrigação, Fungos, Pulverização, Solo, Radiação
   - Cada um com: ícone, valor, unidade, nível (alto/moderado/baixo),
     recomendação textual
   - O indicador ativo define a cor da grade no mapa

3. **Dados agrícolas** (6 cartões adicionais):
   - Entrada de maquinário, Estresse térmico, Molhamento foliar,
     Umidade radicular, Pressão atmosférica, Graus-dia

4. **Barra de resumo** com 9 indicadores rápidos (temperatura, sensação,
   chuva, nuvens, evapotranspiração, rajadas, ponto de orvalho, pressão,
   janela)

### `Header.jsx`

- Navegação responsiva com menu mobile (toggle)
- Botão de login/logout que reflete estado da sessão
- Escuta evento customizado `"prado-sessao"` para atualizar sem reload
- Ícone de sino (notificações, sem ação implementada)

### `Mapa.jsx` (componente reutilizável)

- Usado tanto na Home quanto na rota `/mapa`
- Detecta localização aproximada via `ipapi.co`
- Mostra clima atual (temperatura, descrição, umidade, vento) em um card
- Exibe camadas de chuva e nuvens servidas pelo backend (proxy)

---

## Considerações técnicas

### Por que o estado não usa Context/Redux?

O projeto mantém estado **local nos componentes** por dois motivos:
1. Não há estado global compartilhado complexo (apenas a sessão, que vai
   para `localStorage`).
2. É um projeto acadêmico com escopo definido — Context API ou Redux
   adicionariam complexidade desnecessária.

### Por que o backend salva em JSON e não em SQL?

Mesma lógica acadêmica: JSON é transparente, não exige setup de banco,
e o volume de dados é pequeno.

### Leaflet sem tipos

O projeto usa `react-leaflet` mas não instala `@types/leaflet` como
dependência de desenvolvimento (embora `@types/react` esteja presente).
Os tipos do Leaflet são resolvidos indiretamente.

### Título do HTML

O arquivo `index.html` tem `<title>front</title>`, herdado do scaffold
do Vite. Em produção, deve ser alterado para `PRADO`.

---

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`. O backend deve estar rodando
em `http://localhost:8000`.

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Build de produção para `dist/` |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | ESLint em todos os arquivos |

---

## Build de produção

```bash
npm run build
```

Gera uma pasta `dist/` com os arquivos otimizados. O resultado pode ser
servido por qualquer servidor HTTP estático (Nginx, Apache, etc.) ou
integrado ao backend.
