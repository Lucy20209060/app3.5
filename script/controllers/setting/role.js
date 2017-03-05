define(['app'], function(app) {

    app.filter("str_valid", function() {
        return function(input) {
            return input ? '有效' : '无效';
        }
    });

    return app.controller('RoleCtrl', ['$scope', 'RoleService', '$timeout', 'oms','ModalService', function($scope, service, $timeout, oms,ModalService) {

        var vm = $scope;

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var config = {
            'fields': [
                { "key": "name", "value": "角色名称", "display": true },
                { "key": "bcCode", "value": "所属公司", "display": true },
                { "key": "isValid", "value": "状态", "display": true },
                { "key": "remark", "value": "角色备注", "display": true },
            ],
            'area': [],

            'page_size_options': [5, 10, 20, 50]
        };

        var paras = {

            pageCount: 0,

            search: {
                pageSize: 10,
                pageNum: 1,
                name: '' //角色名称
            },

            checkall: false
        };

        vm.isLoading = true;

        vm.data = [];

        vm.paras = paras;

        vm.config = config;

        vm.list = list;

        vm.remove = remove;


        function list(tableState) {
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            service.list(getParas(tableState)).then(function(resp) {
                paras.checkall = false;

                $timeout.cancel(loadingTimeout);

                vm.data = setData(resp.list);

                tableState.pagination.numberOfPages = resp.pages;

                vm.paras.pageCount = resp.total;

                vm.isLoading = false;

            }, function(resp) {
                console.error('Error list');
            });
        }

        function remove(items) {
            if(items.length){
                vm.isLoading = true;
                service.remove( items.join(',')).then(function(resp) {
                    if(!resp.returnCode){
                        oms.notify('操作完成');
                        oms.reload();
                    }else{
                        oms.alert(resp.returnMsg);
                    }
                    vm.isLoading = false;
                }, function(resp) {
                    oms.notify('操作失败，请重试','error');
                    vm.isLoading = false;
                })
            }else{
                oms.alert('请选择要删除的角色');
            }
        }

        function setData(d) {
            for (var i in d) {
                d[i].isValid = d[i].isValid ? '有效' : '无效';
            }
            return d;
        }

        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {
            var getSorts = function(obj) {
                var ret = [],
                    value, state = ['', 'asc', 'desc'];
                for (var i in obj) {
                    value = obj[i];
                    if (value != 0) {
                        ret.push(i + ' ' + state[obj[i]]);
                    }

                }
                return ret.join(",");
            }

            var obj = paras.search,
                search_arr = [],
                pagination = tableState.pagination;

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.pageSize = pagination.number;
            obj.orders = getSorts(tableState.sort);

            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }

            return search_arr.join('&');
        }
    }]);
})
