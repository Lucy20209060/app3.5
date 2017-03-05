define(['app'], function(app) {

    return app.controller('customerListCtrl', ['$scope', 'customerManage', 'oms', '$log', '$timeout', '$uibModal', '$state', 'ModalService', '$rootScope', function($scope, service, oms, $log, $timeout, $uibModal, $state, ModalService, $rootScope) {

       	var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var config = {
            'fields': [{ "key": "id", "value": "ID", "display": true },{ "key": "name", "value": "商家名称", "display": true }, { "key": "code", "value": "商家编码", "display": true }, { "key": "address", "value": "所在地", "display": true }, { "key": "companyDesc", "value": "商家简介", "display": true }, { "key": "creater", "value": "创建人",  "display": false }, { "key": "createTime", "value": "创建时间",  "display": true }, { "key": "isValid", "value": "商家状态",  "display": true }, { "key": "wmsCode", "value": "WMS编码",  "display": false }, { "key": "tpSystemName", "value": "使用系统",  "display": false }, { "key": "appKey", "value": "APP_KEY",  "display": false }, { "key": "secretKey", "value": "SECRET_KEY",  "display": false }, { "key": "country", "value": "国家", "display": false },{ "key": "province", "value": "省份", "display": false }, { "key": "city", "value": "城市", "display": false }, { "key": "district", "value": "区域", "display": false }, { "key": "zipCode", "value": "邮编",  "display": false }, { "key": "editor", "value": "编辑人",  "display": false }, { "key": "updateTime", "value": "编辑时间",  "display": false }],

            'page_size_options': [5, 10, 20, 50],

            'isValid': [{ "key": "", "value": "全部"},{ "key": "1", "value": "激活"},{ "key": "0", "value": "禁用"}],
        };

        // 取缓存数据
        var firstIn = 0;
        var sessionSearch = sessionStorage.getItem("customer_list");
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
        if (sessionSearch && $rootScope.referrer && $rootScope.referrer.name == "app.customer_detail") {
            var name = rePick(sessionSearch, 'name'),
                code = rePick(sessionSearch, 'code'),
                isValid = rePick(sessionSearch, 'isValid'),
                pageSize = rePick(sessionSearch, 'pageSize'),
                pageNum = rePick(sessionSearch, 'pageNum');
        }
        else {
            var name = '',
                code = '',
                isValid = '',
                pageSize = 10,
                pageNum = 1;
        }

        var paras = {

            pageCount: 0,

            search: {
                name: name, //商品中文名
                code: code,
                isValid: isValid,
                pageSize: pageSize,
                pageNum: pageNum
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

        //重置
        vm.reset = reset;

        //删除
        vm.remove = remove;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.fields_hash = oms.hash(config.fields);
            config.isValid_hash = oms.hash(config.isValid ,'key','value');
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

            service.list(getParas(tableState)).then(function(resp) {

                paras.checkall = false;

                $timeout.cancel(loadingTimeout);

                vm.data = afterList(resp.list);

                tableState.pagination.numberOfPages = resp.pages;
                tableState.pagination.start = resp.pageSize * (resp.pageNum - 1) ;
                vm.paras.pageCount = resp.total;

                vm.isLoading = false;
            });
        }

        /**
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset() {
            paras.search.name = '';
            paras.search.code = '';
            paras.search.isValid = '';
        }


        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {
            sessionStorage.removeItem("customer_list");
            var getSorts = function(obj) {
                var ret = [],
                    value, state = ['', 'asc', 'desc'];
                for (var i in obj) {
                    value = obj[i];
                    if (value != 0) {
                        ret.push(i + ' ' + state[obj[i]]);
                    }
                }
                return ret.join(",");
            }

            var obj = paras.search,
                search_arr = [],
                pagination = tableState.pagination;

            if (firstIn == 0) {
                obj.pageNum = obj.pageNum;
            }
            else {
                obj.pageNum = pagination.start / pagination.number + 1;
            }

            obj.pageSize = pagination.number;
            obj.orders = getSorts(tableState.sort);

            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }
            firstIn ++;
            sessionStorage.setItem("customer_list", search_arr.join('&'));
            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集，包括关区 和 状态 的值转换
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            // status 状态码转换
            var isValid_hash = config.isValid_hash;
            for (var i in data) {
                data[i]['isValid'] = data[i]['isValid'] != 2 ? isValid_hash[ data[i]['isValid'] ] : 'unknow';
            }
            return data;
        }

        function remove(item) {
            console.log(item)
            if (!item.length) {
                oms.alert("已禁用的商家不能再删除，请选择要禁用的商家！");
            }
            else {
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                    vm.isLoading = true;
                }, loadingLatency);

                service.delete(item).then(function(resp) {

                    if (resp.returnCode == 0) {
                        // 删除页面上的数据
                        ModalService.open({
                            "title":"",
                            "content":"删除成功",
                            "alert":true,
                        }).then(function(modal) {
                            modal.close.then(function(result) {
                                $state.reload();
                            })
                        }); 
                    }

                    $timeout.cancel(loadingTimeout);

                    vm.isLoading = false;
                });
            }
        }

    }]);
})