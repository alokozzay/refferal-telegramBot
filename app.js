const TelegramAPI = require('node-telegram-bot-api')

const keyboard =  require ('./module/keyboard')
const messageText =  require ('./module/text.js')

const mongoose = require('mongoose') // база данных MongoDB
const User = require('./models/users'); // експорт модель базы данных


require('dotenv').config();

// подключение к базе данных, в случае ошибки выводим в консоль.
mongoose
    .connect(process.env.TOKENBD, {useNewUrlParser: true, useUnifiedTopology: true}) 
    .then((res) => console.log('Connection to DataBase...'))
    .catch( err => console.log(err));

const bd = mongoose;

const bot = new TelegramAPI(process.env.TOKEN, { polling: true})
const adm = new TelegramAPI(process.env.TOKEN2, { polling: true})

let NameButton = 'Button'
let LinkButton = 'https://t.me/tallliban'

bot.onText(/\/start/, async msg => {

    const ChatId = msg.chat.id;
    const UserName = msg.from.username;
    const RefferalId = msg.from.id;
    const UserId = msg.from.id;
    const Name = msg.from.first_name;

    const refferalCode = msg.text.split(" ").slice(1,2).join(" ");
    const userBD = await User.findOne({ UserId: UserId });

    if(!userBD) {
        const users = await new User({
            ChatId: ChatId,
            ReferralId: RefferalId,
            ReferralCount: 0,
            UserNumber: 0,
            MoneyCount: 0,
            UserName: UserName,
            Name: Name,
            UserId: UserId,
        });

        users
            .save()
            .then(res => console.log('new user in telegram bot!'))
            .catch(err => console.log(err))

        if(refferalCode) {
            let userRefferal = await User.findOne({ ReferralId: refferalCode });

            if (userRefferal) {
                UserRefferalCount = userRefferal.ReferralCount;
                UserMoneyCount = userRefferal.MoneyCount;

                UserRefferalCount++;
                UserMoneyCount = UserMoneyCount + 10;

            	await User.updateOne({ReferralId: refferalCode}, {$set: {ReferralCount : UserRefferalCount, MoneyCount: UserMoneyCount }})

            	bot.sendMessage(userRefferal.ReferralId, `🔔 Вы пригласили <a href="tg://user?id=${msg.from.id}">партнёра</a> и получили +10₽
                \n💰Всего вы пригласили ${UserRefferalCount} партнеров, на счету у вас ${UserMoneyCount}₽`, { 
                    parse_mode: "HTML" 
                });
            }
        }
    }
    
    bot.sendMessage(ChatId, `Здравствуй ${Name}, вы выбрали:\n\n🔝Главное Меню`,{ 
        parse_mode: "HTML",
        reply_markup: {
            keyboard: keyboard.start
        }
    });

})

bot.on('message', async msg => {

    const ChatId = msg.chat.id;
    const UserName = msg.from.username;
    const RefferalId = msg.from.id;
    const UserId = msg.from.id;
    const Name = msg.from.first_name;

    let userBD = await User.findOne({ UserId: UserId });

    switch(msg.text) {
        case 'Как заработать?🍀':
            bot.sendMessage(ChatId, messageText.how)
            break
        
        case 'Реферальная ссылка💰':
            bot.sendMessage(ChatId,`🔗 Твоя реферальная ссылка для приглашений: https://t.me/referrallmoneyBot?start=${RefferalId}
            \n💴Чтоб узнать сколько ты будешь получать за пригласившего, перейди в раздел 'Как заработать?'💴`)
            break

        case 'Личный кабинет💸':
            bot.sendMessage(ChatId,`👋 Привет ${Name}, ну давай посмотрим что тебе удалось заработать, твой баланс ниже.
            \n💰 Ваш баланс - ${userBD.MoneyCount}₽\nℹ️ Ваш юзер - @${UserName}\n🆔️ Ваш ID - ${UserId}`)
            break

        case 'Вывод средств🏦':
            if (userBD.MoneyCount < 75) {
                bot.sendMessage(ChatId, `🤷‍♂️ Кажется у тебя на балансе не достаточно средств для вывода.
                    \n💸 Мин вывод составляет - 75₽, исключительно на QIWI/Сбербанк/Тинькоф`)
            }
            else {
                bot.sendMessage(ChatId, `Поздравляю, вы набрали достаточную сумму для вывода💰
                    \nдля вывода, отправьте свой номер, и в течение 5 минут получите ${userBD.MoneyCount}₽💰`, { 
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: keyboard.pay
                        }
                })
            }
            break
        
        case '🔝Главное меню': 
            bot.sendMessage(ChatId, `Здравствуй ${Name}, вы выбрали:\n\n🔝Главное Меню`,{ 
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: keyboard.start
                }
            })
            break

        case 'Информация📈':
            bot.sendMessage(ChatId, `📡 Статистика бота Refferal Money
                \n📆 Работаем дней: 79\n⛄️ Всего пользователей: 389\n🔥 Новых за сегодня: 1\n\n🍀Обновляется раз в день`)
            break
        
        case 'Купить рекламу💲': 
            bot.sendMessage(ChatId, `Привет, желаешь купить рекламу?
                \nТогда ссылка на нашего менеджера по рекламе находится ниже ⬇️`, {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: keyboard.advertising
                    }
            })
            break
    }
})

// принимаем команду, обрабатываем текст и ссылку на фотографию
// затем собираем список юзеров с базы данных и отправляем сообщение

adm.onText(/\/postphoto/, async msg => {

    // переменная для хранение текста, который мы будем отправлять.
    const sendText = msg.text.split(" ").slice(2).join(" "); 

    //перменная для хранение ссылки фотографии.
    const sendUrl = msg.text.split(" ").slice(1,2).join(" ");

    const log = await User.find( { }, { ChatId: 1, _id: 0 } );
    
    // проходим циклом по всем юзерам
    for (let i = 0; i < log.length; i++) {
        
        bot.sendPhoto(log[i].ChatId, sendUrl, {
            caption: sendText,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: NameButton,
                            callback_data: 'write',  
                            url: LinkButton
                        }
                    ],
                ],
            }
        })          
    }
})


// принимаем команду, обрабатываем текст и ссылку на видео
// затем собираем список юзеров с базы данных и отправляем сообщение

adm.onText(/\/postvideo/, async msg => {

    // переменная для хранение текста, который мы будем отправлять.
    const sendText = msg.text.split(" ").slice(2).join(" "); 

    //перменная для хранение ссылки видео.
    const sendUrl = msg.text.split(" ").slice(1,2).join(" ");

    const log = await User.find( { }, { ChatId: 1, _id: 0 } );
    
    // проходим циклом по всем юзерам
    for (let i = 0; i < log.length; i++) {
        
        bot.sendVideo(log[i].ChatId, sendUrl, {
            caption: sendText,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: NameButton,
                            callback_data: 'write',  
                            url: LinkButton
                        }
                    ],
                ],
            }
        })        
    }
})


// принимаем команду, затем обрабатываем только текст
// затем собираем список юзеров с базы данных и отправляем сообщение

adm.onText(/\/posttext/, async msg => {
    
    // переменная для хранение текста, который мы будем отправлять.
    const sendText = msg.text.split(" ").slice(1).join(" ");

    const log = await User.find( { }, { ChatId: 1, _id: 0 } );
    
    // проходим циклом по всем юзерам
    for (let i = 0; i < log.length; i++) {
        
        bot.sendMessage(log[i].ChatId, sendText, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: NameButton,
                            callback_data: 'write',  
                            url: LinkButton
                        }
                    ],
                ],
            }
        })       
    }
})
adm.onText(/\/nbtnposttext/, async msg => {
    
    // переменная для хранение текста, который мы будем отправлять.
    const sendText = msg.text.split(" ").slice(1).join(" ");

    const log = await User.find( { }, { ChatId: 1, _id: 0 } );
    
    // проходим циклом по всем юзерам
    for (let i = 0; i < log.length; i++) {
        
        bot.sendMessage(log[i].ChatId, sendText, {
            parse_mode: 'HTML',
            
        })         
    }
})

adm.onText(/\/nbtnpostphoto/, async msg => {

    // переменная для хранение текста, который мы будем отправлять.
    const sendText = msg.text.split(" ").slice(2).join(" "); 

    //перменная для хранение ссылки фотографии.
    const sendUrl = msg.text.split(" ").slice(1,2).join(" ");

    const log = await User.find( { }, { ChatId: 1, _id: 0 } );
    
    // проходим циклом по всем юзерам
    for (let i = 0; i < log.length; i++) {      
        bot.sendPhoto(log[i].ChatId, sendUrl, {
            caption: sendText,
            parse_mode: 'HTML',
        })        
    }
})

adm.onText(/\/namebutton/, async msg => {
    NameButton = msg.text.split(" ").slice(1,2).join(" ");
    
    const ChatId = msg.chat.id;

    adm.sendMessage(ChatId, `name button: ${NameButton}`, {
        parse_mode: 'HTML',
    })
    
})

adm.onText(/\/linkbutton/, async msg => {
    LinkButton = msg.text.split(" ").slice(1,2).join(" ");

    const ChatId = msg.chat.id;

    adm.sendMessage(ChatId, `link button: ${LinkButton}`, {
        parse_mode: 'HTML',
    })
})