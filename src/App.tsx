
import { useState } from 'react'
import { Register } from './pages/Register'
import { Map, Placemark, YMaps } from '@r3flector/react-yandex-maps'
import { Teams } from './pages/Teams'

export function App() {

  const [openInfo, setOpenInfo] = useState(false)
  return (
    <>
      <main>
        <section>
          <center>
            <img className='logo' src="jar.png" />
          </center>
        </section>
        <section>
          
          <h1 className='text-outline d-box'>
            Омский Людум Даре!
          </h1>
          <div className='d-box'>
            <p>
              <b><span>Игровое варенье</span></b> - это омский хакатон по разработке ИГР.<br/>
              Собираемся 5 октября в Точке Кипения на Жукова 21 в городе Омске и пишем игру ДВА ДНЯ.
            </p>
            <p>
              Мы соберёмся разрабатывать игры параллельно с мировым конкурсом <a target='_blank' href="https://ldjam.com/">Ludum Dare #56!</a><br/>
              <br />
              Ludum Dare — мировой конкурс по созданию игр за 48 часов. Разработчики, дизайнеры и просто весёлые ребята со всего мира создают новые игры на тему, выбранную общим голосованием.<br />
              Чтобы было веселее делать игры, участники по всему миру организуют сходки и собираются в офисах, квартирах, кофейнях. Игровое Варенье — и есть такая сходка.<br />
            </p>
            <p>
              Можно участвовать в соло или в команде из 2..10 человек.
            </p>
          </div>
        </section>
        <section>
          <center>
            <button className={'d-box d-box-black' + (openInfo ? ' active' : '')} onClick={() => setOpenInfo(!openInfo)}>
              {openInfo ? '[X]' : '[>]'} Информация
            </button>
          </center>
        </section>
        <section>
          {
            openInfo && (
            <div className='ras'>
            <div style={{gridArea: '1 / 1 / 2 / 2'}} className='d-box'>
              <h4>Суббота 5 октября:</h4>
              <ul>
                <li>Анонс темы хакатона в 9:00 в чате <a href='https://t.me/omsky_gamedev' target='_blank'>https://t.me/omsky_gamedev</a></li>
                <li>Открытие Точки в 10:00</li>
                <li>В 12:00 обсуждение идей игр</li>
                <li>Делаем игры</li>
                <li>Уходим домой в 20:00</li>
              </ul>
            </div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}} className='d-box'>
              <h4>Воскресенье 6 октября:</h4>
              <ul>
                <li>Открытие Точки в 10:00</li>
                <li>Делаем игры</li>
                <li>Ярмарка игр в 18:00 (Можно звать друзей)</li>
                <li>Подведение итогов, награжения и СЮРПРИЗ</li>
                <li>Афтепати в Биркиндоме в 21:00</li>
              </ul>
            </div>
            <div style={{gridArea: '2 / 1 / 3 / 3'}} className='d-box'>
              <div>
                <div>Место: <b>Точка Кипения Омск</b></div>
                <div>Адрес: Омск, Маршала Жукова 21</div>
                <br/><br/>
              </div>
              <YMaps query={{apikey: '4d1af35d-5954-46a5-8f53-883add76bfbf'}}>
                <Map height={300} defaultState={{
                  center: [54.985395, 73.387463],
                  zoom: 17
                }}>
                  <Placemark geometry={[54.985313, 73.387150]} defaultProperties={{iconCaption: 'Вход туташки!'}} />
                </Map>
              </YMaps>
            </div>
            <div style={{gridArea: '3 / 1 / 3 / 3'}} className='d-box'>
              В конце второго дня происходит Ярмарка Игр, на которой участники голосуют за игры друг друга в следующих номинациях:
              <ul>
                <li>Геймплей - игра, в которую веселее или интереснее всего играть</li>
                <li>Красота - игра с лучшим артом, лучшими шейдерами или попросту тесно сшитая</li>
                <li>Доделай это - каждый интерпритирует эту номинацию по своему, но сюда тоже не каждая игра попадает. Попадёшь сюда - у твоей игры есть потенциал!</li>
                <li>Что это - никто не знает, что это, сюда попадают игры, которые <span>не такие, как все</span></li>
                <li>Эстэтишно - таинственная номинация от таинственного спонсора</li>
              </ul>
            </div>
          </div>
          )
          }
        </section>
        
        { window.location.pathname.includes('/teams') ? 
          <Teams />
          :
          <Register />
        }
        
      </main>
    </>
  )
}
export default App
