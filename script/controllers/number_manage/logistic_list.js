define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('logisticSettingListCtrl', ['$scope', 'numberManage', '$log', '$timeout', 'oms', 'ModalService', '$state', function($scope, service, $log, $timeout, oms, ModalService, $state) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {
            'ruleSences': [{"key":"","value":"全部"},{"key":"接口推送","value":"接口推送"},{"key":"导单","value":"导单"}],

            'fields':[{"key":"logisticsName","value":"快递名称","display":true},{"key":"logisticsCode","value":"快递代码","display":true},{"key":"mailFetchType","value":"单号获取方式","display":true}],

            'isValid': [{"key":"pool","value":"号段池"},{"key":"sole","value":"一单一取"}],

            'page_size_options':[5,10,20,50],
        };

        var paras = {

            pageCount : 0,
            
            search : {
                pageSize : 10,
                pageNum : 1,
                name:'', // 规则名称
                code:'' // 适用场景
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
        vm.deleteLogistic = deleteLogistic;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.isValid_hash = oms.hash(config.isValid, 'key', 'value');
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
                data[i]['mailFetchType'] = data[i]['mailFetchType'] != undefined ? isValid_hash[ data[i]['mailFetchType'] ] : 'unknow';
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

            service.getLogistic(getParas(tableState)).then(function(resp) {

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
        function deleteLogistic(items) {

            if (items.length != 0) {
                var ids = {ids: items};
                loadingTimeout = $timeout(function() {
                   vm.isLoading = true;
                }, loadingLatency);
                service.deleteLogistic(ids).then(function(resp) {

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
                    else if (response == -5) {
                        ModalService.open({
                            "title": "提示",
                            "content": "部分快递公司存在网店，未删除成功",
                            "alert": true,
                        }).then(function(modal) {
                            modal.close.then(function(result) {
                                $state.reload();
                            })
                        });
                    }
                    else{
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
