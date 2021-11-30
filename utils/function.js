const { readFileSync, writeFileSync } = require('fs');
const notifier = require('node-notifier');
const { Qiwi } = require('node-qiwi-promise-api');

const { notifications } = require('../config.js');
const qiwiCache = require('./qiwi.json')

function sendNotification(params = {}) {
    if(!params) return;

    return notifier.notify({
        ...params,
        // title: notifications.title,
        // message: message,
        // icon: `./img/${notifications.img}`
    })
}

async function loadTokens() {
    const tokens = readFileSync('./qiwiTokens.txt').toString();

    for(const token of tokens.split('\r\n')) { // мне похуй что for (в след версии мб по другому сделаю)
        try {
            const qiwi = new Qiwi(token);
            const { authInfo: { personId: phone } } = await qiwi.getAccountInfo();

            qiwiCache[token] = {
                token,
                phone,
                balance: 0,
                lastCheck: 0,
            };
        }

        catch(err) {
            console.log(`Токен: ${token} || Невалид (Либо же не все права)`)
        }
    }

    saveCache();
}

async function getBalance(token) {
    const qiwi = new Qiwi(token);
    
    return (await qiwi.getBalance()).accounts[0].balance.amount;
}

async function getOperationHistory(token, options = {}) {
    const qiwi = new Qiwi(token);

    return (await qiwi.getOperationHistory(options)).data;
}

async function sendPayment(token, options = {}) {
    const qiwi = new Qiwi(token);

    return await qiwi.toWallet(options)
}

function saveCache() {
    writeFileSync('./utils/qiwi.json', JSON.stringify(qiwiCache, null, 2))
}

module.exports = {
    sendNotification, loadTokens, saveCache,
    sendPayment, getBalance, getOperationHistory, qiwiCache
}