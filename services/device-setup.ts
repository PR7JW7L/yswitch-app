import { ApiResponse, deviceApi, handleApiCall } from "@/lib/api-instance";

export interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface StatusResponse {
  StatusNET: {
    Hostname: string;
  };
}

class DeviceSetupService {
  async configureGPIO(): Promise<ApiResponse<object>> {
    return await handleApiCall(
      deviceApi.get(
        "/cm?cmnd=Backlog%20GPIO0%200;GPIO12%20288;GPIO15%20224;PwmRange%20255;Save",
      ),
    );
  }

  async configureMQTT(
    config: MqttConfig,
    deviceId: string,
  ): Promise<ApiResponse<object>> {
    const MQTTHOST = config.host;
    const MQTTPORT = config.port;
    const MQTTCLIENT = "DVES_%06X";
    const MQTTUSER = config.username;
    const MQTTPASSWORD = config.password;
    const MQTTTOPIC = deviceId;
    const FULLTOPIC = "%prefix%/%topic%/";

    return await handleApiCall(
      deviceApi.get("/cm", {
        params: {
          cmnd: `Backlog MqttHost ${MQTTHOST};MqttPort ${MQTTPORT};MqttClient ${MQTTCLIENT};MqttUser ${MQTTUSER};MqttPassword ${MQTTPASSWORD};Topic ${MQTTTOPIC};FullTopic ${FULLTOPIC};Save`,
        },
      }),
    );
  }

  async configureWifi(
    ssid: string,
    password: string,
  ): Promise<ApiResponse<object>> {
    const wifiUrl = `/cm?cmnd=Backlog SSID1 ${encodeURIComponent(
      ssid,
    )}; PASSWORD1 ${encodeURIComponent(password)}; Restart 1`;

    return await handleApiCall(deviceApi.get(wifiUrl));
  }

  async getDeviceStatus(): Promise<ApiResponse<StatusResponse>> {
    return await handleApiCall(deviceApi.get("/cm?cmnd=Status%200"));
  }
}

export const deviceSetupService = new DeviceSetupService();
