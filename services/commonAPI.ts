import axios, { type AxiosRequestConfig, type Method } from 'axios';

export const commonAPI = async <T>(
  method: Method,
  url: string,
  data?: any,
  headers?: Record<string, string>
): Promise<T> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    data,
    headers,
  };

  const response = await axios.request<T>(config);
  return response.data;
};