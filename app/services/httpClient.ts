import axios from 'axios';

export const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/incidents`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
