"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";

export function LanguageToggle() {
  const { locale, changeLocale } = useTranslations();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => changeLocale(locale === "en" ? "ar" : "en")}
    >
      <Globe className="h-5 w-5" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}

