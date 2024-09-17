import { observer } from "mobx-react-lite"
import { RegaFormKey, regaFormState } from "../stores/RegaFormState"
import { regaFormValidityState } from "../stores/RegaFormValidityState"

interface Option {
  long: string,
  short: string
}

interface RadioGroupOptions {
  title: string | JSX.Element
  subtitle: string | JSX.Element
  name: RegaFormKey
  options: Option[] 
}

function BaseRadioGroup(props: RadioGroupOptions) {
  
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    regaFormState.set(props.name, e.target.value)
    regaFormValidityState.set(props.name, true)
  }

  return <div className="input-group radio-group d-box d-box-black">
      <div className="input-group-title">
        { props.title } 
        <span style={{color: 'orangered'}}> 
          { regaFormValidityState[props.name] ? '' : '        Нужно заполнить!' } 
        </span> 
      </div>
      <div className="input-group-subtitle"> { props.subtitle } </div>
      <div className="radio-options">
        { props.options.map( (option, idx) => {
          return <label>
            <input key={idx} onChange={onChange} type="radio" name={props.name} value={option.short} />
            <div> { option.long } </div>
          </label>
        }) }
      </div>
    </div>
}

export const RadioGroup = observer(BaseRadioGroup)