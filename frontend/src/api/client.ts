import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach API key from localStorage
client.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('sms_api_key') || '';
  if (apiKey) config.headers['x-api-key'] = apiKey;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message;
    return Promise.reject(new Error(message));
  }
);

export default client;
