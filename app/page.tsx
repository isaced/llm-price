import { DataTable, ModelInfo } from "./table/data-table"
import fs from 'fs'
import Image from "next/image";

/**
 * load data from ../data/*.json
 */
async function getData(): Promise<ModelInfo[]> {
  const list: ModelInfo[] = []

  const files = fs.readdirSync('data')
  for (const file of files) {
    const data = fs.readFileSync(`data/${file}`).toString()
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
  console.log(list)
  return list
}

export default async function Home({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  const data = await getData()
  const currency = searchParams?.currency as string | undefined

  return (
    <main className="min-h-screen p-4 md:p-24 space-y-10" >
      <div className="space-y-4">
        <div className="text-4xl font-bold">
          LLM Price
        </div>
        <div>
          A open source project to collect and display the price of LLM model.
        </div>
      </div>
      <DataTable data={data} defaultCurrency={currency} />
      <footer>
        <div className="flex">
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
        </div>
      </footer>
    </main>
  );
}
