"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ModelInfo = {
  model: string
  provider: string
  oneMInputTokenPrice: number
  oneMOutputPrice: number
}

export const columns: ColumnDef<ModelInfo>[] = [
  {
    accessorKey: "model",
    header: "MODEL NAME",
  },
  {
    accessorKey: "provider",
    header: "PROVIDER",
  },
  {
    accessorKey: "oneMInputTokenPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          1 M INPUT TOKENS
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("oneMInputTokenPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "CNY",
      }).format(amount)
      return <div className="font-medium ml-4">{formatted}</div>
    },
  },
  {
    accessorKey: "oneMOutputPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          1 M OUTPUT TOKENS
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("oneMOutputPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "CNY",
      }).format(amount)
      return <div className="font-medium ml-4">{formatted}</div>
    },
  },
]
