define(['app'], function(app) {

    app.factory('customerManage', ['$http', '$q','oms', 'Upload', function($http, $q , oms, upload) {
        //配置信息
        var config = {};
        return {
            'area': function() {
                return oms.get('customArea/queryAllAreaList').then(function(response) {
                    var data = response.data.returnVal,
                        objs = [];
                    for (var i in data) {
                        var obj = { 'areaCode': data[i].code, 'value': data[i].name }
                        objs.push(obj);
                    }
                    return objs;
                })
            },
            // 获取上级店铺
            'allCustomes': function() {
                return oms.get('customShop/queryAll').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching user');
                    return $q.reject(errResponse);
                });
            },
            // 根据关区获取鼓舞平台
            'platform': function(paras) {
                return oms.get('shopPlatform/queryByAreaCode', {areaCode:paras}).then(function(response) {
                    var data = response.data.returnVal,
                        objs = [];
                    for (var i in data) {
                        var obj = { 'shopPlatformCode': data[i].code, 'value': data[i].name }
                        objs.push(obj);
                    }
                    return objs;
                })
            },
            // 根据id获取店铺名
            'getCustomer': function(id) {
                return oms.get('customShop/query/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching user');
                    return $q.reject(errResponse);
                });
            },
            //获取详情
            'get': function(id) {
                return oms.get('businessCompany/query/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching user');
                    return $q.reject(errResponse);
                });
            },

            'allWare': function() {
                return oms.get('businessCompany/queryAllTpSystemAndWarehouseInfo').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching user');
                    return $q.reject(errResponse);
                });
            },

            'update': function(data, isCreate, id) {

                var url = isCreate ?
                    'businessCompany/create' :
                    'businessCompany/update/' + id;

                return oms.post(url,data).then(function(response) {
                    return response.data;
                    console.log(response.data);
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'addShop': function(data, id) {

                var url = id == -1 ?
                    'customShop/create' :
                    'customShop/update/' + id;

                return oms.post(url,data).then(function(response) {
                    return response.data;
                    console.log(response.data);
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'removeShop': function(paras) {
                return oms.get('customShop/delete/' + paras).then(function(response) {
                    return response.data;
                    // console.log(response);
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 获取接口可配置规则
            'getRule': function(paras) {
                return oms.get('businessCompany/queryDatePropertys/' + paras).then(function(response) {
                    return response.data;
                    // console.log(response);
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 商家列表
            'list': function(paras) {
                return oms.get('businessCompany/queryPage', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            'delete': function(paras) {
                return oms.get('businessCompany/delete/' + paras).then(function(response) {
                    return response.data;
                    // console.log(response);
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