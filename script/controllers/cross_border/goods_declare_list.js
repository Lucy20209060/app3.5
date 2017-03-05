// define(['app', 'ui.bootstrap'], function(app) {
define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('GoodsDeclareListCtrl', ['$scope', 'GoodsDeclareService', '$log','$timeout' ,'oms', '$state', 'ModalService', '$rootScope', function($scope, service, $log, $timeout, oms, $state, ModalService, $rootScope) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;


        var config = {
            'status': [{"key":"","value":"全部"},{"key":"订单新建","value":"订单新建"},{"key":"订单审核","value":"订单审核"},{"key":"订单待分配","value":"订单待分配"},{"key":"分配完成","value":"分配完成"},{"key":"装箱完成","value":"装箱完成"},{"key":"订单完成","value":"订单完成"},{"key":"库存不足","value":"库存不足"},{"key":"国检审核未过","value":"国检审核未过"},{"key":"海关单证审核未过","value":"海关单证审核未过"},{"key":"海关查验未过","value":"海关查验未过"},{"key":"审核失败","value":"审核失败"},{"key":"订单关闭","value":"订单关闭"},{"key":"身份认证失败","value":"身份认证失败"},{"key":"申报支付单失败","value":"申报支付单失败"},{"key":"推送WMS失败","value":"推送WMS失败"},{"key":"发送海关失败","value":"发送海关失败"},{"key":"海关退单","value":"海关退单"},{"key":"扣留","value":"扣留"},{"key":"退运","value":"退运"}],
            
            'fields':[{"key":"id","value":"ID","display":true},{"key":"orderNo","value":"订单号","display":true},{"key":"busOrderNo","value":"商家订单号","sort":1,"display":false},{"key":"customerName","value":"商家名称","display":true},{"key":"mftNo","value":"申报单号","sort":1,"display":true},{"key":"dealDate","value":"下单时间","sort":1,"display":true},{"key":"createTime","value":"创建时间","sort":1,"display":true},{"key":"payment","value":"实付金额","sort":1,"display":true},{"key":"taxAmount","value":"税额","display":false},{"key":"buyerAccount","value":"买家账号","display":false},{"key":"declareStatus","value":"申报状态","display":false}],

            'page_size_options':[5,10,20,50],
            'date_range_options':{
                format: "YYYY-MM-DD",
                locale:{
                    applyLabel: '确定',
                    cancelLabel: '取消',
                }
            }
            // 'create_date_range_options':{
            //     format: "YYYY-MM-DD",
            //     locale:{
            //         applyLabel: '确定',
            //         cancelLabel: '取消',
            //     }
            // }
        };

        // 取缓存数据
        var firstIn = 0;
        var sessionSearch = sessionStorage.getItem("goods_declear");
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
        if (sessionSearch && $rootScope.referrer && $rootScope.referrer.name == "app.goods_declare_detail") {
            var declareStatus = rePick(sessionSearch, 'declareStatus'),
                customArea = rePick(sessionSearch, 'customArea'),
                orderNo = rePick(sessionSearch, 'orderNo'),
                bcode = rePick(sessionSearch, 'bcode'),
                mftNo = rePick(sessionSearch, 'mftNo'),
                hgCode = rePick(sessionSearch, 'hgCode'),
                searchQuickDate = rePick(sessionSearch, 'searchQuickDate'),
                searchQuickCreateDate = rePick(sessionSearch, 'searchQuickCreateDate'),
                pageSize = rePick(sessionSearch, 'pageSize'),
                pageNum = rePick(sessionSearch, 'pageNum'),
                orders = rePick(sessionSearch, 'orders'),
                startTime = rePick(sessionSearch, 'startTime'),
                endTime = rePick(sessionSearch, 'endTime'),
                createStartDate = rePick(sessionSearch, 'createStartDate'),
                createEndDate = rePick(sessionSearch, 'createEndDate'),
                startDate1 = rePick(sessionSearch, 'startTime'),
                endDate1 = rePick(sessionSearch, 'endTime');
                startDate2 = rePick(sessionSearch, 'createStartDate'),
                endDate2 = rePick(sessionSearch, 'createEndDate');
        }
        else {
            var declareStatus = '',
                customArea = '',
                orderNo = '',
                bcode = '',
                mftNo = '',
                hgCode = '',
                searchQuickDate = '',
                searchQuickCreateDate = '',
                pageSize = 10,
                pageNum = 1,
                orders = '',
                startTime = '',
                endTime = '',
                createStartDate = '',
                createEndDate = '',
                startDate1 = null,
                endDate1 = null;
                startDate2 = null,
                endDate2 = null;
        }
        var searchDate = {
                                startDate: startDate1,
                                endDate: endDate1
                            },
            searchCreateDate = {
                                startDate: startDate2,
                                endDate: endDate2
                            };

        var paras = {
            searchDate:searchDate,
            searchCreateDate:searchCreateDate,

            searchQuickDate: searchQuickDate,
            searchQuickCreateDate: searchQuickCreateDate,

            pageCount : 0,
            
            search : {
                pageSize: pageSize,
                pageNum: pageNum,
                declareStatus: declareStatus,
                customArea: customArea,
                orderNo: orderNo,
                bcode: bcode,
                mftNo: mftNo,
                startTime: startTime,      //下单时间开始
                endTime: endTime,        //下单时间结束
                createStartDate: '',    //创建时间开始
                createEndDate: '',      //创建时间结束
                orders: orders,
                hgCode: hgCode
            } 
        };

        // 第一次进入页面读取快速时间选择的缓存
        if (firstIn == 0) {
            if (paras.searchQuickDate != '') {
                setDateRange();
            }
            if (paras.searchQuickCreateDate != '') {
                setCreateDateRange();
            }
        }
        
        //数据
        vm.data = [];

        vm.firstIn = firstIn;

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

        //快速设置创建时间范围
        vm.setCreateDateRange = setCreateDateRange;

        // 切换关区
        vm.changeCustom = changeCustom;

        //重置
        vm.reset = reset;

        // 取消订单
        vm.removeOrder = removeOrder;

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init(callback) {

            if(config.customs_hash && config.area_hash){
                callback && callback();
            }else{
                config.fields_hash  = oms.hash(config.fields);

                oms.config('customs','area').then(function(resp) {
                    var customs = resp[0] , area = resp[1];
                    if (customs && customs.length && area && area.length) {
                        config.customs = [].concat(customs);
                        config.customs_hash = oms.hash(customs,'key','value');
                        paras.search.hgCode = paras.search.hgCode != '' ? paras.search.hgCode : config.customs[0].key;
                        paras.hgName = config.customs_hash[paras.search.hgCode];

                        config.area = [{"key":"","value":"全部"}].concat(area);
                        config.area_hash = oms.hash(resp);

                        callback && callback();
                        
                    }
                    else {
                        oms.notify('加载关区发生错误，请重试', 'error');
                    }
                }); 
            }
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

        function setCreateDateRange(){
            var tmp = parseInt(paras.searchQuickCreateDate);
            if(isNaN(tmp)){
                paras.searchCreateDate = {
                    startDate: null,
                    endDate: null
                }
            }else{
                paras.searchCreateDate = {
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
            // 清除所有的session
            sessionStorage.removeItem("goods_declear");
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

            var obj = paras.search,
                search_arr = [] , 
                pagination = tableState.pagination,
                data_range = paras.searchDate;
                create_data_range = paras.searchCreateDate;

            // 第一次进入页面读取页码的缓存

            if (firstIn == 0) {
                obj.pageNum = obj.pageNum;
                obj.orders = obj.orders;
                if (paras.searchQuickDate != '') {
                    obj.startTime = data_range.startDate ? data_range.startDate.format(config.date_range_options.format) : '';
                    obj.endTime   = data_range.endDate ? data_range.endDate.format(config.date_range_options.format) :'';
                }
                else if (obj.startTime != '') {
                    obj.startTime = obj.startTime;
                    obj.endTime = obj.endTime;
                    data_range.startDate = moment(obj.startTime);
                    data_range.endDate = moment(obj.endTime);
                }
                if (paras.searchQuickCreateDate != '') {
                    obj.createStartDate = create_data_range.startDate ? create_data_range.startDate.format(config.date_range_options.format) : '';
                    obj.createEndDate   = create_data_range.endDate ? create_data_range.endDate.format(config.date_range_options.format) :'';
                }
                else if (obj.createEndDate != '') {
                    obj.createStartDate = obj.createStartDate;
                    obj.createEndDate = obj.createEndDate;
                    create_data_range.startDate = moment(obj.createStartDate);
                    create_data_range.endDate = moment(obj.createEndDate);
                }
            }
            else {
                obj.pageNum = pagination.start / pagination.number + 1;
                obj.orders = getSorts(tableState.sort);
                obj.startTime = data_range.startDate ? data_range.startDate.format(config.date_range_options.format) : '';
                obj.endTime   = data_range.endDate ? data_range.endDate.format(config.date_range_options.format) :'';

                obj.createStartDate = create_data_range.startDate ? create_data_range.startDate.format(config.date_range_options.format) : '';
                obj.createEndDate   = create_data_range.endDate ? create_data_range.endDate.format(config.date_range_options.format) :'';
            }

            obj.pageSize = pagination.number;

            for (var i in obj){
                if(obj[i] !== '') {
                    search_arr.push( i + '=' + obj[i] );
                }
            }
            firstIn ++;
            var sessionStr = search_arr.join('&') + '&searchQuickDate=' + paras.searchQuickDate + '&searchQuickCreateDate=' + paras.searchQuickCreateDate;
            sessionStorage.setItem("goods_declear", sessionStr);
            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集，关区值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data){
            // status 状态码转换
            var area_hash = config.area_hash;
            for(var i in data){
                data[i]['customArea'] = data[i]['customArea'] ? area_hash[ data[i]['customArea'] ] : 'unknow';
            }
            return data;
        }

        //切换关区
        function changeCustom(v){
            paras.search.hgCode = v;
            paras.hgName = config.customs_hash[v];
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

                service.list(getParas(tableState)).then(function(resp) {

                    $timeout.cancel(loadingTimeout);

                    vm.data = afterList( resp.list );

                    tableState.pagination.numberOfPages = resp.pages;
                    tableState.pagination.start = resp.pageSize * (resp.pageNum - 1) ;
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
            paras.search.orderNo = '';
            paras.search.bcode = '';
            paras.search.mftNo = '';
            paras.search.declareStatus = '';
            paras.search.customArea = '';
            paras.search.startTime = '';
            paras.search.endTime = '';
            paras.search.createStartDate = '';
            paras.search.createEndDate = '';

            paras.searchDate = {
                startDate : null,
                endDate : null
            }

            paras.searchCreateDate = {
                createStartDate : null,
                createEndDate : null
            }

            paras.searchQuickDate = '';
            setDateRange();

            paras.searchQuickCreateDate = '';
            setCreateDateRange();
        }

        /**
         * 取消订单
         * @return {[type]} [description]
         */
        function removeOrder(item) {
            var items = {ids:item};
            if (item.length == 0) {
                oms.alert("请先选择订单");
            }
            else {
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                   vm.isLoading = true;
                }, loadingLatency);

                service.removeOrder(items).then(function(resp) {
                    if (resp.returnCode == 0) {
                        ModalService.open({
                            "title": "",
                            "content": resp.returnMsg,
                            "alert": true,
                        }).then(function(modal) {
                            modal.close.then(function(result) {
                                $state.reload();
                            })
                        });
                    }
                    else {
                        oms.alert("请求失败，请检查网络");
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                })
            }
        }
    }]);

})
