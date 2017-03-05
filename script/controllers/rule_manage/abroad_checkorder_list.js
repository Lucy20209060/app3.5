define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('AbroadCheckOrderCtrl', ['$scope', 'AbroadCheckOrderService', '$log', '$timeout', 'oms', 'ModalService', '$state', function($scope, service, $log, $timeout, oms, ModalService, $state) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {
            'ruleSences': [{"key":"0","value":"全部"},{"key":"2","value":"订单推送"},{"key":"1","value":"订单导入"}],

            'fields':[{"key":"name","value":"规则名称","display":true},{"key":"sceneDesc","value":"适用场景","display":true},{"key":"remark","value":"规则描述","display":true},{"key":"isValid","value":"是否有效","display":true},{"key":"updateTime","value":"更新时间","display":true},],

            'isValid': [{"key":"1","value":"有效"},{"key":"0","value":"无效"}],

            'page_size_options':[5,10,20,50],
        };

        var paras = {

            pageCount : 0,
            
            search : {
                pageSize : 10,
                pageNum : 1,
                name:'', // 规则名称
                sceneDesc:'' // 适用场景
            }
        };
        
        //数据
        vm.data = [];

        //查询条件
        vm.paras = paras;

        //配置
        vm.config = config;

        //加载状态
        vm.isLoading = true;

        //执行搜索
        vm.list = list;

        // 删除审单规则
        vm.deleteCheck = deleteCheck;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.isValid_hash = oms.hash(config.isValid, 'key', 'value');
            config.ruleSences_hash = oms.hash(config.ruleSences, 'key', 'value');
        }

        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {
            var obj = paras.search,
                search_arr = [] , 
                pagination = tableState.pagination;

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.pageSize = pagination.number;

            for (var i in obj){
                if(obj[i] !== '') search_arr.push( i + '=' + obj[i] );
            }

            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集，关区值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data){
            var isValid_hash = config.isValid_hash;
            for(var i in data){
                data[i]['isValid'] = data[i]['isValid'] != undefined ? isValid_hash[ data[i]['isValid'] ] : 'unknow';
                data[i]['sceneDesc'] = data[i]['sceneDesc'] != undefined ? config.ruleSences_hash[ data[i]['sceneDesc'] ] : 'unknow';
            }
            return data;
        }

        /**
         * 执行查询
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function list(tableState) {

            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);

            service.ruleList(getParas(tableState)).then(function(resp) {

                vm.data = afterList(resp.list);

                tableState.pagination.numberOfPages = resp.pages;

                vm.paras.pageCount = resp.total;

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });

            $timeout.cancel(loadingTimeout);
            vm.isLoading = false;
        }

        /**
         * 删除审单规则
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function deleteCheck(items) {

            if (items.length != 0) {
                var ids = {ids: items};
                loadingTimeout = $timeout(function() {
                   vm.isLoading = true;
                }, loadingLatency);
                service.deleteCheck(ids).then(function(resp) {

                    var response = resp.returnCode;

                    if (response == 0) {
                        ModalService.open({
                            "title": "提示",
                            "content": "删除成功",
                            "alert": true,
                        }).then(function(modal) {
                            modal.close.then(function(result) {
                                $state.reload();
                            })
                        });
                    }
                    else {
                        oms.alert("删除失败，请重试");
                    }

                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            }
            else {
                oms.alert("请先选择审单规则项！");
            }
        }

    }]);

})
