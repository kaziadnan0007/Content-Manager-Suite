import { useState } from "react";
import { useAdminLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck } from "lucide-react";

export function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const login = useAdminLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { password } }, {
      onSuccess: () => {
        setLocation("/admin");
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Invalid password. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-orange-50 dark:to-orange-950/10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/acholgatha-logo-transparent.png"
            alt="AcholGatha"
            className="h-12 w-auto object-contain mx-auto mb-2 [filter:brightness(0)_saturate(100%)_invert(62%)_sepia(98%)_saturate(700%)_hue-rotate(158deg)_brightness(105%)_contrast(102%)]"
          />
          <p className="text-muted-foreground text-sm font-medium">Admin Control Panel</p>
        </div>

        <Card className="shadow-xl border-2 border-border">
          <CardHeader className="text-center space-y-2 pb-6 pt-8">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">Secure Access</CardTitle>
            <CardDescription className="text-sm">Enter your admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  className="h-12 pl-10 text-sm border-2 rounded-xl focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-black rounded-xl shadow-md"
                disabled={login.isPending || !password}
              >
                {login.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Login →"
                )}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-5">
              Contact the site owner for access credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
