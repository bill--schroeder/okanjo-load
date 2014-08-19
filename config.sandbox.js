var okanjo = require('okanjo');

module.exports = exports = {
    api: {
        key: 'TEST-AKEfqKSWps6QpDLVuZChWim3',
        passPhrase: 'AP4oqV2auqwNa7g2jBGSC3CoEhoKqUPsj1OJN1GtivoNju2sc7',
        endpoint: 'sandbox-api.okanjo.com'
    },
    user: {
        action: okanjo.constants.loginAction.loginUsernamePassword,
        username: 'huterratestuser',
        password: 'Hut3rra!Admin'
    },
    productData: {
      storeId: 5170,
      causeId: null,
      sourceFile: "data/SSI Product File - 20140818.csv",
      deleteAllRoute: "https://sandbox-api.okanjo.com/products?key=TEST-AKEfqKSWps6QpDLVuZChWim3&store_id=5170&page_size=900&signature=1506bd11cab07eb1b2c1907c24508646c600ddbb72b17285bd871812d0c9b687"
      //deleteAllRoute: "https://sandbox-api.okanjo.com/products?key=TEST-AKEfqKSWps6QpDLVuZChWim3&store_id=5173&page_size=900&signature=3f45bf76f92e282b18e4e6074dbb153973f73a940a5f4a57961fee59f063c890"
    }
};
