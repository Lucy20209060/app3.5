define(['app'], function(app) {

    app.directive('treeChange', ['oms',function(oms) {
        var filter = function(o, key){
            var ret = {};
            var root = [];
            var obj = angular.copy(o);
            //初步过滤
            for (var i in obj) {
                
                if( obj[i].name.indexOf(key) != -1 || obj[i].level == 1 ){
                    ret[obj[i].id] = obj[i];
                };
            }

            //建树
            for (var i in ret) {
                var pid = ret[i]['parentId'],
                    id = ret[i]['id'];
                if (pid == 0) {
                    root.push(ret[i]);
                } else {
                    if (ret[pid]) {
                        if (!ret[pid]['children']) {
                            ret[pid]['children'] = [];
                        }
                        ret[pid]['children'].push(ret[i]);
                    }
                }
            }
            for (var i = root.length - 1; i >= 0; i--) {
                if(!root[i].children || root[i].children.length == 0){
                    if(root[i].name.indexOf(key) == -1) 
                        root.splice(i,1);
                }
            }
            return root;
        }

        return {
            restrict: 'A',
            link: function($scope, element, attr) {
                //var options = JSON.parse(attr('treeChange'));
                function create(key){
                    $scope.permission = filter($scope.page.permission , key)
                }

                element.on('input',function(e){
                    var key = this.value;
                    if(/^[a-zA-Z\'\s]+$/.test(key) == false){
                        create(key);
                        $scope.$apply();
                    }
                })
                
            }
        };
    }]);

    return app.controller('PermissionCtrl', ['$scope', 'PermissionService', 'oms', '$timeout', '$state',  function($scope, service, oms, $timeout,$state) {

        var vm = $scope;

        var permission_hash = {};

        var data = {};

        var atom = [];

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var isCreate = false;

        vm.permission = [];

        vm.data = data;

        vm.select = select;

        vm.update = update;

        vm.create = create;

        vm.remove = remove;

        vm.isLoading = true;

        isCreate = false;

        vm.page = { 
            title: '新增',
            perType : [
                { 'id' : 1 , 'label':'菜单'},
                { 'id' : 2 , 'label':'功能模块'},
                { 'id' : 3 , 'label':'仓库'},
                { 'id' : 4 , 'label':'电商公司'},
                { 'id' : 5 , 'label':'店铺'},
            ],
            defaultPerType:1,
            atom:[],
            query:'',
            permission:[]
        };


        init();

        function initData(d) {
            d.sort(function(a, b) {
                if (a.level == b.level) {
                    return a.orderIndex > b.orderIndex ? 1 : -1;
                } else {
                    return a.level > b.level ? 1 : -1;
                }
            });

            for (var i in d) {
                permission_hash[d[i].id] = d[i];
            }

            vm.page.permission = d;//oms.tree(angular.copy(d);
            vm.page.permission[0].checked = true;

            vm.permission = oms.tree(angular.copy(d));
            select(vm.page.permission[0].id);
        }

        function getData() {
            var ops = [];
            for (var i in atom) {
                if (atom[i].hit) ops.push(atom[i].code);
            }
            var paras = angular.copy(vm.data);
            paras.permissions = ops.join(',');
            return paras;
        }

        function init() {
            oms.config('atom').then(function(resp) {
                atom = resp.returnVal;
                service.list().then(function(resp) {
                if(resp.returnVal)
                    initData(resp.returnVal);
                    vm.page.query = '';
                    vm.isLoading = false;
                });
            });
        }

        function update() {
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            if (isCreate) {
                service.create(getData()).then(function(resp) {
                    if (!resp.returnCode) {
                        oms.notify('保存成功');
                        init();
                    }else{
                        alert(resp.returnMsg);
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            } else {
                service.update(getData()).then(function(resp) {
                    if (!resp.returnCode) {
                        oms.notify('保存成功');
                    }else{
                        oms.notify(resp.returnMsg);
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            }
        }


        function create(mode) {
            isCreate = true;
            setDefaultData(mode)
        }

        function remove(result){
            if(!isCreate && data && result){
                loadingTimeout = $timeout(function() {
                    vm.isLoading = true;
                }, loadingLatency);
                service.remove(data.id).then(function(resp) {
                    if (!resp.returnCode) {
                        oms.notify('删除成功');
                        init();
                    }else{
                        oms.alert(resp.returnMsg);
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            }
        }

        function setDefaultData(mode) {

            var d = {
                name: '',
                code: '',
                url: '',
                level: 1,
                parentId: 0,
                orderIndex: 1,
                permissions: '*',
                isValid: 1,
                remark: ''
            }
            //新增同级权限
            if(mode == 0){
                d.parentId = data.parentId;
                d.level = data.level;
            }
            //新增下级权限
            else{
                d.parentId = data.id;
                d.level = data.level + 1;
            }

            for (var i in atom) {
                atom[i].hit = true;
            }

            vm.data = d;
            vm.page.atom = atom;
            vm.page.title = '新增';
        }

        function select(id) {
            data = permission_hash[id];

            var ops = data.permissions;
            if (ops != '*') {
                ops = ops.split(',');
            }

            //重置权限
            for (var i in atom) {
                atom[i].hit = ops == '*' ? true : (ops.indexOf(atom[i].code) != -1);
            }

            isCreate = false;
            vm.data = data;
            vm.page.atom = atom;
            vm.page.title = '编辑';
        }

    }]);
})
