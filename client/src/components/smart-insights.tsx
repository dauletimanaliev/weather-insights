import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type WeatherData } from "@shared/schema";
import { Shirt, Umbrella, Sun, Calendar, Info } from "lucide-react";

export function SmartInsights({ data }: { data: WeatherData }) {
  const { current, daily } = data;
  
  // Logic for insights
  const isRaining = current.weatherCode >= 51;
  const isCold = current.temperature < 15;
  const isHot = current.temperature > 25;
  const uvHigh = current.uvIndex > 5;
  
  const clothingRecommendation = () => {
    if (isRaining) return "Жамбылдайтын киім немесе қолшатыр алыңыз.";
    if (isCold) return "Жылы киініңіз! Жылы куртка кию ұсынылады.";
    if (isHot) return "Жеңіл, дем алатын киім ең жақсы таңдау болады.";
    return "Ыңғайлы күнделікті киім тамаша үйлеседі.";
  };

  const activityScore = () => {
    let score = 100;
    if (isRaining) score -= 40;
    if (current.windSpeed > 20) score -= 20;
    if (uvHigh) score -= 10;
    return Math.max(0, score);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-panel border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shirt className="w-4 h-4" /> Не кию керек
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{clothingRecommendation()}</p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sun className="w-4 h-4" /> Жайлылық индексі
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">{activityScore()}/100</div>
            <p className="text-sm text-muted-foreground">
              {activityScore() > 80 ? "Далада серуендеуге өте қолайлы!" : "Үйде қалу немесе жабық жерде жоспарлау ұсынылады."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
