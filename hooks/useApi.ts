import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

export type UseApiOptions = {
  onMount?: boolean;
  onFocus?: boolean;
};

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions,
  deps: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(
    options.onMount === true || options.onFocus === true,
  );
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(
    async (isRefetch = false) => {
      if (isRefetch) setIsRefetching(true);
      else setIsLoading(true);

      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
        return result;
      } catch (err) {
        setError(err);
      } finally {
        if (isRefetch) setIsRefetching(false);
        else setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  // Always call hook; conditionally run effect logic
  useFocusEffect(
    useCallback(() => {
      if (!options.onFocus) return;
      void fetchData(false);
    }, [fetchData, options.onFocus]),
  );

  useEffect(() => {
    if (!options.onMount) return;
    void fetchData(false);
  }, [fetchData, options.onMount]);

  return { data, isLoading, isRefetching, error, refetch };
}
