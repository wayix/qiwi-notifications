const { 
    sendNotification, loadTokens, saveCache,
    sendPayment, getBalance, getOperationHistory, qiwiCache
} = require('./utils/function.js')
const { qiwi, notifications: { img } } = require('./config.js')
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const start = async () => {
    console.log('Запуск')
    await loadTokens();
	
    if(Object.keys(qiwiCache).length > 0) {
		
        setInterval(async() => {
			
            for(const i of Object.keys(qiwiCache)) {
                const qiwiInfo = qiwiCache[i];
				
				if(qiwi.check.balance) {
					try {
                        const balance = await getBalance(qiwiInfo.token);
						
                        if(balance > qiwiInfo.balance) {
                            qiwiInfo.balance = balance;
							
                            sendNotification({
								icon: img.balance,
                                title: 'Проверка баланса.',
                                message: [
                                    `Номер: ${qiwiInfo.phone}`,
                                    `Баланс кошелька: ${balance}`
								].join('\n')
							})
						}
						
                        if(qiwi.autoWithdrawal.status) {
							
                            if(balance > qiwi.autoWithdrawal.balanceMore) {
								await sendPayment(qiwiInfo.token, {
                                    amount: Number(balance * 0.97).toFixed(2),
                                    account: `+${qiwi.autoWithdrawal.number}`,
								})

								sendNotification({
									icon: img.transfer,
									title: 'Перевод баланса',
									message: [
										`Номер: ${qiwiInfo.phone}`,
										`Перевод на номер: +${qiwi.autoWithdrawal.number}`,
										`Cумма перевода: ${Number(balance * 0.97).toFixed(2)}`
									].join('\n')
								})
							}
							
						}
						
					}
					
                    catch(e) {
                        console.log('Ошибка связана с балансом или переводом:\n', e)
					}
				}
                
                if(qiwi.check.newPayment.status) {
					try {
						let response = await getOperationHistory(qiwiInfo.token, {
							rows: qiwi.check.newPayment.last,
							operation: 'IN',
							sources: qiwi.check.newPayment.currency
						})
						
						response.map((operation) => {
							const operationTime = new Date(operation.date).getTime();
							
							if(operationTime > qiwiInfo.lastCheck) {
								sendNotification({
									icon: img.newPayment,
									title: 'Новый платеж',
									message: [
										`Номер: ${qiwiInfo.phone}`,
										`Сумма платежа: ${operation.sum.amount}`,
										`Пополнение от: ${operation.account}`,
										`Комментарий: ${operation.comment || 'Без комментария'}`,
										`Время платежа: ${operation.date}`
									].join('\n')
								});
							}
						})
						
						qiwiInfo.lastCheck = new Date().getTime();
					}
					
					catch(e) {
						console.log('Ошибка связана с проверкой новых платежей:\n', e)
					}
				}
			}
			
			saveCache()
		}, qiwi.timeout)
		
	}
	
    else {
        sendNotification({
			icon: img.error,
            title: 'Ошибка!',
            message: 'Все кошельки не совпадают требованиям либо же невалид.\n\nРабота программы завершена'
		});
        await sleep(2000);
		
        process.exit();
	}
}


start();