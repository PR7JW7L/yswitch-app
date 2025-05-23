import { useState } from "react";
import { getDeviceId, setDeviceId } from "@/lib/storage";

export function useSetup() {
  const [deviceId, setId] = useState<string | undefined>(getDeviceId());

  const completeSetup = (id: string) => {
    setDeviceId(id);
    setId(id);
  };

  return { deviceId, completeSetup };
}
