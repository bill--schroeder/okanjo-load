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


var api = new okanjo.Client(config.api);

api.userLogin().data(config.user).execute(function(err, res) {
    if (err) { console.error(err); return; }

    if (res.status == okanjo.Response.Status.OK) {

        // Use this user context with further API calls
        api.userToken = res.data.user_token;

        // get all products for this store
        //TODO - build this url dynamically, possibly config driven
        request.get(config.productData.deleteAllRoute,
        function(err, result, data) {
            if(result && result.body) {
                var body = JSON.parse(result.body);
                _.each(body, function(product){

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