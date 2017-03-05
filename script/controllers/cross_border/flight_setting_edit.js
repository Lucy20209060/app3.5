//flightSetting_detail

define(['app'], function(app) {

    return app.controller('flightSettingEditCtrl', ['$scope', 'flightSettingManage', '$stateParams', '$state', 'oms', '$location', '$timeout', 'ModalService', function($scope, service, $stateParams, $state, oms, $location, $timeout, ModalService) {

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

            'destinatyPort': [{"key":"HZ-POST","value":"杭州POST"},{"key":"HZ-EXPRESS","value":"杭州EXPRESS"},{"key":"GZ-POST","value":"广州POST"},{"key":"GZ-EXPRESS","value":"广州EXPRESS"}],

            'date_range_options':{
                format: "YYYY-MM-DD",
                locale:{
                    applyLabel: '确定',
                    cancelLabel: '取消',
                }
            }
        };

        var param = {
            flightTime: '',
            landingTime: '',
            search: {
                warehouseCode:codes, // 仓库代码
                logisticsCode:code, // 快递公司代码
                carrierWay: '2',
                destinationPort: '',
                flightNumber: '',
                mainNumber: '',
                flightTime: '',
                landingTime: '',
                saucerCode: '',
                saucerWeight: '',
            }
        }

        vm.data = {};
        vm.config = config;
        vm.param = param;

        // 航班设置
        vm.addSet = addSet;

        vm.isOpen = false;

        vm.isEnd = false;
    
        vm.openCalendar = function(e,moment) {
            e.preventDefault();
            e.stopPropagation();
            if (moment == 0) {
                vm.isOpen = true;
            }else {
                vm.isEnd = true;
            }
        };

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
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);
            if (flightype == 'order') {
                
                service.orderDetail(getParas(config.order)).then(function(resp) {
                    if (resp.returnVal) {
                        vm.data = resp.returnVal;
                        vm.data.state = vm.data.state == '0' ? '未设置' : '已设置';
                        vm.data.carrierWay = vm.data.carrierWay == 'airlift' ? '空运' : '陆运';
                        vm.data.numberNo = ids;
                    }
                    else {
                        oms.alert(resp.returnMsg);
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
                        vm.data.numberNo = '';
                        vm.data.busOrderNo = '';
                    }
                    else {
                        oms.alert(resp.returnMsg);
                    }

                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }
        }

        function fix0(v) {
            return (v < 9) ? ('0' + v) : v;
        }

        /**
         * 航班设置
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getTime(item) {
            var forDate = item;
            var formatDate = forDate.getFullYear() + '-' +
                            fix0(forDate.getMonth() + 1) + '-' +
                            fix0(forDate.getDate()) + ' ' +
                            fix0(forDate.getHours()) + ':' +
                            fix0(forDate.getMinutes()) + ':' +
                            fix0(forDate.getSeconds());
            return formatDate;
        }
        function compareTime(date1, date2) {
            date1 = date1.replace(/\-/gi,"/");
            date2 = date2.replace(/\-/gi,"/");
            var time1 = new Date(date1).getTime();
            var time2 = new Date(date2).getTime();
            if(time1 > time2){
                return 1;
            }else if(time1 == time2){
                return 2;
            }else{
                return 3;
            }
        }
        function addSet() {
            if (flightype == 'order') {
                param.search.omsOrderNos = ids;
            }
            else {
                param.search.handoverNos = id;
            }
            var creatTime = vm.data.createTime;
            var startTime = getTime(param.flightTime);
            var endTime = getTime(param.landingTime);
            var comStart = compareTime(creatTime, startTime);
            var comEnd = compareTime(startTime, endTime);
            if (flightype == 'order') {
                if (comStart != 3) {
                    oms.alert("订单创建时间不能晚于航班起飞时间！");
                    return false;
                }
            }
            if (comEnd == 3) {
                param.search.flightTime = startTime;
                param.search.landingTime = endTime;
                ModalService.open({
                    "title": "提示",
                    "content": "确认将设置的航班信息发送给快递公司？",
                    "alert": false
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        if (result) {
                            if (flightype == 'order') {
                                    return service.orderFlight(param.search).then(function(response) {
                                        var resps = response.returnCode;
                                        if (resps == '0' || resps == 0) {
                                            ModalService.open({
                                                "title": "",
                                                "content": "设置成功",
                                                "alert": true,
                                            }).then(function(modal) {
                                                modal.close.then(function(result) {
                                                    $state.go('app.flight_setting_order_list');
                                                })
                                            });  
                                        }
                                        else {
                                            oms.alert(response.returnMsg);
                                        }
                                    });
                            }
                            else {
                                return service.logisticFlight(param.search).then(function(response) {
                                    var resps = response.returnCode;
                                    if (resps == '0' || resps == 0) {
                                        ModalService.open({
                                            "title": "",
                                            "content": "设置成功",
                                            "alert": true,
                                        }).then(function(modal) {
                                            modal.close.then(function(result) {
                                                $state.go('app.flight_setting_logistic_list');
                                            })
                                        });  
                                    }
                                    else {
                                        oms.alert(response.returnMsg);
                                    }
                                });
                            }
                        }
                        else {
                            ModalService.open({
                                "title": "提示",
                                "content": "取消后填写的内容将无法保存，确认取消吗？",
                                "alert": false,
                            }).then(function(modal) {
                                modal.close.then(function(result) {
                                    if (result) {
                                        oms.alert("取消成功");
                                    }
                                    else {
                                        return;
                                    }
                                })
                            });
                        }
                    })
                });
            }
            else {
                oms.alert("航班落地时间不能晚于航班起飞时间！");
            }
        }
    }]);
})

