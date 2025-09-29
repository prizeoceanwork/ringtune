import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; rememberMe: boolean }) => {
      return apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: () => {
      window.location.href = "/"; // Redirect to home after login
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields",
      });
      return;
    }
    loginMutation.mutate({ email, password, rememberMe });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* MY ACCOUNT Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">MY ACCOUNT</h1>
        </div>

        <Card className="bg-black/40 border-ringtone-900/20 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold gradient-text text-center">LOGIN</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <Label htmlFor="email" className="text-white">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="bg-white text-black border-gray-300 mt-2"
                  data-testid="input-email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white text-black border-gray-300 mt-2"
                  data-testid="input-password"
                  required
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  data-testid="checkbox-remember"
                />
                <Label htmlFor="remember" className="text-white text-sm">
                  Remember me
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-ringtone-700 text-white font-bold"
                data-testid="button-login"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "LOGGING IN..." : "LOG IN"}
              </Button>

              {/* Lost Password Link */}
              <div className="text-center">
                <Link href="/forgot-password">
                  <a className="text-ringtone-400 hover:text-ringtone-300 text-sm" data-testid="link-forgot-password">
                    Lost your password?
                  </a>
                </Link>
              </div>

              {/* Register Link */}
              <div className="text-center border-t border-gray-600 pt-4">
                <p className="text-white text-sm mb-2">Don't have an account?</p>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="border-ringtone-600 text-ringtone-400 hover:bg-ringtone-600/10"
                    data-testid="button-go-to-register"
                  >
                    CREATE ACCOUNT
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}