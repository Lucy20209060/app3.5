/**
 * Created by lsy on 2016/7/25.
 *  入库单
 */

define(['app'], function(app) {

    app.factory('orderWarehouseInService', ['$http', '$q','oms' ,function($http, $q , oms) {

        //配置信息
        var config = {};

        return {
            'config': {
                'area': function() {
                    return oms.get('customArea/queryAreaList').then(function(response) {
                        var data = response.data.returnVal , obj = [];
                        for(var i in data){
                            obj.push({'key':data[i].code , 'value':data[i].name})
                        }
                        return obj;
                    })
                }
            },

            'list': function(paras) {
                return oms.get('OrderWarehouseEnter/query/page' , paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetch orderWarehouseIn');
                    return $q.reject(errResponse);
                });
            },
            //入库单详情()
            'getDetail' : function(id){

                return oms.get('OrderWarehouseEnter/query/'+id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching orderWarehouseIn');
                    return $q.reject(errResponse);
                });
            },

            //海关关区列表http://192.168.1.19:8080/omsoms-web/customArea/areaList
            'getAreaList' : function(data){
                return oms.get('customArea/queryAreaList',data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching AreaList');
                    return $q.reject(errResponse);
                });
            },

        }
    }]);

})