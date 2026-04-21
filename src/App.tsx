import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import DefaultSEO from "@/components/seo/DefaultSEO";
import RouteSeo from "@/components/seo/RouteSeo";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAnalytics } from "@/hooks/useAnalytics";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ConvertPage = lazy(() => import("./pages/ConvertPage"));
const Index = lazy(() => import("./pages/Index"));
const MagicBrushPage = lazy(() => import("./pages/MagicBrushPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const RemoveBackgroundPage = lazy(() => import("./pages/RemoveBackgroundPage"));
const ResizePage = lazy(() => import("./pages/ResizePage"));
const ResizeUpscalePage = lazy(() => import("./pages/ResizeUpscalePage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/resize" element={<ResizePage />} />
    <Route path="/resize-upscale" element={<ResizeUpscalePage />} />
    <Route path="/convert" element={<ConvertPage />} />
    <Route path="/remove-background" element={<RemoveBackgroundPage />} />
    <Route path="/upscale" element={<Navigate to="/resize-upscale" replace />} />
    <Route path="/object-removal" element={<MagicBrushPage />} />
    <Route path="/magic-brush" element={<MagicBrushPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  useAnalytics();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DefaultSEO />
              <RouteSeo />
              <ScrollToTop />
              <Layout>
                <Suspense
                  fallback={
                    <div className="container py-16 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  }
                >
                  <AppRoutes />
                </Suspense>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
