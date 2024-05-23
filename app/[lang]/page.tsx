import LanguageSwitch from "@/components/language-switch";
import { DataTable, ModelInfo } from "./table/data-table"
import fs from 'fs'
import Image from "next/image";
import { getDictionary } from './dictionaries'


/**
 * load data from ../data/*.json
 */
async function getData(): Promise<ModelInfo[]> {
  const list: ModelInfo[] = []

  const files = fs.readdirSync(process.cwd() + '/data')
  for (const file of files) {
    const data = fs.readFileSync(process.cwd() + `/data/${file}`).toString()
    const providerData = JSON.parse(data) as {
      provider: string,
      currency: 'USD' | 'CNY',
      prices: {
        model: string
        oneMInputTokenPrice: number
        oneMOutputPrice: number
      }[]
    }
    list.push(...providerData.prices.map(item => ({
      provider: providerData.provider,
      ...item,
      oneMInputTokenPrice: item.oneMInputTokenPrice,
      oneMOutputPrice: item.oneMOutputPrice,
      currency: providerData.currency,
    })))
  }
  return list
}

export default async function Home({
  params,
  searchParams,
}: {
  params: { slug: string, lang: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  const data = await getData()
  const currency = searchParams?.currency as string | undefined
  const i18n = await getDictionary(params.lang || 'en');

  return (
    <main className="min-h-screen p-4 md:p-24 space-y-10" >
      <div className="space-y-4">
        <div className="text-4xl font-bold">
          {i18n.title}
        </div>
        <div>
          {i18n.description}
        </div>
      </div>
      <DataTable data={data} defaultCurrency={currency} i18n={i18n} />
      <footer>
        <div className="flex justify-between items-center">
          <div>
            <a href="https://github.com/isaced/llm-price" target="_blank" className="inline text-blue-500">
              <Image
                src="/github.svg"
                alt="GitHub Logo"
                className="dark:invert"
                width={24}
                height={24}
              />
            </a>
          </div>

          <LanguageSwitch defaultLang={params.lang} />
        </div>
      </footer>
    </main>
  );
}
