import { useLocalStorageState } from "ahooks";

export function useCurrencyStorage(defaultCurrency: string | undefined) {
  return useLocalStorageState<string | undefined>(
    'currency',
    {
      defaultValue: defaultCurrency || 'USD',
    },
  );

}