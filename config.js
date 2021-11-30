module.exports = {
    notifications: {
        img: {
            error: './img/error_default.png', // Иконка при ошибке
            transfer: './img/transfer_default.png', // Икона при переводе
            balance: './img/balance_default.png',
            newPayment: './img/leon.png'// Икона при проверке баланса
        }, // Картинки
        sound: true, // Звук (true / false)
    },
    qiwi: {
        timeout: 60 * 1000, // 60 секунд (60000 ms.)
        check: {
            balance: true, // проверка баланса (true - включен / false - выключен)
            newPayment: {
                status: true, // проверка новых платежей (true - включен / false - выключен)
                last: 5, // Проверка последних 5
                currency: [ 'QW_RUB' ] // Валюта (Руб)
            }, 
        },
        autoWithdrawal: {
            status: false, // true - включен / false - выключен
            balanceMore: 1, // Если баланс больше 1 и статус true тогда будет переводить,
            number: 38000000000 // На данный номер будет перевод
        }
    }
}