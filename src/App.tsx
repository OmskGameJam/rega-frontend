
import { useState } from 'react'
import { Register } from './pages/Register'
import { Privacy } from './pages/Privacy'
import { Map, Placemark, YMaps } from '@r3flector/react-yandex-maps'
import { Teams } from './pages/Teams'
import Snowfall from 'react-snowfall'
import { genSnowflakes } from './crap/snowflakes'

export function App() {

  const [openInfo, setOpenInfo] = useState(false)
  return (
    <>
      <main>
        <Snowfall snowflakeCount={70} style={{ position: 'fixed'}} images={genSnowflakes()} radius={[16,24]}/>
        <section>
          <center onClick={() => {window.location.href = '/'}}>
            <img className='logo' src="old-long.png" />
            <img className='logo-mobile' src="old-short.png" />
          </center>
        </section>
        <section>

          <h1 className='text-outline d-box'>
            Омский Игровой Хакатон 4-5 октября!
          </h1>
          <div className='d-box'>
            <p>
              <b><span>Омский Людум Даре</span></b> - это <span style={{fontFamily: 'cursive'}}>легендарный</span> омский хакатон по разработке ИГР.<br />
              Собираемся 4 октября в 10:00 в Точке Кипения на Маршала Жукова 21 в городе Омске и пишем игру ДВА ДНЯ.
            </p>
            <p>
              Стартуем одновременно мировым с <a target='_blank' href="https://ldjam.com/">Ludum Dare 58</a><br />
            </p>
            <p>
              Можно участвовать в соло или в команде из 2..5 человек.
            </p>
            <p style={{fontSize: '0.6em'}}>
              но хеллоуин же в конце месяца...
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
                <div style={{ gridArea: '1 / 1 / 2 / 2' }} className='d-box'>
                  <h4>Суббота 4 октября:</h4>
                  <ul>
                    <li>Анонс темы в чате <a href='https://t.me/omsky_gamedev' target='_blank'>https://t.me/omsky_gamedev</a></li>
                    <li>Открытие точки в 10:00</li>
                    <li>В 12:00 обсуждение идей игр</li>
                    <li>Делаем игры</li>
                    <li>Уходим домой в 20:00</li>
                  </ul>
                </div>
                <div style={{ gridArea: '1 / 2 / 2 / 3' }} className='d-box'>
                  <h4>Воскресенье 5 октября:</h4>
                  <ul>
                    <li>Открытие офиса в 10:00</li>
                    <li>Делаем игры</li>
                    <li>Ярмарка игр в 18:00 <b>(Можно звать друзей!)</b></li>
                    <li>Подведение итогов, награжения и СЮРПРИЗ</li>
                    <li>Афтепати в Биркиндоме в 21:00</li>
                  </ul>
                </div>
                <div style={{ gridArea: '2 / 1 / 3 / 3' }} className='d-box'>
                  <div>
                    <div>Место: <b>Точка Кипения Омск</b></div>
                    <div>Адрес: Омск, улица Маршала Жукова, 21</div>
                    <br /><br />
                  </div>
                  <YMaps query={{ apikey: '4d1af35d-5954-46a5-8f53-883add76bfbf' }}>
                    <Map height={300} defaultState={{
                      center: [54.985396, 73.387089],
                      zoom: 17
                    }}>
                      <Placemark geometry={[54.985396, 73.387089]} defaultProperties={{ iconCaption: 'Вход туташки!' }} />
                    </Map>
                  </YMaps>
                </div>
                <div style={{ gridArea: '3 / 1 / 3 / 3' }} className='d-box'>
                  В конце второго дня происходит Ярмарка Игр, на которой участники голосуют за игры друг друга в следующих номинациях:
                  <ul>
                    <li>Геймплей - игра, в которую веселее или интереснее всего играть</li>
                    <li>Красота - игра с лучшим артом, лучшими шейдерами или попросту тесно сшитая</li>
                    <li>Звук - игра с лучшим звуковым оформлением, короче, Dolbit Normalno</li>
                    <li><i>Ш</i>то это - никто не знает, что это; сюда попадают игры, которые <span style={{fontFamily: 'cursive'}}>не такие, как все</span></li>
                    <li>Вайбик - таинственная номинация от таинственного спонсора</li>
                  </ul>
                </div>
              </div>
            )
          }
        </section>

        {
          window.location.pathname.includes('/teams') ?
          <Teams />
          :
          window.location.pathname.includes('/privacy') ? 
          <Privacy></Privacy> 
          :
          <Register />
        }

      </main>
    </>
  )
}
export default App
