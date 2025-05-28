import { useApi } from "@/hooks/useApi";
import { deviceControl } from "@/services/device-control";

export function useGetSavedDevices() {
  return useApi(
    () => deviceControl.getDevices().then((r) => r.data),
    { onFocus: true },
    [],
  );
}
