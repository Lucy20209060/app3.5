define(['app'], function(app) {

    app.factory('IndexService', ['$http', '$q','oms','AuthService' ,function($http, $q , oms , auth) {

        //配置信息
        var config = {};

        return {
            menu : menu
        }


        function menu(){
            return oms.get('menu/query').then(function(resp){
                return resp.data;
            },function(err){
                return $q.reject(err);
            })
        }
        
    }]);
})