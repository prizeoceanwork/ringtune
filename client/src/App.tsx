import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Account from "@/pages/account";
import Wallet from "@/pages/wallet";
import Orders from "@/pages/orders";
import PastWinners from "@/pages/past-winners";
import Checkout from "@/pages/checkout";
import Competition from "@/pages/competition";
import PlayGame from "@/pages/play-game";
import Login from "@/pages/login";
import Register from "@/pages/register";
import spinWheel from "./pages/spinWheel";
import WalletSuccess from "./pages/success";
import SpinWheel from "./components/games/spinwheeltest";
import CheckoutSuccess from "./pages/competion-success";
import RingtonePoints from "./pages/ringtunePoints";
import ScratchCard from "./components/games/scratch-card";
import scratchcard from "./pages/scratch-card";
import PaymentCancelled from "./pages/cancelled";
import PaymentFailed from "./pages/failed";
import CheckoutFailed from "./pages/competition-failed";
import CheckoutCancelled from "./pages/competition-cancelled";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - always available */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Conditional routes based on auth status */}
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/competition/:id" component={Competition} />
          <Route path="/play/:id" component={PlayGame} />
          <Route path="/winners" component={PastWinners} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/competition/:id" component={Competition} />
          <Route path="/play/:id" component={PlayGame} />
          <Route path="/account" component={Account} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/orders" component={Orders} />
          <Route path="/winners" component={PastWinners} />
          <Route path="/checkout/:orderId" component={Checkout} />
          <Route path="/spin-wheel-test" component={spinWheel} />
          <Route path="/wallet/success" component={WalletSuccess} />
          <Route path="/wallet/cancelled" component={PaymentCancelled} />
          <Route path="/wallet/failed" component={PaymentFailed} />
          <Route path="/success/competition" component={CheckoutSuccess} />
          <Route path="/failed" component={CheckoutFailed} />
          <Route path="/cancelled" component={CheckoutCancelled} />
          <Route path="/ringtune-points" component={RingtonePoints} />
          <Route path="/scratch" component={scratchcard} />

        </>
      )}
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
