export type AccessTokenPayload = {
  sub: string;
  permission: string;
  rg: string;
  name: string;
  iat?: number;
  exp?: number;
};

const base64UrlToJson = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return JSON.parse(atob(base64)) as AccessTokenPayload;
};

export const decodeAccessToken = (token: string) => {
  const [, payload] = token.split('.');
  if (!payload) {
    throw new Error('Token JWT inválido.');
  }

  return base64UrlToJson(payload);
};
