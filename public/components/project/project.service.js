angular.module('fragileApp').factory('projectService', ['$http', 'Socket',function($http,Socket) {

  return {
    getUserProjects: function() {
      var url = '/user/projects?id=' ;
      return $http.get(url);
    },
    editProject: function(name,description,projectId) {
      var req = {
        method: 'POST',
        url: '/project/updateProject',
        data: {
          name: name,
          description: description,
          projectId:projectId
        }
      }
      return $http(req);
    },
    addProject: function(name, desc,uuid) {
      var req = {
        method: 'POST',
        url: '/project',
        data: {
          name: name,
          desc: desc
        }
      }
      return $http(req);
    },
    addProjectToUser: function( projectID) {
      var req = {
        method: 'POST',
        url: '/user/addProject',
        data: {
          projectID: projectID,
        }
      }
      return $http(req);
    },
    setData: function(name, id) {
      this.addWhat = name;
      this.addId = id;
    },
    getCurrentUser: function(){
      return $http.get("/user");
    },
    getAllUsers:function(){
      var url = "/user/all";
      return $http.get(url);
    },
    getMembers: function(projectID){

      var url = '/project/memberList?id=' + projectID

      return $http.get(url);
    },
    getUuid:function(projectId,memberList){
      var req = {
        method: 'GET',
        url: '/project/channelId',
        params  : {
          'projectId': projectId,
          'member':memberList,
        }
      }
      return $http(req);
    },
    getChannels:function(projectId){
      var url = '/project/allChannels?projectId=' + projectId
      return $http.get(url);
    },
    groupDetails:function(channelIds){
      var req={
        method:'GET',
        url:'/project/groupDetails',
        params:{
          'channelIds':channelIds
        }
      }
      return $http(req);
    }
  }
}]);
