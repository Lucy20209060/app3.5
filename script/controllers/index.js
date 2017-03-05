define(['app','layout'], function(app,layout) {

    return app.controller('IndexCtrl', ['$scope','$rootScope','$document','AuthService','Session' ,'IndexService',
        function($scope,$rootScope,$document, auth , session , service) {

        var vm = $scope;

        vm.userDrop = false;

        vm.isLoading = true;

        vm.dropDown = function() {
            vm.userDrop = !$scope.userDrop;
        }

        vm.signout = signout;
 

        function signout(){
            auth.signout();
        }

        function init(){
            auth.init().then(function(resp){

                if(!resp.returnCode){
                    if(resp.returnVal){
                        vm.menu = setMenu(resp.returnVal);
                        vm.data = session.get();
                        document.title = "NR OMS";
                    }
                    vm.isLoading = false;
                }
                setTimeout(function(){
                    layout();
                },100)
            },function(){
                console.log('error');
            });

        }

        function setMenu(data){
            data.sort(function(a,b){
                if(a.level == b.level){
                    return a.orderIndex > b.orderIndex ? 1 : -1;
                }else{
                    return a.level > b.level ? 1 : -1;
                }
            });

            var obj = {}
            for(var i in data){
                var cur = data[i],
                    id = cur.id , 
                    parent = cur.parentId;

                if( parent && obj[parent]){
                    if( !obj[parent]['children'] ){
                        obj[parent]['children'] = [cur];
                    }else{
                        obj[parent]['children'].push( cur )
                    }
                }
                else{
                   obj[id] = cur;
                }
            }

            return angular.copy(obj);
        }

        init();
       /* //ng-Tip
        $scope.ngTip = ngTip;
        vm.openTip = function(){
            ngTip.tip('tip message here','success');
        };*/
    }]);
})
