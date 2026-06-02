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

export default function Mapa() {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);

  const FALLBACK = [-15.7801, -47.9292]; // Brasília

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
        className="flex items-center justify-center bg-[#1a2e10]/60 h-[300px] sm:h-[450px] lg:h-[600px] w-full"
      >
        <p className="text-white/60 text-sm">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] sm:h-[450px] lg:h-[600px]">

      {/* CARD CLIMA */}
      {weather && (
        <div className="absolute top-4 left-4 z-[1000] bg-[#1a2e10]/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-white shadow-xl min-w-[190px]">
          <p className="text-xs uppercase tracking-widest text-[#71b549] font-bold mb-2">
            Clima atual
          </p>

          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt=""
              className="w-14 h-14"
            />

            <div>
              <p className="text-3xl font-bold leading-none">
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