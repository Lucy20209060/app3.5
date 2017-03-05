define(['app'], function(app) {

    app.factory('OrderImportService', ['$http', '$q', 'oms', function($http, $q, oms) {

        return {
            'verify': function(obj, file) {

                var url = 'orderimport/importXlsVerify';

                return oms.upload(url + '?' + oms.serialize(obj), { 'file': file }).then(function(resp) {
                    return resp.data;
                }, function(resp) {
                    return resp;
                    console.log('Error status: ' + resp.status);
                }, function(evt) {
                    var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    return progress;
                });
            },
            'import': function(obj , file) {
                var url = 'orderimport/importXls';

                return oms.upload(url + '?' + oms.serialize(obj), { 'file': file }).then(function(resp) {
                    return resp.data;
                }, function(resp) {
                    return resp;
                    console.log('Error status: ' + resp.status);
                }, function(evt) {
                    var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    return progress;
                });
            }
        }
    }]);

})
