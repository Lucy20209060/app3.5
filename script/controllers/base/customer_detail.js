define(['app'], function(app) {

    return app.controller('customerDetailCtrl', ['$scope', 'oms', 'customerManage', '$stateParams', '$timeout', '$state', '$uibModal', '$log', 'ModalService', function($scope, oms, service, $stateParams, $timeout, $state, $uibModal, $log, ModalService) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var paras = $stateParams;

        var id = paras.id;

        var isCreate = (id === undefined || id === 'create');

        var model = {
            "id": "", //ID
            "name": "", //商家名称
            "code": "", //商家编码
            "address": "", //所在地
            "wmsCode": "", //wms编码
            "companyDesc": "", //商家说明
            "bcCustomersTpSystemVO": "", //使用系统
            "hasWarehouseInfoListVO": "", //仓库
            "hasCustomShopListVO": "" //店铺
        };

        var config = {
            'fields': [{ "key": "id", "value": "ID", "display": true }, { "key": "areaCode", "value": "所属关区", "display": true }, { "key": "code", "value": "店铺代码", "display": true }, { "key": "name", "value": "店铺名称", "display": true }, { "key": "shopPlatformCode", "value": "所属平台", "display": true }, { "key": "preCode", "value": "上级店铺代码", "display": true }, { "key": "preName", "value": "上级店铺名称", "display": true }, { "key": "isRecord", "value": "是否备案", "display": true }, { "key": "isValid", "value": "店铺状态", "display": true }, { "key": "remark", "value": "备注信息", "display": false }, { "key": "customVal", "value": "海关侧取值", "display": false }, { "key": "createTime", "value": "创建时间", "display": false }, { "key": "creater", "value": "创建人", "display": false }, { "key": "updateTime", "value": "编辑时间", "display": false }, { "key": "editor", "value": "编辑人", "display": false }],

            'ifRecord': [{"key":"1","value":"是"},{"key":"0","value":"否"}],
            'isValid': [{"key":"1","value":"激活"},{"key":"0","value":"禁用"}],

            'allHadInter': {},

            'allInter': {},

            'hadInterRule': [],

            'allInterRule': {},

            'format': [{"key":"1","value":"XML"},{"key":"2","value":"JSON"},{"key":"3","value":"MAP"}],

            'preRule': {}
        };

        var page = {
            title: (isCreate ? '新增' : '编辑') + '商家',
            show: false
        };

        var all_inter = {};
        var inter_obj = {};

        var warehouse;

        var shopIds = []; //保存所有店铺的ID

        var shopData = [];

        var curId, curName;

        vm.isLoading = false;

        vm.page = page;

        vm.update = update;

        vm.deleteShop = deleteShop;

        vm.isCreate = isCreate;

        vm.config = config;

        vm.warehouse = warehouse;

        vm.shopIds = shopIds;

        vm.shopData = shopData;

        vm.back = back;

        vm.updateAppKey = updateAppKey;

        vm.toggle = toggle;

        vm.initRules = initRules;

        vm.setRule = setRule;

        vm.select = select;

        vm.changeInter = changeInter;

        vm.removeItem = removeItem;

        vm.addContact = addContact;
        vm.removeContact = removeContact;
        vm.getCities = getCities;

        init();

        function init() {
            config.fields_hash = oms.hash(config.fields);
            config.ifRecord_hash = oms.hash(config.ifRecord, 'key', 'value');
            config.isValid_hash = oms.hash(config.isValid, 'key', 'value');
            // 关区
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            service.area().then(function(resp) {
                config.area = resp; //获取关区并传给model
                // 根据code转换
                config.area_hash = oms.hash(config.area, 'areaCode', 'value');
            }, function() {
                console.log('Error while Detail!');
            });

            getPro();
        }

        function getPro() {
            // 获取省
            service.getProvince().then(function(resp) {
                if (resp.returnVal) {
                    config.province = resp.returnVal;
                    config.province_hash = oms.hash(config.province, 'areaname', 'id');
                    getDetail();
                } else {
                    alert('没有数据');
                }
            }, function() {
                console.log('Error while Logistic!');
            });
        }

        /**
         * 获取市区信息 还需要加一个初始化
         */
        function getCities(type) {
            var setStr, setId;
            setStr = type == 0 ? vm.data.province : vm.data.city;
            setId = type == 0 ? config.province_hash[setStr] : config.city_hash[setStr];
            if (setId != undefined) {
                service.getCity(setId).then(function(resp) {
                    if (resp.returnVal) {
                        if (type == 0) {
                            config.city = resp.returnVal;
                            config.city_hash = oms.hash(config.city, 'areaname', 'id');
                            if (vm.data.city && vm.data.city.length) {
                                getCities(1);
                            }
                        }
                        else {
                            config.dist = resp.returnVal;
                        }
                    } else {
                        alert('没有数据');
                    }
                }, function() {
                    console.log('Error while Logistic!');
                });
            }
        }

        function getDetail() {
            if (!isCreate) {
                // 所有的上级店铺
                service.allCustomes().then(function(resp) {
                    config.preShops = resp.returnVal;
                }, function() {
                    console.log('Error while Detail!');
                });

                service.get(id).then(function(resp) {
                    vm.data = resp.returnVal;
                    if (vm.data) {
                        config.ifSys = vm.data.bcCustomerTpSystemVO;
                        setData(resp.returnVal, config.preShops);
                    }
                    if (vm.data && vm.data.province) {
                        getCities(0);
                    }
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                }, function() {
                    console.log('Error while Detail!');
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });

            } else {
                service.allWare().then(function(resp) {
                    vm.data = resp.returnVal;
                    vm.data.isValid =  vm.data.isValid ?  vm.data.isValid : 1;
                    config.ifSys = vm.data.bcCustomerTpSystemVO;
                    setData(resp.returnVal);
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                }, function() {
                    console.log('Error while Detail!');
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            }
        }

        function setData(data, preshops) {
            // 所属仓库 ==、这代码已经优化 涕泗横流
            if (data) {
                var hasWare = data.hasWarehouseInfoListVO;
                var allWare = data.warehouseInfoListVO;
                if (hasWare) {
                    var all_obj = {};

                    for (var i in allWare) {
                        all_obj[allWare[i].id] = allWare[i];
                    }

                    for (var i = hasWare.length; i--;) {
                        var id = hasWare[i].id;
                        if (all_obj[id]) {
                            all_obj[id].display = true;
                        }
                    }
                }

                // 初始化数据，判断是否有父级店铺
                var allShop = data.hasCustomShopListVO;
                if (allShop) {
                    var ifRecord_hash = config.ifRecord_hash, isValid_hash = config.isValid_hash;
                    vm.shopData = data.hasCustomShopListVO;
                    // 初始化shopIDs
                    shopIds = oms.pick(allShop, { id: '' });
                    var obj_shop = {}
                    for (var i in preshops) {
                        obj_shop[preshops[i].id] = preshops[i];
                    }
                    for (var i in allShop) {
                        // shopIds.push(allShop[i].id);
                        var pid = allShop[i].parentId;
                        if (pid != null && obj_shop) {
                            if (obj_shop[pid]) {
                                allShop[i].preCode = obj_shop[pid].code;
                                allShop[i].preName = obj_shop[pid].name;
                            }
                        }
                        allShop[i]['isRecord'] = allShop[i]['isRecord'] != undefined ? ifRecord_hash[ allShop[i]['isRecord'] ] : 'unknow';
                        allShop[i]['isValid'] = allShop[i]['isValid'] != undefined ? isValid_hash[ allShop[i]['isValid'] ] : 'unknow';
                    }
                }

                // 转换购物平台
                var shopPlat = data.shopPlatformListVO,
                    objs = [];
                for (var i in shopPlat) {
                    var obj = { 'shopPlatformCode': shopPlat[i].code, 'value': shopPlat[i].name }
                    objs.push(obj);
                }
                config.plat_hash = oms.hash(objs, 'shopPlatformCode', 'value');

                // 显示列表接口列表
                var allInterface = data.interfaceConfigListVO;
                var hasInterface = data.bcCustomersInterfaceListVO;
                var initId = 99;
                for (var i in allInterface) {
                    config.allInter[allInterface[i].id] = allInterface[i];
                }
                if (hasInterface) {
                    var firstCheck = 0;
                    for (var i in hasInterface) {
                        var id = hasInterface[i].interfaceId;
                        // 根据interfaceId记录商家有的接口
                        config.allHadInter[id] = hasInterface[i];
                        if (config.allInter[id] && hasInterface[i].isOpen == '1') {
                            config.allInter[id].display = true;
                            if (firstCheck == 0) {
                                config.allInter[id].isActive = true;
                                firstCheck ++;
                            }
                            else {
                                config.allInter[id].isActive = false;
                            }
                            initId = id;
                        }
                        else if (firstCheck == 0) {}{
                            initId = hasInterface[0].interfaceId;
                        }
                    }
                }
                else {
                    allInterface[0].isActive = true;
                    console.log(allInterface[0])
                    initId = allInterface[0].id;
                }
                // 初始化 默认获取第一个选中的interfaceid
                curId = initId;
                curName = hasInterface ? config.allHadInter[curId].interfaceName : config.allInter[curId].interfaceName;
                initRules(initId);
                initTree(initId);
            }
        }

        // 不同接口的规则配置请求
        function initRules(id) {
            // id = 99;
            service.getRule(id).then(function(resp) {
                setRule('init', resp.returnVal, id);
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while Detail!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        /**
         * 规则配置显示 以及 协议
         * @param {[string]} type [add 新增 change 节点改变 init 初始化]
         * @param {[string]} data [init传入所有的节点 change传入当前行的数据]
         * @param {[string]} id   [init记录选中的节点Id]
         */
        function setRule(type, data, id) {
            // 详情页面初始化
            if (type == 'init') {
                // data为所有的规则配置下拉值
                config.hadInterRule = [];
                config.apiMethod = '';
                config.apiProtocol = '';
                config.formatType = '';
                var hadRule = config.allHadInter[id];
                if (hadRule) {
                    config.apiMethod = hadRule.apiMethod;
                    config.apiProtocol = hadRule.apiProtocol;
                    config.formatType = hadRule.formatType;
                }
                if (data) {
                    for(var i in data) {
                        config.allInterRule[data[i].id] = data[i];
                    }
                    config.allRules = data;
                    config.preRule[id] = config.allRules;
                }
                else {
                    config.preRule[id] = 1;
                }
                // rule list
                if (hadRule && hadRule.bcInterfaceRuleListVO) {
                    var allHadsRule = hadRule.bcInterfaceRuleListVO;
                    for(var i in allHadsRule) {
                        var interObjs = [];
                        var dataType =  allHadsRule[i].customsBaseParamListVO;
                        for(var j in dataType) {
                            var interObj = {"code": dataType[j].code, "name": dataType[j].name};
                            interObjs.push(interObj);
                        }
                        var obj = {
                            "id": allHadsRule[i].id, 
                            "expression": allHadsRule[i].expression, 
                            "matchContent": allHadsRule[i].matchContent, 
                            "propertyId": allHadsRule[i].propertyId, 
                            'exp': interObjs,
                            'propertyField': allHadsRule[i].propertyField, 
                        };
                        config.hadInterRule.push(obj);
                    }
                }
            }
            // 新增规则
            else if (type == 'add') {
                data.preventDefault();
                var obj = {
                    "expression": '',
                    "matchContent": '',
                    "propertyId": '',
                    "propertyField": '',
                    "exp": ''
                };
                config.hadInterRule.push(obj);
            }
            // 筛选dateType的范围
            else {
                // data为 row的值
                var dataId = data.propertyId;
                var interObjs = [];
                var dataType =  config.allInterRule[dataId].customsBaseParamListVO;
                for(var i in dataType) {
                    var interObj = {"code": dataType[i].code, "name": dataType[i].name};
                    interObjs.push(interObj);
                }
                for(var i in config.allRules) {
                    if (config.allRules[i].id == dataId) {
                        data.propertyField = config.allRules[i].dataField;
                        break;
                    }
                }
                data.exp = interObjs;
            }
        }

        function initTree(id) {
            // id = 99;
            all_inter = {},inter_obj = {};
            var all_inters = config.allInter[id];
            var had_inters = config.allHadInter[id];
            var all_content, has_inter, has_content;
            // 所有的节点
            if (all_inters && all_inters.bcInterfacePropertyListVO) {
                all_inter = all_inters.bcInterfacePropertyListVO;
            }
            // 所有的系统值
            if (all_inters && all_inters.bcInterfacePropertyContentListVO) {
                all_content = all_inters.bcInterfacePropertyContentListVO;
            }
            // 映射的节点值
            if (had_inters && had_inters.bcInterfacePropertyMappingListVO) {
                has_inter = had_inters.bcInterfacePropertyMappingListVO;
            }
            // 映射的系统值
            if (had_inters && had_inters.bcInterfaceContentMappingListVO) {
                has_content = had_inters.bcInterfaceContentMappingListVO;
            }

            var mapInter_obj = {};
            var content_obj = {};
            var mapContent_obj = {};
            for (var i in all_inter) {
                all_inter[i].sysContent = [];
                inter_obj[all_inter[i].id] = all_inter[i];
            }
            // 对应节点映射值
            for (var i in has_inter) {
                mapInter_obj[has_inter[i].id] = has_inter[i];
                inter_obj[has_inter[i].propertyId].mappingCode = has_inter[i].mappingCode;
                inter_obj[has_inter[i].propertyId].mappingId = has_inter[i].id;
            }
            // 所有的系统值
            for(var i in all_content) {
                content_obj[all_content[i].contentVal] = all_content[i];
            }

            for(var i in has_content) {
                mapContent_obj[has_content[i].mappingVal] = has_content[i];
                if (mapInter_obj[has_content[i].propertyMappingId] && content_obj[has_content[i].contentVal]) {
                    content_obj[has_content[i].contentVal].mappingVal = has_content[i].mappingVal;
                    content_obj[has_content[i].contentVal].mappingId = has_content[i].id;
                }
            }
            // content_obj 每一个系统值包含其对应的映射值
            // console.log(content_obj)

            // 处理系统值
            for(var i in all_content) {
                inter_obj[all_content[i].propertyId].sysContent.push(all_content[i]);
            }
            vm.config.tree = oms.tree(angular.copy(all_inter), 'id', 'parentId');
            vm.config.parms = all_inter[0];
        }

        function select(id) {
            vm.config.parms = inter_obj[id];
        } 

        function changeInter(e, v) {
            e.preventDefault();
            var id = v.id;
            if (id == curId) {
                return;
            }
            else {
                curName = v.interfaceName;
                ModalService.open({
                    "title": "警告",
                    "content": "切换成功后，本接口设置数据不会保存，是否确认切换？",
                    "alert": false,
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        if (result) {
                            config.allInter[curId].isActive = false;
                            config.allInter[id].isActive = true;
                            curId = id;
                            if(config.preRule[id] || config.preRule[id] == 1) {
                                if (config.preRule[id] == 1) {
                                    config.preRule[id] = '';
                                }
                                setRule('init', config.preRule[id], id);
                            }
                            else {
                                initRules(id);
                            }
                            initTree(id);
                        }
                    })
                });
            }
        }

        // 更新所属系统的APPKey的变化
        function updateAppKey() {
            var system_Code = vm.data.bcCustomerTpSystemVO.systemCode;
            var all_sys = {};
            for (var i in vm.data.bcTpsystemListVO) {
                all_sys[vm.data.bcTpsystemListVO[i].systemCode] = vm.data.bcTpsystemListVO[i];
            }
            var cur_sys = all_sys[system_Code];
            vm.data.bcCustomerTpSystemVO.appKey = cur_sys.appKey;
        }

        function update() {
            // console.log(getData(vm.data))
            // init();
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);

            service.update(getData(vm.data), isCreate, id).then(function(resp) {
                //接口返回数据
                if (!resp.returnCode) {
                    ModalService.open({
                        "title": "",
                        "content": "保存成功",
                        "alert": true,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (isCreate) {
                                $state.go('app.customer_list');
                            }
                        })
                    });
                } else {
                    alert(resp.returnMsg);
                }

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function(resp) {
                //console.log('==>',resp)
                ModalService.open({
                    "title": "",
                    "content": "发生错误请重试！",
                    "alert": true,
                }).then(function(modal) {
                    modal.close.then(function(result) {})
                });
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        function getData(data) {
            var warehouse = oms.pick(
                oms.filter(
                    data.warehouseInfoListVO, { 'display': true }
                ), { id: '' }
            );
            // 根据是否回传所属系统判断发送的data
            if (vm.config.ifSys != null) {
                var tpSystem = {
                    "id": data.bcCustomerTpSystemVO.id,
                    "systemCode": data.bcCustomerTpSystemVO.systemCode,
                    "tpSystemId": data.bcCustomerTpSystemVO.tpSystemId,
                    "appKey": data.bcCustomerTpSystemVO.appKey
                }
            } else {
                // 新增时，单个tpSystemId和选中的id相同
                var allSys = vm.data.bcTpsystemListVO;
                var all_obj = {};
                var tp_sys_id, tp_sys_app;
                for (var i in allSys) {
                    all_obj[allSys[i].systemCode] = allSys[i];
                }

                var isSys = data.bcCustomerTpSystemVO.systemCode;
                if (all_obj[isSys]) {
                    tp_sys_id = all_obj[isSys].id;
                    tp_sys_app = all_obj[isSys].appKey;
                }
                var tpSystem = {
                    "systemCode": data.bcCustomerTpSystemVO.systemCode,
                    "tpSystemId": tp_sys_id,
                    "appKey": tp_sys_app
                }
            }

            // 获取所有的配置规则
            var all_config_rule = [];
            for (var i in config.hadInterRule) {
                var ruleModel = {
                    "expression": '',
                    "matchContent": '',
                    "propertyId": '',
                    "propertyField": ''
                };
                if (config.hadInterRule[i].id) {
                    ruleModel.id = '';
                }
                all_config_rule.push(oms.pick(config.hadInterRule[i], ruleModel));
            }
            // 当前接口配置项
            var all_config_map = [], all_config_content = [];
            for(var i in inter_obj) {
                if (inter_obj[i].mappingCode && inter_obj[i].mappingCode != "request" && inter_obj[i].mappingCode != "response") {
                    var obj = {
                        'mappingCode': inter_obj[i].mappingCode,
                        'propertyId': inter_obj[i].id,
                        'propertyField': inter_obj[i].dataField
                    }
                    if (inter_obj[i].mappingId) {
                        obj.id = inter_obj[i].mappingId;
                    }
                    all_config_map.push(obj);
                }
                if (inter_obj[i].sysContent.length) {
                    for(var j in inter_obj[i].sysContent) {
                        var curCon = inter_obj[i].sysContent[j];
                        if (curCon.mappingVal) {
                            var obj_con = {
                                'contentVal': curCon.contentVal,
                                'propertyMappingField': inter_obj[i].mappingCode,
                                'mappingVal': curCon.mappingVal
                            }

                            if (curCon.mappingId) {
                                obj_con.id = curCon.mappingId;
                            }
                            if (inter_obj[i].mappingId) {
                                obj_con.propertyMappingId = inter_obj[i].mappingId;
                            }
                            all_config_content.push(obj_con);
                        }
                    }
                }
            }
            var isOpen = config.allInter[curId].display ? 1 : 0, all_inter_save = [];
            var eachInter = {
                "apiMethod": config.apiMethod,  // 报文格式
                "apiProtocol": config.apiProtocol,  // 接口协议
                "bcInterfaceContentMappingListVO": all_config_content,  // 系统值映射
                "bcInterfacePropertyMappingListVO": all_config_map,  // 节点映射值
                "bcInterfaceRuleListVO": all_config_rule,  // 规则配置
                "formatType": config.formatType,  // 请求方式
                "isOpen": isOpen,  // 是否启用
                "interfaceId": curId,  // interfaceId
                "interfaceName": curName  // interfaceName
            };
                
            if (config.allHadInter[curId]) {
                eachInter.id = config.allHadInter[curId].id;
            }
            all_inter_save.push(oms.dig(eachInter));
            var allInterface = data.interfaceConfigListVO;
            for (var i in allInterface) {
                var compId = allInterface[i].id;
                console.log(curId)
                if (compId != curId) {
                    // 判断是否有映射值
                    var openIf = config.allInter[compId].display ? 1 : 0;
                    if (config.allHadInter && config.allHadInter[compId]) {
                        var eachInter = {
                            "apiMethod": config.allHadInter[compId].apiMethod,  // 报文格式
                            "apiProtocol": config.allHadInter[compId].apiProtocol,  // 接口协议
                            "formatType": config.allHadInter[compId].formatType,  // 请求方式
                            "isOpen": openIf,  // 是否启用
                            "interfaceId": compId,  // interfaceId
                            "interfaceName": config.allHadInter[compId].interfaceName,  // interfaceName
                            "id": config.allHadInter[compId].id
                        };
                        if (config.allHadInter[compId].bcInterfaceRuleListVO) {
                            eachInter.bcInterfaceRuleListVO = config.allHadInter[compId].bcInterfaceRuleListVO;
                        }
                        if (config.allHadInter[compId].bcInterfaceContentMappingListVO) {
                            eachInter.bcInterfaceContentMappingListVO = config.allHadInter[compId].bcInterfaceContentMappingListVO;
                        }
                        if (config.allHadInter[compId].bcInterfacePropertyMappingListVO) {
                            eachInter.bcInterfacePropertyMappingListVO = config.allHadInter[compId].bcInterfacePropertyMappingListVO;
                        }
                        all_inter_save.push(oms.dig(eachInter));
                    }
                    else {
                        if (openIf == 1) {
                            var eachInter = {
                                "isOpen": openIf,  // 是否启用
                                "interfaceId": compId,  // interfaceId
                                "interfaceName": allInterface[i].interfaceName  // interfaceName
                            };
                            all_inter_save.push(oms.dig(eachInter));
                        }
                    }
                }
            }
            // console.log(config.allHadInter);
            var models = {
                'name': '',
                'telephone': '',
                'mobilePhone': '',
                'fax': '',
                'email': '',
                'conType': ''
            };
            var obj = {
                "name": data.name,
                "code": data.code,
                "address": data.address,
                "companyDesc": data.companyDesc,
                "wmsCode": data.wmsCode, //wms编码
                "isValid": data.isValid,

                "bcCustomerTpSystemVO": tpSystem,
                "hasWarehouseInfoListVO": warehouse,
                "hasCustomShopListVO": shopIds,

                // "bcCustomersInterfaceListVO": all_inter_save,

                "zipCode": data.zipCode,
                "country": data.country,
                "province": data.province,
                "city": data.city,
                "district": data.district
            };
            if (data.contactsInfoListVO && data.contactsInfoListVO.length) {
                for(var i in data.contactsInfoListVO) {
                    if (data.contactsInfoListVO[i].id) {
                        model.id = '';
                    }
                    data.contactsInfoListVO[i] = oms.pick(data.contactsInfoListVO[i], models);
                }
                obj.contactsInfoListVO = data.contactsInfoListVO;
            }
            else {
                delete data.contactsInfoListVO;
            }
            if (vm.data.bcCustomersVO) {
                obj.bcCustomersVO = vm.data.bcCustomersVO;
            }
            return oms.dig(obj);
        }

        function addContact(e) {
            e.preventDefault();
            var obj = {
                'name': '',
                'telephone': '',
                'mobilePhone': '',
                'fax': '',
                'email': '',
                'conType': ''
            };
            if (!vm.data.contactsInfoListVO) {
                vm.data.contactsInfoListVO = [];
            }
            vm.data.contactsInfoListVO.push(obj);           
        }

        function removeContact(e, index) {
            e.preventDefault();
            vm.data.contactsInfoListVO.splice(index, 1);      
        }

        function deleteShop(row, index) {
            // 删除店铺的请求
            ModalService.open({
                "title": "提示",
                "content": "确认删除当前店铺？",
                "alert": false,
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result) {
                        var id = row.id;
                        service.removeShop(id).then(function(resp) {
                            vm.shopData.splice(index, 1);
                            shopIds.splice(index, 1);
                            oms.notify("删除成功", "success");
                        }, function() {
                            console.log('Error while Detail!');
                        });
                    }
                })
            });
        }

        function toggle(e){
            e.preventDefault();
            vm.otherSearch = !vm.otherSearch;
            var ele = angular.element( document.querySelector( '#toggleItem' ) );
            ele.toggleClass('toggleItem');
        }

        function back() {
            $state.go('app.customer_list');
        }

        function removeItem(e, index) {
            e.preventDefault();
            config.hadInterRule.splice(index, 1);
        }
        vm.openAdd = function(row, index) {
            service.allCustomes().then(function(resp) {
                //获取所有上级店铺
                var pre_obj = resp.returnVal,
                    pre_objs = [];
                for (var i in pre_obj) {
                    var obj_pre = { 'parentId': pre_obj[i].id, 'value': pre_obj[i].name, 'code': pre_obj[i].code };
                    pre_objs.push(obj_pre);
                }
                config.shops = pre_objs;
                // 编辑店铺的id
                var id, platData;
                var param = {
                    areaCode: '',
                    code: '',
                    name: '',
                    shopPlatformCode: '',
                    parentId: '',
                    isRecord: '',
                    isValid: '',
                    address: '',
                    country: '',
                    province: '',
                    city: '',
                    district: '',
                    zipCode: '',
                    contactsInfoListVO: '',
                    remark: '',
                    customVal: ''
                };
                var title = (row == -1 ? '新增' : '编辑') + '店铺';
                if (row != -1) {
                    // 初始化编辑状态的所属平台
                    var area_code = row.areaCode;
                    id = row.id;
                    param = oms.pick(row, param);
                    param.isRecord = param.isRecord == "是" ? 1 : 0;
                    param.isValid = param.isValid == "激活" ? 1 : 0;
                    service.platform(area_code).then(function(response) {
                        platData = response;
                        if (param.province) {
                            service.getCity(config.province_hash[param.province]).then(function(resp) {
                                if (resp.returnVal) {
                                    config.citys = resp.returnVal;
                                    config.citys_hash = oms.hash(config.citys, 'areaname', 'id');
                                    if (param.city) {
                                        service.getCity(config.citys_hash[param.city]).then(function(resp) {
                                            if (resp.returnVal) {
                                                config.dists = resp.returnVal;
                                                // config.dists_hash = oms.hash(config.dists, 'areaname', 'id');
                                                openModel();
                                            } else {
                                                alert('没有数据');
                                            }
                                        }, function() {
                                            console.log('Error while Logistic!');
                                        });
                                    }
                                    else {
                                        openModel();
                                    }
                                } else {
                                    alert('没有数据');
                                }
                            }, function() {
                                console.log('Error while Logistic!');
                            });
                        }
                        else {
                            openModel();
                        }
                    })
                } 
                else {
                    id = -1;
                    openModel();
                }
                function openModel() {
                    ModalService.open({
                        'template': 'example.html',
                        'shopsData': config.shops,
                        'areaData': config.area,
                        'row': row,
                        'shopIds': shopIds,
                        'index': index,
                        'id': id,
                        'param': param,
                        'platData': platData,
                        'title': title,
                        'province': config.province,
                        'city': config.citys,
                        'dist': config.dists,
                        'getCities': function(type, data) {
                            var setStr, setId;
                            setStr = type == 0 ? data.param.province : data.param.city;
                            setId = type == 0 ? config.province_hash[setStr] : data.city_hash[setStr];
                            if (setId != undefined) {
                                service.getCity(setId).then(function(resp) {
                                    if (resp.returnVal) {
                                        if (type == 0) {
                                            data.city = resp.returnVal;
                                            data.city_hash = oms.hash(data.city, 'areaname', 'id');
                                            if (data.param.city && data.param.city.length) {
                                                getCities(1);
                                            }
                                        }
                                        else {
                                            data.dist = resp.returnVal;
                                        }
                                    } else {
                                        alert('没有数据');
                                    }
                                }, function() {
                                    console.log('Error while Logistic!');
                                });
                            }
                        },
                        'refreshArea': function(data) {
                            return service.platform(data.param.areaCode).then(function(response) {
                                data.platData = response;
                            });
                        },
                        'addContact': function(e, data) {
                            e.preventDefault();
                            var obj = {
                                'name': '',
                                'telephone': '',
                                'email': '',
                                'conType': '',
                                'address': ''
                            };
                            if (!data.param.contactsInfoListVO) {
                                data.param.contactsInfoListVO = [];
                            }
                            data.param.contactsInfoListVO.push(obj);    
                        },
                        'removeContact': function(e, index, data) {
                            e.preventDefault();
                            data.param.contactsInfoListVO.splice(index, 1);    
                        }  
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (result) {
                                // console.log(modal.data);
                                var data = modal.scope.data;
                                var params = data.param;
                                if (params.contactsInfoListVO && params.contactsInfoListVO.length) {
                                    for(var i in params.contactsInfoListVO) {
                                        var obj = {
                                            "conType": '',
                                            "name": '',
                                            "telephone": '',
                                            "email": '',
                                            "address": ''
                                        };
                                        if (params.contactsInfoListVO[i].id) {
                                            obj.id = '';
                                        }
                                        params.contactsInfoListVO[i] = oms.pick(params.contactsInfoListVO[i], obj);
                                    }
                                }
                                else {
                                    delete params.contactsInfoListVO;
                                }
                                return service.addShop(oms.dig(params), id).then(function(response) {
                                    if (response.returnCode == 0) {
                                        var resps = response.returnVal;
                                        if (id != -1) {
                                            vm.shopData.splice(data.index, 1);
                                            // alert("更新成功");
                                            oms.notify("更新成功", "success");

                                        } else {
                                            // $scope.ShopListId.id = resps.id;
                                            shopIds.push({'id':resps.id});
                                            // alert("添加成功");
                                            oms.notify("添加成功", "success");
                                        }
                                        var all_obj = {};
                                        for (var i in data.shopsData) {
                                            all_obj[data.shopsData[i].parentId] = data.shopsData[i];
                                        }
                                        if (resps.parentId) {
                                            resps.preName = all_obj[resps.parentId].value;
                                            resps.preCode = all_obj[resps.parentId].code;
                                        }
                                        resps.isRecord = resps.isRecord == 1 ? '是' : '否';
                                        resps.isValid = resps.isValid == 1 ? '激活' : '禁用';
                                        vm.shopData.push(resps);
                                    }
                                });
                            }
                        })
                    });
                }
                
            }, function() {
                console.log('Error while Detail!');
            });
        };
    }]);
})
