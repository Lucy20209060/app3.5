define(['app'], function(app) {

    app.factory('InterfaceManageService', ['$q', 'oms', function($q, oms) {

        return {
            'interfaceList': function(paras) {
                return oms.get('interfaceConfig/query/page', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
            'getInfo': function(paras) {
                return oms.get('interfaceConfig/query/' + paras).then(function(resp) {
                    return resp.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'remove': function(id) {
                return oms.get('interfaceConfig/deleteInterface/', id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete interface');
                    return $q.reject(errResponse);
                });
            },
            // 新增，修改
            'update': function(data, isCreate) {
                var url = isCreate ?
                    'interfaceConfig/create' :
                    'interfaceConfig/update' ;

                return oms.post(url,data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'delete': function(id) {
                return oms.get('interfaceConfig/deleteInterfaceProperty/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete interface');
                    return $q.reject(errResponse);
                });
            },

            'ifMore': function(name) {
                return oms.get('interfaceConfig/checkInterfaceName', name).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete interface');
                    return $q.reject(errResponse);
                });
            },

            'getType': function(name) {
                return oms.get('customsBaseParam/queryByType', name).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while delete interface');
                    return $q.reject(errResponse);
                });
            }
        }
    }]);
})