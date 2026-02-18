import { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { useSearchCities, useAddCity, useCities } from "@/hooks/use-weather";
import { Loader2, Plus, Check } from "lucide-react";
import { useLocation } from "wouter";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearchCities(query);
  const { data: savedCities } = useCities();
  const addCity = useAddCity();
  const [, setLocation] = useLocation();

  const isSaved = (lat: number, lon: number) => {
    return savedCities?.some(c => c.lat === String(lat) && c.lon === String(lon));
  };

  const handleAdd = async (city: any) => {
    if (isSaved(city.latitude, city.longitude)) return;
    
    await addCity.mutateAsync({
      name: city.name,
      lat: String(city.latitude),
      lon: String(city.longitude),
      country: city.country,
      admin1: city.admin1,
    });
    setLocation("/");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-display font-bold mb-6">Орынды табу</h1>
        
        <Input
          placeholder="Қаланың атын енгізіңіз..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-lg py-6 mb-8"
          autoFocus
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {results?.map((city: any) => {
              const saved = isSaved(city.latitude, city.longitude);
              return (
                <div 
                  key={city.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="font-bold text-lg">{city.name}</div>
                    <div className="text-muted-foreground">
                      {[city.admin1, city.country].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAdd(city)}
                    disabled={saved || addCity.isPending}
                    className={`p-2 rounded-full transition-all ${
                      saved 
                        ? "bg-green-100 text-green-600 cursor-default" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              );
            })}
            
            {query.length > 2 && results?.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                "{query}" үшін ешқандай орын табылмады
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
