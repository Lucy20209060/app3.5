/**
 * Created by Administrator on 2016/8/8.
 * 仓库 - 服务 warehouse
 */

define(['app'], function(app) {

    app.factory('warehouse', ['$http','$q','oms' ,function($http,$q ,oms) {

        var config = {};
        return {
            list : function(paras){
                return oms.get('warehouseInfo/queryPage', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetch warehouse');
                    return $q.reject(errResponse);
                });
            },
            'Detail' : function(id){
                return oms.get('warehouseInfo/query/'+id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching warehouse by id');
                    return $q.reject(errResponse);
                });
            },
            'remove': function(id) {
                return oms.get('warehouseInfo/delete/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete warehouse');
                    return $q.reject(errResponse);
                });
            },
            /*'create': function(user) {
                return $http.post('warehouseInfo/create', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while create warehouse');
                    return $q.reject(errResponse);
                });
            },*/
            // 新增，修改
            'update': function(datas,isEdit) {
                //var url = isEdit ?'warehouseInfo/update':'warehouseInfo/create';
                var url = isEdit ?'warehouseInfo/update/'+datas.id:'warehouseInfo/create';
                return oms.post(url,datas).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.log(datas);
                    console.error('Error while update warehouse');
                    return $q.reject(errResponse);
                });
            },

            'getProvince': function() {
                return oms.get('cityInfo/queryAllProvince').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            'getCity': function(id) {
                return oms.get('cityInfo/queryCitys/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },            
        }
    }]);
})