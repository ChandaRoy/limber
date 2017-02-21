var mongoose = require('mongoose'),
 templateSchema = new mongoose.Schema({
     docType:String,
    //  projectId:{
    //    type: Schema.ObjectId,
    //    ref: 'Project'
    //  }
     labelList:[{
       _id: mongoose.Schema.Types.ObjectId,
       text: String,
       colorCode: String,
       colorName:String
     }]

 });
templateSchema.statics.findMasterTemplate = function(docType, callback) {
  this.findOne({"docType":docType})
  .exec(function(err,doc){
    if (err) {
      callback(err, null);
    }
    else {
      callback(null, doc);
    }
   });
}
templateSchema.statics.findTemplate = function(projId, callback) {
  this.findOne({"_id":projId})
  .exec(function(err,doc){
    if (err) {
      callback(err, null);
    }
    else {
      callback(null, doc);
    }
   });
}

 templateSchema.statics.feedTemplate = function(templateObj, callback) {
    this.create({
      'docType':'General',
      'projectId':templateObj.projectId
     },
     function(err, doc) {
       if (err) {
         callback(err, null);
       } else {
        //  callback(null, doc);
        templateObj.labelList.forEach(function(label) {
          label._id = mongoose.Types.ObjectId();
          doc.labelList.push(label);
        });
        doc.save(function(err,documents) {
          console.log("Got Document",documents);
          callback(null,documents);
        })
       }
     });
 };

 templateSchema.statics.addNewLabel= function(labelId,labelObj, callback) {
//check if u need to add id manually
   this.update(
     { "_id" : labelId},
     { $push: {labelList:{
       _id:mongoose.Types.ObjectId(),
       text:labelObj['text'],
       colorCode: labelObj['colorCode'],
       colorName:labelObj['colorName']
     }
   }
 },
 {
   upsert: true
 }
 )
 .exec(function(err , doc) {
   if (err) {
     console.log(err);
     callback(err, null);
   }
   else {
     console.log(doc);
     callback(null, doc);
   }
 });
 }

 Template = mongoose.model('Template', templateSchema, "Templates");

module.exports = Template;
