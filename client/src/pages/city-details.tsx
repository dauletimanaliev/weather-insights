import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import { useCities, useWeather } from "@/hooks/use-weather";
import { CurrentWeather } from "@/components/weather-card";
import { HourlyForecast, DailyForecast } from "@/components/forecast-charts";
import { SmartInsights } from "@/components/smart-insights";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CityDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = Number(params.id);

  const { data: cities } = useCities();
  const city = cities?.find(c => c.id === id);

  const { data: weather, isLoading: isLoadingWeather } = useWeather(city?.lat, city?.lon);

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
            Ауа райы мәліметтерін жүктеу мүмкін болмады.
          </div>
        )}
      </div>
    </Layout>
  );
}
