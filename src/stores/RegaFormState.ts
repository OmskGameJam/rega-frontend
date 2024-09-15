import { makeAutoObservable } from "mobx";

export type RegaFormKey = keyof Omit<RegaFormState, "set">

class RegaFormState {
  teamName: string = ''
  teamExperience: string = ''
  teamContacts: string = ''
  teamMembers: string = ''
  category: string = ''
  location: string = ''
  engine: string = ''
  kek: string = ''
  joined: string = ''

  set(key: RegaFormKey, value: string) {
    this[key] = value
  }
}

export const regaFormState = makeAutoObservable(new RegaFormState())

//@ts-expect-error Debugging
window.regaFormState = regaFormState