import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@shared/schema";
import logoImage from "@assets/Logo_1758887059353.gif";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Header() {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user as User | null;
  const logout = auth.logout;

  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/user");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

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

  const ringtonePoints = userData?.ringtonePoints ?? user?.ringtonePoints ?? 0;

  // Handle mobile menu open/close with animation
  const handleMobileToggle = () => {
    if (!mobileOpen) {
      setMobileOpen(true);
      setIsAnimating(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setMobileOpen(false);
        document.body.style.overflow = 'unset'; // Re-enable scrolling
      }, 300);
    }
  };

  // Close mobile menu when clicking on a link
  const handleMobileLinkClick = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setMobileOpen(false);
      document.body.style.overflow = 'unset';
    }, 300);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        handleMobileToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

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
                {/* ADD RINGTONE POINTS BUTTON HERE */}
                <Link href="/ringtune-points">
                  <button className="bg-muted text-yellow-300 px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <i className="fas fa-music "></i>
                    <span>{ringtonePoints.toLocaleString()}</span>
                  </button>
                </Link>
                
                <Link href="/wallet">
                  <button className="bg-muted text-yellow-300 px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <i className="fas fa-wallet "></i>
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
              className="lg:hidden text-foreground z-60 relative"
              onClick={handleMobileToggle}
            >
              <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} text-xl transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`}></i>
            </button>
          </div>
        </nav>

        {/* Mobile Full Screen Overlay */}
        {mobileOpen && (
          <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
            isAnimating ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'
          }`}>
            {/* Mobile Menu Content - Centered with gaps */}
            <div className={`flex flex-col items-center justify-center h-full space-y-8 transition-all duration-500 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
            }`}>
              
              {/* Navigation Links */}
              <Link href="/">
                <span 
                  onClick={handleMobileLinkClick}
                  className="block text-white text-2xl font-bold hover:text-primary transition-all duration-300 transform hover:scale-110"
                  style={{ animationDelay: '0.1s' }}
                >
                  OUR COMPETITIONS
                </span>
              </Link>
              
              <Link href="/winners">
                <span 
                  onClick={handleMobileLinkClick}
                  className="block text-white text-2xl font-bold hover:text-primary transition-all duration-300 transform hover:scale-110"
                  style={{ animationDelay: '0.2s' }}
                >
                  PAST WINNERS
                </span>
              </Link>
              
              <span className="block text-white text-2xl font-bold hover:text-primary transition-all duration-300 transform hover:scale-110 cursor-pointer">
                JACKPOTS
              </span>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex flex-col items-center space-y-6 mt-8">
                  <Link href="/account">
                    <button 
                      onClick={handleMobileLinkClick}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                      MY ACCOUNT
                    </button>
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      handleLogout(e);
                      handleMobileLinkClick();
                    }}
                    className="text-white font-medium text-lg hover:text-destructive transition-all duration-300 transform hover:scale-105"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 mt-8">
                  <Link href="/login">
                    <button 
                      onClick={handleMobileLinkClick}
                      className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
                    >
                      LOGIN
                    </button>
                  </Link>
                  <Link href="/register">
                    <button 
                      onClick={handleMobileLinkClick}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                      REGISTER
                    </button>
                  </Link>
                </div>
              )}

              {/* Close button at bottom */}
              {/* <button
                onClick={handleMobileToggle}
                className="absolute bottom-10 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                <i className="fas fa-times text-2xl"></i>
              </button> */}
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles for Animation */}
      <style >{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .menu-item {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </header>
  );
}