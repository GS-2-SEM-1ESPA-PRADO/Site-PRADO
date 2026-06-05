import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import { buscarClimaAtual, urlTileMapa } from "../lib/api.js";

// corrige ícone quebrado do leaflet no react
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FALLBACK = [-15.7801, -47.9292];

export default function Mapa() {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // A localização aproximada vem do IP do visitante (sem chave de API).
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then(async (data) => {
        const lat = data.latitude || FALLBACK[0];
        const lon = data.longitude || FALLBACK[1];

        setPosition([lat, lon]);

        // O clima atual agora vem do nosso backend, que conversa com a
        // OpenWeatherMap por baixo dos panos (a chave fica no servidor).
        try {
          const climaAtual = await buscarClimaAtual(lat, lon);
          setWeather(climaAtual);
        } catch {
          // Sem clima: o mapa continua funcionando, apenas sem o card.
          setWeather(null);
        }
      })
      .catch(() => {
        setPosition(FALLBACK);
      });
  }, []);

  if (!position) {
    return (
      <div
        className="flex h-[320px] w-full items-center justify-center bg-[#1a2e10]/60 sm:h-[450px] lg:h-[600px]"
      >
        <p className="text-white/60 text-sm">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[320px] w-full sm:h-[450px] lg:h-[600px]">

      {/* CARD CLIMA */}
      {weather && (
        <div className="absolute left-3 top-3 z-[1000] max-w-[calc(100%-24px)] rounded-xl border border-white/10 bg-[#1a2e10]/90 p-3 text-white shadow-xl backdrop-blur-sm sm:left-4 sm:top-4 sm:min-w-[190px] sm:p-4">
          <p className="text-xs uppercase tracking-widest text-[#71b549] font-bold mb-2">
            Clima atual
          </p>

          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icone}@2x.png`}
              alt=""
              className="h-12 w-12 sm:h-14 sm:w-14"
            />

            <div>
              <p className="text-2xl font-bold leading-none sm:text-3xl">
                {weather.temperatura}°
              </p>

              <p className="text-sm text-white/70 capitalize">
                {weather.descricao}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div>
              <p className="text-white/40">Umidade</p>
              <p className="font-semibold">
                {weather.umidade}%
              </p>
            </div>

            <div>
              <p className="text-white/40">Vento</p>
              <p className="font-semibold">
                {weather.vento} km/h
              </p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={position}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        {/* MAPA BASE */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CAMADA DE CHUVA (servida pelo backend) */}
        <TileLayer
          opacity={0.5}
          url={urlTileMapa("chuva")}
        />

        {/* CAMADA DE NUVENS (servida pelo backend) */}
        <TileLayer
          opacity={0.3}
          url={urlTileMapa("nuvens")}
        />

        <Marker position={position}>
          <Popup>
            Região aproximada do usuário
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
