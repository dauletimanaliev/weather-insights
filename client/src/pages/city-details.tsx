import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import { useCities, useWeather, getWeatherThemeClass, useAirQuality } from "@/hooks/use-weather";
import { CurrentWeather } from "@/components/weather-card";
import { HourlyForecast, DailyForecast } from "@/components/forecast-charts";
import { SmartInsights } from "@/components/smart-insights";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Loader2, Sparkles, Wind, Droplets, Activity, Thermometer, Gauge, Sun, MessageCircle, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityScore } from "@/components/activity-score";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

export default function CityDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = Number(params.id);

  const { data: cities } = useCities();
  const city = cities?.find(c => c.id === id);

  const { data: weather, isLoading: isLoadingWeather } = useWeather(city?.lat, city?.lon);
  const { data: aqi } = useAirQuality(city?.lat || "", city?.lon || "");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Сәлеметсіз бе! Мен ${city?.name || "осы қала"} бойынша көмекшіңізбін. Қазіргі ауа райына байланысты сұрағыңыз бар ма?`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleQuestionSelect = (question: string, getAnswer: () => string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: question }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: getAnswer() }]);
    }, 600);
  };

  const themeClass = weather ? getWeatherThemeClass(weather.current.weatherCode) : "";

  if (!city && !cities) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!city && cities) {
    setLocation("/");
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${themeClass}`}>
      <Layout>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            className="rounded-full hover:bg-muted"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{city?.name}</h1>
            <p className="text-muted-foreground text-sm">{city?.country}</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingWeather ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-3xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-[200px] rounded-2xl" />
              <Skeleton className="h-[200px] rounded-2xl" />
            </div>
          </div>
        ) : weather ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6"
          >
            {/* Main Weather Card */}
            <CurrentWeather data={weather} city={city!.name} />

            {/* Charts & Insights */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <HourlyForecast data={weather} />
                
                {/* Technical Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel rounded-3xl p-6 flex items-center gap-4"
                  >
                    <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ылғалдылық</p>
                      <p className="text-xl font-bold">{weather.current.humidity}%</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel rounded-3xl p-6 flex items-center gap-4"
                  >
                    <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500">
                      <Sun className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">УК Индекс</p>
                      <p className="text-xl font-bold">{weather.current.uvIndex}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel rounded-3xl p-6 flex items-center gap-4"
                  >
                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Қысым</p>
                      <p className="text-xl font-bold">{Math.round(weather.current.pressure)} <span className="text-xs font-normal">hPa</span></p>
                    </div>
                  </motion.div>
                </div>

                {/* City Specific Inline FAQ Chat */}
                {city && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-3xl flex flex-col border-white/20 overflow-hidden relative min-h-[400px]"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Сұрақ-жауап ({city.name})</h3>
                        <p className="text-xs text-muted-foreground">Жергілікті ауа райы бойынша кеңес</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div 
                      ref={scrollRef}
                      className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[300px] scrollbar-thin overflow-x-hidden"
                    >
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted border border-border/50 flex gap-1">
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Question Actions */}
                    <div className="p-4 bg-muted/20 border-t border-white/10 flex flex-wrap gap-2">
                       <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs font-medium bg-background/50 hover:bg-muted"
                          onClick={() => handleQuestionSelect("Қазір не киіп шыққан дұрыс?", () => {
                            const t = Math.round(weather.current.temperature);
                            const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.current.weatherCode);
                            if(t < 0) return "Аяз бар. Қалың куртка, бөрік және қолғап киюді ұсынамыз.";
                            if(t < 10) return "Күн салқын. Жылы күрте немесе пальто кигеніңіз дұрыс.";
                            if(t < 20) return "Ауа райы қолайлы. Жемпір немесе жеңіл куртка жеткілікті.";
                            return "Күн жылы. Жеңіл киім жарайды." + (isRaining ? " Қолшатыр алуды ұмытпаңыз!" : "");
                          })}
                        >
                          Қазір не киіп шыққан дұрыс?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs font-medium bg-background/50 hover:bg-muted"
                          onClick={() => handleQuestionSelect("Серуендеуге бола ма?", () => {
                            const t = Math.round(weather.current.temperature);
                            const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.current.weatherCode);
                            const isSnowing = [71, 73, 75, 77, 85, 86].includes(weather.current.weatherCode);
                            const wSpeed = Math.round(weather.current.windSpeed);
                            if(isRaining) return "Жаңбыр жауып тұр, қолшатыр алғаныңыз жөн.";
                            if(isSnowing) return "Қар жауып тұр, дала өте әдемі, бірақ жылы киініңіз.";
                            if(t < -10) return "Күн тым суық, ұзақ серуендеуді ұсынбаймыз.";
                            if(wSpeed > 30) return "Жел өте күшті, абай болыңыз.";
                            return "Ауа райы серуендеуге тамаша!";
                          })}
                        >
                          Серуендеуге бола ма?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs font-medium bg-background/50 hover:bg-muted"
                          onClick={() => handleQuestionSelect(`${city.name} қаласындағы қазіргі ауа райы?`, () => {
                            const t = Math.round(weather.current.temperature);
                            const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.current.weatherCode);
                            const isSnowing = [71, 73, 75, 77, 85, 86].includes(weather.current.weatherCode);
                            const wSpeed = Math.round(weather.current.windSpeed);
                            const conditionStr = isRaining ? "Жаңбыр жауып тұр" : isSnowing ? "Қар жауып тұр" : "Жауын-шашынсыз ашық";
                            return `Қазір температура ${t}°C, жел жылдамдығы ${wSpeed} км/сағ. ${conditionStr}.`;
                          })}
                        >
                          {city.name} қаласындағы қазіргі ауа райы?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs font-medium bg-background/50 hover:bg-muted"
                          onClick={() => handleQuestionSelect("Ауа сапасы қандай?", () => {
                            if (!aqi) return "Кешіріңіз, қазір ауа сапасы туралы мәлімет жоқ.";
                            if (aqi.pm2_5 < 12) return "Ауа сапасы тамаша! Бүгін таза ауада серуендеуге өте қолайлы уақыт.";
                            if (aqi.pm2_5 < 35) return "Ауа сапасы қанағаттанарлық. Сезімтал адамдарға сақ болу ұсынылады.";
                            return "Ауа сапасы төмен. Далаға шыққанда бетперде киген жөн немесе үйде болыңыз.";
                          })}
                        >
                          Ауа сапасы қандай?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs font-medium bg-background/50 hover:bg-muted"
                          onClick={() => handleQuestionSelect("Ертеңгі ауа райы қандай?", () => {
                            if (!weather.daily || weather.daily.length < 2) return "Ертеңгі болжам әлі жүктелген жоқ.";
                            const tomorrow = weather.daily[1];
                            const tMax = Math.round(tomorrow.tempMax);
                            const tMin = Math.round(tomorrow.tempMin);
                            const code = tomorrow.weatherCode;
                            const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
                            const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);
                            const conditionStr = isRaining ? "жаңбыр жауады" : isSnowing ? "қар жауады" : "күн ашық болады";
                            
                            return `Ертең ${conditionStr}. Температура күндіз ${tMax}°C, түнде ${tMin}°C болады деп күтілуде.`;
                          })}
                        >
                          Ертеңгі ауа райы қандай?
                        </Button>
                    </div>
                  </motion.div>
                )}

                {/* Activity Score Card */}
                <ActivityScore data={weather} />
                
                {/* Air Quality Index Card */}
                {aqi && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-3xl p-6 border-white/20"
                  >
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <Activity className="w-5 h-5" />
                      <h3 className="font-semibold">Ауа сапасы (AQI)</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/30 dark:bg-black/20 p-4 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">PM2.5</p>
                        <p className="text-xl font-bold">{aqi.pm2_5} <span className="text-xs font-normal">µg/m³</span></p>
                      </div>
                      <div className="bg-white/30 dark:bg-black/20 p-4 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">PM10</p>
                        <p className="text-xl font-bold">{aqi.pm10} <span className="text-xs font-normal">µg/m³</span></p>
                      </div>
                      <div className="bg-white/30 dark:bg-black/20 p-4 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">Озон (O₃)</p>
                        <p className="text-xl font-bold">{Math.round(aqi.ozone)} <span className="text-xs font-normal">µg/m³</span></p>
                      </div>
                      <div className="bg-white/30 dark:bg-black/20 p-4 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">NO₂</p>
                        <p className="text-xl font-bold">{Math.round(aqi.nitrogen_dioxide)} <span className="text-xs font-normal">µg/m³</span></p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        {aqi.pm2_5 < 12 
                          ? "Ауа сапасы тамаша! Бүгін таза ауада серуендеуге өте қолайлы уақыт." 
                          : aqi.pm2_5 < 35 
                          ? "Ауа сапасы қанағаттанарлық. Сезімтал адамдарға сақ болу ұсынылады." 
                          : "Ауа сапасы төмен. Далаға шыққанда бетперде киген жөн немесе үйде болыңыз."}
                      </p>
                    </div>
                  </motion.div>
                )}

                <SmartInsights data={weather} />

                {/* SmartInsights was below Activity and AQI - kept order below Chat */}
              </div>
              <div className="lg:col-span-1">
                <DailyForecast data={weather} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Ауа райы мәліметтерін жүктеу мүмкін болмады.
          </div>
        )}
      </div>
      </Layout>
    </div>
  );
}
