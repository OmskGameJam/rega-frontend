
import { useState } from 'react'
import { Register } from './pages/Register'
import { Privacy } from './pages/Privacy'
import { Map, Placemark, YMaps } from '@r3flector/react-yandex-maps'
import { Teams } from './pages/Teams'
import Snowfall from 'react-snowfall'
import { genSnowflakes } from './crap/snowflakes'
import StringCycler from './components/StringCycler'

export function App() {

  const [openInfo, setOpenInfo] = useState(false)
  return (
    <>
      <main>
        <Snowfall snowflakeCount={70} style={{ position: 'fixed'}} images={genSnowflakes()} radius={[16,24]}/>
        <section>
          <center onClick={() => {window.location.href = '/'}}>
            <img className='logo' src="jar.png" />
          </center>
        </section>
        <section>

          <h1 className='text-outline d-box'>
            Омский Игровой Хакатон 5-6 января!
          </h1>
          <div className='d-box'>
            <p>
              <b><span>Игровое Варенье №5</span></b> - это омский хакатон по разработке ИГР.<br />
              Собираемся 5 января в 10:00 в ИТ-парке на Комарова 21 к1 в городе Омске и пишем игру ДВА ДНЯ.
            </p>
            <p>
              Стартуем одновременно с <a target='_blank' href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ">
                <StringCycler strings={['undefined', '[object Object]', 'ERROR', 'ReferenceError', 'NullPointerException', 'NaN', 'DivisionByZeroException', '[screaming externally]', 'VibeCheckNotPassedException', 'Abort, Retry, Ignore, Fail?', '?REDO FROM START', 'lp0 on fire', 'Guru Meditation' ]} />
              </a>...?
              <br />
            </p>
            <p>
              В этот раз мы не синхронизируемся с каким-то мировым джемом! Тему подберём сами и анонсируем в день начала.
            </p>
            <p>
              Можно участвовать в соло или в команде из 2..5 человек.
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
                  <h4>Понедельник 5 января:</h4>
                  <ul>
                    <li>Анонс темы хакатона в чате <a href='https://t.me/omsky_gamedev' target='_blank'>https://t.me/omsky_gamedev</a></li>
                    <li>Открытие в 10:00</li>
                    <li>В 12:00 обсуждение идей игр</li>
                    <li>Делаем игры</li>
                    <li>Уходим домой в 20:00</li>
                  </ul>
                </div>
                <div style={{ gridArea: '1 / 2 / 2 / 3' }} className='d-box'>
                  <h4>Вторник 6 января:</h4>
                  <ul>
                    <li>Открытие в 10:00</li>
                    <li>Делаем игры</li>
                    <li>Ярмарка игр в 18:00 <b>(Можно звать друзей!)</b></li>
                    <li>Подведение итогов, награжения и СЮРПРИЗ</li>
                    <li>Афтепати в Биркиндоме в 21:00</li>
                  </ul>
                </div>
                <div style={{ gridArea: '2 / 1 / 3 / 3' }} className='d-box'>
                  <div>
                    <div>Место: <b>ИТ-парк Омск</b></div>
                    <div>Адрес: Омск, пр. Комарова, 21 к1</div>
                    <br /><br />
                  </div>
                  <YMaps query={{ apikey: '4d1af35d-5954-46a5-8f53-883add76bfbf' }}>
                    <Map height={300} defaultState={{
                      center: [54.983200, 73.309408],
                      zoom: 17
                    }}>
                      <Placemark geometry={[54.983200, 73.309408]} defaultProperties={{ iconCaption: 'Вход туташки!' }} />
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
