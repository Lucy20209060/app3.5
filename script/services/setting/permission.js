define(['app'], function(app) {

    app.factory('PermissionService', ['$http', '$q', 'oms', function($http, $q, oms) {

        //配置信息
        return {
            list: function() {
                return oms.get('menu/queryAll').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            update: function(data) {
                return oms.post('menu/update/' + data.id, data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            create: function(data) {
                return oms.post('menu/create', data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            remove: function(id) {
                return oms.get('menu/delete/'+id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})
