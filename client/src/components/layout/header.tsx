import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@shared/schema";
import logoImage from "@assets/Logo_1758887059353.gif";

export default function Header() {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user as User | null;
  const logout = auth.logout;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img 
                src={logoImage} 
                alt="RingToneRiches Logo" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <span className="text-xl md:text-2xl font-bold gradient-text">RINGTONE RICHES</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className="nav-link text-foreground hover:text-primary font-medium cursor-pointer" data-testid="nav-competitions">
                OUR COMPETITIONS
              </span>
            </Link>
            <Link href="/winners">
              <span className="nav-link text-foreground hover:text-primary font-medium cursor-pointer" data-testid="nav-winners">
                PAST WINNERS
              </span>
            </Link>
            <span className="nav-link text-foreground hover:text-primary font-medium" data-testid="nav-jackpots">
              JACKPOTS
            </span>
          </div>

          {/* User Account & Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/wallet">
                  <button className="bg-muted text-muted-foreground px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="button-balance">
                    <i className="fas fa-wallet"></i>
                    <span>£{parseFloat(user?.balance || '0').toFixed(2)}</span>
                  </button>
                </Link>
                <Link href="/account">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity" data-testid="button-account">
                    MY ACCOUNT
                  </button>
                </Link>
                <button 
                  onClick={logout}
                  className="border border-muted-foreground text-muted-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted-foreground hover:text-background transition-colors" 
                  data-testid="button-logout"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className="border border-primary text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="button-login">
                    LOGIN
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity" data-testid="button-register">
                    REGISTER
                  </button>
                </Link>
              </div>
            )}
            <button className="md:hidden text-foreground" data-testid="button-mobile-menu">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
