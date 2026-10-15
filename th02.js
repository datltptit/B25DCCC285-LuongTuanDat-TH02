const { useState, useEffect } = React;

const CITIES = [
  { id: 1, name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { id: 2, name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { id: 3, name: "Huế", lat: 16.4637, lon: 107.5909 },
  { id: 4, name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { id: 5, name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { id: 6, name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { id: 7, name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { id: 8, name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
];

const getWeatherInfo = (code) => {
  if (code === 0) return { icon: "☀️", desc: "Trời quang" };
  if (code === 1 || code === 2) return { icon: "⛅", desc: "Ít mây" };
  if (code === 3) return { icon: "☁️", desc: "Nhiều mây" };
  if (code === 45 || code === 48) return { icon: "🌫️", desc: "Sương mù" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", desc: "Mưa phùn" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", desc: "Mưa" };
  if (code >= 71 && code <= 77) return { icon: "❄️", desc: "Tuyết rơi" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", desc: "Mưa rào" };
  if (code >= 95) return { icon: "⛈️", desc: "Dông bão" };
  return { icon: "🌤️", desc: "Không xác định" };
};

const getDayOfWeek = (dateString) => {
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C");

  const fetchWeather = async (city) => {
    if (!city) return;
    setLoading(true);
    setError(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu thời tiết từ máy chủ.");
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity);
    }
  }, [selectedCity]);

  const convertTemp = (tempC) => {
    if (unit === "F") {
      return ((tempC * 9) / 5 + 32).toFixed(1);
    }
    return tempC.toFixed(1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dự Báo Thời Tiết Việt Nam</h1>
        <button
          className="unit-toggle-btn"
          onClick={() => setUnit(unit === "C" ? "F" : "C")}
        >
          Đang hiển thị: °{unit} (Bấm để đổi sang °{unit === "C" ? "F" : "C"})
        </button>
      </header>

      <main className="main-layout">
        <aside className="sidebar">
          <h2>Danh sách thành phố</h2>
          <ul className="city-list">
            {CITIES.map((city) => (
              <li key={city.id}>
                <button
                  className={`city-btn ${
                    selectedCity?.id === city.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="content-area">
          {!selectedCity && (
            <div className="status-box">
              <p>
                👈 Vui lòng chọn một thành phố ở danh sách bên cạnh để xem thời
                tiết.
              </p>
            </div>
          )}

          {selectedCity && loading && (
            <div className="status-box">
              <p>
                ⏳ Đang tải dữ liệu thời tiết cho{" "}
                <strong>{selectedCity.name}</strong>...
              </p>
            </div>
          )}

          {selectedCity && !loading && error && (
            <div className="status-box error-box">
              <p>❌ Lỗi: {error}</p>
              <button
                className="retry-btn"
                onClick={() => fetchWeather(selectedCity)}
              >
                Thử lại
              </button>
            </div>
          )}

          {selectedCity && !loading && !error && weatherData && (
            <div className="weather-details">
              <div className="current-weather-card">
                <h2>Thời tiết hiện tại: {selectedCity.name}</h2>
                <div className="current-main">
                  <span className="weather-icon-large">
                    {getWeatherInfo(weatherData.current.weather_code).icon}
                  </span>
                  <div>
                    <p className="temp-large">
                      {convertTemp(weatherData.current.temperature_2m)}°{unit}
                    </p>
                    <p className="weather-desc">
                      {getWeatherInfo(weatherData.current.weather_code).desc}
                    </p>
                  </div>
                </div>

                <div className="current-extra">
                  <p>
                    💧 <strong>Độ ẩm:</strong>{" "}
                    {weatherData.current.relative_humidity_2m}%
                  </p>
                  <p>
                    💨 <strong>Tốc độ gió:</strong>{" "}
                    {weatherData.current.wind_speed_10m} km/h
                  </p>
                  <p>
                    🕒 <strong>Cập nhật lúc:</strong>{" "}
                    {new Date(weatherData.current.time).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="forecast-section">
                <h3>Dự báo 7 ngày tới</h3>
                <div className="forecast-grid">
                  {weatherData.daily.time.map((dateStr, index) => {
                    const code = weatherData.daily.weather_code[index];
                    const maxTemp = weatherData.daily.temperature_2m_max[index];
                    const minTemp = weatherData.daily.temperature_2m_min[index];
                    const info = getWeatherInfo(code);

                    return (
                      <div key={dateStr} className="forecast-card">
                        <p className="forecast-day">{getDayOfWeek(dateStr)}</p>
                        <p className="forecast-date">{formatDate(dateStr)}</p>
                        <div className="forecast-icon" title={info.desc}>
                          {info.icon}
                        </div>
                        <p className="forecast-desc">{info.desc}</p>
                        <p className="forecast-temps">
                          <span className="temp-max">
                            Cao: {convertTemp(maxTemp)}°{unit}
                          </span>
                          <br />
                          <span className="temp-min">
                            Thấp: {convertTemp(minTemp)}°{unit}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
