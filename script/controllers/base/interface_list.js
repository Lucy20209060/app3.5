define(['app'], function(app) {

    return app.controller('interfaceListCtrl', ['$scope', 'InterfaceManageService', 'oms', '$log', '$timeout', '$uibModal', '$state', 'ModalService', function($scope, service, oms, $log, $timeout, $uibModal, $state, ModalService) {

       	var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var config = {
            'fields': [{ "key": "id", "value": "接口编号", "display": true },{ "key": "interfaceName", "value": "接口名称", "display": true }, { "key": "interfaceType", "value": "接口类型", "display": true }, { "key": "direction", "value": "接口方向", "display": true }, { "key": "fromSystem", "value": "来源系统", "display": true }, { "key": "toSystem", "value": "目标系统",  "display": true }, { "key": "targetUrl", "value": "目标地址", "display": false },{ "key": "notifyUrl", "value": "通知地址", "display": false }, { "key": "businessType", "value": "业务名称", "display": false }, { "key": "handleMaxNum", "value": "允许处理最大次数", "display": true }, { "key": "priority", "value": "优先级", "display": true }, { "key": "enabled", "value": "是否有效",  "display": true }],
            // 接口类型
            'interfaceType': [{ "key": "1", "value": "内部系统"}, { "key": "2", "value": "商家接口"}, { "key": "3", "value": "快递接口"}, { "key": "4", "value": "WMS接口"}, { "key": "5", "value": "海关接口"}],
            // 接口方向
            'direction': [{ "key": "", "value": "全部"},{ "key": "INPUT", "value": "INPUT"}, { "key": "OUTPUT", "value": "OUTPUT"}],
            // 是否有效
            'enabled': [{ "key": "1", "value": "是"},{ "key": "2", "value": "否"}],
            // 每页显示数量
            'page_size_options': [5, 10, 20, 50]
        };

        var paras = {
            pageCount: 0,

            search: {
                interfaceName: '', // 接口名称
                direction: '', // 接口方向
                businessType: '', // 方法名称
                fromSystem: '', // 来源系统
                toSystem: '', // 目标系统
                interfaceType: '', // 接口类型
                enabled: '1', // 是否有效
                pageSize: 10,
                pageNum: 1
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

        //删除
        vm.remove = remove;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.fields_hash = oms.hash(config.fields);
            config.interfaceType_hash = oms.hash(config.interfaceType ,'key','value');
            config.enabled_hash = oms.hash(config.enabled ,'key','value');
            // 在控制台打印key代表的value
            // console.log(config.enabled_hash);
        }

        /**
         * 查询
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function list(tableState) {

            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            service.interfaceList(getParas(tableState)).then(function(resp) {

                paras.checkall = false;

                $timeout.cancel(loadingTimeout);

                vm.data = afterList(resp.list);

                tableState.pagination.numberOfPages = resp.pages;

                vm.paras.pageCount = resp.total;

                vm.isLoading = false;
            });
        }       
        //批量删除
        function remove(items) {
            if (items.length == 0) {
                oms.alert("请先选择需要删除的接口");
            }
            else {
                var id = {id: items};
                service.remove(id).then(function(resp) {
                    if(!resp.returnCode){
                        oms.alert('删除成功');
                        $state.reload();
                    }else{
                        oms.alert(resp.returnVal);
                    }
                }, function(resp) {
                    oms.alert('删除失败，请重试');
                })
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
                search_arr = [],
                pagination = tableState.pagination;

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.pageSize = pagination.number;

            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }

            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集，包括关区 和 状态 的值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            // status 状态码转换
            var interfaceType_hash = config.interfaceType_hash;
            var enabled_hash = config.enabled_hash;
            for (var i in data) {
                data[i]['checked'] = false;
                data[i]['interfaceType'] = data[i]['interfaceType'] ? interfaceType_hash[ data[i]['interfaceType'] ] : 'unknow';
                data[i]['enabled'] = data[i]['enabled'] ? enabled_hash[ data[i]['enabled'] ] : 'unknow';
            }
            return data;
        }

    }]);
})