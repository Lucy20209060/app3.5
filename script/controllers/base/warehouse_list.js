/**
 * Created by lsy on 2016/8/8.
 * warehouseListCtrl 仓库管理
 */

define(['app'], function(app) {

    return app.controller('warehouseListCtrl', ['$scope', 'warehouse','$state','ModalService', 'oms', '$timeout', function($scope, service,$state,ModalService, oms, $timeout) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var config = {
            'fields': [{ "key": "id", "value": "ID", "display": false },{ "key": "name", "value": "仓库名称", "display": true }, { "key": "code", "value": "仓库编码", "display": true }, { "key": "warehouseType", "value": "仓库类型", "display": true }, { "key": "wcCode", "value": "仓库所属公司", "display": true }, { "key": "isValid", "value": "仓库状态",  "display": true }, { "key": "country", "value": "国家",  "display": false }, { "key": "province", "value": "省份",  "display": false }, { "key": "city", "value": "城市",  "display": false }, { "key": "district", "value": "区域",  "display": false }, { "key": "address", "value": "地址",  "display": false }, { "key": "zipCode", "value": "邮编",  "display": false }, { "key": "replenishRule", "value": "缺省补货规则",  "display": false }, { "key": "ccaCode", "value": "海关关区",  "display": false }, { "key": "remark", "value": "仓库说明",  "display": false }, { "key": "createTime", "value": "创建时间",  "display": true }],

            'page_size_options':[5,10,20,50],

            'isValid': [{ "key": "", "value": "全部"},{ "key": "1", "value": "激活"},{ "key": "0", "value": "禁用"}],

            'warehouseTypes': [{"key": "","value": "全部"}, { "key": "1", "value": "跨境仓"},{ "key": "2", "value": "境内仓"}],
        }
        var paras = {
            pageCount: 0,

            search: {
                pageSize: 5,
                pageNum: 1,
                name: '',
                warehouseType: '',
                isValid: ''
            },
        }

        //数据
        vm.data = [];

        //查询条件
        vm.paras = paras;

        //删除
        vm.remove = remove;
        //配置
        vm.config = config;
        //执行搜索
        vm.list = list;

        //重置
        vm.reset = reset;

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            config.isValid_hash = oms.hash(config.isValid ,'key','value');
            config.warehouseTypes_hash = oms.hash(config.warehouseTypes ,'key','value');
            oms.config('area', true).then(function(resp) {
                config.area = resp;
                config.area_hash = oms.hash(resp, 'key','value');
            });
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


            for (var i in obj){
                if(obj[i] !== '') search_arr.push( i + '=' + obj[i] );
            }

            return search_arr.join('&');
        }

        //转换
        function afterList(data){
            var isValid_hash = config.isValid_hash, warehouseTypes_hash = config.warehouseTypes_hash, area_hash = config.area_hash;
            for (var i in data) {
                data[i]['isValid'] = data[i]['isValid'] != 2 ? isValid_hash[ data[i]['isValid'] ] : 'unknow';
                data[i]['warehouseType'] = data[i]['warehouseType'] != 4 ? warehouseTypes_hash[ data[i]['warehouseType'] ] : 'unknow';
                data[i]['ccaCode'] = data[i]['ccaCode'] != 4 ? area_hash[ data[i]['ccaCode'] ] : 'unknow';
            }
            return data;
            return data;
        }
        //查询
        function list(tableState) {

            service.list(getParas(tableState)).then(function(resp) {
                vm.data = afterList(resp.list);
                //vm.data = resp.list;
                tableState.pagination.numberOfPages = resp.pages;

                vm.paras.pageCount = resp.total;

                vm.isLoading = false;
            });
        }

        function remove(item) {
            if (!item.length) {
                oms.alert("已禁用的仓库不能再删除，请选择要禁用的商家！");
            }
            else {
                $timeout.cancel(loadingTimeout);

                loadingTimeout = $timeout(function() {
                    vm.isLoading = true;
                }, loadingLatency);

                service.remove(item).then(function(resp) {

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
                    else {
                        oms.alert(resp.returnMsg);
                    }

                    $timeout.cancel(loadingTimeout);

                    vm.isLoading = false;
                });
            }
        }

        // 搜索重置
        function reset() {
            paras.search.name = '';
            paras.search.warehouseType = '';
            paras.search.isValid = '';
        }

    }]);


})