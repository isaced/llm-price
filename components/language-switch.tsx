'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCurrentLocale } from 'next-i18n-router/client';
import i18nConfig from '@/i18nConfig';
import { useRouter } from 'next/navigation'

export default function LanguageSwitch({ defaultLang }: { defaultLang: string }) {
  const locale = useCurrentLocale(i18nConfig);
  const router = useRouter()
  return <Select value={locale || defaultLang} onValueChange={(lang) => {
    router.push(`/${lang}`)
  }}>
    <SelectTrigger className="w-[150px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {i18nConfig.locales.map((lang) => (
        <SelectItem key={lang} value={lang}>
          {i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
}