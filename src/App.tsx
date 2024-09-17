
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
            Игровое Варенье!
          </h1>
          <div className='d-box'>
            <p>
              <b>Игровое варенье</b> - это омский хакатон по разработке ИГР.<br/>
              Собираемся 17 августа в Точке Кипения на Жукова 21 в городе Омске и пишем игру ДВА ДНЯ.
            </p>
            <p>
              Мы соберёмся разрабатывать игры в своё удовольствие, без привязки к какому-то мировому джему!<br/> Например, мы точно не связаны с GMTK-2024, который будет проходить в те же дни. И тем более не связаны с Magical Girl Game Jam #10
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
              <h4>Суббота 17 августа:</h4>
              <ul>
                <li>Анонс темы хакатона в 9:00 в чате https://t.me/omsky_gamedev</li>
                <li>Открытие Точки в 10:00</li>
                <li>В 11:00 обсуждение идей игр</li>
                <li>Делаем игры</li>
                <li>Уходим домой в 20:00</li>
              </ul>
            </div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}} className='d-box'>
              <h4>Суббота 17 августа:</h4>
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
