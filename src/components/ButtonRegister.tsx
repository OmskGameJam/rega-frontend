import { observer } from "mobx-react-lite"
import { sender } from "../stores/Sender"

function BaseButtonRegister() {
  return <button className="d-box d-box-black" onClick={() => {sender.send()}}>
    { sender.regaSending ? 'Регистрируемся...' : '> Зарегистрироваться!'} 
  </button>
}

export const ButtonRegister = observer(BaseButtonRegister)