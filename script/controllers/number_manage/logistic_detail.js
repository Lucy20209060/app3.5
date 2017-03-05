define(['app'], function(app) {

    return app.controller('logisticSettingDetailCtrl', ['$scope', 'oms', 'numberManage', '$stateParams', '$timeout', '$state', '$uibModal', '$log', 'ModalService', function($scope, oms, service, $stateParams, $timeout, $state, $uibModal, $log, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var paras = $stateParams;

        var id = paras.id;

        var isCreate = (id === undefined || id === 'create') ? 1 : 0;

        var page = {
            title: (isCreate ? '新增' : '编辑') + '快递配置',
            show: false
        };

         var config = {
            'type': [{"key":"pool","value":"号段池获取"},{"key":"sole","value":"一单一取"}],
            area: '',
            area_select:[],
            interface: ''
        };

        var paras = {
            interfaceType:3, // 接口类型
            interfaceName:'' // 接口名称
        };

        //查询条件
        vm.paras = paras;

        vm.isLoading = false;

        vm.page = page;

        vm.isCreate = isCreate;

        vm.data = {};

        vm.config = config;

        // 保存
        vm.save = save;

        init();

        function init() {
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            oms.config('area_info').then(function(resp){
                //console.log(resp)
                if (resp.returnVal) {
                    vm.config.area = resp.returnVal;
                } else {
                    alert('没有地区数据');
                }
                vm.isLoading = false;
                $timeout.cancel(loadingTimeout);
            });
           
            getInterface();
        }

        // 获取所有的接口列表 
        function getInterface() {
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            service.getInterface(getParse()).then(function(resp) {
                if (!resp.returnCode) {
                    var interfaceModel = {
                        'id': '',
                        'businessType': ''
                    }
                    vm.config.interface = oms.pick(resp.list, interfaceModel);
                    getInfo();
                } else {
                    alert('没有快递公司数据');
                }
                vm.isLoading = false;
                $timeout.cancel(loadingTimeout);
            }, function() {
                console.log('Error while Detail!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        // 获取详情
        function getInfo() {
            if (!isCreate) {
                // 所有的仓库以及店铺
                loadingTimeout = $timeout(function() {
                    vm.isLoading = true;
                }, loadingLatency);
                service.getLogisticInfo({'id': id}).then(function(resp) {
                    if (resp.returnVal) {
                        setData(resp.returnVal);
                    } else {
                        alert('没有数据');
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                }, function() {
                    console.log('Error while Detail!');
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            } else {
                
            }
        }

        /**
         * 获取接口类型为快递的参数
         * @return {[type]}            [description]
         */
        function getParse() {
            var obj = paras,
                search_arr = [];

            for (var i in obj){
                if(obj[i] !== '') search_arr.push( i + '=' + obj[i] );
            }

            return search_arr.join('&');
        }

        /**
         * 格式化数据
         * @param {[]} predata [预格式化数据]
         */
        function setData(d) {
            if (d && d.interfaces) {
                //转换权限树，末端添加原子操作
                var interModel = {
                    "interfaceId": "",
                    "interfaceName": ""
                };
                vm.config.interface = convPermissions(oms.pick(d.interfaces, interModel));
            }
            vm.data = d;

            //读取
            var area = [];
            for(var i in d.outareas){
                area.push({id:d.outareas[i].areaId , fullpath:d.outareas[i].areaName});
            }
            //outareas
            config.area_select = area;
        }

        /**
         * save
         * @return {[type]} [description]
         */
        function save() {
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            service.updateLogistic(getData(vm.data), isCreate, id).then(function(resp) {
                //接口返回数据
                if (!resp.returnCode) {
                    ModalService.open({
                        "title": "",
                        "content": "保存成功",
                        "alert": true,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (isCreate) {
                                $state.go('app.logistic_setting_list');
                            }
                        })
                    });
                } else {
                    alert(resp.returnMsg);
                }
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function(resp) {
                oms.alert("发生错误请重试！");
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }



        /**
         * 获取数据
         * @param {[]} predata [预格式化数据]
         */
        function getData(data) {
            // 获取适用场景
            var interfaces = [];
            for(var i in config.interface) {
                if (config.interface[i].checked) {
                    var obj = {"interfaceId": config.interface[i].id, "interfaceName": config.interface[i].interfaceName};
                    interfaces.push(obj);
                }
            }

            var outareas = convAreas(config.area_select);

            var datas = isCreate ? {
                logisticsCode: data.logs.logisticsCode,
                logisticsName: data.logs.logisticsName,
                mailFetchType: data.logs.mailFetchType,
                interfaces: interfaces,
                outareas: outareas
            } : {
                id: id,
                logisticsCode: data.logs.logisticsCode,
                logisticsName: data.logs.logisticsName,
                mailFetchType: data.logs.mailFetchType,
                interfaces: interfaces,
                outareas: outareas
            }
            datas = oms.dig(datas);
            return datas;
        }

        /**
         * 转换选择的地区
         * @return {[type]} [description]
         */
        function convAreas(d){
            var ret = [];
            for(var i in d){
                ret.push({areaId:d[i].id , areaName:d[i].fullpath});
            }
            return ret;
        }

        /**
         * 转换权限数组为 权限树
         * @param  {[type]} d    [权限数组]
         * @param  {[type]} atom [权限原子操作]
         * @return {[type]}      [权限树]
         */
        function convPermissions(d) {
            //预处理权限,给有选中状态的标记
            var alls = vm.config.interface;
            var all_obj = [];
            for(var i in d) {
                all_obj.push(d[i].interfaceId);
            }
            for (var i in alls) {
                var id = alls[i].id;
                if (all_obj.indexOf(id) >= 0) {
                    alls[i].checked = true;
                }
            }
            return alls;
        } 
    }]);
})
