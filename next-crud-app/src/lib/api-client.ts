/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ApiResponse } from "./types";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2323";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const cookieHeader = (await cookies()).toString();
    if (cookieHeader) {
      config.headers["Cookie"] = cookieHeader;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export async function apiCall<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  data?: any,
  params?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request({
      method,
      url: endpoint,
      data,
      params,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error.message || "API call failed"
    );
  }
}
