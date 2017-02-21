
// module.exports=function(socket,io){
//
//   io.on('connection', function(socket) {
//     const redis=require('redis');
//     const publisher=redis.createClient(6379,'172.23.238.253');
//     socket.on('room',function(userId){
//       var middleWare=function(socket,userId){
//         var self=this;
//         self.userId=userId;
//         socket.on('chat',function(data){
//           publisher.publish(data.channel,data.message);
//         })
//       }
//     })
//   });
//
// }
