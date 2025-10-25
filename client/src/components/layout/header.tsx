import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@shared/schema";
import logoImage from "@assets/Logo_1758887059353.gif";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Header() {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user as User | null;
  const logout = auth.logout;

  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const LogoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "Something went wrong",
      });
    },
  });

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    LogoutMutation.mutate();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img
                src={logoImage}
                alt="RingToneRiches Logo"
                className="w-36 h-18 md:w-48 md:h-24 object-contain"
              />
             
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/">
              <span className="nav-link text-foreground hover:text-primary font-medium cursor-pointer">
                OUR COMPETITIONS
              </span>
            </Link>
            <Link href="/winners">
              <span className="nav-link text-foreground hover:text-primary font-medium cursor-pointer">
                PAST WINNERS
              </span>
            </Link>
            <span className="nav-link text-foreground hover:text-primary font-medium">
              JACKPOTS
            </span>
          </div>

          {/* User Account & Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/wallet">
                  <button className="bg-muted  text-muted-foreground px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <i className="fas fa-wallet"></i>
                    <span>£{parseFloat(user?.balance || "0").toFixed(2)}</span>
                  </button>
                </Link>
                <Link href="/account">
                  <button className="bg-primary hidden md:block text-primary-foreground px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    MY ACCOUNT
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline border border-muted-foreground text-muted-foreground px-3 py-2 rounded-lg font-medium hover:bg-muted-foreground hover:text-background transition-colors"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <button className="border border-primary text-primary px-3 py-2 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                    LOGIN
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-primary text-primary-foreground px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    REGISTER
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 space-y-3 bg-card p-4 rounded-lg shadow-lg">
            <Link href="/">
              <span className="block mb-2 text-foreground hover:text-primary font-medium">
                OUR COMPETITIONS
              </span>
            </Link>
            <Link href="/winners">
              <span className="block  mb-2  text-foreground hover:text-primary font-medium">
                PAST WINNERS
              </span>
            </Link>
            <Link to="#">
            <span className="block text-foreground hover:text-primary font-medium">
              JACKPOTS
            </span>
            </Link>

            <hr className="border-border my-2" />

            {isAuthenticated ? (
              <>
                <Link href="/wallet">
                  <button className="bg-muted hidden md:hidden mt-3 mb-3 text-muted-foreground px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <i className="fas fa-wallet"></i>
                    <span>£{parseFloat(user?.balance || "0").toFixed(2)} </span>
                  </button>
                </Link>
                  <Link href="/ringtone-points">
      <button className="bg-muted text-muted-foreground px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors">
        <i className="fas fa-music"></i>
        <span>{user?.ringtonePoints?.toLocaleString() || 0} pts</span>
      </button>
    </Link>
                <Link href="/account">
                  <button className="bg-primary md:hidden  text-primary-foreground px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    MY ACCOUNT
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left md:hidden text-destructive font-medium hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span className="block text-foreground hover:text-primary font-medium">
                    Login
                  </span>
                </Link>
                <Link href="/register">
                  <span className="block text-foreground hover:text-primary font-medium">
                    Register
                  </span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
