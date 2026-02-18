import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Umbrella, Eye } from "lucide-react";
import { format } from "date-fns";
import { type WeatherData } from "@shared/schema";
import { motion } from "framer-motion";

interface WeatherCardProps {
  data: WeatherData;
  city: string;
}

export function CurrentWeather({ data, city }: WeatherCardProps) {
  const { current } = data;

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-16 h-16 text-yellow-500" />;
    if (code <= 3) return <Cloud className="w-16 h-16 text-gray-400" />;
    if (code <= 67) return <CloudRain className="w-16 h-16 text-blue-500" />;
    return <CloudRain className="w-16 h-16 text-indigo-500" />;
  };

  const getWeatherLabel = (code: number) => {
    if (code <= 1) return "Sunny";
    if (code <= 3) return "Cloudy";
    if (code <= 67) return "Rainy";
    return "Stormy";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-display font-bold">{city}</h2>
              <p className="text-blue-100 mt-1">{format(new Date(), "EEEE, MMMM do")}</p>
              
              <div className="mt-8">
                <div className="text-6xl font-bold font-display tracking-tighter">
                  {Math.round(current.temperature)}°
                </div>
                <div className="text-xl font-medium text-blue-100 mt-2">
                  {getWeatherLabel(current.weatherCode)}
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
              {getWeatherIcon(current.weatherCode)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Metric icon={Wind} label="Wind" value={`${current.windSpeed} km/h`} />
            <Metric icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
            <Metric icon={Umbrella} label="Precip." value={`${current.pressure} hPa`} />
            <Metric icon={Eye} label="UV Index" value={current.uvIndex} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <Icon className="w-5 h-5 text-blue-100" />
      <div>
        <p className="text-xs text-blue-200">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
