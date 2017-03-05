define(['app'], function(app) {

    return app.controller('UserListCtrl', ['$scope', 'UserService', function($scope, service) {

        var vm = $scope;

        vm.users = [];

        vm.remove = remove;

        list();

        function list() {

            service.list().then(function(d) {
                console.log(d);
                vm.users = d;
            }, function(errResponse) {
                console.error('Error while list users');
            });
        }

        function remove(id) {

            service.remove(id).then(function(resp) {
                if (resp === true) {
                    //删除成功
                    alert('删除成功');
                    list();
                }
            }, function() {
                console.log('Error while add');
            });
        }

    }]);
})
