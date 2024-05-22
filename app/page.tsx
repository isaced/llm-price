import { ModelInfo, columns } from "./table/columns"
import { DataTable } from "./table/data-table"
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
      oneMInputTokenPrice: providerData.currency === 'USD' ? item.oneMInputTokenPrice * 7 : item.oneMInputTokenPrice,
      oneMOutputPrice: providerData.currency === 'USD' ? item.oneMOutputPrice * 7 : item.oneMOutputPrice,
    })))
  }
  console.log(list)
  return list
}

export default async function Home() {

  const data = await getData()

  return (
    <main className="min-h-screen p-4 md:p-24 space-y-10" >
      <div className="space-y-4">
        <div className="text-4xl font-bold">
          LLM Price
        </div>
        <div>
          Open source project to collect and display the price of LLM model.
        </div>
      </div>
      <DataTable columns={columns} data={data} />
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
