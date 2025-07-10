import { ButtonRegister } from "../components/ButtonRegister";
import { RadioGroup } from "../components/RadioGroup";
import { TextInputGroup } from "../components/TextInputGroup";
import { CheckboxGroup } from "../components/CheckboxGroup";

export function Register() {
  return <>
  <section>
    <h2 className='text-outline d-box d-box-black'>
      Регистрация команды
    </h2>
    <TextInputGroup 
      name='name'
      title='Название вашей команды'
      subtitle='Например, "Зайчики-попрыгайчики" или "Новая команда (1)"'
      placeholder='Новая команда (2)'
      required={true}
    />
    <TextInputGroup 
      name='exp'
      title='Какой у вас опыт в написании игр?'
      subtitle='Не важно, много его у вас или мало, нам просто интересно :)'
      placeholder='0-3 года'
    />
    <TextInputGroup 
      name='contact'
      title='Оставьте ваши контакты'
      subtitle='ВКонтакте, Телегарам, Мой Мир Mail.RU, в какое окно кидать камень'
      placeholder='телеграм: @oleg_gaming'
    />
    <TextInputGroup 
      name='members'
      title='Расскажите о свой команде!'
      subtitle='Кто вы, что вы делаете, всё что угодно'
      placeholder='Мы - Новая Команда (1), с нами: &#10;&#10;Олег - Разработчик штук, игрец на гитаре &#10;Олег (1) - Дизайнер штук, колбасит соло &#10;Олег (2) - Андрей'
      area
      maxlen={400}
    />
    <RadioGroup
      name='where'
      title='Где планируете хакатонить?'
      subtitle='Можно откуда угодно, но с нами - веселее'
      options={[
        { long: 'С нами, из Точки Кипения на Маршала Жукова 21', short: 'Из Точки' }, 
        { long: 'Из дома', short: 'Из дома' },
        { long: 'Из дома, а потом приду в офис на ярмарку', short: 'И там, и там'}
      ]}
    />
    <TextInputGroup
      name='tech'
      title='На чём планируете делать игру?'
      subtitle='Unity? Godot? Свой движок, или что-то совсем серьёзное?'
      placeholder='Unreal Bomjine 2'
    />
    <TextInputGroup
      name='prepare'
      title='Как будете готовиться?'
      subtitle='Читать литературу? Разминаться? Спать?'
      placeholder='Прочитаю мангу про бетон и лягу спать в 7 утра'
      maxlen={128}
    />
    <TextInputGroup
      name='advice'
      title='Наконец, дайте совет остальным участникам'
      subtitle='Пейте водичку и ложитесь спать вовремя!'
      placeholder='Да'
      maxlen={128}
    />
    <RadioGroup
      name='joined'
      title=<>Я зашёл в чат <a target='_blank' href='https://t.me/omsky_gamedev'>@omsky_gamedev</a> и прочитал о формате <a target='_blank' href='https://vk.com/@-41503523-chto-za-ludum-dare-aka-old48'>Игрового Джема</a></>
      subtitle=''
      options={[
        { long: 'Да', short: 'Да' }
      ]}
    />
    <CheckboxGroup
      name='public'
      title=<>Приватность команды</>
      subtitle=<>Нужные легальные штуки</>
      options={[
        { short: 'public', long: 'Показывать мою команду в списке участников'},
        { short: 'hideteam', long: 'Скрывать участников команды'}
      ]}
    />

    
    <center>
      Отправляя форму вы соглашаетесь с <a href="/privacy" target="_blank">политикой конфиденциальности</a><br/>
      <ButtonRegister />
    </center>
  </section>
  </>
}