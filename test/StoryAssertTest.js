var supertest = require("supertest");
var assert = require("chai").assert;
var app = require('../bin/www');
var Storymodel=require("../models/story");

describe('Story schema', function() {
  it('should have a function called removeAttachment()', function() {
    assert( typeof Storymodel.removeAttachment === 'function');
  });
  it('should have a function called findStory()', function() {
    assert( typeof Storymodel.findStory === 'function');
  });
  it('should have a function called addMembers()', function() {
    assert( typeof Storymodel.addMembers === 'function');
  });
  it('should have a function called addStory()', function() {
    assert( typeof Storymodel.addStory === 'function');
  });
  it('should have a function called removeMembers()', function() {
    assert( typeof Storymodel.removeMembers === 'function');
  });
  it('should have a function called removeAttachment()', function() {
    assert( typeof Storymodel.removeAttachment === 'function');
  });
  it('should have a function called addAttachments()', function() {
    assert( typeof Storymodel.addAttachments === 'function');
  });
  it('should have a function called updateChecklistItems()', function() {
    assert( typeof Storymodel.updateChecklistItems === 'function');
  });
  it('should have a function called addChecklistGroup()', function() {
    assert( typeof Storymodel.addChecklistGroup === 'function');
  });
  it('should have a function called removeChecklistGroup()', function() {
    assert( typeof Storymodel.removeChecklistGroup === 'function');
  });
  it('should have a function called updateLabelList()', function() {
    assert( typeof Storymodel.updateLabelList === 'function');
  });
  it('should have a function called deleteStory()', function() {
    assert( typeof Storymodel.deleteStory === 'function');
  });
  it('should have a function called saveDescription()', function() {
    assert( typeof Storymodel.saveDescription === 'function');
  });
  it('should have a function called updateLabelList()', function() {
    assert( typeof Storymodel.updateLabelList === 'function');
  });

});
describe('Story\'s  schema ', function() {
  it('findStory() should accept two parameters, StoryId(ObjectId) and callback.', function() {
    assert( Storymodel.findStory.length === 2 );
  });
  it('addMembers() should accept three parameters, storyId(ObjectId), memberId(ObjectId), and callback.', function() {
    assert( Storymodel.addMembers.length === 3 );
  });
  it('addStory() should accept two parameters, StoryId(ObjectId) and callback.', function() {
    assert( Storymodel.addStory.length === 2 );
  });
  it('removeMembers() should accept three parameters, StoryId(ObjectId), MembersId(ObjectId) , and callback.', function() {
    assert( Storymodel.removeMembers.length === 3 );
  });
  it('addAttachments() should accept three parameters, StoryId(ObjectId), AttachmentObj(ObjectId), and callback.', function() {
    assert( Storymodel.addAttachments.length === 3 );
  });
  it('updateChecklistItems() should accept three parameters, StoryId(ObjectId), CheckListObj(ObjectId), and callback.', function() {
    assert( Storymodel.updateChecklistItems.length === 3 );
  });
  it('addChecklistGroup() should accept three parameters, StoryId(ObjectId), CheckListObj(ObjectId) and callback.', function() {
    assert( Storymodel.addChecklistGroup.length === 3 );
  });
  it('removeChecklistGroup() should accept three parameters, StoryId(ObjectId), ChecklistId(String), and callback.', function() {
    assert( Storymodel.removeChecklistGroup.length === 3 );
  });
  it('updateLabelList() should accept four parameters, StoryId(ObjectId),LabelId(objectId),operation and callback.', function() {
    assert( Storymodel.updateLabelList.length === 4 );
  });
  it('deleteStory() should accept two parameters, StoryId(ObjectId) and callback.', function() {
    assert( Storymodel.deleteStory.length === 2 );
  });
  // it('should accept one parameter gameId as String, and return undefined if leaderBoard for gameId does not exist', function() {
  //   //  assert( Storymodel.Storymodel.length === 1 );
  //     var players = Storymodel.findStory('57026064772a712a164d7abc');
  //     assert.equal( players, undefined );
  //   });
});
