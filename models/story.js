/***
Copyrights: StackRoute and Wipro Digital

Author:Sharan, Shrinivas and Soumitra
Date: 21-March-2016

Mongoose is used to define the schema and static operatoins are
written so that it can be reffered from anywhere of the application.
This model describes the schema for the story on
which below set opertaions will be performed.
Most of the fuctions will be moved to intermediate DB(Redis) and
new set of functions need to be brought in to picturewhich will
be used to sync Redis data with MONGO data.

TODO: Need to update few functions w.r.t the intermediate
database which is planned to be implemented.

1. Post to this implementation,we need to update functions
related to attachments(place where we will be storing the files physically)
2. During the implementation of first point please make sure that
we are creating seperate folders for each project and subfolders for each story.
Through this we will not end up in missing\overriding any attachment.
3. Once intermediate DB come into picture, please analyze functions again
and see where are set operation is applicable.
4.Code need to be done w.r.t to the indicators getting updated based
on each operation.This will applied post implementation of intermediate DB.
5. Bring the Concept of Story number for each story whichwill be
further useful like tagging the story with an # and much more.


Note: There is a slight change in the schema, all the indicators
required to be showcased in list for each story as been merged together under
"indicator section". Recheck if any changes need to be applide
where ever populate is done.
***/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StorySchema = new Schema({
  storyCreatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  listId: String,
  heading: String,
  description: String,
  createdTimeStamp: Date,
  lastUpdated: Date,
  indicators: {
    descriptionStatus: Boolean,
    chklstItmsCnt: Number,
    chklstItmsChkdCnt: Number,
    attachmentsCount: Number,
    commentCount: Number
  },
  attachmentList: [{
    fileName: String,
    timeStamp: Date,
    attachmentType: String,
    addedByUserName: String,
    addedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    path: String
  }],
  checklist: [{
    checklistHeading: String,
    checkedCount: Number,
    items: [{
      text: String,
      checked: Boolean,
      assignedMember:[{ type: Schema.Types.ObjectId,
        ref: 'User'}],
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        creationDate: Date,
        dueDate: Date,
        creatorName: String
      }]
    }],
    comments: [{
      text: String,
      commentedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: String,
      commentedData: Date
    }],
    memberList: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    projectFiles:[{
          fileName:String,
          uploadedBy:{type: Schema.Types.ObjectId, ref: 'User'},
          timeStamp:Date,
          description:String,
          fileStatus:String
        }],
    labelList: [String],
    githubSync: {type: Schema.Types.ObjectId,ref: 'GithubRepo'},
    projectId: {type: Schema.Types.ObjectId,ref: 'Project'},
    issueNumber: String,
    pendingMemberFromGithub: [String],
    pendingMemberToGithub: [{
      type: Schema.Types.ObjectId,
      ref: 'User'}],
    issueCreatorId:String,
    issueAssigneeList:[String]
  });
  //Code merge by sharan Starts:
  /***this function is to fetch the story details from the collection
  based on the storyID passed***/
  StorySchema.statics.findStory = function(storyId, callback) {

    this.findOne({
      "_id": storyId
    })
    .populate('memberList', 'firstName lastName')
    .populate("checklist.items.assignedMember")
    .exec(function(err, doc) {
      if (err) {
        //console.log("err"+err);
        callback(err, null);
      } else {
        //console.log("doc"+doc);
        //console.log(JSON.stringify(doc));
        callback(null, doc);
      }
    });
  }

  //neo
  //   StorySchema.statics.addRemoveMembersList=function(checklistItem)
  // {
  //   }

  //   );
  // }
  /*** addMembers function is used to assign the members to
  the story from the project members list.**/
  StorySchema.statics.addMembers = function(storyId, membersId, callback) {

    //Find was written only for reference
    //  this.findOne({"_id":storyId}).exec(function(err,doc){ console.log(doc);});

    this.findOneAndUpdate({
      "_id": storyId
    },{
      $addToSet: {
        memberList: membersId
      }
    }, {
      upsert: true,
      new: true
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
  }

  /*** addLabel function is used to assign the label to
  the story from the project label list.**/
  StorySchema.statics.addLabel = function(storyId,labelId, callback) {
    this.findOneAndUpdate(
      { "_id" : storyId },
      { $push: { labelList : labelId
      }
    },
    {
      upsert: true,
      new:true
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

StorySchema.statics.convertToStory=function(story,callback)
{
  this.create({
    'listId': story.listId,

    'storyCreatorId': story.storyCreatorId,
    'storyStatus': story.storyStatus,
    'heading': story.heading,
    'description': story.description,
    'createdTimeStamp': Date.now(),
    'lastUpdated': Date.now(),
    'indicators': {
      'descriptionStatus': false,
      "chklstItmsCnt": 0,
      "chklstItmsChkdCnt": 0,
      'attachmentsCount': 0,
      'commentCount': 0
    },
    'attachmentList': [],
    'checklist': [],
    'memberList': story.memberList,
    'labelList': [],
    'projectId':story.projectId,
    'issueNumber':story.issueNumber,
    'githubSync':story.githubSync,
    'issueCreatorId':story.issueCreatorId,
    'issueAssigneeList':story.issueAssigneeList
  },
  function(err, doc) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, doc);
    }
  });
}

StorySchema.statics.addStory = function(story, callback) {
  this.create({
    'listId': story.listId,

    'storyCreatorId': story.storyCreatorId,
    'storyStatus': story.storyStatus,
    'heading': story.heading,
    'description': story.description,
    'createdTimeStamp': Date.now(),
    'lastUpdated': Date.now(),
    'indicators': {
      'descriptionStatus': false,
      "chklstItmsCnt": 0,
      "chklstItmsChkdCnt": 0,
      'attachmentsCount': 0,
      'commentCount': 0
    },
    'attachmentList': [],
    'checklist': [],
    'memberList': [],
    'labelList': [],
    'projectId':story.projectId,
    'issueNumber':story.issueNumber,
    'githubSync':story.githubSync,
    'issueCreatorId':story.issueCreatorId,
    'issueAssigneeList':story.issueAssigneeList
  },
  function(err, doc) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, doc);
    }
  });
};

/*** removeMembers function is used to remove the members from
the story.**/
//modifying removing member
StorySchema.statics.removeMembers = function(storyId, memberId, callback)
{
  this.findOne({
    "_id": storyId
  })
  .exec(function(err, story) {
    story.memberList.splice(story.memberList.indexOf(memberId),1);
    story.checklist.filter(function(checkList)
    {
      checkList.items.filter(function(item)
      {
        if(item.assignedMember.indexOf(memberId)!=-1)
        item.assignedMember.splice(item.assignedMember.indexOf(memberId),1);
      });
    });
    story.save(function(err,doc){
      if(!err){
        Story.findById(doc._id,function(err,storyData){
          if(!err){
            callback(null,storyData);
          }
          else {
            callback(err,null);
          }
        })
      }
      else callback(err,null)
    });

  });
}

/*** removeLabel function is used to remove the labels from
the story.**/
StorySchema.statics.removeLabel = function(storyId,labelId, callback) {
  this.findOneAndUpdate(
    { "_id" : storyId },
    {$pull: {labelList:labelId}},
    {
      upsert: true,
      new:true
    })
    .exec(function(err , doc) {
      if (err) {
        console.log(err);
        callback(err, null);
      }
      else {
        callback(null, doc);
      }
    });

  }
  /*** removeAttachment function is used to remove the the attachment
  (documents\images\etc) details from the story.
  TODO: Need to update the below code w.r.t deletion of files from memory
  where atachments are stored**/
  StorySchema.statics.removeAttachment = function(storyId, attachmentId, callback) {
    this.findByIdAndUpdate({
      "_id": storyId
    },

    {
      $pull: {
        attachmentList: {
          _id: attachmentId
        }
      },
      $inc: {
        "indicators.attachmentsCount": -1
      }
    }, {
      new: true,
      upsert: true
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });

  }

  /*** addAttachments function is used to add the the attachment
  (documents\images\etc) to the story.
  TODO: Need to implement where the attachments will be stored
  in the disk**/
  StorySchema.statics.addAttachments = function(storyId, atachmentObj, callback) {

    this.findByIdAndUpdate({
      "_id": storyId
    }, {
      $push: {
        attachmentList: {
          fileName: atachmentObj['fileName'],
          timeStamp: atachmentObj['timeStamp'],
          attachmentType: atachmentObj['attachmentType'],
          addedByUserName: atachmentObj['addedByUserName'],
          addedByUserId: atachmentObj['addedByUserId'],
          path: atachmentObj['path']
        }
      },
      $inc: {
        "indicators.attachmentsCount": 1
      }
    }, {
      new: true,
      upsert: true
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
  }

  /***
  addChecklistItem function is to add or delete or update particular
  checklist item in each group.
  ***/
  StorySchema.statics.addChecklistItem = function(storyId, checklistGrpId, itemObj, callback) {
    //TODO: write function to delete particular item or check particular item
    this.update({
      "_id": storyId,
      "checklist._id": checklistGrpId
    }, {
      $push: {
        "checklist.$.items": itemObj
      },
      $inc: {
        "indicators.chklstItmsCnt": 1
      }
    }, {

      upsert: true
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);

      }
    });
  }

  ///
  StorySchema.statics.removeItem=function(storyId, checklistGrpId, itemId, checked, callback)
  {
    this.findOne({
      "_id":storyId
    }).exec(function(err,data)
    {
      data.indicators.chklstItmsCnt--;

      data.checklist.filter(function(checkList)
      {
        if(checkList._id==checklistGrpId)
        checkList.items.filter(function(item)
        {
          if(item._id==itemId)
          {
            if(checked)
            {
              data.indicators.chklstItmsChkdCnt=data.indicators.chklstItmsChkdCnt-- < 0 ? 0 : data.indicators.chklstItmsChkdCnt--;
              checkList.checkedCount=checkList.checkedCount-- < 0 ? 0 : checkList.checkedCount--;
            }
          }
        });
      });
      data.save();
    })
  }

  /***
  authors:sharan,srinivas
  function:removeChecklistItem
  description: RemoveChecklistItem function is to delete particular checklist item in each group.
  ***/
  StorySchema.statics.removeChecklistItem = function(storyId, checklistGrpId, itemId, checked, callback) {
    var setIndicators = {};
    if (checked) {
      setIndicators["indicators.chklstItmsCnt"] = -1;
      setIndicators["indicators.chklstItmsChkdCnt"] = -1;
      setIndicators["checklist.$.checkedCount"] = -1;
    } else {
      setIndicators["indicators.chklstItmsCnt"] = -1;
    }

    this.update({
      "_id": storyId,
      "checklist._id": checklistGrpId
    }, {
      $pull: {
        "checklist.$.items": {
          "_id": itemId
        }
      },
      $inc: setIndicators
    }, {
      upsert: true
    })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        console.log(doc);
        callback(null, doc);
      }
    });
  }

  /***
  author:Gowtham,
  function:getCheckItemIndex
  parameters:checklistItemId
  description:This function returns the index of the checklistitem
  ***/
  StorySchema.statics.getCheckItemIndex = function(itemId, callback) {
    this.findOne({
      "checklist.items._id": itemId
    }, {
      "checklist.$": 1
    }).exec(function(err, doc) {
      doc.checklist.forEach(function(data) {
        data.items.forEach(function(checkItems, index) {
          if (checkItems.id == itemId) {
            callback(null, index);
          }
        })
      })
    });

  }
  /***
  authors:sharan
  function:updateChecklistItem
  parameters:storyId,checklistGrpId,itemId,item-index
  description: UpdateChecklistItem function is to update particular checklist item in each group.
  ***/
  StorySchema.statics.updateChecklistItem = function(storyId,checklistGrpId,operation,itemId, checked,text,dueDate,callback) {

    this.findOne({
      "_id":storyId
    }).exec(function(err,story)
    {
      story.checklist.filter(function(checklist)
      {
        checklist.items.filter(function(item)
        {
          if(item._id==itemId)
          {
            if(operation=='check')
            {
              if (checked) {
                story.indicators.chklstItmsChkdCnt++;
                checklist.checkedCount++;
              } else {
                story.indicators.chklstItmsChkdCnt--;
                checklist.checkedCount--;
              }
            }
            item.text=text;
            item.dueDate=dueDate;
            item.checked=checked;
          }
        })
      })
      story.save(function(err,doc){
        if(!err){
          Story.findStory(doc._id,function(err,storyData){
            if(!err){
              callback(null,storyData);
            }
            else {
              callback(err,null);
            }
          })
        }
        else callback(err,null)
      });
    })
  }






StorySchema.statics.addMemberToChecklist=function(data,callback)
{
//console.log("im in story model -->",data);


this.findOne({
 "_id": data.storyId
}).exec(function(err, story) {
 story.checklist.filter(function(checkList)
 {
   if(checkList._id==data.checkListId)
     checkList.items.filter(function(item)
     {
       if(item._id==data.listItem._id)
       {
         item.assignedMember=data.assignedMember;
       }
     });
 });
 story.save(function(err,doc){
   if(!err){
     Story.findStory(doc._id,function(err,storyData){
       if(!err){
         callback(null,storyData);
       }
       else {
         callback(err,null);
       }
     })
   }
   else callback(err,null)
 });
});
}




  /***
  addChecklistGroup function is to add new checklist group to the story.
  ***/

  StorySchema.statics.addChecklistGroup = function(storyId, checklistObj, callback) {
    this.findOneAndUpdate({
      "_id": storyId
    }, {
      $push: {
        checklist: {
          checklistHeading: checklistObj['checklistHeading'],
          checkedCount: checklistObj['checkedCount'],
          items: checklistObj['items']
        }
      }
    }, {
      upsert: true,
      new: true
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
  }

  /***
  removeChecklistGroup function is to remove checklist group from the story.
  ***/

  StorySchema.statics.removeChecklistGroup = function(storyId, checklistgroupId,checkedCount,itemsLength,callback) {
    //TODO: write function to delete particular item or check particular item
    var setIndicators={};
    setIndicators['indicators.chklstItmsCnt']= -1*itemsLength;
    setIndicators['indicators.chklstItmsChkdCnt']=-1*checkedCount;
    this.update({
      "_id": storyId
    }, {
      $pull: {
        checklist: {
          _id: checklistgroupId
        }
      },
      $inc:setIndicators
    }
  )
  .exec(function(err, doc) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, doc);
    }
  });
}


/***
updateLabelList function is used to Add and Delete a label reference in a story.
***/
StorySchema.statics.updateLabelList = function(storyId, labelListId, operation, callback) {
  switch (operation) {
    case "add":
    this.update({
      "_id": storyId
    }, {
      $push: {
        labelList: labelListId
      }
    }, {
      upsert: true
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
    break;
    case "remove":
    this.update({
      "_id": storyId
    }, {
      $pull: {
        labelList: {
          $in: [labelListId]
        }
      }
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
    break;
  }
}

//Sharan changes Ends
/***
updateLabelList function is used to Delete from the stories collection.
Need to relook into this based on future implementation.
***/

StorySchema.statics.deleteStory = function(storyId, callback) {
  this.remove({
    "_id": storyId
  })
  .exec(function(err, doc) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, doc);
    }
  });
}

StorySchema.statics.saveDescription = function(storyId, Desc, callback) {
  //  console.log("inside save description");
  //  console.log(storyId);
  this.findOne({
    "_id": storyId
  }).exec(function(err, doc) {
    console.log(doc);
  });
  this.findByIdAndUpdate(storyId, {
    $set: {
      description: Desc
    }
  }, function(err, doc) {
    if (err) return callback(err, null);
    //  console.log("response in model"+ doc);
    callback(null, doc);
  });

}

/***
addComment function is to add new comments to the story.
***/

StorySchema.statics.addComment = function(storyId, commentsObj, callback) {
  this.findOneAndUpdate({
    "_id": storyId
  }, {
    $push: {
      "comments": commentsObj

    }
  }, {
    upsert: true,
    new: true
  })
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      console.log(doc);
      callback(null, doc);
    }
  });
}

/***
deleteComment function is to add new comments to the story.
***/

StorySchema.statics.deleteComment = function(storyId, commentId, callback) {

  this.findOneAndUpdate({
    "_id": storyId
  }, {
    $pull: {
      comments: {
        _id: commentId
      }
    }
  }, {
    new: true
  })
  .exec(function(err, doc) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, doc);
    }
  });
}

StorySchema.statics.getStory = function(storyId, callback) {
  this.findOne({"_id":storyId})
  .exec(function(err,doc){
    if (err) {
      callback(err, null);
    }
    else {
      callback(null, doc);
    }
  });

}
// Update ListId on move Story on moveStory
StorySchema.statics.updateList = function(storyId, newListName, callback) {
  this.findByIdAndUpdate(storyId, {
    $set: {
      listId: newListName
    }
  }, function(err, doc) {
    if (err) return callback(err, null);
    //  console.log("response in model"+ doc);
    callback(null, doc);
  });
}
//edited for cards
// StorySchema.statics.getStories = function(StoryIdArr, callback) {
//find stories
// var storyList=[];
// StorySchema.statics.getStories= function(storyIdAdd,callback){
//
//   console.log(storyIdAdd+"in model");
//   return this.find({
//     "_id":{
//       $in: storyIdAdd
//     }
//   })
//   .exec(function(err, doc) {
//     console.log(doc);
//     if (err) {
//       callback(err, null);
//     } else {
//       callback(null, doc);
//     }
//   });





StorySchema.statics.updateGithubSync = function(projectId,userId,repoId,callback) {
  //console.log("inside model find story");
  this.find({
    "projectId": projectId
    // "storyCreatorId":userId
  }).exec(function(err,data)
{
data.filter(function(story)
{
story.githubSync=repoId;
story.save(function(err,cb)
{

})
})

  Story.find({
    "projectId": projectId

    //"storyCreatorId":userId
  }).populate('memberList','github').populate('storyCreatorId','github').exec(function(err,data){
    if(!err){
      callback(null,data)
    }
    else
    callback(err,null)
  })
  //console.log("doc"+doc);
  //callback(null, doc);


})



  //
  // this.update({
  //   "projectId": projectId
  //   // "storyCreatorId":userId
  // },{
  //   $set:{
  //     'githubSync':repoId
  //   }
  // },{
  //   upsert:true
  // })
  // .exec(function(err, doc) {
  //   console.log(doc);
  //   if (err) {
  //     //console.log("err"+err);
  //     callback(err, null);
  //   } else {
  //     Story.find({
  //       "projectId": projectId,
  //       "storyCreatorId":userId
  //     }).populate('memberList','github').populate('storyCreatorId','github').exec(function(err,data){
  //       if(!err){
  //         callback(null,data)
  //       }
  //       else
  //       callback(err,null)
  //     })
  //     //console.log("doc"+doc);
  //     //callback(null, doc);
  //   }
  // });
}
StorySchema.statics.findIssue = function(storyId, callback) {
  //console.log("inside model find story");
  this.findOne({
    "_id": storyId
  })
  .populate('githubSync', 'name owner')
  .populate('memberList','github')
  .exec(function(err, doc) {
    if (err) {
      //console.log("err"+err);
      callback(err, null);
    } else {
      console.log("doc in find issue"+doc);
      callback(null, doc);
    }
  });
}

StorySchema.statics.findConvertedIssues = function(projectId, callback) {
  //console.log("inside model find story");
  this.find({
    "projectId": projectId
  })
  .select({issueNumber:1,_id:0})
  .exec(function(err, doc) {
    if (err) {
      //console.log("err"+err);
      callback(err, null);
    } else {
      //console.log("doc"+doc);
      callback(null, doc);
    }
  });
}

StorySchema.statics.findbyGithubId = function(githubRepoId,issueNumber, callback) {
  //console.log("inside model find story");
  this.findOne({
    "githubSync": githubRepoId,
    "issueNumber":issueNumber
  })

  .exec(function(err, doc) {
    if (err) {
      //console.log("err"+err);
      callback(err, null);
    } else {
      //console.log("doc"+doc);
      callback(null, doc);
    }
  });
}



var Story = mongoose.model('Story', StorySchema, 'Stories');
module.exports = Story;
