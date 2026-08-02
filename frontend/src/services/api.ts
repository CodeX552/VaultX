import axios from 'axios';

// Backend ke saath saare frontend requests isi shared axios client se jaate hain.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  // Base URL aur credentials yahan centralize hain taaki har request consistent rahe.
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});
