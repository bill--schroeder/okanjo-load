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
      storeId: 5173,
      causeId: 35862,
      sourceFile: "data/SSI Product File - Office - 20140619 1 row.csv",
      deleteAllRoute: "https://sandbox-api.okanjo.com/products?key=TEST-AKEfqKSWps6QpDLVuZChWim3&store_id=5170&page_size=900&signature=1506bd11cab07eb1b2c1907c24508646c600ddbb72b17285bd871812d0c9b687"
    }
};
