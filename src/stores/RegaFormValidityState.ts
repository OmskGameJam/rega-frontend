import { makeAutoObservable } from "mobx";
import { RegaFormKey } from "./RegaFormState";

class RegaFormValidityState {
  name: boolean = true
  exp: boolean = true
  contact: boolean = true
  where: boolean = true
  category: boolean = true
  members: boolean = true
  advice: boolean = true
  prepare: boolean = true
  tech: boolean = true
  joined: boolean = true

  set(key: RegaFormKey, value: boolean) {
    this[key] = value
  }
}

export const regaFormValidityState = makeAutoObservable(new RegaFormValidityState())

//@ts-expect-error Debugging
window.regaFormValidityState = regaFormValidityState