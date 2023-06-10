import Axios from "axios";
import { API_URL } from "./constants";
import { getToken } from "./storage";

const axios = Axios.create({
  baseURL: API_URL,
});

axios.interceptors.request.use(async (config) => {
  const accessToken = await getToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      chrome.runtime.sendMessage({ enabled: false, auth: false });
    }

    return Promise.reject(error);
  },
);

export const axiosInstance = axios;
