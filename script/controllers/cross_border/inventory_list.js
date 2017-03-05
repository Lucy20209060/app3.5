/**
 * Created by lxh on 2016/12/1.
 *  InventoryListCtrl
 */

define(['app', 'moment'], function(app, moment) {
    // modal button method

    return app.controller('inventoryListCtrl', ['$scope','$rootScope' ,'inventoryService', 'oms', '$log', '$timeout', function($scope,$rootScope, service, oms, $log, $timeout) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var page = {
            fields: [{ "key": "id", "value": "ID", "display": true }, { "key": "productId", "value": "货号", "display": true }, { "key": "dsSkuCode", "value": "商品条码", "display": true }, { "key": "name", "value": "商品名称", "display": true }, { "key": "customCode", "value": "备案海关", "display": true },{ "key": "statusDesc", "value": "商品中文名称", "display": true }, { "key": "nameEn", "value": "中文翻译名", "display": true }, { "key": "shelfLife", "value": "单位", "display": true }, { "key": "inBoundLifeDays", "value": "库存总数量", "display": false }
            ],

            page_size_options: [5, 10, 20, 50],

            pageCount: 0,

            search: {
                pageSize: 10,
                pageNum: 1,
                productId: '', //货号
                dsSkuCode: '', //商品条码
                chnName: '', //商品中文名
                tranName: '', //中文名翻译
                shopName: '', //商家名称
                status: '' //状态查询
            },

            isLoading: true,
        };

        vm.page = page;

        //数据
        vm.data = [];

        //执行搜索
        vm.list = list;

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

            obj.pageNum = pagination.start / pagination.number + 1;
            obj.orders = getSorts(tableState.sort);

            obj.pageSize = pagination.number;

            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }
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
            page.search.dsSkuCode = '';
            page.search.chnName = '';
            page.search.tranName = '';
            page.search.shopName = '';
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
