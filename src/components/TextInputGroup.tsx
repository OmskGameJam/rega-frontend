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
  maxlen?: number
}

function BaseTextInputGroup(props: TextInputGroupProps) {

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const text = e.target.value.slice(0,props.maxlen ?? 64);

    regaFormState.set(props.name, text.trimStart()) // Не позволяем вводить тупо пробелы
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
        <textarea onChange={onChange} value={regaFormState[props.name] as string}></textarea>
        :
        <input onChange={onChange} type="text" name={props.name} placeholder={props.placeholder} value={regaFormState[props.name] as string}/>
      }
    </label>
  </div>
}

export const TextInputGroup = observer(BaseTextInputGroup)