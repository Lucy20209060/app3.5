//externalDetailCtrl

define(['app'], function(app) {

    return app.controller('externalDetailCtrl', ['$scope','external', '$stateParams','$state','oms','$location',
        function($scope, service,$stateParams,$state,oms,$location) {

        var vm = $scope,
            paras = $stateParams,
            isEdit = paras.id != undefined;

        var config = {
                "system": []

            };

        function int() {
            var prams = {"paramType": 7};
            service.config(prams).then(function(resp) {
                config.system = resp.returnVal;
            });
        }
        int();

        var model = {
            id: '',
            systemName: '',
            systemCode: '',
            systemType: '',
            appKey: '',
            memo: ''
        };
        vm.isEdit = isEdit;
        vm.data = {};
        vm.config = config;
        vm.updateExternal = updateExternal;

            if(isEdit){
                Detail();
            }

        //获取数据
        function Detail(){
            service.Detail(paras.id).then(function(resp) {
                vm.data = oms.pick(resp.returnVal , model);
            }, function() {
                console.log('Error while Detail!');
            });
        }

            
            
        // 新建或编辑功能
        function updateExternal() {
            var datas = vm.data;
            if (isEdit) {
                service.update(datas,isEdit).then(function(resp) {
                    if (resp.returnCode == 0) {
                        oms.notify('修改成功');
                    }
                    else if (resp.returnCode == -4) {
                        oms.alert('修改失败！请重新填写');

                    }
                }, function() {
                    oms.alert('修改失败');
                });
            } else {
                service.update(datas,isEdit).then(function(resp) {
                    if (resp.returnCode == 0) {
                        oms.notify('添加成功');
                        $state.go('app.external_list');
                    }
                    else if (resp.returnCode == -4) {
                        alert('添加失败！请重新填写');
                    }
                }, function() {
                    oms.alert("添加失败！");
                });
            }
        }
    }]);
})

