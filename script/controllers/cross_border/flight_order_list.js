// define(['app', 'ui.bootstrap'], function(app) {
define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('flightOrderListCtrl', ['$scope', 'flightSettingManage', '$log', '$timeout', 'oms', 'ModalService', '$state', function($scope, service, $log, $timeout, oms, ModalService, $state) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {
            'status': [{"key":"","value":"全部"},{"key":"0","value":"未设置"},{"key":"1","value":"已设置"}],

            'fields':[{"key":"busOrderNo","value":"订单号","display":true},{"key":"handoverNo","value":"快递交接单号","display":true},{"key":"warehouseName","value":"仓库","display":true},{"key":"createTime","value":"创建时间","display":true},{"key":"omsOrderNo","value":"OMS订单号","display":true},{"key":"payAmount","value":"实付金额","display":true},{"key":"clearPort","value":"清关口岸","display":false},{"key":"clearType","value":"清关方式","display":false},{"key":"shopName","value":"店铺名称","display":false},{"key":"province","value":"收件省","display":false},{"key":"city","value":"收件市","display":false},{"key":"busName","value":"商家名称","display":false},{"key":"goodsAmount","value":"商品金额","display":false},{"key":"weight","value":"称重重量","display":false},{"key":"goodsNum","value":"商品数量","display":false},{"key":"state","value":"设置状态","display":true}],

            'logisticsCom': [{"key":"TTPH","value":"天天盘海"}],
            'wareHouse': [{"key":"DG","value":"沙田仓"}],
            'clearPorts': [{"key":"","value":"全部"},{"key":"东莞","value":"东莞"},{"key":"郴州","value":"郴州"}],
            'clearTypes': [{"key":"","value":"全部"},{"key":"BC直邮","value":"BC直邮"},{"key":"个人物品","value":"个人物品"}],

            'carryWay': [{"key":"1","value":"空运"},{"key":"2","value":"陆运"}],
            'destinatyPort': [{"key":"HZ-POST","value":"杭州POST"},{"key":"HZ-EXPRESS","value":"杭州EXPRESS"},{"key":"GZ-POST","value":"广州POST"},{"key":"GZ-EXPRESS","value":"广州EXPRESS"}],

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
                pageSize : 5,
                pageNum : 1,
                state:'', // 是否已设置
                warehouseCode:'DG', // 仓库代码
                logisticsCode:'TTPH', // 快递公司代码
                handoverNo:'', // 交接单号
                startTime:'',
                endTime:'',
                clearPort:'',
                clearType:'',
                busName:'',
                omsOrderNo:'',
                busOrderNo:'',
                payAmountMin:'',
                payAmountMax:'',
                goodsAmountMin:'',
                goodsAmountMax:'',
                weightMin:'',
                weightMax:'',
                goodsNumMin:'',
                goodsNumMax:'',
                province:'',
                city:''
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

        vm.toggle = toggle;

        // get cities
        vm.getCity = getCity;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.set_status = oms.hash(config.status, 'key', 'value');
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);

            service.getProvince().then(function(resp) {

                config.province = resp.returnVal;

                config.province_hash = oms.hash(config.province, 'name', 'id');

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });

            $timeout.cancel(loadingTimeout);
            vm.isLoading = false;
        }

        function getCity() {
            var provinceName = paras.search.province;
            var provinceId = config.province_hash[provinceName];
            var provinceStr = {provinceID: provinceId};
    
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);

            service.getCity(provinceStr).then(function(resp) {

                config.city = resp.returnVal; 

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });

            $timeout.cancel(loadingTimeout);
            vm.isLoading = false;
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

            obj.startTime = data_range.startDate ? data_range.startDate.format(config.date_range_options.format) : '';
            obj.endTime   = data_range.endDate ? data_range.endDate.format(config.date_range_options.format) :'';


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
            for(var i in data) {
                data[i].checked = false;
                data[i].clearPort = data[i].clearPort == 'DG' ? '东莞' : '郴州';
                data[i].clearType = data[i].clearType == 'BC' ? 'BC直邮' : '个人物品';
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

            service.orderList(getParas(tableState)).then(function(resp) {

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
            paras.search.state = '', // 是否已设置
            paras.search.warehouseCode = 'DG', // 仓库代码
            paras.search.logisticsCode = 'TTPH', // 快递公司代码
            paras.search.handoverNo = '', // 交接单号
            paras.search.startTime = '',
            paras.search.endTime = '',
            paras.search.clearPort = '',
            paras.search.clearType = '',
            paras.search.busName = '',
            paras.search.omsOrderNo = '',
            paras.search.busOrderNo = '',
            paras.search.payAmountMin = '',
            paras.search.payAmountMax = '',
            paras.search.goodsAmountMin = '',
            paras.search.goodsAmountMax = '',
            paras.search.weightMin = '',
            paras.search.weightMax = '',
            paras.search.goodsNumMin = '',
            paras.search.goodsNumMax = '',
            paras.search.province = '',
            paras.search.city = ''
            paras.searchDate = {
                startDate : null,
                endDate : null
            }

            paras.searchQuickDate = '';
            setDateRange();
        }

        function toggle(){
            vm.otherSearch = !vm.otherSearch;
            var ele = document.getElementById("otSearch");
            if(vm.otherSearch == true){
                ele.style.display = "block";
            }
            else{
                ele.style.display = "none";
            }
        }

        function fix0(v) {
            return (v < 9) ? ('0' + v) : v;
        }

        /**
         * 航班设置弹框
         * @param  {[type]} row   [description]
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        vm.openAdd = function(item) {

            // console.log(item);
            if (item.length == 0) {
                oms.alert("请先选择未设置航班的快递单");
            }
            else {
                var param = {
                    warehouseCode:'DG', // 仓库代码
                    logisticsCode:'TTPH', // 快递公司代码
                    omsOrderNos: item,
                    carrierWay: '2',
                    destinationPort: '',
                    flightNumber: '',
                    mainNumber: '',
                    flightTime: '',
                    landingTime: '',
                    saucerCode: '',
                    saucerWeight: ''
                };
                openModel();
            }
            
            // 打开弹框以及数据处理
            function openModel() {
                ModalService.open({
                    'template': 'example.html',
                    'carrierWay': config.carryWay,
                    'destinationPort': config.destinatyPort,
                    'param': param,
                    'isStart': false,
                    'isEnd': false,
                    'openCalendar': function(e, data, item) {
                        // do sth...
                        e.preventDefault();
                        e.stopPropagation();
                        if (item == 0) {
                            data.isStart = true;
                        }
                        else {
                            data.isEnd = true;
                        }
                    }
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        // 点击确定按钮
                        if (result) {
                            var data = modal.scope.data;
                            var params = data.param;
                            function getTime(item){
                                var forDate = item;
                                var formatDate = forDate.getFullYear() + '-' +
                                                fix0(forDate.getMonth() + 1) + '-' +
                                                fix0(forDate.getDate()) + ' ' +
                                                fix0(forDate.getHours()) + ':' +
                                                fix0(forDate.getMinutes()) + ':' +
                                                fix0(forDate.getSeconds())
                                return formatDate;
                            }
                            function compareTime(date1, date2) {
                                date1 = date1.replace(/\-/gi,"/");
                                date2 = date2.replace(/\-/gi,"/");
                                var time1 = new Date(date1).getTime();
                                var time2 = new Date(date2).getTime();
                                if(time1 > time2){
                                    return 1;
                                }else if(time1 == time2){
                                    return 2;
                                }else{
                                    return 3;
                                }
                            }

                            var startTime = getTime(params.flightTime);
                            var endTime = getTime(params.landingTime);
                            var comEnd = compareTime(startTime, endTime);

                            if (comEnd == 3) {
                                params.flightTime = startTime;
                                params.landingTime = endTime;
                                ModalService.open({
                                    "title": "提示",
                                    "content": "确认将设置的航班信息发送给快递公司？",
                                    "alert": false,
                                }).then(function(modal) {
                                    modal.close.then(function(result) {
                                        if (result) {
                                            return service.orderFlight(params).then(function(response) {
                                                var resps = response.returnCode;
                                                if (resps == 0 || resps == '0') {
                                                    ModalService.open({
                                                        "title": "提示",
                                                        "content": "设置成功",
                                                        "alert": true,
                                                    }).then(function(modal) {
                                                        modal.close.then(function(result) {
                                                            if (result) {
                                                                $state.reload();
                                                            } 
                                                        })
                                                    });
                                                }
                                                else {
                                                    oms.alert(response.returnMsg);
                                                }
                                            });
                                        }
                                        else {
                                            ModalService.open({
                                                "title": "提示",
                                                "content": "取消后填写的内容将无法保存，确认取消吗？",
                                                "alert": false,
                                            }).then(function(modal) {
                                                modal.close.then(function(result) {
                                                    if (result) {
                                                        oms.alert("取消成功");
                                                    }
                                                    else {
                                                        return;
                                                    }
                                                })
                                            });
                                        }
                                    })
                                });
                            }
                            else {
                                oms.alert("航班落地时间不能晚于航班起飞时间！");
                            }
                            
                        }
                    })
                });
            }
        };
    }]);

})
