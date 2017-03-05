// define(['app', 'ui.bootstrap'], function(app) {
define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('ExceptionOrderListCtrl', ['$scope', 'GoodsDeclareService', '$log','$timeout' ,'oms', '$state', 'ModalService', '$rootScope', function($scope, service, $log, $timeout, oms, $state, ModalService, $rootScope) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {
            'dealType': [{"key":"","value":"全部"},{"key":"0","value":"未处理"},{"key":"2","value":"已关闭"}],

            'fields':[{"key":"busOrderNo","value":"订单号","display":true},{"key":"warehouseName","value":"仓库","display":true},{"key":"customerName","value":"客户名称","display":true},{"key":"expType","value":"异常类型","display":true},{"key":"mftNo","value":"申报单号","display":true},{"key":"dealDate","value":"下单时间","display":true},{"key":"amount","value":"实付金额","display":true},{"key":"taxAmount","value":"税额","display":true},{"key":"buyerAccount","value":"买家账号","display":true}],

            'page_size_options':[5,10,20,50],
            'date_range_options':{
                format: "YYYY-MM-DD",
                locale:{
                    applyLabel: '确定',
                    cancelLabel: '取消',
                }
            }
        };

        // 取缓存数据
        var sessionSearch = sessionStorage.getItem("goods_order");
        // 解析表达式
        function rePick(str, name) {
            var theRequest = [];    
            var strs = str.split("&");   
            var getName;
            for(var i = 0; i < strs.length; i ++) {
                if (strs[i].split("=")[0] == name) {
                    return unescape(strs[i].split("=")[1]);
                }      
            }  
            return '';   
        } 
        if (sessionSearch && $rootScope.referrer && ($rootScope.referrer.name == "app.goods_declare_detail" || $rootScope.referrer.name == "app.goods_declare_edit")) {
            var busOrderNo = rePick(sessionSearch, 'busOrderNo');
                customerName = rePick(sessionSearch, 'customerName');
                mftNo = rePick(sessionSearch, 'mftNo');
                expType = rePick(sessionSearch, 'expType');
                handleStatus = rePick(sessionSearch, 'handleStatus');
                searchQuickDate = rePick(sessionSearch, 'searchQuickDate');
                pageSize = rePick(sessionSearch, 'pageSize');
                pageNum = rePick(sessionSearch, 'pageNum');
                warehouseName = rePick(sessionSearch, 'warehouseName');
                startDate = rePick(sessionSearch, 'startDate'),
                endDate = rePick(sessionSearch, 'endDate'),
                startDate1 = rePick(sessionSearch, 'startDate'),
                endDate1 = rePick(sessionSearch, 'endDate'),
                searchQuickDate = rePick(sessionSearch, 'searchQuickDate');
        }
        else {
            var busOrderNo = '';
                customerName = '';
                mftNo = '';
                expType = '';
                handleStatus = '0';
                searchQuickDate = '';
                pageSize = 10;
                pageNum = 1;
                warehouseName = '';
                startDate = '',
                endDate = '',
                startDate1 = null,
                endDate1 = null,
                searchQuickDate = '';
        }
        var firstIn = 0;

        var searchDate = {
                                startDate: startDate1,
                                endDate: endDate1
                            };

        var paras = {
            searchDate:searchDate,
            searchQuickDate:searchQuickDate,

            pageCount : 0,
            
            
            search: {
                pageSize : pageSize,
                pageNum : pageNum,
                busOrderNo: busOrderNo,
                customerName: customerName,
                mftNo: mftNo,
                startDate:startDate,
                endDate:endDate,
                expType: expType,
                handleStatus: handleStatus,
                warehouseName: warehouseName
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

        // 切换关区
        vm.changeCustom = changeCustom;

        //重置
        vm.reset = reset;

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init(callback) {
            if(config.customs_hash && config.exceptionType_hash){
                callback && callback();
            }else{
                config.fields_hash  = oms.hash(config.fields);

                oms.config('customs').then(function(resp) {
                    var customs = resp;
                    config.customs = [].concat(customs);
                    config.customs_hash = oms.hash(customs,'key','value');
                    paras.search.warehouseName = paras.search.warehouseName != '' ? paras.search.warehouseName : config.customs[0].key;
                    paras.warehouseName = config.customs_hash[paras.search.warehouseName];
                    getType(callback);
                }); 
            }
        }

        function getType(callback) {
            service.exceptionTypes().then(function(resp) {
                var exceptionType = resp.returnVal;
                    objs = [];
                    for (var i in exceptionType) {
                        var obj = { 'key': exceptionType[i].k, 'value': exceptionType[i].memo }
                        objs.push(obj);
                    }
                config.exceptionType = [{"key":"","value":"全部"}].concat(objs);
                config.exceptionType_hash = oms.hash(config.exceptionType,'key','value');
                callback && callback();
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while exceptionType!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
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
        // 第一次进入页面读取快速时间选择的缓存
        if (firstIn == 0) {
            if (paras.searchQuickDate != '') {
                setDateRange();
            }
        }

        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {
            // 清除所有的session
            sessionStorage.removeItem("goods_order");

            var obj = paras.search,
                search_arr = [] , 
                pagination = tableState.pagination,
                data_range = paras.searchDate;

            // 第一次进入页面读取页码的缓存
            if (firstIn == 0) {
                obj.pageNum = obj.pageNum;
                if (paras.searchQuickDate != '') {
                    obj.startDate = data_range.startDate ? data_range.startDate.format(config.date_range_options.format) : '';
                    obj.endDate   = data_range.endDate ? data_range.endDate.format(config.date_range_options.format) :'';
                }
                else if (obj.startDate != '') {
                    obj.startDate = obj.startDate;
                    obj.endDate = obj.endDate;
                    data_range.startDate = moment(obj.startDate);
                    data_range.endDate = moment(obj.endDate);
                }
            }
            else {
                obj.pageNum = pagination.start / pagination.number + 1;
                obj.startDate = data_range.startDate ? data_range.startDate.format(config.date_range_options.format) : '';
                obj.endDate   = data_range.endDate ? data_range.endDate.format(config.date_range_options.format) :'';
            }
            obj.pageSize = pagination.number;

            for (var i in obj){
                if(obj[i] !== '') {
                    search_arr.push( i + '=' + obj[i] );
                }
            }
            sessionStorage.setItem("goods_order", search_arr.join('&') + '&searchQuickDate=' + paras.searchQuickDate);
            firstIn ++;
            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集，关区值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data){
            // status 状态码转换
            var exceptionType_hash = config.exceptionType_hash;
            for(var i in data){
                if (exceptionType_hash) {
                    data[i]['expType'] = data[i]['expType'] ? exceptionType_hash[ data[i]['expType'] ] : 'unknow';
                }
            }
            return data;
        }

        //切换关区
        function changeCustom(v){
            paras.search.warehouseName = v;
            paras.warehouseName = config.customs_hash[v];
        }

        /**
         * 执行查询
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function list(tableState) {
            init(function(){
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                   vm.isLoading = true;
                }, loadingLatency);

                service.expOrderList(getParas(tableState)).then(function(resp) {

                    $timeout.cancel(loadingTimeout);

                    vm.data = afterList( resp.list );
                    vm.data =  resp.list;
                    tableState.pagination.start = resp.pageSize * (resp.pageNum - 1) ;
                    tableState.pagination.numberOfPages = resp.pages;

                    vm.paras.pageCount = resp.total;

                    vm.isLoading = false;
                });
            })
        }

        /**
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset(){
            paras.search.busOrderNo = '';
            paras.search.mftNo = '';
            paras.search.customerName = '';
            paras.search.customArea = '';
            paras.search.startDate = '';
            paras.search.endDate = '';
            paras.search.expType = '',
            paras.search.handleStatus = '0',
            paras.searchDate = {
                startDate : null,
                endDate : null
            }

            paras.searchQuickDate = '';
            setDateRange();
        }

    }]);

})
