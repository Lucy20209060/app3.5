define(['app'], function(app) {

    app.factory('notificationManage', ['$q', 'oms', function($q, oms) {

        return {
            // http://192.168.1.31:8484/nroms/handoverFlightSet/queryHandoverList?pageSize=10&pageNum=1
            'messageList': function(paras) {
                return oms.get('notifyMessages/queryByPage', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'rePost': function(paras) {
                return oms.post('notifyMessages/resetPushNotify', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

        }
    }]);
})