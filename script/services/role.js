define(['app'], function(app) {

    app.factory('RoleService', ['$http', '$q','oms' ,function($http, $q , oms) {

        //配置信息

        return {
            list : function(){
                return oms.get('orderDeclare/page' , paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetch users');
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})