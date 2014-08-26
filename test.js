var https = require('https');
var _ = require('underscore')._;
var exec = require('child_process').exec;
var request = require('request');
var okanjo = require('okanjo'),
    async = require('async'),
    config = require('./config')

// grab any command line parameters
var argv = require('minimist')(process.argv.slice(2));

// print command line parameter
console.log('command-line parameters: ', argv);
var global_store_id = (argv.store ? argv.store : (argv.s ? argv.s : 0));
console.log('global_store_id: ', global_store_id);

/*
process.argv.slice(2).forEach(function(val, index, array) {
  console.log(index + ': ' + val);
});
*/


/*
var images = [
  'https://store.schoolspecialty.com/OA_HTML/ibcGetAttachment.jsp?cItemId=751558&encrypt=.jpg',
  'https://store.schoolspecialty.com/OA_HTML/ibcGetAttachment.jsp?cItemId=763339&encrypt=.jpg',
  'https://store.schoolspecialty.com/OA_HTML/ibcGetAttachment.jsp?cItemId=758135&encrypt=.jpg',
  'https://store.schoolspecialty.com/OA_HTML/ibcGetAttachment.jsp?cItemId=771687&encrypt=.jpg',
  'https://store.schoolspecialty.com/OA_HTML/ibcGetAttachment.jsp?cItemId=763597&encrypt=.jpg'
];

_.each(images, function(image, idx){
  request({
    uri: image
  }, function(error, msg, res){
    console.log(msg);
  });
  // var child;
  // child = exec('wget ' + image,
  // function (error, stdout, stderr) {
  //   console.log('stdout: ' + stdout);
  //   console.log('stderr: ' + stderr);
  //   if (error !== null) {
  //     console.log('exec error: ' + error);
  //   }
  // });
  // https.get(image, function(res){

  //   console.log(res.statusCode);
  // });
})
*/

var api = new okanjo.Client(config.api);


api.userLogin().data(config.user).execute(function(err, res) {
    if (err) { console.error(err); return; }

    if (res.status == okanjo.Response.Status.OK) {

api.on('log', function(level, message, args) {
    // You can filter out lower-level log events that you don't want to see
    // See okanjo.Client.LogLevel for options
    //if (level.level >= okanjo.Client.LogLevel.Debug) {
        console.log('[' + (new Date()) + '] ' + level.name + ': ' + message, args);
    //}
});

      // Use this user context with further API calls
      api.userToken = res.data.user_token;
      //console.log("call api.userToken: " + api.userToken);


      var store_Id = "5173";  
      var Id = "127795";  
      var SKU = "000069"; 
      var category = "Accessories"; 
      var p = {
          status: 1
      };

      //var timer = setInterval(function() {
        //api.getProductById(Id).execute(function(err, response) {
        //api.getProducts().where({ available: 1, type: 1 }).take(5).execute(function(err, response) {
        api.getProducts().where({store_id: store_Id}).take(1000).execute(function(err, response) {        
        //api.getProducts().where({ store_id: store_Id, meta: { SKU: SKU } }).take(1).execute(function(err, response) {        
        //api.getProducts().where({ store_id: store_Id, 'meta.SKU': SKU }).take(1).execute(function(err, response) {        
        //api.getCategories().where({ name: category, depth: "2" }).take(1).execute(function(err, response) {        
        //api.putProductById(SKU).data(p).execute(function(err, response) {

            if (err) { console.log("err=" + JSON.stringify(err)); return; }

            if (response.status == okanjo.Response.Status.OK && response.data && response.data.length > 0) {
              // Take a look at the okanjo.Response object
              console.log('success!  ' + response.data.length + " documents found");
              //console.log(response);

              if(response.data.length < 11){
                // Show the data
                for(var i in response.data) {
                    var p = response.data[i];
                    console.log("id: " + p.id + " | " + (p.name || p.title));
                }
              }

            } else {
                console.error('Failed to get product. Response:', response);
            }

            //clearInterval(timer);
        });
      //}, 15000);


    } else {
        console.error('Failed to login', res);
    }
});
