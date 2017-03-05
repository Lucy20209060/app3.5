define(['app'], function(app) {

    app.factory('UserService', ['$http', '$q','oms' ,function($http, $q , oms) {

        //配置信息

        return {
            get : function(id){
                return oms.get('user/query/'+id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            list : function(paras){
                return oms.post('user/query/page',paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            remove : function(id){
                return oms.post('user/delete'  ,{id:id}).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            update : function(data , isCreate){
                var url = 'user/' + (isCreate ? 'create' : ('update/'+data.id));
                return oms.post(url,data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            reset : function(id){
                return oms.post('/user/resetPassword'  ,{ids:id}).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})