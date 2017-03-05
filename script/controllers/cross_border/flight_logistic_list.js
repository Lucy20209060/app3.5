// define(['app', 'ui.bootstrap'], function(app) {
define(['app','moment'], function(app,moment) {
    // modal button method
    
    return app.controller('flightLogisticListCtrl', ['$scope', 'flightSettingManage', '$log', '$timeout', 'oms', 'ModalService', '$state', function($scope, service, $log, $timeout, oms, ModalService, $state) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        var config = {
            'status': [{"key":"","value":"全部"},{"key":"0","value":"未设置"},{"key":"1","value":"已设置"}],

            'fields':[{"key":"handoverNo","value":"快递交接单号","display":true},{"key":"warehouseName","value":"仓库","display":true},{"key":"logisticsName","value":"快递公司","display":true},{"key":"createTime","value":"创建时间","display":true},{"key":"state","value":"状态","display":true}],

            'logisticsCom': [{"key":"TTPH","value":"天天盘海"}],
            'wareHouse': [{"key":"DG","value":"沙田仓"}],

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

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.set_status = oms.hash(config.status, 'key', 'value');
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

            service.logisticList(getParas(tableState)).then(function(resp) {

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
            paras.search.warehouseCode = '';
            paras.search.handoverNo = '';
            paras.search.logisticsCode = '';
            paras.search.state = '';
            paras.search.startTime = '';
            paras.search.endTime = '';

            paras.searchDate = {
                startDate : null,
                endDate : null
            }

            paras.searchQuickDate = '';
            setDateRange();
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
                oms.alert("请先选择未设置航班快递交接单");
            }
            else {
                var param = {
                    warehouseCode:'DG', // 仓库代码
                    logisticsCode:'TTPH', // 快递公司代码
                    handoverNos: item,
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
                            function getTime(item) {
                                var forDate = item;
                                var formatDate = forDate.getFullYear() + '-' +
                                                fix0(forDate.getMonth() + 1) + '-' +
                                                fix0(forDate.getDate()) + ' ' +
                                                fix0(forDate.getHours()) + ':' +
                                                fix0(forDate.getMinutes()) + ':' +
                                                fix0(forDate.getSeconds());
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
                                            return service.logisticFlight(params).then(function(response) {
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
