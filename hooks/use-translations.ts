"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

const translations = { en, ar };

export function useTranslations() {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") || "en";
    setLocale(savedLocale);
    document.documentElement.dir = savedLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLocale;
  }, []);

  const t = (key: string) => {
    return translations[locale as keyof typeof translations][key] || key;
  };

  const changeLocale = (newLocale: "en" | "ar") => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
    router.refresh();
  };

  return { t, locale, changeLocale };
}

