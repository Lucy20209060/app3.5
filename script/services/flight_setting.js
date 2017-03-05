define(['app'], function(app) {

    app.factory('flightSettingManage', ['$q', 'oms', function($q, oms) {

        return {
            // http://192.168.1.31:8484/nroms/handoverFlightSet/queryHandoverList?pageSize=10&pageNum=1
            'logisticList': function(paras) {
                return oms.get('tms:handoverFlightSet/queryHandoverList', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'orderList': function(paras) {
                return oms.get('tms:handoverFlightSet/queryOrderList', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'logisticFlight': function(paras) {
                return oms.post('tms:handoverFlightSet/updateHandoverFlightDetail', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'orderFlight': function(paras) {
                return oms.post('tms:handoverFlightSet/updateOrderFlightDetail', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'logisticDetail': function(paras) {
                return oms.get('tms:handoverFlightSet/queryHandoverFlightDetail', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'orderDetail': function(paras) {
                return oms.get('tms:handoverFlightSet/queryOrderFlightDetail', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'getProvince': function() {
                return oms.get('tms:handoverFlightSet/queryAllProvince').then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'getCity': function(paras) {
                return oms.get('tms:handoverFlightSet/queryCitys', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
        }
        
    }]);
})