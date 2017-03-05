//flightSetting_detail

define(['app'], function(app) {

    return app.controller('flightSettingDetailCtrl', ['$scope', 'flightSettingManage', '$stateParams', '$state', 'oms', '$location', '$timeout', 'ModalService', function($scope, service, $stateParams, $state, oms, $location, $timeout, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope,
            paras = $stateParams,
            flightype = paras.flightype,
            id = paras.id,
            code = paras.code, 
            codes = paras.codes,
            ids = paras.ids;
            

        var config = {
            logistic: {
                'handoverNo':id,
                'logisticsCode':code,
                'warehouseCode':codes
            },
            order: {
                'handoverNo':id,
                'omsOrderNo':ids,
                'logisticsCode':code,
                'warehouseCode':codes
            },
            'carryWay': [{"key":"1","value":"空运"},{"key":"2","value":"陆运"}],

            'status': [{"key":"0","value":"未设置"},{"key":"1","value":"已设置"}],

            'destinatyPort': [{"key":"杭州POST","value":"杭州POST"},{"key":"杭州EXPRESS","value":"杭州EXPRESS"},{"key":"广东POST","value":"广东POST"},{"key":"广东EXPRESS","value":"广东EXPRESS"}],
        };

        vm.data = {};
        vm.config = config;

        init();

        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {
            var obj = tableState,
                search_arr = [];

            for (var i in obj){
                if(obj[i] !== '') search_arr.push( i + '=' + obj[i] );
            }
            return search_arr.join('&');
        }

        function init() {
            config.state_hash = oms.hash(config.status);
            config.carry_hash = oms.hash(config.carryWay);
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);
            if (flightype == 'order') {
                
                service.orderDetail(getParas(config.order)).then(function(resp) {
                    if (resp.returnVal) {
                        vm.data = resp.returnVal;
                        vm.data.state = vm.data.state == '0' ? '未设置' : '已设置';
                        vm.data.carrierWay = vm.data.carrierWay == '1' ? '空运' : '陆运';
                        vm.data.numberNo = ids;
                    }

                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }
            else {
                service.logisticDetail(getParas(config.logistic)).then(function(resp) {
                    if (resp.returnVal) {
                        vm.data = resp.returnVal;
                        vm.data.state = vm.data.state == '0' ? '未设置' : '已设置';
                        vm.data.carrierWay = vm.data.carrierWay == 'airlift' ? '空运' : '陆运';
                        vm.data.busOrderNo = '';
                        vm.data.numberNo = '';
                    }

                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }
        }
    }]);
})

