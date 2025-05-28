import { api, ApiResponse, handleApiCall } from "@/lib/api-instance";

export interface ServerMqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}
export interface Device {
  id: number;
  name: string;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class DeviceControlService {
  async getMqttConfig(): Promise<ApiResponse<ServerMqttConfig>> {
    return await handleApiCall(api.get("/mqtt-config"));
  }

  async registerDevice(deviceId: string): Promise<ApiResponse<object>> {
    return await handleApiCall(api.post("/device", { deviceId }));
  }

  async getDevices(): Promise<ApiResponse<Device[]>> {
    return await handleApiCall(api.get("/device"));
  }

  async getDevice(deviceId: string): Promise<ApiResponse<Device>> {
    return await handleApiCall(api.get(`/device/${deviceId}`));
  }

  async removeDevice(deviceId: string): Promise<ApiResponse<Device>> {
    return await handleApiCall(api.delete(`/device/${deviceId}`));
  }

  async turnDeviceOn(deviceId: string): Promise<ApiResponse<object>> {
    return await handleApiCall(api.get(`/${deviceId}/on`));
  }

  async turnDeviceOff(deviceId: string): Promise<ApiResponse<object>> {
    return await handleApiCall(api.get(`/${deviceId}/off`));
  }
}

export const deviceControl = new DeviceControlService();
