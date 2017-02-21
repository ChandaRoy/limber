var request = require("request");
var fs=require("fs");

var uploadFileDir = __dirname + "/../public/uploadfile/";

exports = module.exports = function(storyId, fileName, callback) {

var options = {
  url: 'https://content.dropboxapi.com/2/files/upload',
  headers:
   { 'postman-token': '63ac1330-3995-d590-c761-48d08012d12c',
     'cache-control': 'no-cache',
     'content-type': 'application/octet-stream',
     'dropbox-api-arg': '{"path": "/'+storyId+'/'+fileName+'","mode": "add","autorename": true,"mute": false}',
     authorization: 'Bearer zCbu9rkoaOAAAAAAAAAAI_XXBOj1Xkq8b8iXGBbq6VRnpb1WopvPw18EN-LpEive' } };

/*request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});*/

var source = fs.createReadStream(uploadFileDir + storyId + '/' + fileName);
source.pipe(request.post(options, function(error, response, body) {
  if (error) return callback(error);
  callback(null);
}));
}

/*f('5784d20405dc2c9f277f9179','upload_66a568018a34ed2faf6e0a41722a341d.js');*/
