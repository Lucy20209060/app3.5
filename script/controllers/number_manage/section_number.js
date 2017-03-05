define(['app'], function(app) {

    return app.controller('sectionNumberCtrl', ['$scope', 'numberManage', 'oms', '$log', '$timeout', '$uibModal', 'ModalService', function($scope, service, oms, $log, $timeout, $uibModal, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var config = {};

        var parms = {
                name: '',
                tel: ''
            };

        //数据
        var data = {
            surpluses : '',
            warehouses: '',
            warehouse: '',
            dangerInfo: ''
        }

        var dangerInfo = [];

        vm.isLoading = false;

        vm.parms = parms;

        vm.data = data;

        vm.getSurplus = getSurplus;

        vm.getNumber  = getNumber;

        vm.config = config;

        vm.addContact = addContact;

        vm.removeItem = removeItem;

        vm.saveDanger = saveDanger;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            // 获取仓库信息
            oms.config('warehouse').then(function(resp) {
                vm.data.warehouses = resp.returnVal;
                vm.data.warehouse = vm.data.warehouses[0].code;
                vm.isLoading = true;
                getSurplus();
            });
        }

        /**
         * 获取余量信息
         * @return {[type]} [description]
         */
        function getSurplus() {
            vm.data.surpluses = '';
            vm.data.dangerInfo = '';
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            service.getSurplus(vm.data.warehouse).then(function(resp) {

                if (resp.returnVal) {
                    vm.data.surpluses = setData(resp.returnVal);
                    getDangerInfo();
                }
            });
            
        }

        /**
         * 获取预警信息
         * @return {[type]} [description]
         */
        function getDangerInfo() {
            vm.data.dangerInfo = '';
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            service.getDangerInfo(vm.data.warehouse).then(function(resp) {

                $timeout.cancel(loadingTimeout);

                if (resp.returnVal) {
                    vm.data.dangerInfo = resp.returnVal;
                    var thresholds = resp.returnVal.thresholds;
                    for(var i in thresholds) {
                        var logisticsCode = thresholds[i].logisticsCode;
                        var threshold = thresholds[i].threshold;
                        for(var j in vm.data.surpluses) {
                            if (vm.data.surpluses[j].logisticsName == logisticsCode) {
                                vm.data.surpluses[j].dangerNum = threshold;
                            }
                        }
                    }
                }

                vm.isLoading = false;
            });
        }

        /**
         * 获取参数
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function setData(data) {
            var allLogistics = data.logisticsCompanyListVO;
                objs = [];
            for (var i in allLogistics) {
                var obj = { 'logisticsCode': allLogistics[i].code, 'value': allLogistics[i].name }
                objs.push(obj);
            }
            config.log_hash = oms.hash(objs, 'logisticsCode', 'value');
            var curLogs = data.resultWaybillNoRangeSurplusModelsListVO;
            return curLogs;
        }

        /**
         * 获取号段
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function getNumber(item) {
            var curNumber = item.getNum;
            if ( curNumber <= 0 ) {
                // alert("请输入大于0的数量进行获取");
                ModalService.open({
                    "title":"",
                    "content":"请输入大于0的数量进行获取",
                    "alert":true,
                }).then(function(modal) {
                    modal.close.then(function(result) {
                    })
                });
            }
            else {
                ModalService.open({
                    "title":"",
                    "content":"确定获取号段么？",
                    "alert":false,
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        if (result) {
                            $timeout.cancel(loadingTimeout);

                            loadingTimeout = $timeout(function() {
                                vm.isLoading = true;
                            }, loadingLatency);

                            service.getNumbers(getParas(item)).then(function(resp) {

                                $timeout.cancel(loadingTimeout);

                                if (!resp.returnCode) {
                                    var pullNum = resp.returnVal.pullNum == null ? 0 : resp.returnVal.pullNum;
                                    if (pullNum == 0) {
                                        oms.notify("获取失败", "error");
                                    }
                                    else {
                                        ModalService.open({
                                            "title":"",
                                            "content":"已成功获取" + pullNum + "个号段",
                                            "alert":true,
                                        }).then(function(modal) {
                                            modal.close.then(function(result) {
                                            })
                                        });
                                        getSurplus();
                                    }
                                }
                                vm.isLoading = false;
                            });
                        }
                    })
                });
            }
        }

        /**
         * 获取参数
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function getParas(item) {
            return {
                logisticsCode:item.logisticsName,
                ckCode:vm.data.warehouse,
                // customerCode:'',//TODO ?
                getNum:item.getNum
            }
        }

        /**
         * 保存预警信息
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function saveDanger() {
            $timeout.cancel(loadingTimeout);
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            service.saveDangerInfo(getDate()).then(function(resp) {

                $timeout.cancel(loadingTimeout);

                if (!resp.returnCode) {
                    ModalService.open({
                        "title":"",
                        "content":"保存成功",
                        "alert":true,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                        })
                    });
                }
                vm.isLoading = false;
            });
        }

        /**
         * 获取参数
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function getDate() {
            var obj = [];
            for(var i in vm.data.surpluses) {
                var item = {"logisticsCode": vm.data.surpluses[i].logisticsName, "threshold": vm.data.surpluses[i].dangerNum};
                obj.push(item);
            }

            var single = [];
            if (vm.parms.name && vm.parms.tel) {
                var telReg = !!vm.parms.tel.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                if(telReg == false) {
                    oms.alert("请输入合法的11位手机号码");
                }
                else {
                    var item = {"contactMan": vm.parms.name, "contactPhone": vm.parms.tel};
                    single.push(item);
                }
            }
            for(var i in vm.data.dangerInfo.contacts) {
                var item = {"contactMan": vm.data.dangerInfo.contacts[i].contactMan, "contactPhone": vm.data.dangerInfo.contacts[i].contactPhone};
                single.push(item);
            }

            var objs = {
                "id": vm.data.dangerInfo.rule.id,
                "warehouseCode": vm.data.warehouse,
                "warnPage": vm.data.dangerInfo.rule.warnPage,
                "warnMessage": vm.data.dangerInfo.rule.warnMessage,
                "contacts": single,
                "thresholds": obj
            }
            objs = oms.dig(objs);
            return objs;
        }

        /**
         * 增加一行
         * @param {[]} predata [预格式化数据]
         * 稍后通过指令优化==\
         */
        function addContact(e) {
            e.preventDefault();
            e.stopPropagation();

            if (vm.parms.name.length == 0) {
                oms.alert("请输入预警信息接收人");
            }
            else {
                var telReg = !!vm.parms.tel.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                if(vm.parms.tel.length == 0) {
                    oms.alert("请输入预警信息人联系方式");
                }
                else if(telReg == false) {
                    oms.alert("请输入合法的11位手机号码");
                }
                else {
                    var somelogistic = {
                                            "contactMan": vm.parms.name,
                                            "contactPhone": vm.parms.tel,
                                        };
                    // dangerInfo.push(somelogistic);
                    vm.data.dangerInfo.contacts.push(somelogistic);
                    parms.name = '';
                    parms.tel = '';  
                }
            }

            
        }    

        /**
         * 移除一行
         * @param {[]} predata [预格式化数据]
         */
        function removeItem(index) {
             vm.data.dangerInfo.contacts.splice(index,1);
        }     
    }]);
})
