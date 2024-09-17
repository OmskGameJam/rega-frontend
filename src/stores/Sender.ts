import { makeAutoObservable } from "mobx";
import { RegaFormKey, regaFormState } from "./RegaFormState";
import { regaFormValidityState } from "./RegaFormValidityState";
import { globalAxios } from "../net/axios";

export class Sender {
  regaSending: boolean

  constructor() {
    this.regaSending = false;
  }

  async send() {

    let willSend = true;
    let firstInvalidInputName: string | undefined
    
    for (const k in regaFormState) {
      const v = regaFormState[k as RegaFormKey]
      if (typeof v == 'string')  {
        if (v.length < 1) {
          regaFormValidityState.set(k as RegaFormKey, false)
          if (!firstInvalidInputName) firstInvalidInputName = k
          willSend = false;
        }
      }
    }

    if (!willSend) {
      document.querySelector(`input[name="${firstInvalidInputName}"`)?.scrollIntoView({behavior: "smooth", block: "center"})
      return
    }

    this.regaSending = true;
    try {
      const res = await globalAxios.post('/rega', JSON.stringify(regaFormState))
      window.localStorage.setItem('my-team', JSON.parse(res.data).id)
      window.location.pathname = '/teams'
    } catch (e) {
      alert('Что-то пошло не так!')
      console.error(e)
    } finally {
      this.regaSending = false;
    }
  }
}

export const sender = makeAutoObservable(new Sender()) 