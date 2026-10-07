export interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: UserPayload;
  token: string;
}
