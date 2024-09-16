import { observer } from "mobx-react-lite"
import { RegaFormKey, regaFormState } from "../stores/RegaFormState"

interface RadioGroupOptions {
  title: string | JSX.Element
  subtitle: string | JSX.Element
  name: RegaFormKey
  options: string[] 
}

function BaseRadioGroup(props: RadioGroupOptions) {
  return <div className="input-group radio-group d-box d-box-black">
      <div className="input-group-title">{ props.title }</div>
      <div className="input-group-subtitle"> { props.subtitle }</div>
      <div className="radio-options">
        { props.options.map( (option, idx) => {
          return <label>
            <input key={idx} onChange={ (v) => { regaFormState.set(props.name, v.target.value)  } } type="radio" name={props.name} value={option} />
            <div> { option } </div>
          </label>
        }) }
      </div>
    </div>
}

export const RadioGroup = observer(BaseRadioGroup)