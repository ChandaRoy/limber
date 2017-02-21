fragileApp.factory('cardsService', ['$http', 'Socket',function($http,Socket) {


  return {
    getUserCards: function() {
      var url = '/user/cards' ;
      return $http.get(url);
    },
    getUserStories: function(storyIdArr)
    {

      return  $http({
        method: 'GET',
        url: '/story/getStories',
        params: {
          id: storyIdArr //convert array into comma separated values
        }})
      },
      getAssignedStories:function()
      {
        var url='/user/assignedStories';
        return $http.get(url);
      }

    }


      
        var filter = 0;
        return {
            getFilter: function () {
                return filter;
            },
            setFilter: function(value) {
                filter = value;
            }
        }

  }]);
