import axios from "axios";
import { makeAutoObservable } from "mobx";
import { regaFormState } from "./RegaFormState";

export class Sender {
  regaSending: boolean

  constructor() {
    this.regaSending = false;
  }

  async send() {
    this.regaSending = true;
    try {
      await axios.post(import.meta.env.REGA_BACK_URL + '/rega', regaFormState)
    } catch (e) {
      alert('Что-то пошло не так!')
      console.error(e)
    } finally {
      this.regaSending = false;
    }
  }
}

export const sender = makeAutoObservable(new Sender()) 