define(['app'], function(app) {


    return app.controller('UsersListCtrl', ['$scope', 'UserService','$log','oms','$timeout','$state', 'ModalService', function($scope, service,$log,oms,$timeout,$state, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;
        //获取选中的行ID数组
        vm.selected = [];
        vm.isValid = {'1':'有效','0':'无效'};
        var config = {
            'isValid': [{"key":"1","value":"有效"},{"key":"0","value":"无效 "}],
            'page_size_options':[5,10,20,50]
        };

        var paras = {
            pageCount: 0,
            pageSize: 5,
            pageNum: 1,

            searchMap: {
                account: '',
                name: '',
                phone: '',
                isValid: ''
            },

            checkall : false
        }

        vm.isLoading = false;

        //数据
        vm.data = [];

        //查询条件
        vm.paras = paras;

        //配置
        vm.config = config;
        //执行搜索
        vm.list = list;

        //删除
        vm.remove = remove;

        //重置
        vm.reset = reset;

        //重置密码
        vm.reset_account = reset_account;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.fields_hash  = oms.hash(config.fields);
            config.isValid_hash  = oms.hash(config.status);
        }

        /**
         * 选中checkbox
         * @return {[type]} [description]
         */
        vm.handler = (function(){
            function toggle(){
                var isCheck = paras.checkall ;
                // console.log(isCheck)
                for(var i in vm.data){
                    vm.data[i]['checked'] = isCheck;
                    // selectedId.push(vm.data[i].id);
                }
            }


            function check(){
                for(var i in vm.data){
                    if( !vm.data[i]['checked'] ) {
                        paras.checkall = false;
                        return;
                    }
                }
                paras.checkall = true;
            }

            return {'toggle':toggle , 'check' : check}
        }());

        function getSelect(){
            var selectedId = [];
            for(var i in vm.data){
                if(vm.data[i]['checked']){
                    selectedId.push(vm.data[i].id);
                } 
            }
            selectedId = selectedId.toString();
            return selectedId;
        }

        /*
         * 移除 批量移除
         * @return {[type]} [description]
         */
        function remove(){
            if (getSelect().length) {
                ModalService.open({
                    "title":"",
                    "content":"确定删除选中用户么？",
                    "alert":false,
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        if (result) {
                            $timeout.cancel(loadingTimeout);

                            loadingTimeout = $timeout(function() {
                                vm.isLoading = true;
                            }, loadingLatency);

                            console.log(getSelect());

                            service.remove(getSelect()).then(function(resp) {

                                paras.checkall = false;

                                if (resp.returnCode == 0) {
                                    // 删除页面上的数据
                                    ModalService.open({
                                        "title":"",
                                        "content":"删除成功",
                                        "alert":true,
                                    }).then(function(modal) {
                                        modal.close.then(function(result) {
                                            $state.reload();
                                        })
                                    }); 
                                }

                                $timeout.cancel(loadingTimeout);

                                vm.isLoading = false;
                            });
                        }
                    })
                }); 
            }
            else {
                // alert("请选择要删除的商家");
                ModalService.open({
                    "title":"",
                    "content":"请选择要删除的用户",
                    "alert":true,
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        /**/
                    })
                }); 
            }
        }

        /**
         * 重置用户密码
         */
        function reset_account(items){
            if (items.length) {
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                    vm.isLoading = true;
                }, loadingLatency);
                service.reset(items.join(',')).then(function(resp) {

                    if (resp.returnCode == 0) {
                        $timeout.cancel(loadingTimeout);
                        vm.isLoading = false;
                        oms.notify("重置成功");
                    }
                });
            }
            else {
                oms.alert("请选择要重置密码的账号");
            }
        }
        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {

            var getSorts = function(obj){
                var ret = [] , value , state = ['','asc','desc'];
                for(var i in obj){
                    value = obj[i];
                    if(value != 0){
                        ret.push(  i + ' ' + state[obj[i]] );
                    }
                }
                return ret.join(",");
            }

            var obj = paras.searchMap,
            //var obj = {searchMap:paras.searchMap},
                search_arr = [] ,
                pagination = tableState.pagination;

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.pageSize = pagination.number;

            return obj;
        }

        /**
         * 格式化返回的结果集 状态 的值转换
         */
        function afterList(data){
            return data;
        }

        /**
         * 执行查询
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function list(tableState) {

            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            service.list(getParas(tableState)).then(function(resp) {

                $timeout.cancel(loadingTimeout);

                vm.data = afterList( resp.list );
                tableState.pagination.numberOfPages = resp.pages;

                vm.paras.pageCount = resp.total;

                vm.isLoading = false;
            });
        }

        /**
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset() {
            paras.searchMap.account = '';
            paras.searchMap.name = '';
            paras.searchMap.phone = '';
            paras.searchMap.isValid = '';
        }
    }]);
})
