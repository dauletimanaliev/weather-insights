import { useCities, useWeather } from "@/hooks/use-weather";
import { getSportRecommendations } from "@/hooks/use-sport-recommendations";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Info, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SportPage() {
  const { data: cities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Default to first city if none selected
  const activeCity = selectedCityId ? cities?.find(c => c.id === selectedCityId) : cities?.[0];
  const { data: weather, isLoading } = useWeather(activeCity?.lat, activeCity?.lon);

  const recommendations = weather ? getSportRecommendations(weather) : [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-4 py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block bg-orange-500/10 p-4 rounded-full text-orange-600 mb-2"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-gradient">Спорт және белсенділік</h1>
          <p className="text-muted-foreground">Ауа райына қарап бүгінгі ең қолайлы спорт түрін таңдаңыз.</p>
        </section>

        {/* City Selector */}
        <section className="flex flex-wrap gap-2 justify-center">
          {cities?.map(city => (
            <button
              key={city.id}
              onClick={() => setSelectedCityId(city.id)}
              className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                (activeCity?.id === city.id) 
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                : "bg-white/50 border-border hover:border-primary/50"
              }`}
            >
              <MapPin className="w-3 h-3" />
              {city.name}
            </button>
          ))}
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
        ) : !activeCity ? (
          <div className="text-center py-20 glass-panel rounded-3xl">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Ұсыныстарды көру үшін алдымен басты бетте қала қосыңыз.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((sport, idx) => (
              <motion.div
                key={sport.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-none shadow-xl glass-panel group hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl bg-white/50 p-3 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                          {sport.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{sport.name}</h3>
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                            sport.type === 'outdoor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sport.type === 'outdoor' ? 'Далада' : sport.type === 'indoor' ? 'Залда' : 'Кез келген жерде'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-black ${
                          sport.score > 80 ? 'text-green-500' : sport.score > 50 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {sport.score}%
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold italic">ҰППАЙ</div>
                      </div>
                    </div>
                    
                    <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sport.score}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full ${
                          sport.score > 80 ? 'bg-green-500' : sport.score > 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                       <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary opacity-50" />
                       {sport.advice}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
