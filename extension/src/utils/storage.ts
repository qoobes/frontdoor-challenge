import { AUTH_TOKEN, ENABLED_KEY } from "./constants";

export const setToken = async (value: string) =>
  await chrome.storage.local.set({ [AUTH_TOKEN]: value });

export const getToken = async () => {
  const value = await chrome.storage.local.get([AUTH_TOKEN]);

  return value[AUTH_TOKEN];
};

export const setEnabled = async (value: boolean) =>
  await chrome.storage.local.set({ [ENABLED_KEY]: value });

export const getEnabled = async () => {
  const value = await chrome.storage.local.get([ENABLED_KEY]);

  return value[ENABLED_KEY];
};
