import { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchCities, useCities, useAddCity, useDeleteCity } from "@/hooks/use-weather";
import { Search, MapPin, Trash2, Loader2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { data: results, isLoading: isSearching } = useSearchCities(search);
  const { data: savedCities, isLoading: isLoadingCities } = useCities();
  const addCity = useAddCity();
  const deleteCity = useDeleteCity();

  // Handle adding a city from search
  const handleSelectCity = async (result: any) => {
    // Check if already exists
    const exists = savedCities?.some(c => c.lat === String(result.latitude) && c.lon === String(result.longitude));
    if (exists) {
      const city = savedCities?.find(c => c.lat === String(result.latitude) && c.lon === String(result.longitude));
      setLocation(`/city/${city?.id}`);
      return;
    }

    try {
      await addCity.mutateAsync({
        name: result.name,
        lat: String(result.latitude),
        lon: String(result.longitude),
        country: result.country,
        admin1: result.admin1,
      });
      setSearch("");
    } catch (error) {
      console.error("Failed to add city", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <section className="text-center space-y-4 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-gradient"
          >
            Ақылды ауа райы
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Нақты уақыттағы болжамдар және күніңізге арналған ақылды кеңестер.
          </motion.p>
        </section>

    
        {/* Saved Cities Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold">Сіздің орындарыңыз</h2>
          </div>

          {isLoadingCities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : savedCities?.length === 0 ? (
            <Card className="border-dashed border-2 border-muted bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-medium text-lg">Сақталған орындар жоқ</h3>
                <p className="text-muted-foreground">Бастау үшін жоғарыдағы қаланың атын жазыңыз.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedCities?.map((city) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={city.id}
                  className="group relative"
                >
                  <Link href={`/city/${city.id}`}>
                    <div className="block bg-card hover:bg-accent/5 hover:border-accent/50 border border-border transition-all duration-300 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{city.name}</h3>
                          <p className="text-sm text-muted-foreground">{city.country}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm font-medium text-primary">
                        Болжамды көру <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteCity.mutate(city.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
