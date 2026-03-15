import axios from "axios";

export const globalAxios = axios.create({
  baseURL: import.meta.env.VITE_REGA_BACK_URL,
  headers: {
    "Content-Type": 'application/json'
  }
})