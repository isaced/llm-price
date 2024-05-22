"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrencyStorage } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { useRouter } from 'next/navigation'
import { convertCurrency, getCurrencyList } from "@/lib/currency"

export type ModelInfo = {
  model: string
  provider: string
  oneMInputTokenPrice: number
  oneMOutputPrice: number
  currency: string
}

interface DataTableProps<TData> {
  data: TData[];
  defaultCurrency: string | undefined;
}

export function DataTable<TData>({
  data,
  defaultCurrency,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const router = useRouter();
  const [currency, setCurrency] = useCurrencyStorage(defaultCurrency)

  const columns: ColumnDef<TData>[] = [
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
        const sourceCurrency = row.original.currency as string
        const price = parseFloat(row.getValue("oneMInputTokenPrice"))
        const localPrice = convertCurrency(price, sourceCurrency, currency!)
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(localPrice)
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
        const sourceCurrency = row.original.currency as string
        const price = parseFloat(row.getValue("oneMOutputPrice"))
        const localPrice = convertCurrency(price, sourceCurrency, currency!)
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(localPrice)
        return <div className="font-medium ml-4">{formatted}</div>
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex justify-between py-4">
        <Input
          placeholder="Filter models..."
          value={(table.getColumn("model")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("model")?.setFilterValue(event.target.value)
          }}
          className="max-w-sm"
        />
        <Select value={currency} onValueChange={(value) => {
          setCurrency(value);

          const url = new URL(window.location.href);
          url.searchParams.set('currency', value);
          router.push(url.toString());
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Currency (USD)" />
          </SelectTrigger>
          <SelectContent>
            {
              getCurrencyList().map((currency) => (
                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
