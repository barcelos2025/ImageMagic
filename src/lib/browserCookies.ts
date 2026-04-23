export const getBrowserCookie = (name: string) => {
  if (typeof document === "undefined") return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName));

  return entry ? decodeURIComponent(entry.slice(encodedName.length)) : null;
};

export const setBrowserCookie = (name: string, value: string, maxAgeDays = 180) => {
  if (typeof document === "undefined") return;

  const maxAge = Math.max(1, Math.floor(maxAgeDays)) * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};
