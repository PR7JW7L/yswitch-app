import { api, ApiResponse, handleApiCall } from "@/lib/api-instance";

export interface ServerMqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

class DeviceOperationsService {
  async getMqttConfig(): Promise<ApiResponse<ServerMqttConfig>> {
    return await handleApiCall(api.get("/mqtt-config"));
  }

  async registerDevice(deviceId: string): Promise<ApiResponse<object>> {
    return await handleApiCall(api.post("/device", { deviceId }));
  }

  async turnDeviceOn(deviceId: string): Promise<ApiResponse<object>> {
    return await handleApiCall(api.get(`/${deviceId}/on`));
  }

  async turnDeviceOff(deviceId: string): Promise<ApiResponse<object>> {
    return await handleApiCall(api.get(`/${deviceId}/off`));
  }
}

export const deviceOperationsService = new DeviceOperationsService();
