/**
 * Created by lsy on 2016/8/2.
 */

define(['app'], function(app) {

    app.factory('orderWarehouseInImportService', ['$http', '$q', 'oms', function($http, $q, oms) {

        return {
            'verify': function(obj, file) {

                var url = 'OrderWarehouseEnter/importVerify';

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
                var url = 'OrderWarehouseEnter/import';

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
