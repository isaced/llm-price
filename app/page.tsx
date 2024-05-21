import { ModelInfo, columns } from "./table/columns"
import { DataTable } from "./table/data-table"
const fs = require('fs');

/**
 * load data from ../data/*.json
 */
async function getData(): Promise<ModelInfo[]> {
  const list: ModelInfo[] = []

  const files = fs.readdirSync('data')
  for (const file of files) {
    const data = fs.readFileSync(`data/${file}`)
    const providerData = JSON.parse(data) as {
      provider: string, prices: {
        model: string
        oneMInputTokenPrice: number
        oneMOutputPrice: number
      }[]
    }
    list.push(...providerData.prices.map(item => ({ provider: providerData.provider, ...item })))
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
          LLM Price is a simple app that displays the price of LLM.
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </main>
  );
}
