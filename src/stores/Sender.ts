import { makeAutoObservable } from "mobx";
import { RegaFormKey, regaFormState } from "./RegaFormState";
import { regaFormValidityState } from "./RegaFormValidityState";
import { globalAxios } from "../net/axios";
import { YM_COUNTER } from "../helpers/constants";

export class Sender {
  regaSending: boolean

  constructor() {
    this.regaSending = false;
  }

  async send() {

    let willSend = true;
    let firstInvalidInputName: string | undefined
    
    for (const k in regaFormState) {
      const key = k as RegaFormKey
      const value = regaFormState[key]
      if (typeof value == 'string')  {
        regaFormState.set(key, value.trim()) // Авто trim
        if (value.length < 1) {
          regaFormValidityState.set(key, false)
          if (!firstInvalidInputName) firstInvalidInputName = key
          willSend = false;
        }
      }
    }

    if (!willSend) {
      document.querySelector(`input[name="${firstInvalidInputName}"`)?.scrollIntoView({behavior: "smooth", block: "center"})
      return
    }

    console.log(JSON.stringify(regaFormState));
    this.regaSending = true;
    try {
      const res = await globalAxios.post('/rega', JSON.stringify(regaFormState))
      ym(YM_COUNTER, "reachGoal", "rega")
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