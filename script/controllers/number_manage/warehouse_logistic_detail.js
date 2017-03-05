define(['app'], function(app) {

    return app.controller('warehouseLogisticDetailCtrl', ['$scope', 'oms', 'numberManage', '$stateParams', '$timeout', '$state', '$uibModal', '$log', 'ModalService', function($scope, oms, service, $stateParams, $timeout, $state, $uibModal, $log, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var paras = $stateParams;

        var id = paras.id;

        var isCreate = (id === undefined || id === 'create') ? 1 : 0;

        var page = {
            title: (isCreate ? '新增' : '编辑') + '快递网点',
        };

        var config = {
            'mailType':　[{"key":"VIP空白运单","value":"VIP空白运单"},{"key":"天天国际业务面单","value":"天天国际业务面单"},{"key":"天天云仓面单","value":"天天云仓面单"}],
            'type': [{"key":"号段池获取","value":"号段池获取"},{"key":"一单一取","value":"一单一取"}]
        };

        var model = {
            'warehouseCode': '',
            'logisticsCode': '',
            'warehouseName': '',
            'siteName': '',
            'siteCode': '',
            'password': '',
            'appSecret': '',
            'appKey': '',
            'account': '',
            'digistSecret': '',
            'mailType': '',
            'billSendAddr': '',
            'hasTax': '',
            'customsRecordNo': '',
            'customsRecordName': '',
            'businessMan': '',
            'businessPhone': '',
            'financePhone': '',
            'financeMan': '',
            'operatorPhone': '',
            'operator':'',
            'techniqueMan': '',
            'techniquePhone': '',
            'handleMan': '',
            'handlePhone': '',
            'ticketAddress': '',
            'ticketZipCode': '',
            'ticketBankNo': '',
            'ticketBank': '',
            'ticketTaxNo': '',
            'taxPercent': '',
            'ticketPhone': '',
            'companyName':''
        }

        vm.isLoading = false;

        vm.page = page;

        vm.isCreate = isCreate;

        vm.data = {};

        vm.config = config;

        // 保存
        vm.save = save;

        init();

        function init() {
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);

            service.getLogistic().then(function(resp) {
                if (resp.list) {
                    config.logistic = afterList(resp.list);
                }
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });

            oms.config('warehouse').then(function(resp) {
                config.warehouses = setWarehouse(resp.returnVal);
                config.warehouses_hash = oms.hash(config.warehouses, 'value', 'key');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });

            if (!isCreate) {
                // 所有的仓库以及店铺
                service.getSitesInfo({'id':id}).then(function(resp) {
                    if (resp.returnVal) {
                        setData(resp.returnVal);
                    } else {
                        alert('没有数据');
                    }

                    vm.isLoading = false;

                }, function() {
                    console.log('Error while Detail!');
                });
            }
        }

        /**
         * 格式化返回的结果集，关区值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data){
            var objs = [];
            for(var i in data){
                var obj = {"key":data[i].logisticsCode,"value":data[i].logisticsName};
                objs.push(obj);
            }
            return objs;
        }

        function setWarehouse(data){
            var objs = [];
            for(var i in data) {
                var obj = {"key":data[i].code,"value":data[i].name};
                objs.push(obj);
            }
            return objs;
        }

        /**
         * 格式化数据
         * @param {[]} predata [预格式化数据]
         */
        function setData(data) {

            vm.data = data;
        }

        /**
         * save
         * @return {[type]} [description]
         */
        function save() {
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            service.updateSite(getData(vm.data), isCreate, id).then(function(resp) {
                //接口返回数据
                if (!resp.returnCode) {
                    ModalService.open({
                        "title": "",
                        "content": "保存成功",
                        "alert": true,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (isCreate) {
                                $state.go('app.warehouse_logistic_list');
                            }
                        })
                    });
                } else {
                    alert(resp.returnMsg);
                }
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function(resp) {
                oms.alert("发生错误请重试！");
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        /**
         * 获取数据
         * @param {[]} predata [预格式化数据]
         */
        function getData(data) {
            // 获取适用场景
            var obj1 = angular.copy(data);
            vm.data.warehouseCode = config.warehouses_hash[vm.data.warehouseName];
            var obj = oms.pick(obj1,model);

            if (!isCreate) {
                obj['id'] = id;
            }

            return obj;
        }      

    }]);
})
