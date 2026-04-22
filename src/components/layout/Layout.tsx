import React from "react";
import { useLocation } from "react-router-dom";

import { AdSlot } from "@/components/ads/AdSlot";
import ConsentBanner from "@/components/ConsentBanner";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {!isHome ? (
        <div className="container py-4">
          <AdSlot slot="sponsored-placement" />
        </div>
      ) : null}
      <main className="flex-1" role="main">
        {children}
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
};
