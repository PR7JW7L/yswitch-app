import axios, { AxiosInstance } from "axios";

export interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface DeviceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const DEVICE_IP = "http://192.168.4.1";

class DeviceApi {
  private client: AxiosInstance;
  private deviceIp = DEVICE_IP;

  constructor() {
    this.client = axios.create({
      baseURL: this.deviceIp,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
  }

  async configureGPIO(): Promise<DeviceResponse> {
    try {
      const response = await this.client.get<object>(
        `/cm?cmnd=Backlog%20GPIO0%200;GPIO12%20288;GPIO15%20224;PwmRange%20255;Save`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to configure GPIO" };
    }
  }

  async configureMQTT(
    config: MqttConfig,
    deviceId: string,
  ): Promise<DeviceResponse> {
    try {
      const MQTTHOST = config.host;
      const MQTTPORT = config.port;
      const MQTTCLIENT = "DVES_%06X";
      const MQTTUSER = config.username;
      const MQTTPASSWORD = config.password;
      const MQTTTOPIC = deviceId;
      const FULLTOPIC = "%prefix%/%topic%/";

      const response = await this.client.get("/cm", {
        params: {
          cmnd: `Backlog MqttHost ${MQTTHOST};MqttPort ${MQTTPORT};MqttClient ${MQTTCLIENT};MqttUser ${MQTTUSER};MqttPassword ${MQTTPASSWORD};Topic ${MQTTTOPIC};FullTopic ${FULLTOPIC};Save`,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to configure MQTT" };
    }
  }

  async connectToWiFi(ssid: string, password: string): Promise<DeviceResponse> {
    try {
      const wifiUrl = `/cm?cmnd=Backlog SSID1 ${encodeURIComponent(ssid)}; PASSWORD1 ${encodeURIComponent(password)}; Restart 1`;
      const response = await this.client.get(wifiUrl);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Failed to connect to WiFi" };
    }
  }

  async getDeviceInfo(): Promise<DeviceResponse<StatusResponse>> {
    try {
      const response = await this.client.get<StatusResponse>(
        "/cm?cmnd=Status%200",
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.log(error);
      return { success: false, message: "Failed to get device info" };
    }
  }
}

export interface StatusResponse {
  StatusNET: {
    Hostname: string;
  };
}

export const deviceApi = new DeviceApi();
