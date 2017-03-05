define(['app'], function(app) {

    app.factory('RoleService', ['$http', '$q','oms' ,function($http, $q , oms) {

        //配置信息

        return {
            get : function(id){
                return oms.get('role/query/'+id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            update : function(paras , isCreate){
                var url = 'role/' + (isCreate ? 'create' : ('update/'+paras.id));

                return oms.post(url,paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            list : function(paras){
                return oms.get('role/query/page',paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            remove : function(id){
                return oms.post('role/delete/',{id:id}).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})