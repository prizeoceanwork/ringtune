import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

interface OrderWithCompetition {
  competitions: {
    title: string;
    imageUrl: string;
  };
  orders: {
    id: string;
    competitionId: string;
    quantity: number;
    totalAmount: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}


export default function Orders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithCompetition[]>({
    queryKey: ["/api/user/orders"],
    enabled: isAuthenticated,
  }
);
console.log(orders)

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
            <span className="text-primary font-bold">Orders</span>
            <span className="text-primary">Entries</span>
            <span className="text-primary">RingTone Points</span>
            <span className="text-primary">Referral Scheme</span>
            <Link href="/wallet" className="text-primary hover:underline">Wallet</Link>
            <span className="text-primary">Address</span>
            <Link href="/account" className="text-primary hover:underline">Account details</Link>
            <a href="/api/logout" className="text-primary hover:underline">Log out</a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center" data-testid="heading-orders">MY ACCOUNT</h1>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-2xl font-bold mb-6">PAST ORDERS</h2>
            
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4" data-testid="text-no-orders">
                  No orders yet
                </p>
                <Link href="/">
                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity" data-testid="button-browse-competitions">
                    Browse Competitions
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Order</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orders.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {order.competitions?.imageUrl && (
                              <img 
                                src={order.competitions.imageUrl} 
                                alt={order.competitions.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium" data-testid={`text-order-id-${order.orders.id ?? "unknown"}`}>
  #{order.orders.id ? order.orders.id.slice(-8).toUpperCase() : "UNKNOWN"}
</p>

                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {order.competitions?.title || 'Competition'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {order.orders.quantity} item{order.orders.quantity !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground" data-testid={`text-order-date-${order.orders.id}`}>
                          {new Date(order.orders.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            order.orders.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : order.orders.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : order.orders.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`} data-testid={`text-order.orders-status-${order.orders.id}`}>
                           {order.orders.status
  ? order.orders.status.charAt(0).toUpperCase() + order.orders.status.slice(1)
  : "Unknown"}

                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold" data-testid={`text-order-total-${order.orders.id}`}>
                          £{parseFloat(order.orders.totalAmount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <button 
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            data-testid={`button-view-order-${order.orders.id}`}
                          >
                            VIEW
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
