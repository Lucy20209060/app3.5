define(['app'], function(app) {

    app.factory('GoodsDeclareService', ['$http', '$q','oms' ,function($http, $q , oms) {

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
                return oms.get('orderDeclare/query/page' , paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetch users');
                    return $q.reject(errResponse);
                });
            },
            //申报单详情()
            'getDetail': function(id){
                //return $http.get('http://192.168.1.19:8080/omsoms-web/orderDeclare/findById?id='+data.id).then(function(response) {

                return oms.get('orderDeclare/query/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching user');
                    return $q.reject(errResponse);
                });
            },

            //海关关区列表http://192.168.1.19:8080/nroms-web/customArea/areaList
            'getAreaList' : function(data){
                return nr.get('customArea/queryAreaList',data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching queryAreaList');
                    return $q.reject(errResponse);
                });
            },

            //取消订单
            'removeOrder' : function(data){
                return oms.get('orderDeclare/cancel',data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching queryAreaList');
                    return $q.reject(errResponse);
                });
            },

            // 异常单
            'expOrderList': function(paras) {
                return oms.get('abnormalOrders/queryByPage', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 订单推送接口
            'exportOrder': function(paras) {
                return oms.post('abnormalOrders/updateOrderToCustom', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 订单更新保存接口
            'updateOrder': function(paras) {
                return oms.post('abnormalOrders/updateOrder', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
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
            
            //获取城市的接口
            'getCity': function(id) {
                return oms.get('cityInfo/queryCitys/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            // 获取快递公司查询接口
            'express': function(id) {
                return oms.get('logisticsCompany/queryLogisticsCompany',id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            // 获取支付机构接口
            'payInstitution': function(id) {
                return oms.get('customsBaseParam/query/payagent',id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            // 异常单类型
            'exceptionTypes': function() {
                return oms.get('abnormalOrders/exceptionType').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})