define(['app'], function(app) {

    return app.controller('GoodsDeclareDetailCtrl', ['$scope', 'oms', 'GoodsDeclareService', '$stateParams', '$state', '$timeout', 'ModalService', function($scope,oms, service, $stateParams, $state, $timeout, ModalService) {

        var vm = $scope;
        var paras = $stateParams;

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var id = paras.id;
        var type =  (paras.type == 1) ? 1 : 0;

        vm.removeOrder = removeOrder;

        vm.pushOrder = pushOrder;

        vm.status ={"00":"未申报","01":"库存不足","02":"发仓库配货","03":"仓库已配货","11":"已报国检","12":"国检放行","13":"国检审核未过","14":"国检抽检","21":"已报海关","22":"海关单证放行","23":"海关单证审核未过","24":"海关货物放行","25":"海关查验未过 ","99":"已关闭"};

        //业务类型
        vm.bizType = {"I10":"直购进口","I20":"网购保税进口"};
        //订购人证件类型
        vm.idType =  {"1":"身份证","2":"其它"};

        vm.clearPorts = {"DG":"东莞","CZ":"郴州"};
        vm.clearTypes = {"BC":"BC直邮","GR":"个人物品"};

        vm.type = type;

        vm.id = id;

        vm.data = {};

        vm.customs = {"CQC":"重庆海关","NBC":"宁波海关","DGC":"沙田海关"};

        vm.titles = type == 1 ? '异常单详情' : '申报单详情';

        Detail();

        //}
        //获取数据
        function Detail(){
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);
            service.getDetail(paras.id).then(function(resp) {
                vm.data = resp.returnVal;
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while Detail!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        /**
         * 取消订单
         * @return {[type]} [description]
         */
        function removeOrder() {
            var items = {ids:id};

            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);

            service.removeOrder(items).then(function(resp) {
                if (resp.returnCode == 0) {
                    ModalService.open({
                        "title": "",
                        "content": resp.returnMsg,
                        "alert": true,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (type == 1) {
                                $state.go('app.exception_order_list');
                            }
                            else {
                                $state.go('app.goods_declare_list');
                            }
                        })
                    });
                }
                else {
                    oms.alert("请求失败，请检查网络");
                }

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while cancel order!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        /**
         * 推送订单
         * @return {[type]} [description]
         */
        function pushOrder() {
            var items = {id:id};

            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);

            service.exportOrder(items).then(function(resp) {
                if (resp.returnCode == 0) {
                    ModalService.open({
                        "title": "",
                        "content": "推送成功，是否返回异常单列表",
                        "alert": false,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (result) {
                                $state.go('app.exception_order_list');
                            }
                        })
                    });
                }
                else {
                    oms.alert(resp.returnMsg);
                }

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while cancel order!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }
    }]);
})
