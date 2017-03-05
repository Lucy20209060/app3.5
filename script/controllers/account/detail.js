define(['app'], function(app) {

    return app.controller('AccountDetailCtrl', ['$scope', 'AccountService', 'AuthService', 'oms', '$timeout', function($scope, service, auth, oms, $timeout) {

        var vm = $scope;
        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        vm.data = {
            oldPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
        };

        vm.page = {
            isLoading: false
        }

        vm.save = save;

        vm.empty = function(v){
            return document.form[v] && !document.form[v].value;
        }

        function save() {

            if (vm.data.newPasswordConfirm != vm.data.newPassword) {
                oms.notify("请确认新密码", 'error');
            }else {
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                    vm.page.isLoading = true;
                }, loadingLatency);
                service.reset(vm.data).then(function(resp) {
                    vm.page.isLoading = false;
                    $timeout.cancel(loadingTimeout);

                    if (resp.returnCode == 0) {
                        oms.alert("修改成功，请重新登录" , function(){
                            auth.signout(false);
                        });
                    } else {
                        oms.notify(resp.returnMsg, 'error');
                    }
                });
            }
        }
    }]);
})
