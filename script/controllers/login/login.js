define(['app'], function(app) {

    return app.controller('LoginCtrl', ['$scope','$rootScope', '$http', 'AuthService','oms','$state', function($scope,$rootScope, $http, service,oms,$state) {

        var vm = $scope;
        $rootScope.isSigned ='';

        var credentials = {
            account : null , 
            password: null
        };

        vm.data = credentials;

        init();

        function init(){
            document.title = "欢迎登录OMS";
        }

        //登录
        vm.login = function() {
            service.signin(credentials).then(function(resp) {
                if (!resp.returnCode) {
                    //alert('登录成功');
                    //$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    //TODO 此处需要修改为 ng 内置的跳转方式
                    $state.go('app');
                    // location.hash = "#/";
                }else{
                    alert(resp.returnMsg);
                }
            }, function() {
                alert('登录失败');
            });
        }
        
    }]);
})