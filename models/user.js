var Project = require('../models/project.js');
var templates = require('../models/template.js');

var mongoose = require('mongoose'),
userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  createdDate: Date,
  updatedDate: Date,
  password: String,
  email: String,
  initials: String,
  photo: String,
  status:String,
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  github:{
    id:String,
    token: String,

    name: String
  },
  assignedStories: [{
    projectId:String,

    releaseId:String,

    sprintId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Sprint'
    },

    stories:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Story'
    }

  }]
});

userSchema.statics.addUser = function(userDetails, callback) {
  this.create({
    firstName: userDetails.firstName,
    lastName: userDetails.lastName,
    createdDate: (userDetails.createdDate) ? (userDetails.createdDate) : Date.now(),
    updatedDate: Date.now(),
    password: userDetails.password,
    email: userDetails.email,
    initials: userDetails.firstName.charAt(0) + userDetails.lastName.charAt(0),
    imageUrl: userDetails.imageUrl,
    projects: userDetails.projects == undefined ? [] : userDetails.projects
  }, function(err, data) {
    if (err) callback(err)
    else callback(data);
  });
}

userSchema.statics.findAll=function(memberList,callback)
{
  this.find(
    {
      "_id":{$in:memberList}
    },{
      "github":1
    }).exec(function(err,data)
    {
      if(!err)
      callback(null,data);
    })
  }

  userSchema.statics.updateUser = function(userId, newUserDetails, callback) {
    this.findOneAndUpdate({
      "_id": userId
    }, {
      $set: {
        firstName: newUserDetails.firstName,
        lastName: newUserDetails.lastName,
        email: newUserDetails.email
      }
    }, {
      upsert: true
    })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
  }
  userSchema.statics.addProjectToUser = function(userID, projectID, callback) {
    this.findByIdAndUpdate(userID, {
      $addToSet: {
        'projects': projectID
      },
      $set: {
        'updatedDate': Date.now()
      }
    }, {
      new: true
    }, function(err, data) {
      if (err) callback(err, null)
      else {
        //To send back added project data
        Project.find({
          "_id": projectID
        }).populate("release").exec(function(err, data) {
          if (err)
          callback(err, null);
          else {
            callback(null, data);
          }
        })
      };
    })
  }

  userSchema.statics.removeProjectfromUser = function(userID, projectID, callback) {
    this.findByIdAndUpdate(userID, {
      $pull: {
        'projects': projectID
      },
      $set: {
        'updatedDate': Date.now()
      }
    }, {
      new: true
    }, function(err, data) {
      if (err) callback(err)
      else callback(data);
    })
  }

  userSchema.statics.getPassword = function(email, callback) {
    return this.find({
      'email': email
    }).exec(function(err, data) {
      if (err) callback(err)
      else callback(data);
    });
  }

  userSchema.statics.getUserId = function(email, callback) {
    return this.find({
      'email': email
    }).exec(function(err, data) {
      if (err) callback(err, null);
      else callback(null, data);
    });
  }
  userSchema.statics.getGithubDetails = function(email, callback) {
    return this.find({
      'email': email
    }).exec(function(err, data) {
      if (err) callback(err, null);
      else callback(null, data);
    });
  }
  userSchema.statics.getUserEmail = function(email, callback) {
    return this.find({
      'email': RegExp(email)
    }).exec(function(err, data) {
      if (err) callback(err, null);
      else callback(null, data);
    });
  }

  userSchema.statics.getProjects = function(userID, callback) {
    this.findById(userID).populate({path:"projects",populate:{path:"labelId"}}).exec(function(err, data) {
      if (err) callback(err)
      else callback(data);
    });
  }



userSchema.statics.getCards = function(UserId, callback) {
 return  this.find({
   "_id": UserId
 }).populate("assignedStories.stories")
.populate("assignedStories.sprintId"," name startDate endDate")
.exec(function(err, data) {
   if (err) callback(err)
   else callback(data);
 });


  }


  userSchema.statics.addAssignedStories = function(dataObj, callback) {
    this.findByIdAndUpdate(dataObj.memberid, {

      $push:{'assignedStories':{
        projectId:dataObj.projectID,
        releaseId:dataObj.releaseId,
        sprintId:dataObj.sprintId,
        stories:dataObj.storyid
      }}},
      {
        safe: true, upsert: true
      }, function(err, data) {
        if (err) callback(err, null)
        else {

          //To send back added project data
          mongoose.model("User").find({
            "_id": dataObj.memberid
          }).populate("assignedStories.stories").exec(function(err, data) {
            if (err){
              console.log(err);
              callback(err, null);}
              else {
                console.log(data);
                callback(null, data);
              }
            })
          };
        })
      }

      userSchema.statics.removeAssignedStories = function(userID, storyID, callback) {
        this.findByIdAndUpdate(userID, {
          $pull:
          {'assignedStories':{'stories':storyID}},

        }, {
          new: true
        }, function(err, data) {
          if (err) callback(err,null)
          else callback(null,data);
        })
      }

      userSchema.statics.getUserMember = function(UserId, callback) {
        return  this.findById(UserId).exec(function(err, data) {
          if (err) callback(err,null)
          else callback(null,data);
        });
      }

      userSchema.statics.getOwnerToken = function(name, callback)
      {
        this.find(
          {
            "github.name":name
          },{
            "github.token":1
          }
        ).
        exec(function(err,data)
        {
          if(!err)
          {
            callback(null,data);
          }
        })
      }
      userSchema.statics.setStatus=function(data,callback){
        this.findOneAndUpdate(
          {
            "_id":data.user
          },
          {
            $set:
            {
              "status":data.status
            }
          },{
            upsert: true
          })
          .exec(function(err, doc) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else {
              callback(null, doc);
            }
          });
        }

        module.exports = mongoose.model('User', userSchema, 'Users');
