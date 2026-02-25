import { motion } from "framer-motion";
import { type WeatherData } from "@shared/schema";
import { Footprints, Sun, Car, Bike, Info } from "lucide-react";

interface ActivityScoreProps {
  data: WeatherData;
}

export function ActivityScore({ data }: ActivityScoreProps) {
  const current = data.current;
  const temp = current.temperature;
  const rain = data.daily[0]?.precipitationSum || 0;
  const wind = current.windSpeed;
  const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(current.weatherCode);

  const calculateScore = (type: "running" | "picnic" | "carwash" | "cycling") => {
    let score = 100;

    if (type === "running") {
      if (temp < 0 || temp > 30) score -= 40;
      if (temp > 10 && temp < 20) score += 10;
      if (isRaining) score -= 60;
      if (wind > 20) score -= 30;
    } else if (type === "picnic") {
      if (temp < 15 || temp > 35) score -= 50;
      if (isRaining) score -= 100;
      if (current.weatherCode > 3) score -= 40;
      if (wind > 15) score -= 30;
    } else if (type === "carwash") {
      if (isRaining) score -= 100;
      // Also check forecast for tomorrow (if available)
      const tomorrowRain = data.daily[1]?.precipitationSum || 0;
      if (tomorrowRain > 0) score -= 50;
    } else if (type === "cycling") {
      if (temp < 5 || temp > 32) score -= 40;
      if (isRaining) score -= 70;
      if (wind > 25) score -= 60;
    }

    return Math.max(0, Math.min(100, score));
  };

  const activities = [
    { label: "Жүгіру", icon: Footprints, score: calculateScore("running"), color: "text-orange-500" },
    { label: "Пикник", icon: Sun, score: calculateScore("picnic"), color: "text-yellow-500" },
    { label: "Көлік жуу", icon: Car, score: calculateScore("carwash"), color: "text-blue-500" },
    { label: "Велосипед", icon: Bike, score: calculateScore("cycling"), color: "text-green-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 border-white/20"
    >
      <div className="flex items-center gap-2 mb-6">
        <Info className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Белсенділік деңгейі</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {activities.map((act) => (
          <div key={act.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <act.icon className={`w-4 h-4 ${act.color}`} />
                <span className="font-medium">{act.label}</span>
              </div>
              <span className="text-muted-foreground">{act.score}%</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${act.score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${act.score > 70 ? "bg-green-500" : act.score > 40 ? "bg-yellow-500" : "bg-red-500"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
