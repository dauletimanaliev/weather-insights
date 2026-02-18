import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import { useCities, useWeather, useWeatherAssistant } from "@/hooks/use-weather";
import { CurrentWeather } from "@/components/weather-card";
import { HourlyForecast, DailyForecast } from "@/components/forecast-charts";
import { SmartInsights } from "@/components/smart-insights";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CityDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = Number(params.id);

  const { data: cities } = useCities();
  const city = cities?.find(c => c.id === id);

  // If city not found (e.g., direct link but list not loaded yet or invalid ID)
  // we wait for cities to load.
  const { data: weather, isLoading: isLoadingWeather } = useWeather(city?.lat, city?.lon);

  // AI Assistant State
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const assistant = useWeatherAssistant();

  const handleAsk = async () => {
    if (!question.trim() || !weather || !city) return;
    try {
      const response = await assistant.mutateAsync({
        question,
        context: { city: city.name, weather }
      });
      setAnswer(response.answer);
    } catch (err) {
      console.error(err);
    }
  };

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

            {/* AI Insight Bar */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-violet-500 text-white p-2 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask anything about the weather</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setChatOpen(!chatOpen)}
                className="border-violet-500/20 hover:bg-violet-500/10"
              >
                {chatOpen ? "Close" : "Ask AI"}
              </Button>
            </div>

            {/* AI Chat Area */}
            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-panel rounded-xl p-4 mb-4">
                    {answer && (
                      <div className="mb-4 bg-secondary/50 p-3 rounded-lg text-sm">
                        {answer}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={`e.g., Is it good for a picnic in ${city?.name}?`}
                        className="bg-white/50"
                        onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                      />
                      <Button 
                        onClick={handleAsk} 
                        disabled={assistant.isPending}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {assistant.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Charts & Insights */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <HourlyForecast data={weather} />
                <SmartInsights data={weather} />
              </div>
              <div className="lg:col-span-1">
                <DailyForecast data={weather} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Unable to load weather data.
          </div>
        )}
      </div>
    </Layout>
  );
}
