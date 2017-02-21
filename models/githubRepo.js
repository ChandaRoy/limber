var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var githubRepoSchema = new Schema({
  projectId: {type: Schema.Types.ObjectId,ref: 'Project'},
  name: String,
  owner: String,
  admin: {
    id:String,
    token: String,
    name: String
  }
});

githubRepoSchema.statics.addRepo = function(repoDetails,callback) {
  this.create({
    projectId: repoDetails.projectId,
    name: repoDetails.name,
    owner: repoDetails.owner

},function(err,data){
  if(err)
  callback(err)
  else callback(data);
})}
githubRepoSchema.statics.getRepo = function(prId,callback) {
  return this.findOne({
    'projectId': prId
  }).exec(function(err, data) {
    if (err) callback(err, null);
    else callback(null, data);
  });


}
githubRepoSchema.statics.getGitRepo = function(owner,name,callback) {
  return this.findOne({
    'owner': owner,'name':name
  }).exec(function(err, data) {
    console.log("error",err);
    console.log(data);
    if (err) callback(err, null);
    else callback(null, data);
  });


}

var GithubRepo = mongoose.model('GithubRepo', githubRepoSchema, "GithubRepos");

module.exports = GithubRepo;
