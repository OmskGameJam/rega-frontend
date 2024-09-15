
interface RadioGroupOptions {
  title: string
  subtitle: string
  name: string
  options: string[] 
}

export function RadioGroup(props: RadioGroupOptions) {
  return <>
    <p className="input-group radio-group">
      <span>{ props.title }</span>
      <span>{ props.subtitle }</span>
      <div className="radio-options">
        { props.options.map( option => {
          return <label>
            <input type="radio" name={props.name} value={option} />
            <span> { option } </span>
          </label>
        }) }
      </div>
    </p>
  </>
}