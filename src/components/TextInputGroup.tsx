import { observer } from "mobx-react-lite";
import { Children } from "../helpers/types";
import { RegaFormKey, regaFormState } from "../stores/RegaFormState";
import { regaFormValidityState } from "../stores/RegaFormValidityState";

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

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    regaFormState.set(props.name, e.target.value)
    regaFormValidityState.set(props.name, true)
  }

  return <div className="input-group d-box d-box-black">
    <label className="text-group">
      <div className="input-group-title">
        { props.title }
        <span style={{color: 'orangered'}}> 
          { regaFormValidityState[props.name] ? '' : '        Нужно заполнить!' } 
        </span> 
      </div>
      <div className="input-group-subtitle">{ props.subtitle }</div>
      {
        props.area? 
        <textarea onChange={onChange}></textarea>
        :
        <input onChange={onChange} type="text" name={props.name} placeholder={props.placeholder} value={regaFormState[props.name]}/>
      }
    </label>
  </div>
}

export const TextInputGroup = observer(BaseTextInputGroup)