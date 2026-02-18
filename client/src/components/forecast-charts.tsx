import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type WeatherData } from "@shared/schema";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

export function HourlyForecast({ data }: { data: WeatherData }) {
  // Take next 24 hours
  const chartData = data.hourly.slice(0, 24).map(hour => ({
    time: format(parseISO(hour.time), "HH:mm"),
    temp: Math.round(hour.temperature),
    rain: hour.precipitationProbability,
  }));

  return (
    <Card className="glass-panel border-none">
      <CardHeader>
        <CardTitle>24-Hour Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                interval={3}
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyForecast({ data }: { data: WeatherData }) {
  const getDayName = (dateStr: string) => {
    return format(parseISO(dateStr), "EEEE");
  };

  return (
    <Card className="glass-panel border-none h-full">
      <CardHeader>
        <CardTitle>7-Day Outlook</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.daily.map((day) => (
            <div key={day.date} className="flex items-center justify-between p-2 hover:bg-black/5 rounded-lg transition-colors">
              <span className="font-medium w-24">{getDayName(day.date)}</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-end">
                   <span className="text-sm font-bold">{Math.round(day.tempMax)}°</span>
                   <span className="text-xs text-muted-foreground">/ {Math.round(day.tempMin)}°</span>
                </div>
              </div>
              <div className="w-20 text-right text-xs text-muted-foreground">
                {day.precipitationSum > 0 ? `${day.precipitationSum}mm rain` : "Clear"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
