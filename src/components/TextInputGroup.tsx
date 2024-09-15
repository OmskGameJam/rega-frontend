import { observer } from "mobx-react-lite";
import { Children } from "../helpers/types";
import { RegaFormKey, regaFormState } from "../stores/RegaFormState";

interface TextInputGroupProps {
  title: string | JSX.Element, 
  subtitle: string | JSX.Element,
  name: RegaFormKey,
  placeholder: string, 
  children?: Children
  required?: boolean
  area?: boolean
}

function BaseTextInputGroup(props: TextInputGroupProps) {
  return <div className="input-group d-box d-box-black">
    <label className="text-group">
      <div className="input-group-title">{ props.title } { props.required ? <span className="required-tick">*</span> : '' }</div>
      <div className="input-group-subtitle">{ props.subtitle }</div>
      {
        props.area? 
        <textarea onChange={ (e) => { regaFormState.set(props.name, e.target.value) } } placeholder={props.placeholder}>{regaFormState[props.name]}</textarea>
        :
        <input onChange={ (e) => { regaFormState.set(props.name, e.target.value) } } type="text" name={props.name} placeholder={props.placeholder} value={regaFormState[props.name]}/>
      }
    </label>
  </div>
}

export const TextInputGroup = observer(BaseTextInputGroup)