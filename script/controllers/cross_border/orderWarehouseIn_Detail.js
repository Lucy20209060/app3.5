/**
 * Created by lsy on 2016/7/28.
 * orderWarehouseInDetailCtrl 入库单详情控制器
 */
define(['app'], function(app) {

    return app.controller('orderWarehouseInDetailCtrl', ['$scope',  'orderWarehouseInService', '$stateParams','oms',
        function($scope, service, $stateParams,oms) {

            var vm = $scope;
            var paras = $stateParams;

            vm.decType = {'1':'一般报关','2':'分送集报'}
            //vm.status ={'1':'待推送','2':'待入库','3':'推送成功','4':'推送失败',"10":"入库成功","11":"入库失败","1":"尚未入库"}

            /*vm.status ={"00":"未申报","01":"库存不足","02":"发仓库配货","03":"仓库已配货","11":"已报国检","12":"国检放行","13":"国检审核未过","14":"国检抽检",
                "21":"已报海关","22":"海关单证放行","23":"海关单证审核未过","24":"海关货物放行","25":"海关查验未过 ","99":"已关闭"};*/

            vm.data = {};

            Detail();

            //获取入库单数据
            function Detail(){
                service.getDetail(paras.id).then(function(resp) {
                    if(resp.returnCode == 0){
                        vm.data = resp.returnVal;
                        // console.log(vm.data);
                    }
                    else{
                        oms.alert("数据获取失败！");
                    }

                }, function() {
                    console.log('Error while Detail!');
                });
            }

        }]);
})
