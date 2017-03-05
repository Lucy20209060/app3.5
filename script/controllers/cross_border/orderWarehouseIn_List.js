/**
 * Created by lsy on 2016/7/25.
 * 入库单列表
 */
define(['app','moment'], function(app,moment) {


    return app.controller('orderWarehouseInListCtrl', ['$scope', 'orderWarehouseInService', '$log','$timeout','oms',
        function($scope, service, $log ,$timeout,oms ) {

        var loadingLatency = oms.options.loadingLatency || 100 , loadingTimeout;

        var vm = $scope;

        $scope.customArea = {'重庆海关':'cqc','沙田海关':'dgc'}

        //vm.status ={"10":"入库成功","11":"入库失败","1":"尚未入库"}
        //vm.status = {'1':'待推送','2':'待入库','3':'推送成功','4':'推送失败',"10":"入库成功","11":"入库失败","1":"尚未入库"}
        var config = {

            'fields':[{"key":"id","value":"ID","display":true,"sort":1},{"key":"orderEntryNo","value":"入库单号","display":true},
                      {"key":"customArea","value":"关区","display":true},{"key":"predictDate","value":"预计到货时间","sort":1,"display":true},
                      {"key":"customerName","value":"商家名称","display":true},{"key":"qty","value":"商品数量","sort":1,"display":true},
                      {'key':'status','value':'状态',"display":true},{'key':'createTime','value':'创建时间','display':'true'},
                      {'key':'toCustomTime','value':'审核时间'}, {'key':'shelfTime','value':'上架时间'},
                      {'key':'toWmsTime','value':'推送wms时间'}],

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

            status: [{"key":"","value":"全部"},{"key":"新建","value":"新建"},{"key":"审核中","value":"审核中"},{"key":"审核成功","value":"审核成功"},
                {"key":"收货完成","value":"收货完成"}, {"key":"上架完成","value":"上架完成"},{"key":"入库单取消","value":"入库单取消"},{"key":"审核失败","value":"审核失败"},],
            search : {
                pageSize : 5,
                pageNum : 1,
                customArea:'',
                customerName:'',
                orderEnterNo:'',
                startTime:'',
                endTime:'',
                orders:'',
                status:'',
                //hgCode:'',//海关编码
            }

        };

        //数据
        vm.data = [];

        //查询条件
        vm.paras = paras;

        //    状态查询列表
        vm.status = status;

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
            config.fields_hash  = oms.hash(config.fields);
            vm.status_hash  = oms.hash(vm.status);
/*
            oms.config('customs').then(function(resp) {
                config.customs = [].concat(resp);
                config.customs_hash = oms.hash(resp);
                paras.search.hgCode = config.customs[0].key;
                paras.hgName = config.customs[0].value;
            });
*/

            oms.config('area' , true).then(function(resp) {
                config.area = [{"key":"","value":"全部"}].concat(resp);
                config.area_hash = oms.hash(resp,'value');
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

            var obj = paras.search,
                search_arr = [] ,
                pagination = tableState.pagination;

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.pageSize = pagination.number;
            obj.orders = getSorts(tableState.sort);

            if(paras.searchDate.startDate && paras.searchDate.endDate){
                obj.startTime = paras.searchDate.startDate.format(config.date_range_options.format);
                obj.endTime   = paras.searchDate.endDate.format(config.date_range_options.format);
            }
            else{
                obj.startTime = "";
                obj.endTime   = "";
            }

            for (var i in obj){
                if(obj[i] !== '') search_arr.push( i + '=' + obj[i] );
            }

            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集，包括关区 和 状态 的值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data){
            // status 状态码转换
            var status_hash = vm.status_hash, area_hash = config.area_hash;
            for(var i in data){
                //data[i]['Status'] = status_hash[ data[i]['Status'] ];
                //data[i]['customAreas'] = data[i]['customAreas'] ? area_hash[ data[i]['customAreas'] ] : 'unknow';
                data[i]['customCode'] = data[i]['customArea'] ? area_hash[data[i]['customArea']].raw['customCode'].toLowerCase(): '';
            }
            return data;
        }
       /* //切换关区
        function changeCustom(v){
            paras.search.hgCode = v;
            paras.hgName = config.changeCustom_hash[v];
        }
*/
        /**
         * 执行查询
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function list(tableState) {

            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                vm.isLoading = false;
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
        function reset(){
            //paras.search.orderNo = '';
            paras.search.customerName = '';
            paras.search.orderEnterNo = '';
            //paras.search.declareStatus = '';
            paras.search.customArea = '';
            paras.search.startTime = '';
            paras.search.endTime = '';

            paras.searchQuickDate = '';
            setDateRange();
        }
    }]);

})

