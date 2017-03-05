/**
 * Created by lxh on 2016/11/10.
 *  externalListCtrl
 */

define(['app'], function(app) {

    return app.controller('externalListCtrl', ['$scope', 'external','oms','$state','ModalService', function($scope, service, oms,$state,ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;
        //获取选中的行ID数组
        $scope.selected = [];

        // vm.systemType = [{"key":"",value:"全部"},{key:"ERP",value:"ERP"},{key:"PAY",value:"支付机构"},{key:"WMS",value:"仓储管理系统"},{key:"HG",value:"海关"},{key:"EXP",value:"快递物流"}];
        


        var config = {
            'fields': [{ "key": "id", "value": "ID", "display": true },{ "key": "systemCode", "value": "系统编码", "display": true }, { "key": "systemName", "value": "系统名称", "display": true }, { "key": "systemType", "value": "系统类型", "display": true }, { "key": "appKey", "value": "APP_KEY", "display": true }, { "key": "memo", "value": "备注",  "display": true }],

            'system': [],

            'page_size_options':[5,10,20,50],
        }
        var paras = {
            pageCount: 0,

            search: {
                pageSize: 5,
                pageNum: 1,
                systemCode: '', //系统编码
                systemName: '', //系统名称
                systemType: '' //系统类型
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

        function int() {
            var prams = {"paramType": 7};
            service.config(prams).then(function(resp) {
                config.system = resp.returnVal;
            });
        }
        int();

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
            // var status_hash = vm.status_hash, area_hash = config.area_hash;
            // for(var i in data){
            //     //data[i]['Status'] = status_hash[ data[i]['Status'] ];
            //     data[i]['customAreas'] = data[i]['customAreas'] ? area_hash[ data[i]['customAreas'] ] : 'unknow';
            // }
            //console.log(data);
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

        //批量删除
        function remove(items) {
            if(items.length){
                service.remove( items.join(',')).then(function(resp) {
                    if(!resp.returnCode){
                        oms.notify('删除成功');
                    }else{
                        alert(resp.returnVal);
                    }
                }, function(resp) {
                    oms.notify('删除失败，请重试');
                })
            oms.reload();
            }
            else {
                oms.notify("请选择要删除的行");
            }
        }

        // 搜索重置
        function reset() {
            paras.search.name = '';
            paras.search.externalType = '';
        }
    }]);


})