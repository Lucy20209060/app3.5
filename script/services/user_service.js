define(['app'], function(app) {

    app.factory('UserService', ['$http', '$q', function($http, $q) {

        return {
            'get' : function(data){
                return $http.get('http://192.168.1.6:8080/nroms-web/angularDemo/findById?id='+data.id).then(function(response) {
                    console.log(response);
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching user');
                    return $q.reject(errResponse);
                });
            },

            'create': function(user) {
                return $http.post('http://192.168.1.6:8080/nroms-web/angularDemo/addUser', user).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching users');
                    return $q.reject(errResponse);
                });
            },

            'list': function() {
                // var url = "data.json";
                var url = 'http://192.168.1.6:8080/nroms-web/angularDemo/findAllUser';
                return $http.get(url).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetch users');
                    return $q.reject(errResponse);
                });
            },

            'remove': function(id) {
                return $http.get('http://192.168.1.6:8080/nroms-web/angularDemo/deleteUser?id=' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete users');
                    return $q.reject(errResponse);
                });
            },

            'update': function(user) {
                return $http.post('http://192.168.1.6:8080/nroms-web/angularDemo/updateUser', user).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while update users');
                    return $q.reject(errResponse);
                });
            },

            'reset': function() {

            }
        }
    }]);

})
