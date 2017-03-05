define(['app'], function(app) {

    app.factory('AbroadCheckOrderService', ['$q', 'oms', function($q, oms) {

        return {

            'ruleList': function(paras) {
                return oms.get('orderVerify/queryByPage', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'deleteCheck': function(paras) {
                return oms.get('orderVerify/delete', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'getInfo': function(id) {
                return oms.get('orderVerify/query/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            'getRange': function() {
                return oms.get('orderVerify/queryRuleRangeInfo').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            'update': function(data, isCreate, id) {

                var url = isCreate ?
                    'orderVerify/create' :
                    'orderVerify/update';

                return oms.post(url,data).then(function(response) {
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

            'getCity': function(id) {
                return oms.get('cityInfo/queryCitys/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            'getLogistic': function() {
                return oms.get('logisticsCompany/queryLogisticsCompany').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})