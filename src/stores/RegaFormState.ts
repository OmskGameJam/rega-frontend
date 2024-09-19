import { makeAutoObservable } from "mobx";

export type RegaFormKey = keyof Omit<RegaFormState, "set">

class RegaFormState {
  name: string = ''
  exp: string = ''
  contact: string = ''
  where: string = ''
  members: string = ''
  advice: string = ''
  prepare: string = ''
  tech: string = ''
  joined: string = ''

  set(key: RegaFormKey, value: string) {
    this[key] = value
  }
}

export const regaFormState = makeAutoObservable(new RegaFormState())

//@ts-expect-error Debugging
window.regaFormState = regaFormState