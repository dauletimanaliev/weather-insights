import { type WeatherData } from "@shared/schema";

export interface SportRecommendation {
  name: string;
  score: number;
  advice: string;
  type: "outdoor" | "indoor" | "both";
  icon: string;
}

export function getSportRecommendations(data: WeatherData): SportRecommendation[] {
  const current = data.current;
  const temp = current.temperature;
  const wind = current.windSpeed;
  const uv = current.uvIndex;
  const weatherCode = current.weatherCode;
  
  // Weather status
  const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isSnowing = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);
  const isClear = [0, 1].includes(weatherCode);

  const sports: SportRecommendation[] = [
    {
      name: "Футбол",
      type: "outdoor",
      icon: "⚽",
      ...calculateFootball(temp, isRaining, isStormy, wind)
    },
    {
      name: "Теннис",
      type: "outdoor",
      icon: "🎾",
      ...calculateTennis(temp, isRaining, wind, isClear)
    },
    {
      name: "Жүгіру",
      type: "outdoor",
      icon: "🏃",
      ...calculateRunning(temp, isRaining, isSnowing, wind)
    },
    {
      name: "Велосипед",
      type: "outdoor",
      icon: "🚲",
      ...calculateCycling(temp, isRaining, wind)
    },
    {
      name: "Баскетбол",
      type: "outdoor",
      icon: "🏀",
      ...calculateBasketball(temp, isRaining, wind)
    },
    {
      name: "Тауға шығу (Hiking)",
      type: "outdoor",
      icon: "🥾",
      ...calculateHiking(temp, isRaining, isStormy, wind)
    },
    {
      name: "Йога",
      type: "outdoor",
      icon: "🧘",
      ...calculateYoga(temp, isRaining, isClear)
    },
    {
      name: "Жүзу (Ашық бассейн)",
      type: "outdoor",
      icon: "🏊",
      ...calculateSwimming(temp, isClear, uv)
    },
    {
      name: "Скейтбординг",
      type: "outdoor",
      icon: "🛹",
      ...calculateSkate(temp, isRaining)
    },
    {
      name: "Волейбол",
      type: "both",
      icon: "🏐",
      ...calculateVolleyball(temp, isRaining, wind)
    }
  ];

  return sports.sort((a, b) => b.score - a.score);
}

function calculateFootball(temp: number, rain: boolean, storm: boolean, wind: number) {
  let score = 80;
  let advice = "Футбол ойнауға жақсы уақыт.";
  
  if (temp < 0) { score -= 30; advice = "Өте суық, жарақат алу қаупі жоғары. Жылы киініңіз."; }
  if (temp > 30) { score -= 20; advice = "Күн ыстық, суды көп ішіңіз."; }
  if (rain) { score -= 40; advice = "Алаң тайғақ болуы мүмкін."; }
  if (storm) { score = 0; advice = "Найзағай кезінде далада ойнау қауіпті!"; }
  
  return { score, advice };
}

function calculateTennis(temp: number, rain: boolean, wind: number, clear: boolean) {
  let score = 90;
  let advice = "Теннис үшін тамаша ауа райы.";
  
  if (rain) { score = 0; advice = "Жаңбыр кезінде кортта ойнау мүмкін емес."; }
  if (wind > 20) { score -= 50; advice = "Қатты жел доптың бағытын өзгертеді."; }
  if (temp > 32) { score -= 30; advice = "Күн өте ыстық, көлеңкеде демалыңыз."; }
  if (!clear) { score -= 10; advice = "Бұлтты, бірақ ойнауға болады."; }

  return { score, advice };
}

function calculateRunning(temp: number, rain: boolean, snow: boolean, wind: number) {
  let score = 100;
  let advice = "Жүгіруге ең қолайлы уақыт!";

  if (temp < 5) { score -= 20; advice = "Салқын, термо-киім киіңіз."; }
  if (temp > 25) { score -= 30; advice = "Ыстық, таңертең немесе кешке жүгірген дұрыс."; }
  if (rain) { score -= 50; advice = "Жаңбырлы, су өткізбейтін киім керек."; }
  if (wind > 30) { score -= 40; advice = "Қарсы жел жүгіруді қиындатады."; }

  return { score, advice };
}

function calculateCycling(temp: number, rain: boolean, wind: number) {
  let score = 90;
  let advice = "Велосипед тебуге ыңғайлы.";

  if (wind > 25) { score -= 60; advice = "Қатты жел велосипед басқаруды қиындатады."; }
  if (rain) { score -= 70; advice = "Жол тайғақ, абай болыңыз."; }
  if (temp < 10) { score -= 20; advice = "Салқын, қолғап пен жылы киім киіңіз."; }

  return { score, advice };
}

function calculateBasketball(temp: number, rain: boolean, wind: number) {
  let score = 85;
  let advice = "Стритболға арналған жақсы кеш.";

  if (rain) { score = 10; advice = "Далада ойнау мүмкін емес, заалға барған дұрыс."; }
  if (wind > 15) { score -= 30; advice = "Жел допты ұшырып әкетеді."; }
  if (temp < 5) { score -= 40; advice = "Қол тоңып, доп ұстау қиын болады."; }

  return { score, advice };
}

function calculateHiking(temp: number, rain: boolean, storm: boolean, wind: number) {
  let score = 95;
  let advice = "Тауда серуендеуге тамаша күн.";

  if (storm) { score = 0; advice = "Тауда найзағай өте қауіпті! Шықпаңыз."; }
  if (rain) { score -= 80; advice = "Соқпақтар тайғақ және қауіпті."; }
  if (temp < 0) { score -= 40; advice = "Тауда аяз, арнайы жабдық керек."; }
  if (wind > 40) { score -= 50; advice = "Биік жерлерде жел өте күшті."; }

  return { score, advice };
}

function calculateYoga(temp: number, rain: boolean, clear: boolean) {
  let score = 100;
  let advice = "Далада йога жасауға өте қолайлы.";

  if (rain) { score = 0; advice = "Жаңбыр кезінде далада йога жасау мүмкін емес."; }
  if (temp < 15) { score -= 60; advice = "Салқын, бұлшықеттер тез суып кетеді."; }
  if (temp > 30) { score -= 30; advice = "Ыстық, көлеңкелі жерді таңдаңыз."; }
  if (!clear) { score -= 10; advice = "Бұлтты, бірақ йогаға кедергі емес."; }

  return { score, advice };
}

function calculateSwimming(temp: number, clear: boolean, uv: number) {
  let score = 90;
  let advice = "Суға шомылуға болады.";

  if (temp < 22) { score -= 70; advice = "Ауа райы суға түсуге әлі салқын."; }
  if (uv > 7) { score -= 20; advice = "Ультракүлгін сәулесі жоғары, крем қолданыңыз."; }
  if (!clear) { score -= 20; advice = "Күн көзі аз, су суық болып көрінуі мүмкін."; }

  return { score, advice };
}

function calculateSkate(temp: number, rain: boolean) {
  let score = 80;
  let advice = "Скейт-паркке баруға болады.";

  if (rain) { score = 0; advice = "Тайғақ бетте скейт тебу өте қауіпті."; }
  if (temp < 5) { score -= 30; advice = "Ауа салқын, зерттеу (trick) жасау қиын."; }

  return { score, advice };
}

function calculateVolleyball(temp: number, rain: boolean, wind: number) {
  let score = 85;
  let advice = "Волейбол ойнауға жақсы уақыт.";

  if (rain) { score -= 60; advice = "Алаң су, ойнау ыңғайсыз."; }
  if (wind > 20) { score -= 40; advice = "Жел доптың бағытын бұзады."; }

  return { score, advice };
}
