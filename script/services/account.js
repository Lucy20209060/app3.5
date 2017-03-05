define(['app'], function(app) {

    app.factory('AccountService', ['$q', 'oms', function($q, oms) {
        return {
            reset: function(data) {
                return oms.post('account/updatePassword' , data).then(function(resp) {
                    return resp.data;
                }, function(err) {
                    return $q.reject(err);
                })
            }
        }

    }]);
})
