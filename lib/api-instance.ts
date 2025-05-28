import type { AxiosResponse } from "axios";
import axios, { AxiosHeaders, isAxiosError } from "axios";
import { StorageKeys, storageService } from "@/lib/storage";

export interface ServerResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const api = axios.create({
  baseURL: "https://tasmota.stag.yarsa.dev",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const accessToken = storageService.getString(StorageKeys.ACCESS_TOKEN);
  if (accessToken) {
    (config.headers as AxiosHeaders).set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      storageService.clear();
    }
    return Promise.reject(error);
  },
);

const deviceApi = axios.create({
  baseURL: "http://192.168.4.1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

interface ApiResponseBase {
  headers?: AxiosResponse["headers"];
  statusCode?: number;
  message?: string;
}

interface ApiSuccessResponse<D> extends ApiResponseBase {
  success: true;
  data: D;
  error?: undefined;
}

interface ApiErrorResponse<E> extends ApiResponseBase {
  success: false;
  error?: E;
  data: undefined;
}

export type ApiResponse<D = unknown, E = unknown> =
  | ApiSuccessResponse<D>
  | ApiErrorResponse<E>;

async function handleApiCall<D = any, E = any>(
  axiosCall: Promise<AxiosResponse<D>>,
): Promise<ApiResponse<D, E>> {
  try {
    const res = await axiosCall;
    return {
      success: true,
      data: res.data,
      headers: res.headers,
      statusCode: res.status,
    };
  } catch (e) {
    if (isAxiosError(e)) {
      return {
        data: undefined,
        success: false,
        error: e.response?.data as E,
        headers: e.response?.headers,
        statusCode: e.response?.status,
        message: getErrorMessage(e),
      };
    }

    return {
      data: undefined,
      error: undefined,
      headers: undefined,
      statusCode: 0,
      success: false,
      message: getErrorMessage(e),
    };
  }
}

function getErrorMessage(error: any, defaultMessage?: string) {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.error ??
      error.response?.data?.errors?.[0]?.message?.[0] ??
      error.response?.data?.message ??
      defaultMessage
    );
  }
  return error?.errors?.[0]?.message?.[0] ?? error?.message ?? defaultMessage;
}

export { handleApiCall, api, deviceApi, getErrorMessage };
