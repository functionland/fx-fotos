import axios from 'axios';

const API_URL = 'http://192.168.88.1:3500';

export const getProperties = async () => {
  return axios.get(`${API_URL}/properties`, {
    timeout: 1000 * 15,
  });
};

export const postProperties = async (data) => {
  return axios.post(`${API_URL}/properties`, data);
};

export const getWifiList = async (): Promise<{ data: { ssid: string }[] }> => {
  return axios.get(`${API_URL}/wifi/list`);
};

export const getWifiStatus = async () => {
  return axios.get(`${API_URL}/wifi/status`);
};

export const postWifiConnect = async (data: {
  ssid: string;
  password: string;
  countryCode: string;
}) => {
  return axios.post(`${API_URL}/wifi/connect`, data, {
    timeout: 1000 * 15,
  });
};

export const putApDisable = async () => {
  return axios.put(`${API_URL}/ap/disable`);
};
