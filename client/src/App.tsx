import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CityDetails from "@/pages/city-details";
import SearchPage from "@/pages/search";
import SportPage from "@/pages/sport";
import { FaqChat } from "@/components/faq-chat";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <FaqChat />
      <Switch>
        {/* Сначала конкретные */}
        <Route path="/search" component={SearchPage} />
        <Route path="/city/:id" component={CityDetails} />
        <Route path="/sport" component={SportPage} />

        {/* Потом корень */}
        <Route path="/" component={Home} />

        {/* И в конце 404 */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
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
