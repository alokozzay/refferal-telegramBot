const keyboard = {
    start: [
        [
            'Как заработать?🍀', 'Реферальная ссылка💰'
        ],
        [
            'Вывод средств🏦','Личный кабинет💸'
        ],
        [
            'Информация📈','Купить рекламу💲'
        ],
    ],
    advertising: [
        [
            {
                text: 'Менеджер🙈',
                callback_data: 'men',  
                url: 'https://t.me/tallliban'
            }
        ]
    ],
    pay: [
        [
            {
                text: 'Поделиться номером📱',
                request_contact: true
            }
        ],
        [
            '🔝Главное меню', 'Личный кабинет💸'
        ],
    ],
}

module.exports = keyboard;