// Mirrors backend org.example.quid.auth.dto.* (1:1, see F0).

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface MeResponse {
  id: number
  email: string
  fullName: string
  role: string
  workspaceId: number
  workspaceName: string
}
