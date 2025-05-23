import axios, { AxiosInstance } from "axios";

export interface ServerMqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface DeviceRegistration {
  deviceId: string;
}

export interface ServerResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ServerApi {
  private client: AxiosInstance;
  private baseUrl: string = "http://172.16.1.64:6969";

  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setServerUrl(url: string) {
    this.baseUrl = url;
    this.client.defaults.baseURL = url;
  }

  async getMqttConfig(): Promise<ServerResponse<ServerMqttConfig>> {
    try {
      const response = await this.client.get("/mqtt-config");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to get MQTT config" };
    }
  }

  async registerDevice(deviceId: string): Promise<ServerResponse> {
    try {
      const response = await this.client.post("/device", { deviceId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to register device" };
    }
  }

  async turnDeviceOn(deviceId: string): Promise<ServerResponse> {
    try {
      const response = await this.client.get(`/${deviceId}/on`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to turn device on" };
    }
  }

  async turnDeviceOff(deviceId: string): Promise<ServerResponse> {
    try {
      const response = await this.client.get(`/${deviceId}/off`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to turn device off" };
    }
  }
}

export const serverApi = new ServerApi();
