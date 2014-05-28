
var okanjo = require('okanjo');

module.exports = exports = {
    api: {
        key: 'YOUR_API_KEY',
        passPhrase: 'YOUR_API_PASSPHRASE',
        endpoint: 'sandbox-api.okanjo.com'
    },
    user: {
        action: okanjo.constants.loginAction.loginUsernamePassword,
        username: 'STORE_USER_NAME',
        password: 'STORE_USER_PASSWORD'
    }
};