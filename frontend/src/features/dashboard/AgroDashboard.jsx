import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CircleGauge,
  Cloud,
  CloudRain,
  CloudSun,
  Crosshair,
  Droplets,
  Footprints,
  Layers,
  LocateFixed,
  MapPin,
  MousePointer2,
  RefreshCw,
  Search,
  Satellite,
  SlidersHorizontal,
  Sprout,
  Sun,
  Thermometer,
  ThermometerSun,
  Timer,
  Tractor,
  TrendingUp,
  Wind,
  X,
} from "lucide-react";
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  Rectangle,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { buscarClima } from "../../lib/api.js";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const baseLayers = [
  {
    id: "street",
    label: "Mapa",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: "satellite",
    label: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  {
    id: "relief",
    label: "Relevo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
];

const regions = [
  {
    name: "Ribeirão Preto",
    state: "SP",
    crop: "Cana e grãos",
    lat: -21.1775,
    lon: -47.8103,
  },
  {
    name: "Petrolina",
    state: "PE",
    crop: "Fruticultura",
    lat: -9.3891,
    lon: -40.5027,
  },
  {
    name: "Londrina",
    state: "PR",
    crop: "Soja e milho",
    lat: -23.3045,
    lon: -51.1696,
  },
  {
    name: "Brasília",
    state: "DF",
    crop: "Hortaliças",
    lat: -15.7801,
    lon: -47.9292,
  },
];

const brazilStateCodes = {
  ACRE: "AC",
  ALAGOAS: "AL",
  AMAPA: "AP",
  AMAZONAS: "AM",
  BAHIA: "BA",
  CEARA: "CE",
  "DISTRITO FEDERAL": "DF",
  "ESPIRITO SANTO": "ES",
  GOIAS: "GO",
  MARANHAO: "MA",
  "MATO GROSSO": "MT",
  "MATO GROSSO DO SUL": "MS",
  "MINAS GERAIS": "MG",
  PARA: "PA",
  PARAIBA: "PB",
  PARANA: "PR",
  PERNAMBUCO: "PE",
  PIAUI: "PI",
  "RIO DE JANEIRO": "RJ",
  "RIO GRANDE DO NORTE": "RN",
  "RIO GRANDE DO SUL": "RS",
  RONDONIA: "RO",
  RORAIMA: "RR",
  "SANTA CATARINA": "SC",
  "SAO PAULO": "SP",
  SERGIPE: "SE",
  TOCANTINS: "TO",
};

const searchAliases = {
  AC: "Rio Branco AC",
  AL: "Maceio AL",
  AP: "Macapa AP",
  AM: "Manaus AM",
  BA: "Salvador BA",
  CE: "Fortaleza CE",
  DF: "Brasilia DF",
  ES: "Vitoria ES",
  GO: "Goiania GO",
  MA: "Sao Luis MA",
  MT: "Cuiaba MT",
  MS: "Campo Grande MS",
  MG: "Belo Horizonte MG",
  PA: "Belem PA",
  PB: "Joao Pessoa PB",
  PR: "Curitiba PR",
  PE: "Recife PE",
  PI: "Teresina PI",
  RJ: "Rio de Janeiro RJ",
  RN: "Natal RN",
  RS: "Porto Alegre RS",
  RO: "Porto Velho RO",
  RR: "Boa Vista RR",
  SC: "Florianopolis SC",
  SP: "Sao Paulo SP",
  SE: "Aracaju SE",
  TO: "Palmas TO",
};

const blockedSearchTypes = new Set([
  "highway",
  "road",
  "route",
  "street",
  "residential",
  "primary",
  "secondary",
  "tertiary",
  "trunk",
  "motorway",
]);

const preferredSearchKeys = [
  "city",
  "town",
  "village",
  "municipality",
  "county",
  "state",
  "state_district",
];

const fallbackReadings = {
  source: "Demonstração local",
  updatedAt: "Sem conexão com a API",
  temperature: 27,
  humidity: 74,
  precipitation: 0.8,
  rainProbability: 42,
  wind: 11,
  gust: 18,
  apparentTemperature: 29,
  dewPoint: 22,
  cloudCover: 48,
  pressure: 1014,
  soilMoisture: 0.21,
  soilMoisture1to3: 0.24,
  soilMoisture3to9: 0.28,
  soilTemperature: 24,
  soilTemperature6: 23,
  evapotranspiration: 1.9,
  vapourPressureDeficit: 1.15,
  radiation: 390,
  growingDegreeDays: 17,
};

const legendItems = [
  { label: "Baixa atenção", color: "#71b549" },
  { label: "Atenção média", color: "#e0a72f" },
  { label: "Alta atenção", color: "#ef6b4a" },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function stateCodeFromAddress(address = {}) {
  const isoCode = address["ISO3166-2-lvl4"] || address["ISO3166-2-lvl3"];
  if (isoCode && isoCode.includes("-")) {
    return isoCode.split("-").pop();
  }

  const state = address.state || address.region;
  if (!state) return "BR";

  if (state.length === 2) return state.toUpperCase();
  return brazilStateCodes[normalizeText(state)] || state;
}

function nameFromAddress(address = {}, fallback = "Regiao encontrada") {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state_district ||
    fallback
  );
}

function searchTermForGeocoder(term) {
  const normalized = normalizeText(term);
  return searchAliases[normalized] || term;
}

function resultPriority(result) {
  const address = result.address || {};
  const normalizedType = normalizeText(result.type).toLowerCase();
  const normalizedClass = normalizeText(result.class).toLowerCase();

  if (blockedSearchTypes.has(normalizedType) || blockedSearchTypes.has(normalizedClass)) {
    return -1;
  }

  const preferredIndex = preferredSearchKeys.findIndex((key) => Boolean(address[key]));
  if (preferredIndex >= 0) {
    return 100 - preferredIndex;
  }

  if (result.type === "administrative" || result.class === "boundary") {
    return 60;
  }

  return 10;
}

function cleanSearchResults(results) {
  return [...results]
    .map((result) => ({ result, priority: resultPriority(result) }))
    .filter((item) => item.priority >= 0)
    .sort((a, b) => b.priority - a.priority)
    .map((item) => item.result);
}

function searchResultToArea(result, fallback = "Regiao pesquisada") {
  const address = result.address || {};
  const lat = Number(result.lat);
  const lon = Number(result.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Coordenadas invalidas.");
  }

  return {
    name: nameFromAddress(address, fallback),
    state: stateCodeFromAddress(address),
    crop: address.county || address.state || result.type || "Regiao pesquisada",
    lat,
    lon,
  };
}

function searchResultLabel(result) {
  const address = result.address || {};
  return [
    nameFromAddress(address, result.name || "Regiao"),
    stateCodeFromAddress(address),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function areaLabel(area) {
  return [area.name, area.state].filter(Boolean).join(", ");
}

function metricIntensity(kind, readings) {
  if (kind === "irrigation") {
    return clamp(
      (0.32 - readings.soilMoisture) / 0.22 +
        readings.vapourPressureDeficit / 6 +
        readings.evapotranspiration / 12,
    );
  }

  if (kind === "fungus") {
    const humidityScore = readings.humidity / 100;
    const tempScore = readings.temperature >= 18 && readings.temperature <= 29 ? 0.35 : 0.08;
    return clamp(humidityScore * 0.65 + tempScore + readings.precipitation / 18);
  }

  if (kind === "spray") {
    return clamp(readings.wind / 24 + readings.gust / 60 + readings.rainProbability / 240);
  }

  if (kind === "soil") {
    return clamp(Math.abs(readings.soilMoisture - 0.25) / 0.18 + readings.soilTemperature / 120);
  }

  return clamp(readings.radiation / 720);
}

function intensityStyle(intensity) {
  if (intensity >= 0.66) {
    return { label: "Alta atenção", color: "#ef6b4a" };
  }

  if (intensity >= 0.38) {
    return { label: "Atenção média", color: "#e0a72f" };
  }

  return { label: "Baixa atenção", color: "#71b549" };
}

function getLevel(kind, readings) {
  if (kind === "irrigation") {
    if (
      readings.soilMoisture < 0.18 ||
      readings.vapourPressureDeficit > 1.6 ||
      readings.evapotranspiration > 3
    ) {
      return "alto";
    }
    if (readings.soilMoisture < 0.25 || readings.vapourPressureDeficit > 1.1) {
      return "moderado";
    }
    return "baixo";
  }

  if (kind === "fungus") {
    if (
      readings.humidity >= 82 &&
      readings.temperature >= 18 &&
      readings.temperature <= 29 &&
      readings.precipitation > 1
    ) {
      return "alto";
    }
    if (readings.humidity >= 70 && readings.temperature >= 16 && readings.temperature <= 31) {
      return "moderado";
    }
    return "baixo";
  }

  if (kind === "spray") {
    if (readings.wind > 15 || readings.gust > 28 || readings.precipitation > 1) {
      return "evitar";
    }
    if (readings.wind > 10 || readings.rainProbability > 45) {
      return "atencao";
    }
    return "seguro";
  }

  if (kind === "soil") {
    if (readings.soilMoisture < 0.18) return "seco";
    if (readings.soilMoisture > 0.33) return "umido";
    return "estavel";
  }

  if (readings.radiation >= 520) return "alto";
  if (readings.radiation >= 260) return "moderado";
  return "baixo";
}

function levelStyle(level) {
  const styles = {
    alto: { label: "Alto", color: "#ef6b4a", bg: "bg-[#ef6b4a]/12", text: "text-[#ef6b4a]" },
    moderado: { label: "Moderado", color: "#e0a72f", bg: "bg-[#e0a72f]/12", text: "text-[#ad7a16]" },
    baixo: { label: "Baixo", color: "#71b549", bg: "bg-[#71b549]/12", text: "text-[#3b5e26]" },
    evitar: { label: "Evitar", color: "#ef6b4a", bg: "bg-[#ef6b4a]/12", text: "text-[#ef6b4a]" },
    atencao: { label: "Atenção", color: "#e0a72f", bg: "bg-[#e0a72f]/12", text: "text-[#ad7a16]" },
    seguro: { label: "Seguro", color: "#71b549", bg: "bg-[#71b549]/12", text: "text-[#3b5e26]" },
    seco: { label: "Seco", color: "#ef6b4a", bg: "bg-[#ef6b4a]/12", text: "text-[#ef6b4a]" },
    estavel: { label: "Estável", color: "#71b549", bg: "bg-[#71b549]/12", text: "text-[#3b5e26]" },
    umido: { label: "Úmido", color: "#2f80ed", bg: "bg-[#2f80ed]/12", text: "text-[#1d5faf]" },
  };

  return styles[level] || styles.baixo;
}

function buildMetrics(readings) {
  const irrigationLevel = getLevel("irrigation", readings);
  const fungusLevel = getLevel("fungus", readings);
  const sprayLevel = getLevel("spray", readings);
  const soilLevel = getLevel("soil", readings);
  const radiationLevel = getLevel("radiation", readings);

  return [
    {
      id: "irrigation",
      icon: Droplets,
      title: "Irrigação",
      subtitle: "Necessidade de água",
      value: `${formatNumber(readings.soilMoisture * 100)}%`,
      unit: "umidade superficial",
      level: irrigationLevel,
      recommendation:
        irrigationLevel === "alto"
          ? "Priorizar irrigação nas próximas horas."
          : irrigationLevel === "moderado"
            ? "Monitorar solo antes de irrigar."
            : "Sem urgência de irrigação agora.",
    },
    {
      id: "fungus",
      icon: AlertTriangle,
      title: "Fungos",
      subtitle: "Risco por umidade",
      value: `${formatNumber(readings.humidity)}%`,
      unit: "umidade do ar",
      level: fungusLevel,
      recommendation:
        fungusLevel === "alto"
          ? "Evitar excesso de água e observar folhas."
          : fungusLevel === "moderado"
            ? "Acompanhar umidade e temperatura."
            : "Baixa chance de proliferação no período.",
    },
    {
      id: "spray",
      icon: Wind,
      title: "Pulverização",
      subtitle: "Janela de aplicação",
      value: `${formatNumber(readings.wind)} km/h`,
      unit: "vento médio",
      level: sprayLevel,
      recommendation:
        sprayLevel === "evitar"
          ? "Não recomendado aplicar agora."
          : sprayLevel === "atencao"
            ? "Aplicar apenas com cautela."
            : "Condição favorável para aplicação.",
    },
    {
      id: "soil",
      icon: Sprout,
      title: "Solo",
      subtitle: "Condição da camada inicial",
      value: `${formatNumber(readings.soilTemperature)}°C`,
      unit: "temperatura do solo",
      level: soilLevel,
      recommendation:
        soilLevel === "seco"
          ? "Solo pede atenção hídrica."
          : soilLevel === "umido"
            ? "Cuidado com encharcamento."
            : "Solo em faixa estável.",
    },
    {
      id: "radiation",
      icon: Sun,
      title: "Radiação",
      subtitle: "Energia solar disponível",
      value: `${formatNumber(readings.radiation)} W/m²`,
      unit: "radiação direta",
      level: radiationLevel,
      recommendation:
        radiationLevel === "alto"
          ? "Alta demanda hídrica esperada."
          : radiationLevel === "moderado"
            ? "Bom nível de energia para a cultura."
            : "Radiação baixa no período.",
    },
  ];
}

function buildFarmData(readings) {
  const dewPointSpread = readings.temperature - readings.dewPoint;
  const machineryLevel =
    readings.precipitation > 4 || readings.soilMoisture3to9 > 0.36
      ? "evitar"
      : readings.precipitation > 1 || readings.soilMoisture3to9 > 0.3
        ? "atencao"
        : "seguro";
  const heatLevel =
    readings.apparentTemperature >= 34 || readings.vapourPressureDeficit > 1.8
      ? "alto"
      : readings.apparentTemperature >= 30 || readings.vapourPressureDeficit > 1.25
        ? "moderado"
        : "baixo";
  const leafWetnessLevel =
    readings.humidity > 86 || dewPointSpread <= 2 || readings.precipitation > 2
      ? "alto"
      : readings.humidity > 76 || dewPointSpread <= 4
        ? "moderado"
        : "baixo";
  const rootZoneLevel =
    readings.soilMoisture3to9 < 0.18
      ? "seco"
      : readings.soilMoisture3to9 > 0.35
        ? "umido"
        : "estavel";
  const pressureLevel =
    readings.pressure < 1008
      ? "atencao"
      : readings.pressure > 1022
        ? "seguro"
        : "estavel";
  const growthLevel =
    readings.growingDegreeDays >= 18
      ? "alto"
      : readings.growingDegreeDays >= 10
        ? "moderado"
        : "baixo";

  return [
    {
      icon: Tractor,
      title: "Entrada de maquinário",
      value: levelStyle(machineryLevel).label,
      detail: `Solo 3-9 cm: ${formatNumber(readings.soilMoisture3to9 * 100)}%`,
      level: machineryLevel,
      text:
        machineryLevel === "evitar"
          ? "Evite compactação: solo úmido ou chuva recente."
          : machineryLevel === "atencao"
            ? "Entrar apenas se o talhão drenar bem."
            : "Boa janela para trânsito leve na área.",
    },
    {
      icon: Thermometer,
      title: "Estresse térmico",
      value: `${formatNumber(readings.apparentTemperature)}°C`,
      detail: "Sensação térmica",
      level: heatLevel,
      text:
        heatLevel === "alto"
          ? "Atenção a irrigação e horários de manejo."
          : heatLevel === "moderado"
            ? "Monitorar perda de água nas próximas horas."
            : "Temperatura confortável para a cultura.",
    },
    {
      icon: Cloud,
      title: "Molhamento foliar",
      value: `${formatNumber(dewPointSpread, 1)}°C`,
      detail: "Diferença temp. x orvalho",
      level: leafWetnessLevel,
      text:
        leafWetnessLevel === "alto"
          ? "Folha pode permanecer úmida por mais tempo."
          : leafWetnessLevel === "moderado"
            ? "Observar fungos em áreas mais fechadas."
            : "Baixa tendência de molhamento foliar.",
    },
    {
      icon: Footprints,
      title: "Umidade radicular",
      value: `${formatNumber(readings.soilMoisture3to9 * 100)}%`,
      detail: `Solo 1-3 cm: ${formatNumber(readings.soilMoisture1to3 * 100)}%`,
      level: rootZoneLevel,
      text:
        rootZoneLevel === "seco"
          ? "Camada inicial está perdendo água."
          : rootZoneLevel === "umido"
            ? "Cuidado com excesso de água nas raízes."
            : "Reserva hídrica em faixa estável.",
    },
    {
      icon: Activity,
      title: "Pressão atmosférica",
      value: `${formatNumber(readings.pressure)} hPa`,
      detail: `${formatNumber(readings.cloudCover)}% de nuvens`,
      level: pressureLevel,
      text:
        pressureLevel === "atencao"
          ? "Pressão baixa pode indicar instabilidade."
          : pressureLevel === "seguro"
            ? "Tendência mais estável no período."
            : "Condição atmosférica sem sinal forte.",
    },
    {
      icon: TrendingUp,
      title: "Graus-dia",
      value: `${formatNumber(readings.growingDegreeDays, 1)} GD`,
      detail: "Base 10°C nas próximas 24h",
      level: growthLevel,
      text:
        growthLevel === "alto"
          ? "Alto acúmulo térmico para desenvolvimento."
          : growthLevel === "moderado"
            ? "Crescimento em ritmo regular."
            : "Baixo avanço térmico esperado.",
    },
  ];
}

function buildGridCells(area, radiusKm, activeMetricId, readings) {
  const size = 5;
  const latKm = 111;
  const lonKm = 111 * Math.max(Math.cos((area.lat * Math.PI) / 180), 0.25);
  const cellKm = (radiusKm * 2) / size;
  const base = metricIntensity(activeMetricId, readings);

  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const north = area.lat + (radiusKm - row * cellKm) / latKm;
    const south = area.lat + (radiusKm - (row + 1) * cellKm) / latKm;
    const west = area.lon + (-radiusKm + col * cellKm) / lonKm;
    const east = area.lon + (-radiusKm + (col + 1) * cellKm) / lonKm;
    const distanceFromCenter = Math.hypot(row - 2, col - 2);
    const wave = Math.sin((row + 1) * 1.7 + (col + 1) * 0.9 + Math.abs(area.lat)) * 0.13;
    const edgePressure = distanceFromCenter * 0.045;
    const intensity = clamp(base + wave + edgePressure, 0.06, 0.96);
    const style = intensityStyle(intensity);

    return {
      id: `${row}-${col}`,
      row,
      col,
      bounds: [
        [south, west],
        [north, east],
      ],
      center: [(north + south) / 2, (west + east) / 2],
      intensity,
      ...style,
    };
  });
}

function buildFieldBoundary(area, radiusKm) {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.max(Math.cos((area.lat * Math.PI) / 180), 0.25));

  return [
    [area.lat + latDelta * 0.44, area.lon - lonDelta * 0.54],
    [area.lat + latDelta * 0.56, area.lon + lonDelta * 0.32],
    [area.lat + latDelta * 0.14, area.lon + lonDelta * 0.62],
    [area.lat - latDelta * 0.46, area.lon + lonDelta * 0.44],
    [area.lat - latDelta * 0.58, area.lon - lonDelta * 0.2],
    [area.lat - latDelta * 0.18, area.lon - lonDelta * 0.64],
  ];
}

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 12, { duration: 0.8 });
  }, [center, map]);

  return null;
}

function MapClickHandler({ onPickPoint }) {
  useMapEvents({
    click(event) {
      onPickPoint(event.latlng);
    },
  });

  return null;
}

function AgroDashboard() {
  const placeLookupId = useRef(0);
  const [selectedArea, setSelectedArea] = useState(regions[0]);
  const [readings, setReadings] = useState(fallbackReadings);
  const [activeMetricId, setActiveMetricId] = useState("irrigation");
  const [baseLayerId, setBaseLayerId] = useState("satellite");
  const [radiusKm, setRadiusKm] = useState(8);
  const [gridOpacity, setGridOpacity] = useState(0.38);
  const [showGrid, setShowGrid] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiStatus, setApiStatus] = useState("Carregando API");
  const [refreshKey, setRefreshKey] = useState(0);

  const center = useMemo(() => [selectedArea.lat, selectedArea.lon], [selectedArea]);
  const activeBaseLayer = baseLayers.find((layer) => layer.id === baseLayerId) || baseLayers[0];
  const metrics = useMemo(() => buildMetrics(readings), [readings]);
  const farmData = useMemo(() => buildFarmData(readings), [readings]);
  const activeMetric = metrics.find((metric) => metric.id === activeMetricId) || metrics[0];
  const ActiveMetricIcon = activeMetric.icon;
  const activeStyle = levelStyle(activeMetric.level);
  const gridCells = useMemo(
    () => buildGridCells(selectedArea, radiusKm, activeMetricId, readings),
    [activeMetricId, radiusKm, readings, selectedArea],
  );
  const fieldBoundary = useMemo(
    () => buildFieldBoundary(selectedArea, radiusKm),
    [radiusKm, selectedArea],
  );

  useEffect(() => {
    if (selectedArea.isResolving) {
      return undefined;
    }

    // Flag para evitar atualizar o estado caso o componente seja
    // desmontado ou a área mude antes da resposta chegar.
    let ativo = true;

    async function loadForecast() {
      setIsLoading(true);
      setApiStatus("Consultando dados");

      const local = areaLabel(selectedArea);

      try {
        // O backend faz a consulta à Open-Meteo, processa os dados e,
        // se houver usuário logado, salva no histórico automaticamente.
        const resposta = await buscarClima(selectedArea.lat, selectedArea.lon, local);

        if (!ativo) return;

        setReadings(resposta.leitura);
        setApiStatus(
          resposta.origem === "online" ? "API conectada" : "Dados demonstrativos",
        );
      } catch {
        // Se nem o backend respondeu, usa a leitura local de demonstração.
        if (ativo) {
          setReadings(fallbackReadings);
          setApiStatus("Backend indisponível");
        }
      } finally {
        if (ativo) setIsLoading(false);
      }
    }

    loadForecast();

    return () => {
      ativo = false;
    };
  }, [refreshKey, selectedArea]);

  useEffect(() => {
    const term = searchQuery.trim();
    const isKnownAlias = Boolean(searchAliases[normalizeText(term)]);

    if (term.length < 3 && !isKnownAlias) {
      setSearchSuggestions([]);
      setIsSuggesting(false);
      return undefined;
    }

    const geocoderTerm = searchTermForGeocoder(term);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSuggesting(true);

      try {
        const params = new URLSearchParams({
          q: geocoderTerm,
          format: "json",
          addressdetails: "1",
          limit: "8",
          countrycodes: "br",
          "accept-language": "pt-BR",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: { "Accept-Language": "pt-BR" },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Falha ao buscar sugestoes.");
        }

        const results = await response.json();
        setSearchSuggestions(cleanSearchResults(results).slice(0, 5));
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  function selectRegion(region) {
    placeLookupId.current += 1;
    setSelectedCell(null);
    setSearchError("");
    setIsSearching(false);
    setShowSuggestions(false);
    setSelectedArea(region);
  }

 async function pickMapPoint(latlng) {
  setSelectedCell(null);
  setSearchError("");
  setIsSearching(false);
  setIsLoading(false);
  setApiStatus("Identificando localização");
  const lookupId = placeLookupId.current + 1;
  placeLookupId.current = lookupId;

  // Já define um nome provisório enquanto a API responde,
  // para o mapa não ficar parado esperando.
  setSelectedArea({
    name: "Carregando...",
    state: "",
    crop: "Identificando localização",
    lat: latlng.lat,
    lon: latlng.lng,
    isResolving: true,
  });

  try {
    const resposta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=pt-BR`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    if (!resposta.ok) {
      throw new Error("Falha ao identificar o local.");
    }

    const dados = await resposta.json();
    if (lookupId !== placeLookupId.current) return;

    const cidade =
      dados.address?.city ||
      dados.address?.town ||
      dados.address?.village ||
      dados.address?.municipality ||
      dados.address?.city_district ||
      dados.address?.suburb ||
      dados.address?.county ||
      "Área rural";

    const estadoAbrev = stateCodeFromAddress(dados.address);

    setSelectedArea({
      name: cidade,
      state: estadoAbrev,
      crop: dados.address?.county || "Ponto selecionado no mapa",
      lat: latlng.lat,
      lon: latlng.lng,
    });
  } catch {
    if (lookupId !== placeLookupId.current) return;

    // Se a API falhar, usa um nome descritivo com as coordenadas.
    setSelectedArea({
      name: `${latlng.lat.toFixed(2)}°S`,
      state: `${Math.abs(latlng.lng).toFixed(2)}°O`,
      crop: "Ponto selecionado no mapa",
      lat: latlng.lat,
      lon: latlng.lng,
    });
  }
}

  async function searchRegion(event) {
    event.preventDefault();

    const term = searchQuery.trim();
    if (!term) {
      setSearchError("Digite uma cidade, estado ou regiao.");
      return;
    }

    const lookupId = placeLookupId.current + 1;
    placeLookupId.current = lookupId;

    setSearchError("");
    setIsSearching(true);
    setSelectedCell(null);
    setShowSuggestions(false);
    setApiStatus("Buscando regiao");

    try {
      const geocoderTerm = searchTermForGeocoder(term);
      const params = new URLSearchParams({
        q: geocoderTerm,
        format: "json",
        addressdetails: "1",
        limit: "8",
        countrycodes: "br",
        "accept-language": "pt-BR",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { "Accept-Language": "pt-BR" } },
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar a regiao.");
      }

      const results = cleanSearchResults(await response.json());
      if (lookupId !== placeLookupId.current) return;

      const result = results[0];
      if (!result) {
        setSearchError("Nenhuma cidade ou regiao encontrada. Tente cidade e estado, como: Londrina PR.");
        setApiStatus("Regiao nao encontrada");
        setSearchSuggestions([]);
        return;
      }

      setSearchSuggestions(results);
      setSelectedArea(searchResultToArea(result, term));
    } catch {
      if (lookupId !== placeLookupId.current) return;
      setSearchError("Nao foi possivel buscar essa regiao agora.");
      setApiStatus("Busca indisponivel");
    } finally {
      if (lookupId === placeLookupId.current) {
        setIsSearching(false);
      }
    }
  }

  function selectSearchResult(result) {
    try {
      placeLookupId.current += 1;
      setSelectedCell(null);
      setSearchError("");
      setIsSearching(false);
      setShowSuggestions(false);
      setSearchQuery(searchResultLabel(result));
      setSelectedArea(searchResultToArea(result, searchQuery.trim()));
    } catch {
      setSearchError("Nao foi possivel usar essa sugestao.");
    }
  }

  function clearSearch() {
    placeLookupId.current += 1;
    setSearchQuery("");
    setSearchError("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);
  }

  function locateUser() {
    placeLookupId.current += 1;
    setSearchError("");
    setIsSearching(false);
    setShowSuggestions(false);

    if (!navigator.geolocation) {
      setApiStatus("Geolocalização indisponível");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedArea({
          name: "Minha localização",
          state: "Atual",
          crop: "Área detectada pelo navegador",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setSelectedCell(null);
        setIsLocating(false);
      },
      () => {
        setApiStatus("Não foi possível localizar");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 9000 },
    );
  }

  return (
    <section id="dashboard" className="bg-[#f3f0e4] px-3 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#71b549]/30 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3b5e26] shadow-sm">
              <Satellite className="h-3.5 w-3.5" aria-hidden="true" />
              Dashboard agroclimático
            </span>
            <h2 className="mt-4 max-w-[820px] font-serif text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-normal text-[#16281e]">
              Mapa interativo para decidir antes de agir.
            </h2>
            <p className="mt-4 max-w-[700px] text-base leading-7 text-[#3d4637]">
              Clique no mapa, altere a camada de análise e veja como solo, vento, chuva,
              radiação e umidade mudam a recomendação para a área selecionada.
            </p>
          </div>

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3b5e26] bg-[#3b5e26] px-5 text-sm font-extrabold text-white transition hover:bg-[#27461f] sm:w-auto"
            onClick={() => setRefreshKey((key) => key + 1)}
            type="button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Atualizar dados
          </button>
        </div>

        <form
          className="mb-4 rounded-[18px] border border-[#d9d4bd] bg-white p-3 shadow-sm"
          onSubmit={searchRegion}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <div className="relative flex-1">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e1ddca] bg-[#faf9f3] px-4 text-[#16281e] focus-within:border-[#71b549]">
                <Search className="h-5 w-5 shrink-0 text-[#3b5e26]" aria-hidden="true" />
                <span className="sr-only">Pesquisar regiao no mapa</span>
                <input
                  autoComplete="off"
                  className="h-12 w-full bg-transparent text-sm font-semibold text-[#16281e] outline-none placeholder:text-[#6e765f]"
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setShowSuggestions(true);
                    if (searchError) setSearchError("");
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Digite cidade, sigla do estado ou regiao rural"
                  type="search"
                  value={searchQuery}
                />
                {isSuggesting && (
                  <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-[#6e765f]" aria-hidden="true" />
                )}
                {searchQuery && !isSuggesting && (
                  <button
                    aria-label="Limpar pesquisa"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#6e765f] transition hover:bg-[#e7eadb] hover:text-[#16281e]"
                    onClick={clearSearch}
                    type="button"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </label>

              {showSuggestions &&
                (searchQuery.trim().length >= 3 ||
                  Boolean(searchAliases[normalizeText(searchQuery)])) && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1200] overflow-hidden rounded-2xl border border-[#d9d4bd] bg-white shadow-[0_18px_45px_rgb(30_52_29_/_18%)]">
                  {searchSuggestions.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto p-2">
                      {searchSuggestions.map((result) => (
                        <button
                          className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#f3f8ef]"
                          key={result.place_id}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectSearchResult(result)}
                          type="button"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#71b549]" aria-hidden="true" />
                          <span className="min-w-0">
                            <strong className="block truncate text-sm font-black text-[#16281e]">
                              {searchResultLabel(result)}
                            </strong>
                            <span className="mt-0.5 block line-clamp-2 text-xs font-semibold text-[#6e765f]">
                              {result.display_name}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-sm font-semibold text-[#6e765f]">
                      {isSuggesting ? "Procurando regioes..." : "Nenhuma sugestao encontrada."}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#3b5e26] bg-[#3b5e26] px-5 text-sm font-extrabold text-white transition hover:bg-[#27461f] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
              disabled={isSearching}
              type="submit"
            >
              {isSearching ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              Buscar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#6e765f]">
              Atalhos
            </span>
            {regions.map((region) => (
              <button
                className="rounded-full border border-[#d9d4bd] bg-[#faf9f3] px-3 py-1.5 text-xs font-black text-[#3b5e26] transition hover:border-[#71b549] hover:bg-[#f3f8ef]"
                key={`search-${region.name}`}
                onClick={() => {
                  setSearchQuery(areaLabel(region));
                  selectRegion(region);
                }}
                type="button"
              >
                {areaLabel(region)}
              </button>
            ))}
          </div>

          {searchError && (
            <p className="mt-2 text-sm font-semibold text-[#a94424]">{searchError}</p>
          )}
        </form>

        <div className="overflow-hidden rounded-[24px] border border-[#d9d4bd] bg-[#102417] shadow-[0_28px_80px_rgb(30_52_29_/_22%)]">
          <div className="relative h-[620px] min-[480px]:h-[580px] sm:h-[560px] lg:h-[680px]">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
            >
              <MapUpdater center={center} />
              <MapClickHandler onPickPoint={pickMapPoint} />
              <TileLayer
                key={activeBaseLayer.id}
                attribution={activeBaseLayer.attribution}
                url={activeBaseLayer.url}
              />

              {showRadius && (
                <Circle
                  center={center}
                  radius={radiusKm * 1000}
                  pathOptions={{
                    color: activeStyle.color,
                    fillColor: activeStyle.color,
                    fillOpacity: 0.08,
                    opacity: 0.85,
                    weight: 2,
                  }}
                />
              )}

              <Polygon
                positions={fieldBoundary}
                pathOptions={{
                  color: "#fff8df",
                  fillColor: "#71b549",
                  fillOpacity: 0.08,
                  opacity: 0.9,
                  weight: 2,
                  dashArray: "8 8",
                }}
              />

              {showGrid &&
                gridCells.map((cell) => (
                  <Rectangle
                    bounds={cell.bounds}
                    eventHandlers={{
                      click(event) {
                        L.DomEvent.stopPropagation(event);
                        setSelectedCell(cell);
                      },
                    }}
                    key={cell.id}
                    pathOptions={{
                      color: selectedCell?.id === cell.id ? "#fff8df" : "#ffffff",
                      fillColor: cell.color,
                      fillOpacity: gridOpacity,
                      opacity: selectedCell?.id === cell.id ? 0.95 : 0.25,
                      weight: selectedCell?.id === cell.id ? 3 : 1,
                    }}
                  >
                    <Popup>
                      Talhão {cell.row + 1}-{cell.col + 1}
                      <br />
                      {activeMetric.title}: {cell.label}
                      <br />
                      Intensidade: {formatNumber(cell.intensity * 100)}%
                    </Popup>
                  </Rectangle>
                ))}

              <Marker position={center}>
                <Popup>
                  {selectedArea.name}, {selectedArea.state}
                  <br />
                  {activeMetric.title}: {activeStyle.label}
                </Popup>
                <Tooltip direction="top" offset={[0, -28]} opacity={0.95}>
                  Área analisada
                </Tooltip>
              </Marker>
            </MapContainer>

            <div className="absolute left-3 right-[68px] top-3 z-[1000] grid gap-2 sm:left-6 sm:right-auto sm:top-6 sm:max-w-[calc(100%-32px)] sm:gap-3">
              <div className="rounded-2xl border border-white/15 bg-[#102417]/90 p-3 text-white shadow-xl backdrop-blur sm:p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="hidden h-11 w-11 place-items-center rounded-xl min-[420px]:grid"
                    style={{ backgroundColor: `${activeStyle.color}22`, color: activeStyle.color }}
                  >
                    <ActiveMetricIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
                      {selectedArea.name}, {selectedArea.state}
                    </p>
                    <p className="mt-1 break-words text-sm text-white/75">{selectedArea.crop}</p>
                    <p className="mt-2 break-words text-xs text-white/50">
                      {formatNumber(selectedArea.lat, 4)}, {formatNumber(selectedArea.lon, 4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-auto rounded-2xl border border-white/15 bg-[#102417]/90 p-3 text-white shadow-xl backdrop-blur">
                <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                  Base do mapa
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {baseLayers.map((layer) => (
                    <button
                      className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                        baseLayerId === layer.id
                          ? "bg-[#71b549] text-white"
                          : "bg-white/10 text-white/75 hover:bg-white/18"
                      }`}
                      key={layer.id}
                      onClick={() => setBaseLayerId(layer.id)}
                      type="button"
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-3 z-[1000] grid gap-3 sm:right-6 sm:top-6">
              <button
                className="pointer-events-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-[#102417]/90 text-[#acd494] shadow-xl backdrop-blur transition hover:bg-[#193420]"
                onClick={locateUser}
                type="button"
                aria-label="Usar minha localização"
              >
                {isLocating ? (
                  <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <LocateFixed className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              <div className="pointer-events-auto hidden rounded-2xl border border-white/15 bg-[#102417]/90 p-3 text-white shadow-xl backdrop-blur sm:block">
                <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Visual
                </p>
                <label className="grid gap-1 text-xs font-bold text-white/70">
                  Raio {radiusKm} km
                  <input
                    className="accent-[#71b549]"
                    max="16"
                    min="4"
                    onChange={(event) => {
                      setSelectedCell(null);
                      setRadiusKm(Number(event.target.value));
                    }}
                    type="range"
                    value={radiusKm}
                  />
                </label>
                <label className="mt-3 grid gap-1 text-xs font-bold text-white/70">
                  Opacidade {formatNumber(gridOpacity * 100)}%
                  <input
                    className="accent-[#71b549]"
                    max="0.65"
                    min="0.15"
                    onChange={(event) => setGridOpacity(Number(event.target.value))}
                    step="0.05"
                    type="range"
                    value={gridOpacity}
                  />
                </label>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] hidden rounded-2xl border border-white/15 bg-[#102417]/90 p-4 text-white shadow-xl backdrop-blur sm:bottom-6 sm:left-6 sm:block">
              <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#acd494]">
                Legenda da camada
              </p>
              <div className="grid gap-2">
                {legendItems.map((item) => (
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/78" key={item.label}>
                    <span className="h-3 w-8 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-[1000] max-w-none rounded-2xl border border-white/15 bg-[#102417]/90 p-4 text-white shadow-xl backdrop-blur sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-[300px]">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl"
                  style={{ backgroundColor: `${activeStyle.color}22`, color: activeStyle.color }}
                >
                  <ActiveMetricIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/55">
                    {activeMetric.subtitle}
                  </p>
                  <p className="text-2xl font-black leading-none">{activeMetric.value}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-snug text-white/78">
                {selectedCell
                  ? `Talhão ${selectedCell.row + 1}-${selectedCell.col + 1}: ${selectedCell.label.toLowerCase()}.`
                  : activeMetric.recommendation}
              </p>
            </div>

            <div className="absolute left-1/2 top-4 z-[1000] hidden -translate-x-1/2 rounded-full border border-white/15 bg-[#102417]/90 px-4 py-2 text-xs font-bold text-white/75 shadow-xl backdrop-blur lg:flex lg:items-center lg:gap-2">
              <MousePointer2 className="h-4 w-4 text-[#acd494]" aria-hidden="true" />
              Clique no mapa para analisar outro ponto
            </div>

            {isLoading && (
              <div className="absolute inset-0 z-[1001] grid place-items-center bg-[#102417]/35 text-white backdrop-blur-[2px]">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-[#102417]/90 px-4 py-3 text-sm font-bold">
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Atualizando dados da área
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#102417] p-3 text-white sm:p-4">
            <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-9">
            {[
              {
                icon: ThermometerSun,
                label: "Temperatura",
                value: `${formatNumber(readings.temperature)}°C`,
              },
              {
                icon: Thermometer,
                label: "Sensação",
                value: `${formatNumber(readings.apparentTemperature)}°C`,
              },
              {
                icon: CloudRain,
                label: "Chuva 24h",
                value: `${formatNumber(readings.precipitation, 1)} mm`,
              },
              {
                icon: CloudSun,
                label: "Nuvens",
                value: `${formatNumber(readings.cloudCover)}%`,
              },
              {
                icon: Droplets,
                label: "Evapotranspiração",
                value: `${formatNumber(readings.evapotranspiration, 1)} mm`,
              },
              {
                icon: Wind,
                label: "Rajadas",
                value: `${formatNumber(readings.gust)} km/h`,
              },
              {
                icon: Cloud,
                label: "Ponto orvalho",
                value: `${formatNumber(readings.dewPoint, 1)}°C`,
              },
              {
                icon: CircleGauge,
                label: "Pressão",
                value: `${formatNumber(readings.pressure)} hPa`,
              },
              {
                icon: Timer,
                label: "Janela",
                value: "24h",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="flex min-h-[84px] min-w-0 items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3 ring-1 ring-white/[0.03]"
                  key={item.label}
                >
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-[#acd494]/10 text-[#acd494]">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="max-w-full break-words text-[10px] font-black uppercase tracking-wider text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-1 max-w-full break-words text-[16px] font-black leading-tight">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        <section className="mt-7 rounded-[18px] border border-[#d9d4bd] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#6e765f]">
                Leituras para fazendeiros
              </p>
              <h3 className="mt-1 text-xl font-black text-[#16281e]">
                Dados práticos para manejo diário
              </h3>
            </div>
            <p className="max-w-[520px] text-sm leading-6 text-[#3d4637]">
              Estes cards cruzam clima, solo e radiação para transformar a previsão em
              decisões de campo mais rápidas.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {farmData.map((item) => {
              const Icon = item.icon;
              const style = levelStyle(item.level);

              return (
                <article className="rounded-2xl border border-[#e1ddca] bg-[#faf9f3] p-4" key={item.title}>
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl ${style.bg} ${style.text}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-black text-[#16281e]">{item.title}</h4>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <strong className="text-2xl font-black leading-none text-[#16281e]">
                      {item.value}
                    </strong>
                    <span className="text-xs font-semibold text-[#6e765f]">{item.detail}</span>
                  </div>
                  <p className="mt-3 text-sm leading-snug text-[#3d4637]">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[18px] border border-[#d9d4bd] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#6e765f]">
                  Dados para alterar o mapa
                </p>
                <h3 className="mt-1 text-xl font-black text-[#16281e]">Área e visualização</h3>
              </div>
              <MapPin className="h-6 w-6 text-[#71b549]" aria-hidden="true" />
            </div>

            <div className="grid gap-3">
              {regions.map((region) => {
                const isSelected =
                  region.name === selectedArea.name && region.state === selectedArea.state;
                return (
                  <button
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-[#71b549] bg-[#71b549]/10 text-[#16281e]"
                        : "border-[#e1ddca] bg-[#faf9f3] text-[#3d4637] hover:border-[#acd494]"
                    }`}
                    key={region.name}
                    onClick={() => selectRegion(region)}
                    type="button"
                  >
                    <span>
                      <strong className="block text-sm font-black">
                        {region.name}, {region.state}
                      </strong>
                      <span className="mt-1 block text-xs font-semibold text-[#6e765f]">
                        {region.crop}
                      </span>
                    </span>
                    <span className="text-xs font-black text-[#3b5e26]">
                      {formatNumber(Math.abs(region.lat), 2)}°
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 border-t border-[#e1ddca] pt-5 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-[#e1ddca] bg-[#faf9f3] px-4 py-3 text-sm font-bold text-[#3d4637]">
                <input
                  checked={showGrid}
                  className="h-4 w-4 accent-[#71b549]"
                  onChange={(event) => setShowGrid(event.target.checked)}
                  type="checkbox"
                />
                Grade de talhões
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-[#e1ddca] bg-[#faf9f3] px-4 py-3 text-sm font-bold text-[#3d4637]">
                <input
                  checked={showRadius}
                  className="h-4 w-4 accent-[#71b549]"
                  onChange={(event) => setShowRadius(event.target.checked)}
                  type="checkbox"
                />
                Raio analisado
              </label>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-[#e1ddca] bg-[#faf9f3] p-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#3d4637]">
                Raio analisado: {radiusKm} km
                <input
                  className="w-full accent-[#71b549]"
                  max="16"
                  min="4"
                  onChange={(event) => {
                    setSelectedCell(null);
                    setRadiusKm(Number(event.target.value));
                  }}
                  type="range"
                  value={radiusKm}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#3d4637]">
                Opacidade: {formatNumber(gridOpacity * 100)}%
                <input
                  className="w-full accent-[#71b549]"
                  max="0.65"
                  min="0.15"
                  onChange={(event) => setGridOpacity(Number(event.target.value))}
                  step="0.05"
                  type="range"
                  value={gridOpacity}
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl bg-[#f3f8ef] p-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#3b5e26]">
                <Crosshair className="h-4 w-4" aria-hidden="true" />
                Status
              </p>
              <p className="mt-2 text-sm leading-6 text-[#3d4637]">
                {apiStatus}. Última leitura: {readings.updatedAt}. O mapa está usando a
                camada <strong>{activeMetric.title}</strong> para colorir os talhões.
              </p>
            </div>
          </section>

          <section className="rounded-[18px] border border-[#d9d4bd] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#6e765f]">
                Camadas de decisão
              </p>
              <h3 className="mt-1 text-xl font-black text-[#16281e]">
                Escolha o dado que pinta o mapa
              </h3>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const style = levelStyle(metric.level);
                const isActive = metric.id === activeMetricId;

                return (
                  <button
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      isActive
                        ? "border-[#3b5e26] bg-[#f3f8ef] shadow-[0_14px_30px_rgb(59_94_38_/_14%)]"
                        : "border-[#e1ddca] bg-[#faf9f3] hover:border-[#acd494]"
                    }`}
                    key={metric.id}
                    onClick={() => {
                      setSelectedCell(null);
                      setActiveMetricId(metric.id);
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl ${style.bg} ${style.text}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-black text-[#16281e]">{metric.title}</h4>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#6e765f]">
                      {metric.subtitle}
                    </p>
                    <div className="mt-4 flex flex-wrap items-end gap-2">
                      <strong className="text-2xl font-black leading-none text-[#16281e]">
                        {metric.value}
                      </strong>
                      <span className="text-xs font-semibold text-[#6e765f]">{metric.unit}</span>
                    </div>
                    <p className="mt-3 text-sm leading-snug text-[#3d4637]">
                      {metric.recommendation}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default AgroDashboard;
