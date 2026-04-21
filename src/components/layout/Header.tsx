import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, Menu, Moon, Sparkles, Sun } from "@/components/icons";

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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/88 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-sm">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-lg font-semibold tracking-tight text-foreground">{t("home.title")}</span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{copy.tagline}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/88 p-1 shadow-sm lg:flex" aria-label={copy.primaryNav}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={isActive(item.path) ? "rounded-full bg-primary px-4 text-primary-foreground shadow-sm" : "rounded-full px-4"}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full" aria-label={copy.languageSelector}>
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
            className="h-10 w-10 rounded-full p-0"
            aria-label={copy.toggleTheme}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 w-10 rounded-full p-0 lg:hidden" aria-label={copy.openMenu}>
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
