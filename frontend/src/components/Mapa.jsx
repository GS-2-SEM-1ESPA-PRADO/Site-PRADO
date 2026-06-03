import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

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

  // SUA CHAVE OPENWEATHER
  const API_KEY = "6943afc37743b85438ca0d9959fdb141";

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then(async (data) => {
        const lat = data.latitude || FALLBACK[0];
        const lon = data.longitude || FALLBACK[1];

        setPosition([lat, lon]);

        // clima atual
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
        );

        const weatherData = await weatherRes.json();

        setWeather(weatherData);
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
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt=""
              className="h-12 w-12 sm:h-14 sm:w-14"
            />

            <div>
              <p className="text-2xl font-bold leading-none sm:text-3xl">
                {Math.round(weather.main.temp)}°
              </p>

              <p className="text-sm text-white/70 capitalize">
                {weather.weather[0].description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div>
              <p className="text-white/40">Umidade</p>
              <p className="font-semibold">
                {weather.main.humidity}%
              </p>
            </div>

            <div>
              <p className="text-white/40">Vento</p>
              <p className="font-semibold">
                {Math.round(weather.wind.speed)} km/h
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

        {/* CAMADA DE CHUVA */}
        <TileLayer
          opacity={0.5}
          url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
        />

        {/* CAMADA DE NUVENS */}
        <TileLayer
          opacity={0.3}
          url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
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
