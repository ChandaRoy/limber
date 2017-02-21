var Personal=require('../models/personal.js');
var Project=require('../models/project.js')
var Group=require('../models/group.js');
//var io=require('./io.js')
//console.log("io", io);
var Group=require('../models/group.js');
exports = module.exports = function(socket,io) {
  var self = this;


  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };



  self.setUser = function(user,io) {
    self.io=io;
    self.user = user;
    var subscriber = require('redis').createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '127.0.0.1');
    var publisher = require('redis').createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '127.0.0.1');

    publisher.on('publish', function() {
    });

    //subscribing all  channels
    socket.on('sub',function(data){
      subscriber.subscribe(data);
    })

    //generating uuid
    socket.on('subscribe', function(data) {
      var randomTopic=generateUUID();
      data.message.content=randomTopic;
      subscriber.subscribe(data.message.content);
      publisher.publish('ChatService1',JSON.stringify(data));
    });

    //sending message
    socket.on('chatMsg',function(data){
      subscriber.subscribe(data.message.content);
      publisher.publish('ChatService1',JSON.stringify(data));
    })

    //retrieving history
    socket.on('history',function(data){

      subscriber.subscribe(data.message.content);
      publisher.publish('ChatService1',JSON.stringify(data));
    })

    subscriber.on('message', function(channel, message){
      // console.log("subscribed to :",channel);
      var message1=JSON.parse(message);


      if(message1.command==='generateUUID'){
        //save to db
        if(message1.details.userId!==undefined)
        {
          var members=[message1.details.userId,message1.details.member];

          Personal.create({
            subject: members,
            relation: 'chatOver',
            object:message1.content,
            projectId:message1.details.projectId
          }, function(err, data) {
            if(err){

            }
            else{

            }
          });
        }
        else if(message1.details.projectId){
          Project.addChannel(message1.content,message1.details.projectId,function(err,doc){
            if(!err){
              Project.findOneProject(message1.details.projectId,function(err,project){
                if(!err){
                  var group=new Group();
                  group.channelId= message1.content;
                  group.members=project.memberList;
                  group.groupName="#general";

                  group.projectId=message1.details.projectId;

                  group.save(function(err,groupDoc){
                    if(!err){

                    }
                  })
                }
              })
            }

          })


        }
      }

      if(message1.command==='sendMessage'){

        if(message1.details && message1.details.prj){
          Personal.getChannelMembers(message1.content,function(err,doc){
            if(!err) {
            var sentToId;
            for(i=0;i<doc.subject;i++)
            {
              if(doc.subject[i]!==message1.sentBy.userId)
              sentToId=doc.subject[i];
            }
            var newMsg={
              projectId:doc.projectId,
              sentToId:sentToId
            }
            io.to(message1.details.projectId).emit('chat:newMessage', newMsg);
          }
        })



      }
      else
      socket.emit('room:chatMessages',message1);
    }
    if(message1.command==='retrieveHistory'){

      socket.emit('room:chatMessages',message1);
    }


  })
}
}
