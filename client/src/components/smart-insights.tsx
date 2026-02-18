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
    if (isRaining) return "Pack a raincoat or umbrella.";
    if (isCold) return "Layer up! A warm jacket is recommended.";
    if (isHot) return "Light, breathable clothing is best.";
    return "Comfortable casual wear is perfect.";
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
            <Shirt className="w-4 h-4" /> What to Wear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{clothingRecommendation()}</p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sun className="w-4 h-4" /> Comfort Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">{activityScore()}/100</div>
            <p className="text-sm text-muted-foreground">
              {activityScore() > 80 ? "Perfect for outdoor activities!" : "Ideally suited for indoor plans."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
