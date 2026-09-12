"use client";

/* Shell aplikasi: routing berbasis hash.
   /            → Landing page
   /auth/signin → Masuk
   /auth/signup → Daftar
   /dashboard   → Dashboard (butuh login)
   /billing     → Kredit & tagihan (butuh login)
   /privacy | /tos | /refund → Halaman legal */

import { useEffect } from "react";
import { useHashRoute, useAuth } from "@/lib/client";
import { LandingPage } from "@/components/youclip/landing";
import { AuthPage } from "@/components/youclip/auth-page";
import { DashboardPage } from "@/components/youclip/dashboard";
import { BillingPage } from "@/components/youclip/billing";
import { LegalPage } from "@/components/youclip/legal";
import { Loader2 } from "lucide-react";

function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function Home() {
  const route = useHashRoute();
  const { refresh, loading } = useAuth();

  // Muat sesi sekali di awal
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return <FullscreenLoader />;

  if (route.startsWith("/auth/signin")) return <AuthPage mode="signin" />;
  if (route.startsWith("/auth/signup")) return <AuthPage mode="signup" />;
  if (route.startsWith("/dashboard")) return <DashboardPage />;
  if (route.startsWith("/billing")) return <BillingPage />;
  if (route.startsWith("/privacy")) return <LegalPage kind="privacy" />;
  if (route.startsWith("/tos")) return <LegalPage kind="tos" />;
  if (route.startsWith("/refund")) return <LegalPage kind="refund" />;
  return <LandingPage />;
}
