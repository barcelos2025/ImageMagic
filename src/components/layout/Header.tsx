import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, Leaf, Menu, Moon, Sun } from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const HEADER_COPY = {
  en: {
    tagline: "Browser image suite",
    primaryNav: "Primary navigation",
    languageSelector: "Language selector",
    toggleTheme: "Toggle theme",
    openMenu: "Open menu",
    getStarted: "Get started",
    languages: {
      en: "English",
      pt: "Português",
      es: "Español",
    },
  },
  pt: {
    tagline: "Suite de imagens no navegador",
    primaryNav: "Navegação principal",
    languageSelector: "Seletor de idioma",
    toggleTheme: "Alternar tema",
    openMenu: "Abrir menu",
    getStarted: "Começar",
    languages: {
      en: "English",
      pt: "Português",
      es: "Español",
    },
  },
  es: {
    tagline: "Suite de imagen en el navegador",
    primaryNav: "Navegación principal",
    languageSelector: "Selector de idioma",
    toggleTheme: "Cambiar tema",
    openMenu: "Abrir menú",
    getStarted: "Empezar",
    languages: {
      en: "English",
      pt: "Português",
      es: "Español",
    },
  },
} as const;

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const copy = HEADER_COPY[language];

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/resize", label: t("nav.resize") },
    { path: "/convert", label: t("nav.convert") },
    { path: "/remove-background", label: t("nav.removeBackground") },
    { path: "/magic-brush", label: t("nav.magicBrush") },
    { path: "/about", label: t("nav.about") },
    { path: "/contact", label: t("nav.contact") },
  ];

  const languageItems = [
    { code: "en" as const, label: copy.languages.en },
    { code: "pt" as const, label: copy.languages.pt },
    { code: "es" as const, label: copy.languages.es },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3">
          <span className="block text-xl font-semibold tracking-tight text-primary">{t("home.title")}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label={copy.primaryNav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative whitespace-nowrap py-2 text-sm font-medium transition-colors ${
                isActive(item.path) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {isActive(item.path) ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" /> : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Leaf className="hidden h-5 w-5 text-primary/65 md:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full px-3" aria-label={copy.languageSelector}>
                <Globe className="h-4 w-4" />
                <span className="ml-1 text-xs uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languageItems.map((item) => (
                <DropdownMenuItem key={item.code} onClick={() => setLanguage(item.code)}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full border-primary/15 bg-background/70 p-0"
            aria-label={copy.toggleTheme}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button asChild size="sm" className="hidden rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90 sm:inline-flex">
            <Link to="/resize">{copy.getStarted}</Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 rounded-full border-primary/15 bg-background/70 p-0 lg:hidden" aria-label={copy.openMenu}>
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="w-full">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
