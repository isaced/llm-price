"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrencyStorage } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { convertCurrency, getCurrencyList } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ModelInfo = {
  model: string;
  provider: string;
  oneMInputTokenPrice: number;
  oneMOutputPrice: number;
  currency: string;
  blendPrice: number;
};

interface DataTableProps {
  data: ModelInfo[];
  defaultCurrency: string | undefined;
  i18n: Record<string, string>;
}

export function DataTable({ data, defaultCurrency, i18n }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const router = useRouter();
  const [currency, setCurrency] = useCurrencyStorage(defaultCurrency);

  const sortingFn = (a: Row<ModelInfo>, b: Row<ModelInfo>, fields: string) => {
    const getLocalPrice = (row: Row<ModelInfo>) => {
      const sourceCurrency = row.original.currency as string;
      const price = parseFloat(row.getValue(fields));
      const localPrice = convertCurrency(price, sourceCurrency, currency!);
      return localPrice;
    };
    return getLocalPrice(a) - getLocalPrice(b);
  };

  const columns: ColumnDef<ModelInfo, any>[] = [
    {
      accessorKey: "model",
      header: i18n.MODEL_NAME,
    },
    {
      accessorKey: "provider",
      header: i18n.PROVIDER,
      cell: ({ row }) => {
        return (
          <div>
            {(i18n.providers as unknown as Record<string, string>)?.[row.original.provider] || row.original.provider}
          </div>
        );
      },
    },
    {
      accessorKey: "blendPrice",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {i18n["1 M BLEND PRICE"]}(in*3 + out*1)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(convertCurrency(row.original.blendPrice, row.original.currency, currency!));
        return <div className="font-medium ml-4">{formatted}</div>;
      },
      sortingFn: (a, b) => sortingFn(a, b, "blendPrice"),
    },
    {
      accessorKey: "oneMInputTokenPrice",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {i18n["1 M INPUT TOKENS"]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(row.original.oneMInputTokenPrice);
        return <div className="font-medium ml-4">{formatted}</div>;
      },
      sortingFn: (a, b) => sortingFn(a, b, "oneMInputTokenPrice"),
    },
    {
      accessorKey: "oneMOutputPrice",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {i18n["1 M OUTPUT TOKENS"]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(row.original.oneMOutputPrice);
        return <div className="font-medium ml-4">{formatted}</div>;
      },
      sortingFn: (a, b) => sortingFn(a, b, "oneMOutputPrice"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const url = `https://github.com/isaced/llm-price/issues/new?assignees=&labels=&projects=&template=update-model-price.yaml&title=Update+model+price&model-name=${row.original.model}`;
                  window.open(url, "_blank");
                }}
              >
                {i18n.Edit || "Edit"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {i18n["View provider"] || "View provider"}
                <ExternalLink href={`https://www.google.com/search?q=${row.original.model}`} className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
    initialState: {
      sorting: [
        {
          id: "blendPrice",
          desc: false,
        },
      ],
    },
  });

  return (
    <div>
      <div className="flex justify-between py-4 space-x-2">
        <div className="flex space-x-2">
          <Input
            placeholder={i18n.FILTER_MODELS}
            value={(table.getColumn("model")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("model")?.setFilterValue(event.target.value);
            }}
            className="max-w-sm"
          />
          <Select
            value={currency}
            onValueChange={(value) => {
              setCurrency(value);

              const url = new URL(window.location.href);
              url.searchParams.set("currency", value);
              router.push(url.toString());
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Currency (USD)" />
            </SelectTrigger>
            <SelectContent>
              {getCurrencyList().map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <a
                  target="_blank"
                  href="https://github.com/isaced/llm-price/issues/new?assignees=&labels=&projects=&template=add-model-price.yaml&title=Add+model+price"
                >
                  <Button>
                    <Plus className="h-4 w-4" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{i18n.ADD_MODEL_PRICE_TIPS}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
  );
}
