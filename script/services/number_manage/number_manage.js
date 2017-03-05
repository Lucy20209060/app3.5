define(['app'], function(app) {

    app.factory('numberManage', ['$http', '$q','oms', 'Upload', function($http, $q , oms, upload) {

        return {
            'getSurplus': function(code) {
                // warehouse=DG
                return oms.get('logistics/queryWaybillNoRangeSurplus', {ckCode:code}).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'getNumbers': function(paras) {
                return oms.get('logistics/queryWaybillNoRange', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询仓库的预警配置
            'getDangerInfo': function(code) {
                return oms.get('tms:preferredWarningConfig/queryWarehouseWarnRule', {wcode:code}).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 保存仓库的预警配置
            'saveDangerInfo': function(paras) {
                return oms.post('tms:preferredWarningConfig/updateWarehouseWarningConfig', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询快递公司列表
            'getLogistic': function(paras) {
                return oms.get('tms:preferredLogisticsConfig/queryLogisticsConfigList', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 删除快递公司配置
            'deleteLogistic': function(paras) {
                return oms.get('tms:preferredLogisticsConfig/deleteLogisticsConfig', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询快递配置
            'getLogisticInfo': function(paras) {
                return oms.get('tms:preferredLogisticsConfig/queryLogisticsConfig', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 更新快递配置
            'updateLogistic': function(data, isCreate, id) {

                var url = isCreate ?
                    'tms:preferredLogisticsConfig/createLogisticsConfig' :
                    'tms:preferredLogisticsConfig/updateLogisticsConfig' ;

                return oms.post(url,data).then(function(response) {
                    return response.data;
                    console.log(response.data);
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询地区树
            'getArea': function(paras) {
                return oms.get('tms:preferredLogisticsConfig/queryAreaInfo', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询接口列表
            'getInterface': function(paras) {
                return oms.get('interfaceConfig/query/page', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询网点列表
            'getSites': function(paras) {
                return oms.get('tms:preferredSiteConfig/queryList', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 查询网点配置详情
            'getSitesInfo': function(paras) {
                return oms.get('tms:preferredSiteConfig/query', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 删除网点
            'deleteSite': function(paras) {
                return oms.get('tms:preferredSiteConfig/delete', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            // 新增网点配置
            'updateSite': function(data, isCreate, id) {

                var url = isCreate ?
                    'tms:preferredSiteConfig/create' :
                    'tms:preferredSiteConfig/update' ;

                return oms.post(url,data).then(function(response) {
                    return response.data;
                    console.log(response.data);
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },
        }
    }]);
})