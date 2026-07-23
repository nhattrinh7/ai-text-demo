import { defineTool } from 'eve/tools';
import { always } from 'eve/tools/approval';
import { z } from 'zod';

// Định dạng kết quả trả về của Open-Meteo Geocoding API (chỉ lấy các trường cần thiết).
interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Định dạng kết quả block "current" của Open-Meteo Weather API (chỉ lấy các trường cần thiết).
interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

/**
 * Map WMO weather-code ranges to human-readable descriptions.
 * Xem bảng chi tiết tại https://open-meteo.com/en/docs#weathervariables
 */
function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Fog';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 84) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export default defineTool({
  description:
    'Look up the current weather for a city by name. ' +
    'Returns temperature (°C), humidity (%), wind speed (km/h), and a ' +
    'short condition description. Uses the free Open-Meteo API.',

  inputSchema: z.object({
    city: z
      .string()
      .min(1)
      .describe('City name to look up, e.g. "Ho Chi Minh City" or "Tokyo".'),
  }),

  outputSchema: z.object({
    city: z.string(),
    country: z.string(),
    temperatureC: z.number(),
    humidityPercent: z.number(),
    windSpeedKmh: z.number(),
    condition: z.string(),
  }),

  // Mỗi lần gọi tool sẽ tạm dừng chờ người dùng phê duyệt trước khi chạy.
  approval: always(),

  async execute({ city }) {
    // ── Bước 1: Tra cứu tên thành phố → tọa độ lat/lon ──────────────────────────
    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name', city);
    geoUrl.searchParams.set('count', '1');
    geoUrl.searchParams.set('language', 'en');
    geoUrl.searchParams.set('format', 'json');

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      throw new Error(`Geocoding request failed (HTTP ${geoRes.status}).`);
    }

    const geoData = (await geoRes.json()) as { results?: GeoResult[] };

    if (!geoData.results?.length) {
      throw new Error(
        `Could not find a location matching "${city}". ` +
          'Try a different spelling or a nearby major city.'
      );
    }

    const { name, country, latitude, longitude } = geoData.results[0];

    // ── Bước 2: Lấy thông tin thời tiết hiện tại từ tọa độ đó ───────────
    const wxUrl = new URL('https://api.open-meteo.com/v1/forecast');
    wxUrl.searchParams.set('latitude', String(latitude));
    wxUrl.searchParams.set('longitude', String(longitude));
    wxUrl.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
    );

    const wxRes = await fetch(wxUrl);
    if (!wxRes.ok) {
      throw new Error(`Weather request failed (HTTP ${wxRes.status}).`);
    }

    const wxData = (await wxRes.json()) as { current: CurrentWeather };
    const cur = wxData.current;

    return {
      city: name,
      country,
      temperatureC: cur.temperature_2m,
      humidityPercent: cur.relative_humidity_2m,
      windSpeedKmh: cur.wind_speed_10m,
      condition: describeWeatherCode(cur.weather_code),
    };
  },
});
