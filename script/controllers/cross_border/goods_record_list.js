// define(['app', 'ui.bootstrap'], function(app) {
define(['app', 'moment'], function(app, moment) {
    // modal button method

    return app.controller('GoodsRecordListCtrl', ['$scope','$rootScope' ,'GoodsRecordService', 'oms', '$log', '$timeout', function($scope,$rootScope, service, oms, $log, $timeout) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        // 取缓存数据
        var sessionSearch = sessionStorage.getItem("goods_record");
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
        if (sessionSearch && $rootScope.referrer && $rootScope.referrer.name == "app.goods_record_detail") {
            var productId = rePick(sessionSearch, 'productId');
                name = rePick(sessionSearch, 'name');
                barCode = rePick(sessionSearch, 'barCode');
                hgCode = rePick(sessionSearch, 'hgCode');
                status = rePick(sessionSearch, 'status');
                pageSize = rePick(sessionSearch, 'pageSize');
                pageNum = rePick(sessionSearch, 'pageNum');
                orders = rePick(sessionSearch, 'orders')
        }
        else {
            var productId = '';
                name = '';
                barCode = '';
                hgCode = '';
                status = '';
                pageSize = 10;
                pageNum = 1;
                orders = '';
        }
        var firstIn = 0;

        var page = {
            fields: [{ "key": "id", "value": "ID", "display": true, 'sort': 1 }, { "key": "productId", "value": "货号", "display": true }, { "key": "name", "value": "商品名称", "sort": 1, "display": true },
                { "key": "dsSkuCode", "value": "商品条码", "display": true }, { "key": "customCode", "value": "备案海关", "display": true },{ "key": "statusDesc", "value": "商品状态", "display": true }, { "key": "nameEn", "value": "英文名称", "display": false },
                { "key": "shelfLife", "value": "有效期", "display": true }, { "key": "inBoundLifeDays", "value": "入库效期", "display": false }, { "key": "outBoundLifeDays", "value": "出库效期", "display": false },
                { "key": "goodsSpec", "value": "商品规格", "display": false }, { "key": "gproduction", "value": "原产国", "display": false }, { "key": "brand", "value": "品牌", "sort": 1, "display": false },
                { "key": "property", "value": "规格型号", "display": false }, { "key": "price", "value": "单价", "sort": 1, "display": false }, { "key": "currency", "value": "币制", "sort": 1, "display": false },
                { "key": "declareUnit", "value": "申报单位", "display": false }, { "key": "legalQty", "value": "第一单位数量", "display": false }, { "key": "secondQty", "value": "第二单位数量", "display": false },
                { "key": "skuLength", "value": "长", "display": false }, { "key": "skuWidth", "value": "宽", "display": false }, { "key": "skuHeight", "value": "高", "display": false },
                { "key": "skuCube", "value": "体积", "display": false }, { "key": "grossWeight", "value": "毛重", "display": true }, { "key": "weight", "value": "净重", "display": false },
                { "key": "tare", "value": "皮重", "display": false }, { "key": "foamWeight", "value": "泡重", "display": false }, { "key": "cycleClass", "value": "保存等级", "display": true },
                { "key": "remark", "value": "单位(次)", "display": false }, { "key": "inAreaUnit", "value": "单位(次)", "display": false }, { "key": "unit", "value": "单位", "display": false }, { "key": "shelfLifeType", "value": "有效期管理类型", "display": false }, { "key": "shelfLifeFlag", "value": "有效期标识", "display": false }, { "key": "shelfLifeAlertDays", "value": "失效期预警", "display": false }
            ],

            status: [{"key":"","value":"全部"},{"key":"草稿","value":"草稿"},{"key":"审核中","value":"审核中"},{"key":"备案成功","value":"备案成功"},{"key":"备案失败","value":"备案失败"}],

            page_size_options: [5, 10, 20, 50],

            pageCount: 0,

            search: {
                pageSize: pageSize,
                pageNum: pageNum,
                productId: productId, //商品货号
                name: name, //商品中文名
                barCode: barCode, //商品条码
                hgCode: hgCode, //海关编码
                orders: orders,
                status: status //状态查询
            },

            isLoading: true,

            checkall: false
        };

        vm.page = page;

        //数据
        vm.data = [];

        //执行搜索
        vm.list = list;

        vm.toCustom = toCustom;
        
        vm.toInternational = toInternational;

        vm.updateGoods = updateGoods;
        //重置
        vm.reset = reset;

        vm.changeCustom = changeCustom;

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init(callback) {
            if (!page.hgName) {
                oms.config('customs').then(function(resp) {
                    if (resp && resp.length) {
                        page.customs = [].concat(resp);
                        page.customs_hash = oms.hash(resp, 'key', 'value');
                        page.search.hgCode = page.search.hgCode != '' ? page.search.hgCode : resp[0].key;
                        page.hgName = page.customs_hash[page.search.hgCode];
                        callback && callback();
                    } else {
                        oms.notify('加载关区发生错误，请重试', 'error');
                    }
                });
            }else{
                callback && callback();
            }
        }

        /**
         * 获取提交参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         * TODO orderBy 没有加入
         */
        function getParas(tableState) {
            sessionStorage.removeItem("goods_record");
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

            var obj = page.search,
                search_arr = [],
                pagination = tableState.pagination;

            if (firstIn == 0) {
                obj.pageNum = obj.pageNum;
                obj.orders = obj.orders;
            }
            else {
                obj.pageNum = pagination.start / pagination.number + 1;
                obj.orders = getSorts(tableState.sort);
            }
            obj.pageSize = pagination.number;

            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }
            firstIn ++;
            sessionStorage.setItem("goods_record", search_arr.join('&'));
            return search_arr.join('&');
        }

        /**
         * 查询
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function list(tableState) {
            init(function() {
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                    vm.page.isLoading = true;
                }, loadingLatency);

                service.list(getParas(tableState)).then(function(resp) {

                    page.checkall = false;

                    $timeout.cancel(loadingTimeout);

                    vm.data = afterList(resp.list);

                    tableState.pagination.numberOfPages = resp.pages;
                    tableState.pagination.start = resp.pageSize * (resp.pageNum - 1) ;
                    vm.page.pageCount = resp.total;

                    vm.page.isLoading = false;

                });
            })
        }

        //批量推送至海关
        function toCustom(items) {
            if(items.length){
                vm.isLoading = true;
                service.toCustom( items.join(',')).then(function(resp) {
                    if(!resp.returnCode){
                        oms.notify('操作完成');
                    }else{
                        oms.alert(resp.returnMsg);
                    }
                    vm.isLoading = false;
                }, function(resp) {
                    oms.notify('操作失败，请重试','error');
                    vm.isLoading = false;
                })
            }else{
                // oms.alert('当前商品正在审核或未选择数据！');
                oms.alert('请先选择商品数据！');
            }
            // oms.reload();
        }

        //更新备案商品
        function updateGoods(goods) {
            if(goods.length){
                vm.isLoading = true;
                service.updateGoods( goods.join(',')).then(function(resp) {
                    if(!resp.returnCode){
                        oms.notify('操作完成');
                    }else{
                        oms.alert(resp.returnMsg);
                    }
                    vm.isLoading = false;
                }, function(resp) {
                    oms.notify('操作失败，请重试','error');
                    vm.isLoading = false;
                })
            }else{
                oms.alert('请先选择商品数据！');
            }
            oms.reload();
        }

        //批量推送至国际物流
        function toInternational(type) {
            if(type.length){
                vm.isLoading = true;
                service.toInternational( type.join(',')).then(function(resp) {
                    if(!resp.returnCode){
                        oms.notify('操作完成');
                    }else{
                        oms.alert(resp.returnMsg);
                    }
                    vm.isLoading = false;
                }, function(resp) {
                    oms.notify('操作失败，请重试','error');
                    vm.isLoading = false;
                })
            }else{
                oms.alert('请先选择商品数据！');
            }
            oms.reload();
        }

        /**
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset() {
            page.search.productId = '';
            page.search.name = '';
            page.search.barCode = '';
            page.search.status = '';
        }

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            for (var i in data) {
                data[i]['checked'] = false;
            }
            return data;
        }

        //切换关区
        function changeCustom(v) {
            page.search.hgCode = v;
            page.hgName = page.customs_hash[v];
        }

    }]);

})
