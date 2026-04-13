const CREDENTIALS_KEY = "terrabit_credentials";

export interface Credentials {
  nif: string;
  password: string;
  codiMO: string;
  codiMOList: string[];
  rememberMe: boolean;
}

function encode(data: string): string {
  return btoa(unescape(encodeURIComponent(data)));
}

function decode(data: string): string {
  return decodeURIComponent(escape(atob(data)));
}

export function saveCredentials(credentials: Credentials): void {
  const encoded = encode(JSON.stringify(credentials));
  localStorage.setItem(CREDENTIALS_KEY, encoded);
}

export function getCredentials(): Credentials | null {
  try {
    const encoded = localStorage.getItem(CREDENTIALS_KEY);
    if (!encoded) return null;
    return JSON.parse(decode(encoded)) as Credentials;
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
}

export function isAuthenticated(): boolean {
  return getCredentials() !== null;
}

export function addCodiMO(codigo: string): void {
  const credentials = getCredentials();
  if (!credentials) return;
  if (!credentials.codiMOList.includes(codigo)) {
    credentials.codiMOList.push(codigo);
    saveCredentials(credentials);
  }
}

export function getCodiMOList(): string[] {
  return getCredentials()?.codiMOList ?? [];
}

export function getActiveCodiMO(): string {
  return getCredentials()?.codiMO ?? "";
}