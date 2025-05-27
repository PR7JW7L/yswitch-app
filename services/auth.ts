import { api, handleApiCall } from "@/lib/api-instance";
import { StorageKeys, storageService } from "@/lib/storage";

export class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await handleApiCall<LoginResponse>(
      api.post("/login", credentials),
    );
    if (response.success) {
      const { token } = response.data;
      const user: User = { email: credentials.email };
      storageService.setString(StorageKeys.ACCESS_TOKEN, token);
      storageService.setObject(StorageKeys.USER, user);
    }
    return response;
  }

  async register(payload: RegisterPayload) {
    return await handleApiCall(api.post("/register", payload));
  }

  async logout(onSuccess?: () => void): Promise<void> {
    storageService.delete(StorageKeys.ACCESS_TOKEN);
    storageService.delete(StorageKeys.USER);
    onSuccess?.();
  }

  getUser() {
    const hasToken = !!storageService.getString(StorageKeys.ACCESS_TOKEN);
    if (!hasToken) return null;
    return storageService.getObject<User>(StorageKeys.USER);
  }
}

interface RegisterPayload {
  fullname: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface User {
  email: string;
}

export const authService = new AuthService();
