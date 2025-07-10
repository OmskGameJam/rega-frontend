import { observer } from "mobx-react-lite"
import { RegaFormKey, regaFormState } from "../stores/RegaFormState"
import { regaFormValidityState } from "../stores/RegaFormValidityState"

interface Option {
  long: string,
  short: string
}

interface CheckboxGroupOptions {
  title: string | JSX.Element
  subtitle: string | JSX.Element
  name: RegaFormKey
  options: Option[] 
}

function BaseCheckboxGroup(props: CheckboxGroupOptions) {
  
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    // @ts-ignore wacky html crap
    regaFormState.set(e.target.name as RegaFormKey, !regaFormState[e.target.name as RegaFormKey])
    regaFormValidityState.set(props.name, true)
  }

  return <div className="input-group radio-group d-box d-box-black">
      <div className="input-group-title">
        { props.title } 
      </div>
      <div className="input-group-subtitle"> { props.subtitle } </div>
      <div className="radio-options">
        { props.options.map( (option, idx) => {
          return <label>
            <input checked={!!regaFormState[option.short as RegaFormKey]} key={idx} onChange={onChange} type="checkbox" name={option.short} value={option.short} />
            <div> { option.long } </div>
          </label>
        }) }
      </div>
    </div>
}

export const CheckboxGroup = observer(BaseCheckboxGroup)