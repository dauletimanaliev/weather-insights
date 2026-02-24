import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CityDetails from "@/pages/city-details";
import SearchPage from "@/pages/search";

function Router() {
  return (
    <Switch>
      {/* Сначала конкретные */}
      <Route path="/search" component={SearchPage} />
      <Route path="/city/:id" component={CityDetails} />

      {/* Потом корень */}
      <Route path="/" component={Home} />

      {/* И в конце 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
