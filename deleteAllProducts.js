var okanjo = require('okanjo'),
    async = require('async'),
    config = require('./config'),
    // Upload dependencies
    path = require('path'),
    mime = require('mime'),
    // Upload via URL dependencies
    url = require('url'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    sanitize = require('sanitize-filename'),
    crypto = require('crypto'),
    request = require('request'),
    _ = require('underscore')._,
    csv = require('fast-csv');

// grab any command line parameters
var argv = require('minimist')(process.argv.slice(2));
console.log('command-line parameters: ', argv);


var api = new okanjo.Client(config.api);

/**
 * Stores the default store id of the logged-in user
 * @type {number}
 * valid cli:  --store or -s
 */
var global_store_id = (argv.store ? argv.store : (argv.s ? argv.s : (config.productData.storeId ? config.productData.storeId : res.data.user.stores[0].id)));


function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

api.userLogin().data(config.user).execute(function(err, res) {
    if (err) { console.error(err); return; }

    if (res.status == okanjo.Response.Status.OK) {

        // Use this user context with further API calls
        api.userToken = res.data.user_token;

        console.log('delete products for store: ', global_store_id);

        var url = config.productData.deleteAllRoute;
        url = updateQueryStringParameter(url, "store_id", global_store_id);
        console.log('url: ' + url);

        // get all products for this store
        request.get(url,
        function(err, result, data) {
            if(result && result.body) {
                var body = JSON.parse(result.body);
                _.each(body, function(product){
                    //console.log("product: " + JSON.stringify(product));
                    
                    var p = {
                        status: 7
                    };
                    api.putProductById(product.id).data(p).execute(function(err, res) {
                        if (err) { console.log("err=" + JSON.stringify(err)); return; }

                        if (res.status == okanjo.Response.Status.OK) {
                            console.log('Delete issued for product ' + product.id );
                            //callback && callback(null, res.data);
                        } else {
                            console.error('Failed to post product. Response:', res);
                            //callback && callback(error);
                        }
                    });
                });
            } else {
                console.log("Unable to get products");
            }
            
        });

        // api.getProducts().where({store_id: 5170}).take(1000).execute(function(err, result) {
        //     console.log(err);
        //     console.log(result);
        //     if(result && result.data) {
        //         _.each(result.data, function(product){

        //             var p = {
        //                 status: 7
        //             };
        //             api.putProductById(product.id).data(p).execute(function(err, res) {
        //                 if (err) { callback && callback(err); return; }

        //                 if (res.status == okanjo.Response.Status.OK) {
        //                     console.log('Delete issued for product ' + product.id );
        //                     //callback && callback(null, res.data);
        //                 } else {
        //                     console.error('Failed to post product. Response:', res);
        //                     //callback && callback(error);
        //                 }
        //             });
        //         });
        //     } else {
        //         console.log("Unable to get products");
        //     }
            
        // });
        

    } else {
        console.error('Failed to login', res);
    }
});