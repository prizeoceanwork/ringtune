import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function Account() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted text-center py-4 mb-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-primary">Phone Number</span>
            <Link href="/orders" className="text-primary hover:underline">Orders</Link>
            <span className="text-primary">Entries</span>
            <span className="text-primary">RingTone Points</span>
            <span className="text-primary">Referral Scheme</span>
            <Link href="/wallet" className="text-primary hover:underline">Wallet</Link>
            <span className="text-primary">Address</span>
            <span className="text-primary">Account details</span>
            <a href="/api/logout" className="text-primary hover:underline">Log out</a>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center" data-testid="heading-account">MY ACCOUNT</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Account Overview */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm">Email</label>
                    <p className="text-foreground" data-testid="text-email">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">Name</label>
                    <p className="text-foreground" data-testid="text-name">
                      {user?.firstName || user?.lastName 
                        ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">Member Since</label>
                    <p className="text-foreground" data-testid="text-member-since">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/orders">
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity" data-testid="button-view-orders">
                      View Orders
                    </button>
                  </Link>
                  <Link href="/wallet">
                    <button className="w-full bg-muted text-muted-foreground py-3 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="button-manage-wallet">
                      Manage Wallet
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-xl font-bold mb-4">Account Balance</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary" data-testid="text-balance">
                    £{parseFloat(user?.balance || '0').toFixed(2)}
                  </p>
                  <Link href="/wallet">
                    <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity" data-testid="button-top-up">
                      TOP UP
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-xl font-bold mb-4">Account Options</h3>
                <div className="space-y-3">
                  <button className="w-full text-left text-muted-foreground hover:text-primary transition-colors">
                    Update Profile
                  </button>
                  <button className="w-full text-left text-muted-foreground hover:text-primary transition-colors">
                    Change Password
                  </button>
                  <button className="w-full text-left text-muted-foreground hover:text-primary transition-colors">
                    Notification Settings
                  </button>
                  <a href="/api/logout" className="block w-full text-left text-destructive hover:underline">
                    Log Out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
