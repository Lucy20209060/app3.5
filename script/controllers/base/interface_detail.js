//interfaceDetailCtrl

define(['app'], function(app) {

    return app.controller('interfaceDetailCtrl', ['$scope', 'oms', 'InterfaceManageService', '$stateParams', '$timeout', '$state', '$uibModal', '$log', 'ModalService', function($scope, oms, service, $stateParams, $timeout, $state, $uibModal, $log, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,
            paras = $stateParams,
            id = paras.id,
            isCreate = (id === undefined || id === 'create') ? 1 : 0;

        var page = {
            title: (isCreate ? '新增' : '编辑') + '接口',
            show: false,
            interface:[]
        };

         var config = {
            // 接口类型
            'interfaceType': [{ "key": "1", "value": "内部系统"}, { "key": "2", "value": "商家接口"}, { "key": "3", "value": "快递接口"}, { "key": "4", "value": "WMS接口"}, { "key": "5", "value": "海关接口"}],
            // 接口方向
            'direction': [{ "key": "INPUT", "value": "INPUT"}, { "key": "OUTPUT", "value": "OUTPUT"}],
            // 优先级
            'priority': [{ "key": "1", "value": "1"}, { "key": "2", "value": "2"}, { "key": "3", "value": "3"}, { "key": "4", "value": "4"}, { "key": "5", "value": "5"}, { "key": "6", "value": "6"}, { "key": "7", "value": "7"}, { "key": "8", "value": "8"}, { "key": "9", "value": "9"}]
        };

        var interface_hash = {};

        var data = {
            "interfaceConfig": {},
            "bcInterfacePropertyVOs": []
        };

        var parms = {};

        var model = {
            "id": '',
            "interfaceName": '',
            "direction": '',
            "fromSystem": '',
            "toSystem": '',
            "targetUrl": '',
            "notifyUrl": '',
            "businessType": '',
            "enabled": '',
            "interfaceType": '',
            "handleMaxNum": '',
            "priority": ''
        };

        var perName = '';

        vm.isLoading = false;

        vm.page = page;

        vm.interface = [];

        vm.data = data;

        vm.parms = parms;

        vm.isCreate = isCreate;

        vm.config = config;

        vm.update = update;
        // 树结构的增删改
        vm.addItem = addItem;
        vm.select = select;
        vm.create = create;
        vm.remove = remove;

        // 新建或编辑功能
        var noType = 0, typeName = [];
        function update() {
            // 先校验名称是否重复以及名称是否修改
            var interName = vm.data.interfaceConfig.interfaceName;
            if (interName == perName) {
                var datas = getData(vm.data);
                if (noType == 0) {
                    addInterface(datas);
                }
                else {
                    var typeNames = '';
                    for(var i in typeName) {
                        if (i == typeName.length-1) {
                            typeNames += typeName[i];
                        }
                        else {
                            typeNames += typeName[i] + '、';
                        }
                    }
                    oms.alert(typeNames + "节点没有设置数据类型，请检查");
                    noType = 0;
                    typeName = [];
                }
            }
            else {
                var interObj = {"interfaceName": interName};
                service.ifMore(interObj).then(function(resp) {
                    //接口返回数据
                    if (resp.returnVal) {
                        var datas = getData(vm.data);
                        if (noType == 0) {
                            addInterface(datas);
                        }
                        else {
                            var typeNames = '';
                            for(var i in typeName) {
                                if (i == typeName.length-1) {
                                    typeNames += typeName[i];
                                }
                                else {
                                    typeNames += typeName[i] + '、';
                                }
                            }
                            oms.alert(typeNames + "节点没有设置数据类型，请检查");
                            noType = 0;
                            typeName = [];
                        }
                    } else {
                        oms.alert("接口名称已存在，请重新输入接口名称");
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                }, function(resp) {
                    oms.alert("发生错误请重试！");
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            }
        }
        // 新增或者修改接口详情页
        function addInterface(data) {
            service.update(data, isCreate).then(function(resp) {
                //接口返回数据
                noType = 0;
                typeName = [];
                if (!resp.returnCode) {
                    ModalService.open({
                        "title": "",
                        "content": "保存成功",
                        "alert": true,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (isCreate) {
                                $state.go('app.interface_list');
                            }
                            else {
                                $state.reload();
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
        // 获取保存接口传送数据
        function getData(data) {
            addOne();
            var obj = {
                "interfaceConfig": data.interfaceConfig,
                "propertys": getObj(vm.interface),
            }
            obj.propertys = JSON.stringify(obj.propertys);
            // return obj;
            return oms.dig(obj);
        }
        // 拼接字符串
        var resType = 0;
        function jsonPush(json1,json2){
            var json1_str = JSON.stringify(json1);
            var json2_str = JSON.stringify(json2);
            if(json1_str=="{}")
                return json2;
            if(json2_str=="{}")
                return json1;
            json1_str = json1_str.slice(0,json1_str.length-1);
            json2_str = json2_str.slice(1,json2_str.length-1);
            json1_str = json1_str+","+json2_str+"}";
            return JSON.parse(json1_str);
        }

        function getObj(data){
            var subData = {};
            for(var i=0;i<data.length;i++){
                if (data[i].dataField == 'response') {
                    resType = 1;
                }
                subData = jsonPush( subData,convert(data[i]) );
            }
            return subData;
        }

        function makeNode(data, type){
            var node = {};
            node[data.dataField] = {};
            var node_attr = node[data.dataField].node_attribute = {};
            node_attr.dataName = data.dataName;
            node_attr.dataField = data.dataField;
            node_attr.isContentSetting = data.isContentSetting;
            node_attr.allowMapping = data.allowMapping;
            node_attr.dataType = data.dataType;
            node_attr.type = resType;
            node_attr.nodeType = type;
            if (type == 1) {
                if(!data.dataType && data.dataField.toLowerCase() != 'response' && data.dataField.toLowerCase() != 'request') {
                   noType++;
                   typeName.push(data.dataField);
                }
            }
            if (data.isNew != 1) {
                node_attr.id = data.id;
            }
            if (data.isContentSetting == 1) {
                node_attr.contentVos = data.contentVos;
            }
            return node;
        }

        function convert( data ){
            var subData = {};
            //node withour children return node directly
            if( data.children==undefined ){
                return makeNode(data, 1);
            }
            else{
                var childNodes = {};
                for(var i=0;i<data.children.length;i++){
                    //convert the children of the data until the the children of the data's children is undefined
                    childNode = convert(data.children[i]);
                    //push the same level childNode
                    childNodes = jsonPush(childNodes,childNode);
                }
                //make node_attr
                subData = makeNode(data, 0);
                //add children to node
                subData[data.dataField] = jsonPush(subData[data.dataField],childNodes);
            }
            return subData;
        }

        init();

        function init() {
            //接口数据类型
            service.getType({"paramType":8}).then(function(resp) {
                if (resp.returnCode == 0) {
                    config.dataTypes = resp.returnVal;
                } else {
                    alert(resp.returnMsg);
                }
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            })
            if (!isCreate) {
                // 接口信息
                service.getInfo(id).then(function(resp) {
                    //接口返回数据
                    if (resp.returnCode == 0) {
                        initData(resp.returnVal, 1);
                        perName = vm.data.interfaceConfig.interfaceName;
                    } else {
                        alert(resp.returnMsg);
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                })
            }
            else {
                data.interfaceConfig.handleMaxNum = 1;
                data.interfaceConfig.priority = "1";
                data.interfaceConfig.enabled = "1";
                initData(data, 0);
            }
        }

        function initData(data, type) {
            var d = data.bcInterfacePropertyVOs;
            // 没有节点的时候初始化两个节点request 和 response
            if (d == null || d.length == 0) {
                var initReq = {
                    "ids": 1,
                    "dataField": "request",
                    "parentIds": 0,
                    "parentId": 0,
                    "level": 1,
                    "allowMapping": 0,
                    "isContentSetting": 0,
                    "contentVos": [],
                    "isNew": 1
                },
                initRes = {
                    "ids": 2,
                    "dataField": "response",
                    "parentIds": 0,
                    "parentId": 0,
                    "level": 1,
                    "allowMapping": 0,
                    "isContentSetting": 0,
                    "contentVos": [],
                    "isNew": 1
                };
                d = [];
                d.push(initReq);
                d.push(initRes);
                data.bcInterfacePropertyVOs = d;
            }
            var objs = {};
            for(var i in d) {
                if (d[i].isNew != 1) {
                    d[i].isNew = 0;
                }
                if (d[i].dataField.toLowerCase() == 'request' && d[i].parentId == 0) {
                    d[i].ids = 1;
                    objs[d[i].id] = d[i].ids;
                    d[i].parentIds = 0;
                }
                else if (d[i].dataField.toLowerCase() == 'response' && d[i].parentId == 0) {
                    d[i].ids = 2;
                    objs[d[i].id] = d[i].ids;
                    d[i].parentIds = 0;
                }
                else {
                    d[i].ids = 2+i;
                    objs[d[i].id] = d[i].ids;
                    d[i].parentIds = objs[d[i].parentId];
                }
            }  
            getTree(d);
            vm.parms = interface_hash[d[0].ids];
            if (data.interfaceConfig != null && type == 1) {
                data.interfaceConfig = oms.pick(data.interfaceConfig, model);
            }
            vm.data = data;
        }

        function getTree(d) {
            // 排序
            for (var i in d) {
                interface_hash[d[i].ids] = d[i];
            }

            vm.interface = oms.tree(angular.copy(d), 'ids', 'parentIds');
        }

        function create(e, mode) {
            e.preventDefault();
            addOne();
            var d = {
                dataField: '',
                dataName: '',
                dataType: '',
                allowMapping: 0,
                isContentSetting: 0,
                contentVos: [],
                isNew: 1
            }
            //新增同级权限
            if(mode == 0){
                d.parentIds = vm.parms.parentIds;
                d.level = vm.parms.level;
                if (d.parentIds == 0) {
                    oms.alert("最外层只能有request和response节点，不能新增其同级节点！");
                    return false;
                }
            }
            //新增下级权限
            else{
                d.parentIds = vm.parms.ids;
                d.level = vm.parms.level + 1;
            }
            d.ids = parseInt(vm.data.bcInterfacePropertyVOs.length) + 1;
            vm.parms = d;
            addOne();
        }

        function remove(e){
            e.preventDefault();
            var id = vm.parms.ids;
            var d = vm.data.bcInterfacePropertyVOs;
            ModalService.open({
                "title": "",
                "content": "确定删除节点以及其所有的子节点吗？",
                "alert": false,
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result) {
                        for(var i in d) {
                            if (d[i].ids == id) {
                                if (d[i].id) {
                                    service.delete(d[i].id).then(function(resp) {
                                        if (resp.returnCode == 0) {
                                            oms.notify('删除成功！');
                                            d.splice(i,1);
                                            vm.parms = '';
                                            getTree(d);
                                        } else {
                                            oms.alert(resp.returnMsg);
                                        }
                                        $timeout.cancel(loadingTimeout);
                                        vm.isLoading = false;
                                    })
                                }
                                else {
                                    oms.notify('删除成功！');
                                    d.splice(i,1);
                                    vm.parms = '';
                                    getTree(d);
                                }
                                break;
                            }
                        }
                        // console.log(vm.interface);
                    }
                })
            });
        }

        function select(id) {
            addOne();
            vm.parms = interface_hash[id];
        } 

        function addOne() {
            // 保存修改数据值
            if (vm.parms.length != "") {
                var d = vm.data.bcInterfacePropertyVOs;
                var allLen = d.length, i = 0;
                for(i; i < allLen; i++) {
                    if (d[i].ids == vm.parms.ids) {
                        d[i] = vm.parms;
                        break;
                    }
                }
                // 新增的数据
                if(i == allLen) {
                    d.push(vm.parms);
                }
                getTree(d);
            }
        }  

        function addItem(e) {
            e.preventDefault();
            var contentVal = {
                                "contentVal": ""
                            };
            if (vm.parms.contentVos == null) {
                vm.parms.contentVos = [];
            }
            vm.parms.contentVos.push(contentVal);
        } 
    }]);
})
