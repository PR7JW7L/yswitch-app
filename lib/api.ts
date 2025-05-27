import axios, { AxiosHeaders, AxiosInstance } from "axios";
import { StorageKeys, storageService } from "@/lib/storage";

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
  private baseUrl: string = "https://tasmota.stag.yarsa.dev/";

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use(
      (config) => {
        const accessToken = storageService.getString(StorageKeys.ACCESS_TOKEN);

        if (accessToken) {
          (config.headers as AxiosHeaders).set(
            "Authorization",
            `Bearer ${accessToken}`,
          );
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          storageService.delete(StorageKeys.ACCESS_TOKEN);
        }
        return Promise.reject(error);
      },
    );
  }

  setServerUrl(url: string) {
    this.baseUrl = url;
    this.client.defaults.baseURL = url;
  }

  setAccessToken(token: string) {
    storageService.setString(StorageKeys.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | undefined {
    return storageService.getString(StorageKeys.ACCESS_TOKEN);
  }

  removeAccessToken() {
    storageService.delete(StorageKeys.ACCESS_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!storageService.getString(StorageKeys.ACCESS_TOKEN);
  }

  async getMqttConfig(): Promise<ServerResponse<ServerMqttConfig>> {
    try {
      const response = await this.client.get("/mqtt-config");
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get MQTT config",
      };
    }
  }

  async registerDevice(deviceId: string): Promise<ServerResponse> {
    try {
      const response = await this.client.post("/device", { deviceId });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to register device",
      };
    }
  }

  async turnDeviceOn(deviceId: string): Promise<ServerResponse> {
    try {
      const response = await this.client.get(`/${deviceId}/on`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to turn device on",
      };
    }
  }

  async turnDeviceOff(deviceId: string): Promise<ServerResponse> {
    try {
      const response = await this.client.get(`/${deviceId}/off`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to turn device off",
      };
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<ServerResponse<{ token: string }>> {
    try {
      const response = await this.client.post("/login", {
        email,
        password,
      });

      if (response.data.token) {
        this.setAccessToken(response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      console.log({ error });
      return {
        success: false,
        message: error.response?.data?.error || "Login failed",
      };
    }
  }

  async register(
    fullname: string,
    email: string,
    password: string,
  ): Promise<ServerResponse> {
    try {
      const response = await this.client.post("/register", {
        fullname,
        email,
        password,
      });

      if (response.data.token) {
        this.setAccessToken(response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      console.log({ error });
      return {
        success: false,
        message: error.response?.data?.error || "Failed to register",
      };
    }
  }

  async logout(): Promise<void> {
    this.removeAccessToken();
  }
}

export const serverApi = new ServerApi();
