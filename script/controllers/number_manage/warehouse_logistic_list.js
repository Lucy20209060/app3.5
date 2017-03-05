define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('warehouseLogisticListCtrl', ['$scope', 'numberManage', '$log', '$timeout', 'oms', 'ModalService', '$state', function($scope, service, $log, $timeout, oms, ModalService, $state) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {

            'fields':[{"key":"warehouseName","value":"仓库名称","display":true},{"key":"logisticsName","value":"快递名称","display":true},{"key":"logisticsCode","value":"快递代码","display":true},{"key":"siteName","value":"网点名称","display":true},{"key":"account","value":"客户名称","display":true},{"key":"hasTax","value":"是否含税","display":true},{"key":"createTime","value":"创建时间","display":true},{"key":"isValid","value":"是否有效","display":true},{"key":"taxPercent","value":"税率","display":false},{"key":"appKey","value":"APP_KEY","display":false},{"key":"operator","value":"运营联系人","display":false},{"key":"operatorPhone","value":"运营电话","display":false},{"key":"handleMan","value":"操作联系人","display":false},{"key":"handlePhone","value":"操作电话","display":false},{"key":"techniqueMan","value":"技术联系人","display":false},{"key":"techniquePhone","value":"技术电话","display":false},{"key":"financeMan","value":"财务联系人","display":false},{"key":"financePhone","value":"财务电话","display":false},{"key":"businessMan","value":"商务联系人","display":false},{"key":"businessPhone","value":"商务电话","display":false},{"key":"billSendAddr","value":"账单寄送地址","display":false},{"key":"companyName","value":"单位名称","display":false},{"key":"ticketAddress","value":"住址","display":false},{"key":"ticketBank","value":"开户行","display":false},{"key":"ticketZipCode","value":"邮编","display":false},{"key":"ticketPhone","value":"电话","display":false},{"key":"ticketBankNo","value":"账号","display":false},{"key":"ticketTaxNo","value":"税号","display":false},{"key":"customsRecordNo","value":"海关备案号","display":false},{"key":"mailType","value":"运单类型","display":false}],

            'isValid': [{"key":"true","value":"有效"},{"key":"false","value":"无效"}],

            'isTax': [{"key":"true","value":"含税"},{"key":"false","value":"不含税"}],

            'page_size_options':[5,10,20,50],
        };

        var paras = {

            pageCount : 0,
            
            search : {
                pageSize : 10,
                pageNum : 1,
                warehouseName:'', // 仓库名称
                logisticsName:'', // 快递名称
                logisticsCode:'' // 快递代码
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
        vm.deleteSite = deleteSite;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.isValid_hash = oms.hash(config.isValid, 'key', 'value');
            config.isTax_hash = oms.hash(config.isTax, 'key', 'value');
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
            var isTax_hash = config.isTax_hash;
            for(var i in data){
                data[i]['isValid'] = data[i]['isValid'] != undefined ? isValid_hash[ data[i]['isValid'] ] : '未知';
                data[i]['hasTax'] = data[i]['hasTax'] != undefined ? isTax_hash[ data[i]['hasTax'] ] : '未知';
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

            service.getSites(getParas(tableState)).then(function(resp) {

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
        function deleteSite(items) {

            if (items.length != 0) {
                var ids = {ids: items};
                loadingTimeout = $timeout(function() {
                   vm.isLoading = true;
                }, loadingLatency);
                service.deleteSite(ids).then(function(resp) {

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
