var https = require('https');
var _ = require('underscore')._;
var exec = require('child_process').exec;
var request = require('request');

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

