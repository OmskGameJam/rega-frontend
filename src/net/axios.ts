import { Axios } from "axios";

export const globalAxios = new Axios({
  baseURL: import.meta.env.VITE_REGA_BACK_URL,
  headers: {
    "Content-Type": 'application/json'
  }
})