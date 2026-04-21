import React from "react";

import { AdSlot } from "@/components/ads/AdSlot";
import ConsentBanner from "@/components/ConsentBanner";
import LocalProcessingNotice from "@/components/LocalProcessingNotice";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-4">
        <AdSlot slot="sponsored-placement" />
      </div>
      <LocalProcessingNotice />
      <main className="flex-1" role="main">
        {children}
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
};
