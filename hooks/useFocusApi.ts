import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function useFocusApi<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(() => {
    let isActive = true;

    const run = async () => {
      setLoading(true);
      try {
        const result = await fetchFn();
        if (isActive) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isActive) setError(err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void run();

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(refresh);

  return { data, loading, error, refetch: refresh };
}
