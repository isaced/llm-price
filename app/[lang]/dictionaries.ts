
import 'server-only'

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
  zh: () => import('../../dictionaries/zh.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => (dictionaries[locale as keyof typeof dictionaries] || dictionaries.en)()
