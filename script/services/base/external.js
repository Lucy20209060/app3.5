/**
 * Created by Administrator on 2016/11/10.
 * 外部系统管理 - 服务 
 */

define(['app'], function(app) {

    app.factory('external', ['$http','$q','oms' ,function($http,$q ,oms) {

        var config = {};
        return {
            list : function(paras){
                return oms.get('tpSystem/queryPage', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetch external');
                    return $q.reject(errResponse);
                });
            },
            'Detail' : function(id){
                return oms.get('tpSystem/query/'+id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching external by id');
                    return $q.reject(errResponse);
                });
            },
            'remove': function(id) {
                return oms.get('tpSystem/delete/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete external');
                    return $q.reject(errResponse);
                });
            },
            // 新增，修改
            'update': function(datas,isEdit) {
                var url = isEdit ?'tpSystem/update/'+datas.id:'tpSystem/create';
                return oms.post(url,datas).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.log(datas);
                    console.error('Error while update external');
                    return $q.reject(errResponse);
                });
            },
            // 获取所有系统类型
            'config': function(id){
                return oms.get('customsBaseParam/queryByType',id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching external by id');
                    return $q.reject(errResponse);
                });
            },
        }
    }]);
})