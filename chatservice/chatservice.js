const redis=require('redis');
const fs = require('fs');

var REDIS_HOST = process.env.REDIS_HOST || '172.23.238.253';
var port = process.env.PORT || '6379';
var REDIS_PORT = process.env.REDIS_PORT || port;


const subscriber=redis.createClient(REDIS_PORT,REDIS_HOST);
const publisher=redis.createClient(REDIS_PORT,REDIS_HOST);

// var subscriber = require('redis').createClient(6379, '172.23.238.253');
// var publisher = require('redis').createClient(6379, '172.23.238.253');


var MsgObj = {};

console.log("Chat Service Running...");

subscriber.subscribe('ChatService2');

subscriber.on('message',function(channel,message){
      var message1 = JSON.parse(message);

      if(message1.message.command === 'generateUUID'){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        var publishMsg ={
          content: uuid, command : 'generateUUID' , details : message1.details
        }
        publisher.publish(message1.message.content,JSON.stringify(publishMsg));
      }

      else if(message1.message.command === 'sendMessage'){
        var publishMsg = {
          content : message1.message.content,
          text : message1.message.text,
          sentBy : message1.message.sentBy,
          command : message1.message.command
        };
        var topicId = message1.message.content;
        publisher.publish(message1.message.content,JSON.stringify(publishMsg));
          var updateMsgObj = {
              text : message1.message.text,
              sentBy : message1.message.sentBy
          };
              if(!MsgObj[topicId]){
                      MsgObj[topicId] = [updateMsgObj];
              }
              else{
                    var arr = MsgObj[topicId];
                      if(arr.length>=4){
                          fs.mkdir('/data/chathistory/'+topicId,function(err,result){
                            if(err){
                                if(err.code === "EEXIST"){
                                  fs.readdir('/data/chathistory/'+topicId,function(err,files){
                                      var fileNumber = files.length;
                                      var file = '/data/chathistory/'+topicId+'/'+topicId+'-'+(fileNumber+1)+'.json';
                                      fs.writeFile(file,JSON.stringify(MsgObj[topicId]),'utf-8',function cb(err,data){
                                          if(err){console.log("Error when writing the file and the error is ",err);}
                                          MsgObj[topicId] = [];
                                          MsgObj[topicId] = [updateMsgObj];
                                      });
                                  });
                                }
                            }
                            else{
                              var file = '/data/chathistory/'+topicId+'/'+topicId+'-1.json';
                              fs.writeFile(file,JSON.stringify(MsgObj[topicId]),'utf-8',function cb(err,data){
                                  if(err){console.log("Error when writing the file and the error is ",err);}
                                  MsgObj[topicId] = [];
                                  MsgObj[topicId] = [updateMsgObj];
                              });
                            }
                          });
                      }
                      else{
                        arr.push(updateMsgObj);
                        MsgObj[topicId] = arr;
                      }
                }
              } //end of else if for send and save message


          // To Retrieve History, Send the TopicId
          else if(message1.message.command === 'retrieveHistory'){
            var topicId = message1.message.content;

            //If The TopicId is not there in the Im Memory Object,
            // Check for any files.

            if(!MsgObj[topicId]){
              fs.readdir('/data/chathistory/'+topicId,function(err,files){

                //If there are no files, return history as null

                if(err){
                  var history={
                         'command':'retrieveHistory',
                         'text':null,
                         'content':topicId
                  };
                  publisher.publish(topicId,JSON.stringify(history));
                }

                //If files are present , parse the file and send the history
                else{
                  var fileNumber = files.length;
                  var fileToRead = '/data/chathistory/'+topicId+'/'+topicId+'-'+fileNumber+'.json';
                  fs.readFile(fileToRead,'utf-8',function cb(err,data){
                  if(err){console.log("error while reading the file to retrieve history");}
                  obj = JSON.parse(data);
                  //Parse the data in file, and save it in Obj
                  var arr1 = obj;
                  var history={
                         'command':'retrieveHistory',
                         'text':arr1,
                         'content':topicId
                     }
                  publisher.publish(topicId,JSON.stringify(history));
                });
              }
              });
            }

            //If Topic Id is present in the im memeory MsgObj

            else{
              fs.readdir('/data/chathistory/'+topicId,function(err,files){

                //Read the directory for any files

                if(err){
                //If the directory is not present,
                //Then send back the data which is in in memory MsgObj
                  var msgarr =[];
                  var history={
                         'command':'retrieveHistory',
                         'text':MsgObj[topicId],
                         'content':topicId
                  };
                  publisher.publish(topicId,JSON.stringify(history));
                }

                //If Directory is present, then read the files and Append the Local
                //in memory MsgObj and send the History back
                else{
                var fileNumber = files.length;
                var fileToRead = '/data/chathistory/'+topicId+'/'+topicId+'-'+fileNumber+'.json';
                fs.readFile(fileToRead,'utf-8',function cb(err,data){
                  if(err){console.log("error while reading the file to retrieve history");}
                  obj = JSON.parse(data);
                  var arr = MsgObj[topicId];
                  var arr1 = arr.concat(obj);
                  var history={
                         'command':'retrieveHistory',
                         'text':arr1,
                         'content':topicId
                     }
                  publisher.publish(topicId,JSON.stringify(history));
                });
              }
              });

            }
          }
});


// MsgObj[topicId].count = MsgObj[topicId].count+1;
// var temp = MsgObj[topicId].count ;
// console.log("Before Reseting the MsgObj, the count is",MsgObj[topicId].count);
// MsgObj[topicId] ={};
// console.log("After Reseting the MsgObj, the count is",MsgObj[topicId].count);
// console.log("After Reseting the MsgObj, the count is",temp);
// MsgObj[topicId] = {count: temp};
// MsgObj[topicId][MsgObj[topicId].count] = updateMsgObj;
// console.log("====After Writing into file, the update MsgObj specific to topicid is",MsgObj[topicId]);
// console.log("=====After Writing into file, MsgObj is ",MsgObj);
// for(key in MsgObj[topicId]){
//   console.log("Message inside loop is,",MsgObj[topicId][key]);
//   var temp = {};
//   temp[key] = MsgObj[topicId][key];
//   msgarr.push(temp);
// }
// console.log("msgarr to be sentr is ",msgarr);
// console.log("The current Msg Obj to be given back as history is Array",[MsgObj[topicId]]);


// for(key in MsgObj[topicId]){
//   console.log("Message inside loop is,",MsgObj[topicId][key]);
//   var temp = {};
//   temp[key] = MsgObj[topicId][key];
//   msgarr.push(temp);
// }
// console.log("msgarr to be sentr is ",msgarr);
// console.log("The current Msg Obj to be given back as history is Array",[MsgObj[topicId]]);

// console.log("Length of array for the topic id "+topicId+" is "+arr.length);
// var arrayLength = arr.length;
// if(arrayLength>=4){
//   fs.mkdir('/data/chathistory/'+topicId,function(err,result){
//   console.log("Inside loop for creating directory");
//     if(err){
//       console.log("Inside loop for creating directory and ther is an error logging the error",err);
//       console.log("Inside loop for creating directory and ther is an error");
//         if(err.code === "EEXIST"){
//           console.log("History folder already Exist");
//           fs.readdir('/data/chathistory/'+topicId,function(err,files){
//               console.log("Inside Read File directory, retrieved number of files are,==",files);
//               console.log("Inside Read File directory, retrieved number of files length is,==",files.length);
//               var fileNumber = files.length;
//               var file = '/data/chathistory/'+topicId+'/'+topicId+'-'+(fileNumber+1)+'.json';
//               console.log("Inside loop for creating directory the new file to be written in old folder is ",file);
//               fs.writeFile(file,JSON.stringify(MsgObj),'utf-8',function cb(err,data){
//                   if(err){console.log("Error when writing the file and the error is ",err);}
//                   MsgObj[topicId] = [];
//                   MsgObj[topicId] = [updateMsgObj];
//               });
//           });
//         }
//     }
//     else{
//       console.log("Inside loop for creating directory and ther is no folder existing ,so folder created");
//       var file = '/data/chathistory/'+topicId+'/'+topicId+'-1.json';
//       console.log("Inside loop for creating directory the new file to be written in new folder is ",file);
//       fs.writeFile(file,JSON.stringify(MsgObj),'utf-8',function cb(err,data){
//           if(err){console.log("Error when writing the file and the error is ",err);}
//           MsgObj[topicId] = [];
//           MsgObj[topicId] = [updateMsgObj];
//           console.log("The New Message Object updated is ",MsgObj);
//       });
//     }
//   });
// }
//   else{
//     arr.unshift(updateMsgObj);
//     MsgObj[topicId] =arr;
//     console.log("inside save and update history, the MsgObj now is===",MsgObj);
// }
