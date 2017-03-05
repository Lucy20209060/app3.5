 // define(['app', 'ui.bootstrap'], function(app) {
define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('notificationMessageListCtrl', ['$scope', 'notificationManage', '$log', '$timeout', 'oms', 'ModalService', '$state', function($scope, service, $log, $timeout, oms, ModalService, $state) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {
            'status': [{"key":"","value":"全部"},{"key":"1","value":"通知成功"},{"key":"2","value":"通知失败"}],

            'fields':[{"key":"id","value":"交接单号","display":false},{"key":"businessType","value":"业务类型","display":true},{"key":"customerCode","value":"商家名称","display":true},{"key":"businessNo","value":"业务单号","display":true},{"key":"notifyUrl","value":"通知地址","display":true},{"key":"notify","value":"通知内容","display":true},{"key":"updateTime","value":"最后通知时间","display":true},{"key":"notifyAffirm","value":"状态","display":true}],

            'firmWay': [{"key":"2","value":"取消通知"},{"key":"5","value":"物流节点通知"}],

            'page_size_options':[5,10,20,50],
            'date_range_options':{
                format: "YYYY-MM-DD",
                locale:{
                    applyLabel: '确定',
                    cancelLabel: '取消',
                }
            }
        };

        var paras = {
            searchDate:{startDate: null,endDate: null},
            searchQuickDate:'',

            pageCount : 0,
            
            search : {
                pageSize : 10,
                pageNum : 1,
                pushStatus:'2', // 状态
                businessType:'', // 业务类型
                customerName:'', // 商家名称
                businessNo:'', // 业务单号
                pushStartDate:'',
                pushEndDate:'',
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

        //快速设置时间范围
        vm.setDateRange = setDateRange;

        //重置
        vm.reset = reset;

        // 重新推送
        vm.rePost = rePost;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.businessType_hash = oms.hash(config.firmWay, 'key', 'value');
            config.notifyAffirm_hash = oms.hash(config.status, 'key', 'value');
        }

        /**
         * 响应选择日期
         */
        function setDateRange(){
            var tmp = parseInt(paras.searchQuickDate);
            if(isNaN(tmp)){
                paras.searchDate = {
                    startDate: null,
                    endDate: null
                }
            }else{
               
                paras.searchDate = {
                    startDate: moment().subtract(tmp, "days"),
                    endDate: moment()
                }
            }
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
                pagination = tableState.pagination,
                data_range = paras.searchDate;

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.pageSize = pagination.number;
            // obj.orders = getSorts(tableState.sort);

            obj.pushStartDate = data_range.startDate ? data_range.startDate.format(config.date_range_options.format) : '';
            obj.pushEndDate   = data_range.endDate ? data_range.endDate.format(config.date_range_options.format) :'';


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
            var businessType_hash = config.businessType_hash;
            var notifyAffirm_hash = config.notifyAffirm_hash;
            for(var i in data){
                data[i].checked = false;
                data[i]['businessType'] = data[i]['businessType'] ? businessType_hash[ data[i]['businessType'] ] : 'unknow';
                data[i]['notifyAffirm'] = data[i]['notifyAffirm'] ? notifyAffirm_hash[ data[i]['notifyAffirm'] ] : 'unknow';
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

            service.messageList(getParas(tableState)).then(function(resp) {

                vm.data = afterList( resp.list );

                tableState.pagination.numberOfPages = resp.pages;

                vm.paras.pageCount = resp.total;

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });

            $timeout.cancel(loadingTimeout);
            vm.isLoading = false;
        }

        /**
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset(){
            paras.search.pushStatus = '2';
            paras.search.businessType = '';
            paras.search.customerName = '';
            paras.search.businessNo = '';
            paras.search.pushStartDate = '';
            paras.search.pushEndDate = '';

            paras.searchDate = {
                startDate : null,
                endDate : null
            }

            paras.searchQuickDate = '';
            setDateRange();
        }

        /**
         * 重新推送
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function rePost(item) {

        	if (item.length == 0) {
        		oms.alert("请先选择需要重新推送的单号！");
        	}
        	else {
                var parms = {id: item};
        		loadingTimeout = $timeout(function() {
	               vm.isLoading = true;
	            }, loadingLatency);

	            service.rePost(parms).then(function(resp) {

	                if (resp.returnCode == 0) {
                        ModalService.open({
                            "title": "",
                            "content": "推送成功",
                            "alert": true,
                        }).then(function(modal) {
                            modal.close.then(function(result) {
                                $state.reload();
                            })
                        });
                    }
                    else {
                        oms.alert(resp.returnMsg);
                    }

	                $timeout.cancel(loadingTimeout);
	                vm.isLoading = false;
	            });
        	}
        }

    }]);

})
