import { useEffect, useState } from "react"
import { globalAxios } from "../net/axios"

interface ITeamData {
  id: number
  name: string
  exp: string
  contact: string
  where: string
  category: string
  members: string
  advice: string
  prepare: string
  tech: string
}

export function Teams() {
  const [loadingState, setLoadingState] = useState(true)
  const [teams, setTeams] = useState<ITeamData[]>([])
  const [activeTeam, setActiveTeam] = useState(0);

  useEffect(() => {
    globalAxios.get('/rega')
      .then((d) => {
        setTeams(JSON.parse(d.data))
        setLoadingState(false)
        setActiveTeam( parseInt(window.localStorage.getItem('my-team') ?? '') )
      })
      .catch(() => {
        alert('Не удалось загрузить команды :(')
      })
  }, [])
  return <>
    { loadingState ? 
      <div className="d-box d-box-black"> 
        Загружаем команды...
      </div>
      :
      <div className="team-masonry">
        {
          teams.map( (t) => {
            return <div className={"d-box d-box-black " + (activeTeam == t.id ? ' active' : '') }>
              <div> <b>Название: </b>  { t.name } </div>
              <br />
              <div> <b>Опыт: </b> { t.exp } </div>
              <div> <b>Контакты: </b>  { t.contact } </div>
              <div> <b>Класс: </b>  { t.category } </div>
              <div> <b>Стек: </b>  { t.tech } </div>
              <div> <b>Где хакатонит:</b>  { t.where } </div>
              <br />
              <div> <b>Участники: </b> { t.members } </div>
              <br />
              <div> <b>Как готовится:</b> { t.prepare } </div>
              <div> <b>Полезный совет:</b> { t.advice } </div>
            </div>
          }) 
        }
      </div>
    }
  </>
}