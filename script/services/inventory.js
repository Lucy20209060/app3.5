/**
 * Created by lxh on 2016/12/1.
 *  InventoryService
 */

define(['app'], function(app) {

    app.factory('inventoryService', ['$q', 'oms', 'Upload', function($q, oms, uploader) {

        return {

            'list': function(paras) {
                return oms.get('warehouseInfo/queryStockPage', paras).then(function(response) {
                    return response.data;   
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
        }
    }]);
})
