import { Children } from "../helpers/types";

interface TextInputGroupProps {
  title: string, 
  subtitle: string,
  name: string,
  value: string, 
  children?: Children
  required?: boolean
}

export function TextInputGroup(props: TextInputGroupProps) {
  return <p>
    <label className="input-group text-group">
      <span>{ props.title } { props.required ? <span className="required-tick">*</span> : '' }</span>
      <span>{ props.subtitle }</span>
      <input type="text" name={props.name} value={props.value}/>
    </label>
  </p>
}