import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect } from "react";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://fullstack-backend-indol.vercel.app/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

export const useApi = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();
      console.log("TOKEN:", token ? "ADA" : "TIDAK ADA");
      console.log("REQUEST URL:", (config.baseURL ?? "") + (config.url ?? ""));

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return api;
};
