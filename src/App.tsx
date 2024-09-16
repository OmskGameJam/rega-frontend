import { TextInputGroup } from './components/TextInputGroup'
import { RadioGroup } from './components/RadioGroup'
import { ButtonRegister } from './components/ButtonRegister'
import { YMaps, Map, Placemark } from '@r3flector/react-yandex-maps'
import { useState } from 'react'

export function App() {

  const [openInfo, setOpenInfo] = useState(false)

  return (
    <>
      <main>
        <section>
          <center>
            <img className='logo' src="jar.png" />
          </center>
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
        <section>
          <h2 className='text-outline d-box d-box-black'>
            Регистрация на Омское Игровое Варенье №3
          </h2>
          <TextInputGroup 
            name='teamName'
            title='Название вашей команды'
            subtitle='Например, "Зайчики-попрыгайчики" или "Новая команда (1)"'
            placeholder='Новая команда (2)'
            required={true}
          />
          <TextInputGroup 
            name='teamExperience'
            title='Какой у вас опыт в написании игр?'
            subtitle='Не важно, много его у вас или мало, нам просто интересно :)'
            placeholder='0-3 года'
          />
          <TextInputGroup 
            name='teamContacts'
            title='Оставьте ваши контакты'
            subtitle='ВКонтакте, Телегарам, Мой Мир Mail.RU, в какое окно кидать камень'
            placeholder='телеграм: @oleg_gaming'
          />
          <TextInputGroup 
            name='teamMembers'
            title='Расскажите о свой команде!'
            subtitle='Кто вы, что вы делаете, всё что угодно'
            placeholder='Мы - Новая Команда (1), с нами: &#10;&#10;Олег - Разработчик штук, игрец на гитаре &#10;Олег (1) - Дизайнер штук, колбасит соло &#10;Олег (2) - Олег'
            area
          />
          <RadioGroup
            name='location'
            title='Где планируете хакатонить?'
            subtitle='Можно откуда угодно, но с нами - веселее'
            options={['С нами, из Точки Кипения на Жукова 21', 'Из дома', 'Из дома, а потом приду в точку на ярмарку']}
          />
          <RadioGroup
            name='category'
            title='Категория участия'
            subtitle='Это важно для мирового Ludum Dare'
            options={[
              'Jam: Сольное участие. Одинокий волк, пишет всё с нуля.',
              'Compo: Командное участие. Вас много (или вы Наруто), можно использовать заготовки.'
            ]}
          />
          <TextInputGroup
            name='engine'
            title='На чём планируете делать игру?'
            subtitle='Unity? Godot? Свой движок, или что-то совсем серьёзное?'
            placeholder='Unreal Bomjine 2'
          />
          <TextInputGroup
            name='kek'
            title='Наконец, дайте совет остальным участникам'
            subtitle='Пейте водичку и ложитесь спать вовремя!'
            placeholder='Да'
          />
          <RadioGroup
            name='joined'
            title=<>Я зашёл в чат <a href='https://t.me/omsky_gamedev'>@omsky_gamedev</a> и прочитал о формате <a href='https://vk.com/@-41503523-chto-za-ludum-dare-aka-old48'>Игрового Джема</a></>
            subtitle='Это важно для мирового Ludum Dare'
            options={[
              'Да',
              'Пока ещё нет'
            ]}
          />
          <center>
            <ButtonRegister />
          </center>
        </section>
        
      </main>
    </>
  )
}
export default App
