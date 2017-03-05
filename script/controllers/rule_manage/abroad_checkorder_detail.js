define(['app'], function(app) {

    return app.controller('AbroadCheckOrderDetailCtrl', ['$scope', 'oms', 'AbroadCheckOrderService', '$stateParams', '$timeout', '$state', '$uibModal', '$log', 'ModalService', 'flatFilter', function($scope, oms, service, $stateParams, $timeout, $state, $uibModal, $log, ModalService, flat) {

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope;

        var paras = $stateParams;

        var id = paras.id;

        var isCreate = (id === undefined || id === 'create') ? 1 : 0;

        var page = {
            title: (isCreate ? '新增' : '编辑') + '跨境审单规则'
        };

        var config = {
            'ruleSences': [{"key":"2","value":"订单推送"},{"key":"1","value":"订单导入"}],
            'rangeTypes': [{"key":0,"value":"全部"},{"key":1,"value":"仓库"},{"key":2,"value":"商家"},{"key":3,"value":"店铺"}],
            'allCities': {},
            'allDists': {}
        };

        var initCityName;

        // 增加一行的临时变量
        var parms = {
            logisticName: '',
            province: '',
            city: '',
            dist: '',
            somecities: '',
            somegoods: '',
            somehscoods: ''
        }
        // 规则内容数据
        var ruleInfo = {
            checks: {
                "logistic": false,
                "orderAmount": false,
                "profile": false,
                "realAmount": false,
                "payment": false,
                "taxAmount": false,
                "postFee": false,
                "insuranceFee": false,
                "disAmount": false,
                "orderNum": false,
                "someCities": false,
                "goodsAmount": false,
                "someGoods": false,
                "someHSCodes": false,
                "otherMount": false,
            },
            specialLogistic: [],
            orderAmount: '',
            realAmount: '',
            orderNum: '',
            someCities: [],
            goodsAmount: '',
            otherMount: '',
            someGoods: [],
            someHSCodes: []
        }

        vm.isLoading = false;

        vm.page = page;

        vm.isCreate = isCreate;

        vm.data = {};

        vm.config = config;

        vm.parms = parms;

        vm.ruleInfo = ruleInfo;

        vm.removeItem = removeItem;

        vm.addItem = addItem;

        // 批量添加弹框
        vm.addGoods = addGoods;

        // 保存
        vm.saveAbroad = saveAbroad;

        vm.getCities = getCities;
        // 根据范围类型选择构建树的数据
        vm.changeTree = changeTree;

        vm.openCalendar = function(e,moment) {
            e.preventDefault();
            e.stopPropagation();
            if (moment == 0) {
                vm.isOpen = true;
            }else {
                vm.isEnd = true;
            }
        };

        var treeData;

        init();

        function init() {
            // 转换使用场景
            config.rule_hash = oms.hash(config.ruleSences, 'value', 'key');
            loadingTimeout = $timeout(function() {
                vm.isLoading = true;
            }, loadingLatency);
            // var allCity = sessionStorage.getItem("area_info");
            // if (allCity) {

            // }
            oms.config('areas').then(function(resp){
                //console.log(resp)
                if (resp.returnVal) {
                    // console.log(resp.returnVal);
                    config.area_info = resp.returnVal;
                    // var sessionSearch = sessionStorage.getItem("goods_declear");
                    setArea(config.area_info);
                    // 获取快递
                    service.getLogistic().then(function(resp) {
                        if (resp.returnVal) {
                            config.logisticList = resp.returnVal;
                            getAll();
                        } else {
                            vm.isLoading = false;
                            $timeout.cancel(loadingTimeout);
                            oms.alert(resp.returnMsg);
                        }
                    }, function() {
                        console.log('Error while Logistic!');
                    });
                } else {
                    vm.isLoading = false;
                    $timeout.cancel(loadingTimeout);
                    alert('没有地区数据');
                }
            });
            
        }
        function getAll() {
            if (!isCreate) {
                // 所有的仓库以及店铺
                service.getInfo(id).then(function(resp) {
                    if (resp.returnVal) {
                        treeData = resp.returnVal.shopCompanyWarehouseInfo;
                        setData(resp.returnVal);
                    } else {
                        alert('没有数据');
                    }
                    vm.isLoading = false;
                    $timeout.cancel(loadingTimeout);
                }, function() {
                    console.log('Error while Detail!');
                });
            } else {
                // 所有的仓库以及店铺
                service.getRange().then(function(resp) {
                    if (resp.returnVal) {
                        treeData = resp.returnVal.shopCompanyWarehouseInfo;
                        setData(resp.returnVal);
                        vm.data.verifyRangeType = 0;
                        vm.data.isValid = 1;
                    } else {
                        alert('没有数据');
                    }
                    vm.isLoading = false;
                    $timeout.cancel(loadingTimeout);
                }, function() {
                    console.log('Error while Detail!');
                });
            }
        }
        function getLog() {
            // 获取省
            service.getProvince().then(function(resp) {
                if (resp.returnVal) {
                    config.province = resp.returnVal;
                    config.province_hash = oms.hash(config.province, 'areaname', 'id');
                    getAll();
                } else {
                    alert('没有数据');
                }
            }, function() {
                console.log('Error while Logistic!');
            });
        }

        /**
         * 获取市区信息
         */
        function getCities(type, item) {
            if (type == 0) {
                if (item) {
                    item.citys = config.allCities[item.province];
                }
                else {
                    config.city = config.allCities[parms.province];
                }
            }
            else {
                if (item) {
                    item.dists = config.allDists[item.city];
                }
                else {
                    config.dist = config.allDists[parms.city];
                }
            }
        }

        function setArea(area) {
            for(var i in area) {
                var curPro = area[i].areaname;
                if (area[i].children) {
                    config.allCities[curPro] = area[i].children;
                    for(var j in area[i].children) {
                        var curCity = area[i].children[j].areaname;
                        if (area[i].children[j].children) {
                            config.allDists[curCity] = area[i].children[j].children;
                        }
                    }
                }
            }
        }

        /**
         * 解析表达式
         * @param {[]} predata [预格式化数据]
         */
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
        /**
         * 格式化数据
         * @param {[]} predata [预格式化数据]
         */
        function setData(data) {
            // 树形结构
            if (data && data.shopCompanyWarehouseInfo) {                
                // 初始化树结构
                vm.data.verifyRangeType = data.verifyRangeType;
                data.shopCompanyWarehouseInfo = changeTree();
            }
            // 规则内容
            if (data && data.verifyRuleItem) {
                var objs = data.verifyRuleItem;
                for(var i in objs) {
                    var type = objs[i].ruleType;
                    var exp = objs[i].expression;
                    switch(type) {
                        case 1 :                               
                                ruleInfo.checks.logistic = true;
                                var logsName = rePick(exp, 'logisticsCode'),
                                    proName = rePick(exp, 'province'),
                                    cityName = rePick(exp, 'city'),
                                    distName = rePick(exp, 'district'),
                                    citys, dists;
                                // 多个快递满足一个地区
                                if (proName) {
                                    citys = config.allCities[proName];
                                }
                                if (cityName) {
                                    dists = config.allDists[cityName];
                                }
                                if (logsName.indexOf(',') >= 0) {
                                    var eachLog = logsName.split(',');
                                    for(var i in eachLog) {
                                        var objLog = {
                                            "logisticName": eachLog[i],
                                            "province": proName,
                                            "city": cityName,
                                            "dist": distName,
                                            "citys": citys,
                                            "dists": dists
                                        };
                                        ruleInfo.specialLogistic.push(objLog);
                                    }
                                }
                                else {
                                    var objLog = {
                                        "logisticName": rePick(exp, 'logisticsCode'),
                                        "province": proName,
                                        "city": cityName,
                                        "dist": distName,
                                        "citys": citys,
                                        "dists": dists
                                    };
                                    ruleInfo.specialLogistic.push(objLog);
                                }
                                
                                break;
                        case 2 : 
                                ruleInfo.checks.orderAmount = true;
                                ruleInfo.orderAmount = exp.match(/[0-9]*\.?[0-9]+$/ig);
                                break;
                        case 3 : 
                                ruleInfo.checks.profile = true;
                                break;
                        case 4 : 
                                ruleInfo.checks.realAmount = true;
                                if (exp.indexOf('payment') >= 0) {
                                    ruleInfo.checks.payment = true;
                                }
                                if (exp.indexOf('taxAmount') >= 0) {
                                    ruleInfo.checks.taxAmount = true;
                                }
                                if (exp.indexOf('postFee') >= 0) {
                                    ruleInfo.checks.postFee = true;
                                }
                                if (exp.indexOf('insuranceFee') >= 0) {
                                    ruleInfo.checks.insuranceFee = true;
                                }
                                if (exp.indexOf('disAmount') >= 0) {
                                    ruleInfo.checks.disAmount = true;
                                }
                                ruleInfo.realAmount = exp.match(/[0-9]*\.?[0-9]+$/ig);
                                break;
                        case 5 : 
                                ruleInfo.checks.orderNum = true;
                                ruleInfo.orderNum = exp.replace(/[^0-9]/ig,"");
                                break;
                        case 6 : 
                                ruleInfo.checks.someCities = true;
                                var obj = {
                                    "cityName" : rePick(exp, 'address')
                                }
                                ruleInfo.someCities.push(obj);
                                break;
                        case 7 : 
                                ruleInfo.checks.goodsAmount = true;
                                ruleInfo.goodsAmount = rePick(exp, 'percentage');
                                ruleInfo.startTime = new Date(Date.parse(rePick(exp, 'beginTime').replace(/-/g, "/")));
                                ruleInfo.endTime = new Date(Date.parse(rePick(exp, 'endTime').replace(/-/g, "/")));
                                // alert(ruleInfo.startTime + rePick(exp, 'beginTime'));
                                break;
                        case 8 : 
                                ruleInfo.checks.someGoods = true;
                                var obj = {
                                    "goodsName" : rePick(exp, 'productId')
                                }
                                ruleInfo.someGoods.push(obj);
                                break;
                        case 9 : 
                                ruleInfo.checks.someHSCodes = true;
                                var obj = {
                                    "hsCodes" : rePick(exp, 'hsCode')
                                }
                                ruleInfo.someHSCodes.push(obj);
                                break;
                        case 10 : 
                                ruleInfo.checks.otherMount = true;
                                ruleInfo.otherMount = exp.match(/[0-9]*\.?[0-9]+$/ig);
                                break;
                    }
                }
                // console.log(ruleInfo.startTime+ruleInfo.endTime)
            }
            // 适用场景
            if (data && data.sceneDesc) {
                var scene = data.sceneDesc;
                if (scene == '2') {
                    config.ruleSences[0].check = true;
                }
                else if (scene == '1') {
                    config.ruleSences[1].check = true;
                }
                else if (scene == '0') {
                    config.ruleSences[0].check = true;
                    config.ruleSences[1].check = true;
                }
            }
            vm.data = data;
        }

        /**
         * save
         * @return {[type]} [description]
         */
        function saveAbroad() {
            // getData(vm.data)
            // init();
            // setArea(config.area_info);
            var pullData = getData(vm.data);
            if (pullData != '') {
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
                                    $state.go('app.abroad_check_order_list');
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
        }

        /**
         * 获取数据
         * @param {[]} predata [预格式化数据]
         */
        function getData(data) {
            // 获取适用场景
            var rules = 0;
            for(var i in config.ruleSences) {
                if (config.ruleSences[i].check) {
                    data.sceneDesc = config.rule_hash[config.ruleSences[i].value];
                    rules ++ ;
                }
            }
            if (rules == 2) {
                data.sceneDesc = 0;
            }
            else if(rules == 0) {
                data.sceneDesc = 'null';
            }

            vm.data.remark = vm.data.remark == undefined ? '' : vm.data.remark;
            if (data.sceneDesc == "null" || data.sceneDesc == null) {
                oms.alert("请选择适用场景");
                return '';
            }
            if (getRuleItem() == 1) {
                return '';
            }
            else {
                var datas = isCreate ? {
                    "name": data.name,
                    "isValid": data.isValid,
                    "sceneDesc": data.sceneDesc,
                    "remark": vm.data.remark,
                    "verifyRuleItem": getRuleItem(),
                    "verifyRuleRange":getRuleRange(vm.data.shopCompanyWarehouseInfo)
                } : {
                    "id": id,
                    "name": data.name,
                    "isValid": data.isValid,
                    "sceneDesc": data.sceneDesc,
                    "remark": vm.data.remark,
                    "verifyRuleItem": getRuleItem(),
                    "verifyRuleRange":getRuleRange(vm.data.shopCompanyWarehouseInfo)
                }
            }
            datas = oms.dig(datas);
            return datas;
        }

        function fix0(v) {
            return (v < 9) ? ('0' + v) : v;
        }
        function getTime(item) {
            var forDate = item;
            var formatDate = forDate.getFullYear() + '-' +
                            fix0(forDate.getMonth() + 1) + '-' +
                            fix0(forDate.getDate()) + ' ' +
                            fix0(forDate.getHours()) + ':' +
                            fix0(forDate.getMinutes()) + ':' +
                            fix0(forDate.getSeconds());
            return formatDate;
        }
        function compareTime(date1, date2) {
            date1 = date1.replace(/\-/gi,"/");
            date2 = date2.replace(/\-/gi,"/");
            var time1 = new Date(date1).getTime();
            var time2 = new Date(date2).getTime();
            if(time1 > time2){
                return 1;
            }else if(time1 == time2){
                return 2;
            }else{
                return 3;
            }
        }
        // 获取规则内容
        function getRuleItem() {
            var ruleItem = [];
            var eachRule = [], eachLog = [];
            if (ruleInfo) {
                // 指定快递
                if (ruleInfo.checks.logistic) {
                    if (parms.logisticName) {
                        var expInfo = parms.logisticName;
                        if (parms.province.length > 0) {
                            var eachPro = "&province=" + parms.province;  // 记录省市区数据
                        }
                        if (parms.city.length > 0) {
                            eachPro += "&city=" + parms.city;
                        }
                        if (parms.dist.length > 0) {
                            eachPro += "&district=" + parms.dist;
                        }
                        var obj = {"log": expInfo, "pro": eachPro};
                        eachLog.push(obj);
                        eachRule.push(eachPro);
                    }
                    var typeLog = ruleInfo.specialLogistic;
                    if (typeLog.length > 0) {
                        for(var i in typeLog) {
                            var expInfo = typeLog[i].logisticName;
                            if (typeLog[i].province) {
                                var eachPro = "&province=" + typeLog[i].province;  // 记录省市区数据
                            }
                            if (typeLog[i].city) {
                                eachPro += "&city=" + typeLog[i].city;
                            }
                            if (typeLog[i].dist) {
                                eachPro += "&district=" + typeLog[i].dist;
                            }
                            // var obj = {"ruleType": 1, "expression": expInfo, "name": "指定快递"};
                            // ruleItem.push(obj);
                            var obj = {"log": expInfo, "pro": eachPro};
                            eachLog.push(obj);
                            eachRule.push(eachPro);
                        }
                    }
                    if (eachRule.length) {
                        for(var i = 0; i < eachRule.length; i++) {
                            var curRule = eachRule[i];
                            var expLog = eachLog[i].log;
                            for(var j= i+1; j < eachRule.length-i; j++) {
                                if (eachRule[j] == curRule) {
                                    if (eachLog[j].log != eachLog[i].log) {
                                        expLog += ',' + eachLog[j].log;
                                    }
                                    else {
                                        oms.notify("指定快递中相同的快递限制相同的地区将作为一条限制数据","warning");
                                    }
                                    eachRule[j] = '';
                                }
                            }
                            if (curRule != '') {
                                var expObj = 'logisticsCode=' + expLog + curRule;
                                var expObjs = {"ruleType": 1, "expression": expObj, "name": "指定快递"};
                                ruleItem.push(expObjs);
                            }
                        } 
                    }
                    // console.log(ruleItem);
                    // return 1;
                }
                // 订单金额限制
                if (ruleInfo.checks.orderAmount && ruleInfo.orderAmount) {
                    var expInfo = "amount<=" + ruleInfo.orderAmount;
                    var obj = {"ruleType": 2, "expression": expInfo, "name": "订单金额限制"};
                    ruleItem.push(obj);
                }
                // 身份证
                if (ruleInfo.checks.profile) {
                    var expInfo = "ID";
                    var obj = {"ruleType": 3, "expression": expInfo, "name": "身份证黑白名单验证"};
                    ruleItem.push(obj);
                }
                // 实付金额
                if (ruleInfo.checks.realAmount && ruleInfo.realAmount) {
                    var expInfo = "";
                    var allChecks = [];
                    if (ruleInfo.checks.payment) {
                        allChecks.push("payment");
                    }
                    if (ruleInfo.checks.taxAmount) {
                        allChecks.push("taxAmount");
                    }
                    if (ruleInfo.checks.postFee) {
                        allChecks.push("postFee");
                    }
                    if (ruleInfo.checks.insuranceFee) {
                        allChecks.push("insuranceFee");
                    }
                    for(var i = 0; i < allChecks.length; i++) {
                        if (i == allChecks.length-1) {
                            expInfo += allChecks[i];
                        }
                        else {
                            expInfo += allChecks[i] + '+';
                        }
                    }
                    if (ruleInfo.checks.disAmount) {
                        expInfo += "-disAmount";
                    }
                    expInfo += "<=" + ruleInfo.realAmount;
                    var obj = {"ruleType": 4, "expression": expInfo, "name": "实付金额校验"};
                    ruleItem.push(obj);
                }
                // 订单数量
                if (ruleInfo.checks.orderNum && ruleInfo.orderNum) {
                    var expInfo = "qty<=" + ruleInfo.orderNum;
                    var obj = {"ruleType": 5, "expression": expInfo, "name": "订单数量限制"};
                    ruleItem.push(obj);
                }
                // 敏感地址
                if (ruleInfo.checks.someCities) {
                    if (parms.somecities) {
                        var expInfo = "address=" + parms.somecities;
                        var obj = {"ruleType": 6, "expression": expInfo, "name": "敏感地址排除"};
                        ruleItem.push(obj);
                    }
                    if (ruleInfo.someCities.length > 0) {
                        for(var i in ruleInfo.someCities) {
                            var expInfo = "address=" + ruleInfo.someCities[i].cityName;
                            var obj = {"ruleType": 6, "expression": expInfo, "name": "敏感地址排除"};
                            ruleItem.push(obj);
                        }
                    }
                }
                // 商品金额
                if (ruleInfo.checks.goodsAmount && ruleInfo.goodsAmount) {
                    var expInfo = "percentage=" + ruleInfo.goodsAmount;
                    if (ruleInfo.startTime) {
                        var startTime = getTime(ruleInfo.startTime);
                    }
                    if (ruleInfo.endTime) {
                        var endTime = getTime(ruleInfo.endTime);
                    }
                    if (startTime && endTime) {
                        var comStart = compareTime(startTime, endTime);
                        if (comStart == 1) {
                            oms.alert("活动开始时间不能晚于结束时间！");
                            return 1;
                        }
                        else {
                            expInfo += "&beginTime=" + startTime + "&endTime=" + endTime;
                            var obj = {"ruleType": 7, "expression": expInfo, "name": "商品金额限制"};
                            ruleItem.push(obj);
                        }
                    }
                    else {
                        oms.alert("请检查活动开始时间和结束时间！");
                        return 1;
                    }
                }
                // 税额限制
                if (ruleInfo.checks.otherMount) {
                    if (ruleInfo.otherMount) {
                        var expInfo = "diffVal=" + ruleInfo.otherMount;
                    }
                    else {
                        var expInfo = "diffVal=0";
                    }
                    var obj = {"ruleType": 10, "expression": expInfo, "name": "保税和BC模式税额限制"};
                    ruleItem.push(obj);
                }
                // 商品限制
                if (ruleInfo.checks.someGoods) {
                    if (parms.somegoods) {
                        var expInfo = "productId=" + parms.somegoods;
                        var obj = {"ruleType": 8, "expression": expInfo, "name": "商品限制"};
                        ruleItem.push(obj);
                    }
                    if (ruleInfo.someGoods.length > 0) {
                        for(var i in ruleInfo.someGoods) {
                            var expInfo = "productId=" + ruleInfo.someGoods[i].goodsName;
                            var obj = {"ruleType": 8, "expression": expInfo, "name": "商品限制"};
                            ruleItem.push(obj);
                        }
                    }
                }
                // HS编码限制
                if (ruleInfo.checks.someHSCodes) {
                    if (parms.somehscoods) {
                        var expInfo = "hsCode=" + parms.somehscoods;
                        var obj = {"ruleType": 9, "expression": expInfo, "name": "HS编码限制"};
                        ruleItem.push(obj);
                    }
                    if (ruleInfo.someHSCodes.length > 0) {
                        for(var i in ruleInfo.someHSCodes) {
                            var expInfo = "hsCode=" + ruleInfo.someHSCodes[i].hsCodes;
                            var obj = {"ruleType": 9, "expression": expInfo, "name": "HS编码限制"};
                            ruleItem.push(obj);
                        }
                    }
                }
            }
            return ruleItem;
        }
        // 获取规则范围
        function getRuleRange(items) {
            var ruleRange = [];
            var d = oms.filter(flat(items), { 'checked': true });
            var rangesType = vm.data.verifyRangeType;
            switch(rangesType) {
                case 0 : 
                        var warehouse = angular.copy(treeData);
                        for(var i = 0; i < warehouse.length; i++) {
                            var obj = {"expression" : warehouse[i].warehouseCode};
                            ruleRange.push(obj);
                        }
                        break;
                case 1 : 
                        for (var i = d.length - 1; i >= 0; i--) {
                            var exp = '';
                            if (d[i].checked) {
                                var obj = {"expression" : d[i].warehouseCode};
                                ruleRange.push(obj);
                            }
                        }
                        break;
                case 2 : 
                        for (var i = d.length - 1; i >= 0; i--) {
                            var exp = '';
                            if (d[i].checked) {
                                if (d[i].companyCode != null) {
                                    var obj = {"expression" : d[i].warehouseCode + '-' + d[i].companyCode};
                                    ruleRange.push(obj);
                                }
                            }
                        }
                        break;
                case 3 : 
                        for (var i = d.length - 1; i >= 0; i--) {
                            var exp = '';
                            if (d[i].checked) {
                                if (d[i].companyCode != null && d[i].shopCode != null) {
                                    var obj = {"expression" : d[i].warehouseCode + '-' + d[i].companyCode + '-' + d[i].shopCode};
                                    ruleRange.push(obj);
                                }
                            }
                        }
                        break;
            }
            return ruleRange;
        }

        /**
         * 转换权限数组为 权限树
         * @param  {[type]} d    [权限数组]
         * @param  {[type]} atom [权限原子操作]
         * @return {[type]}      [权限树]
         */
        function convPermissions(data) {
            //预处理权限,给有选中状态的标记
            var d = data;
            for (var i in d) {
                d[i].checked = !!d[i].isSelected;
                d[i].code = d[i].warehouseCode;
                d[i].name = d[i].warehouseName;
                for(var j in d[i].children) {
                    d[i].children[j].checked = !!d[i].children[j].isSelected;
                    d[i].children[j].code = d[i].children[j].companyCode;
                    d[i].children[j].name = d[i].children[j].companyName;
                    for(var k in d[i].children[j].children) {
                        d[i].children[j].children[k].checked = !!d[i].children[j].children[k].isSelected;
                        d[i].children[j].children[k].code = d[i].children[j].children[k].shopCode;
                        d[i].children[j].children[k].name = d[i].children[j].children[k].shopName;  
                    }
                }
            }
            return d;
        }     
        function convTwo(data) {
            //预处理权限,给有选中状态的标记
            var d = data;
            for (var i in d) {
                d[i].checked = !!d[i].isSelected;
                d[i].code = d[i].warehouseCode;
                d[i].name = d[i].warehouseName;
                d[i].children = '';
            }
            return d;
        } 
        function convThree(data) {
            //预处理权限,给有选中状态的标记
            var d = data;
            for (var i in d) {
                d[i].checked = !!d[i].isSelected;
                d[i].code = d[i].warehouseCode;
                d[i].name = d[i].warehouseName;
                for(var j in d[i].children) {
                    d[i].children[j].checked = !!d[i].children[j].isSelected;
                    d[i].children[j].code = d[i].children[j].companyCode;
                    d[i].children[j].name = d[i].children[j].companyName;
                    d[i].children[j].children = '';
                }
            }
            return d;
        }     
        // 判断范围类型，控制树的显示 所有的原数据都从treeData里面取
        function changeTree() {
            var rangeType = vm.data.verifyRangeType;
            var treesData, dataTree=angular.copy(treeData);
            switch(rangeType) {
                case 0 : 
                        treesData = '';
                        vm.data.shopCompanyWarehouseInfo = '';
                        break;
                case 1 : 
                        treesData = convTwo(dataTree);
                        vm.data.shopCompanyWarehouseInfo = convTwo(dataTree);
                        break;
                case 2 : 
                        treesData = convThree(dataTree);
                        vm.data.shopCompanyWarehouseInfo = convThree(dataTree);
                        break;
                case 3 : 
                        treesData = convPermissions(dataTree);
                        vm.data.shopCompanyWarehouseInfo = convPermissions(dataTree);
                        break;
            }
            return treesData;
        }

        /**
         * 增加一行
         * @param {[]} predata [预格式化数据]
         * 稍后通过指令优化==\
         */
        function addItem(e,type) {
            e.preventDefault();
            e.stopPropagation();
            switch(type) {
                case 1 : 
                        var somelogistic = {
                                                "logisticName": parms.logisticName,
                                                "province": parms.province,
                                                "city": parms.city,
                                                "dist": parms.dist,
                                                "citys": config.city,
                                                "dists": config.dist
                                            }
                        ruleInfo.specialLogistic.push(somelogistic);
                        parms.logisticName = '';
                        parms.province = '';
                        parms.city = '';
                        parms.dist = '';
                        config.city = '';
                        config.dist = '';
                        break;
                case 2 : 
                        var somecity = {
                                            "cityName": parms.somecities
                                        }
                        ruleInfo.someCities.push(somecity);
                        parms.somecities = '';
                        break;
                case 3 : 
                        var somegood = {
                                            "goodsName": parms.somegoods
                                        }
                        ruleInfo.someGoods.push(somegood);
                        parms.somegoods = '';
                        break;
                case 4 : 
                        var somecode = {
                                            "hsCodes": parms.somehscoods
                                        }
                        ruleInfo.someHSCodes.push(somecode);
                        parms.somehscoods = '';
                        break;
            }          
        }    

        /**
         * 移除一行
         * @param {[]} predata [预格式化数据]
         */
        function removeItem(e, index, type) {
            e.preventDefault();
            e.stopPropagation();
            switch(type) {
                case 1 : ruleInfo.specialLogistic.splice(index,1);break;
                case 2 : ruleInfo.someCities.splice(index,1);break;
                case 3 : ruleInfo.someGoods.splice(index,1);break;
                case 4 : ruleInfo.someHSCodes.splice(index,1);break;
            }          
        }     

        /**
         * 批量添加弹框
         * @param  {[type]} row   [description]
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        function addGoods(item) {
            var title = item == 0 ? '批量添加商品' : '批量添加HS编码';
            var tip = item == 0 ? '商品货号' : 'HS编码';
            var code = ''; 
            openModel();
            // 打开弹框以及数据处理
            function openModel() {
                ModalService.open({
                    'template': 'example.html',
                    'title': title,
                    'tip': tip,
                    'code': code
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        // 点击确定按钮
                        if (result) {
                            var data = modal.scope.data.code;
                            if (data.lenght != 0) {
                                var codes = data.split(',');
                                if (item == 0) {
                                    // 添加商品
                                    for(var i in codes) {
                                        var obj = {"goodsName": codes[i]};
                                        ruleInfo.someGoods.push(obj);
                                    }
                                }
                                else {
                                    for(var i in codes) {
                                        var obj = {"hsCodes": codes[i]};
                                        ruleInfo.someHSCodes.push(obj);
                                    }
                                }
                            } 
                            else {
                                return;
                            }
                        }
                    })
                });
            }
        } 
        
        /*vm.ac_options = {
            suggest: suggestGoods,
            key:'name',
            select: function(item) {
                vm.data.hsCode = item.code;
                vm.data.consumptionDuty = item.raw.consumptionDuty;
            },
            verify:function(r){
                vm.page.verify.hsCode = r;
            }
        }*/

        //预查询方法
        /*function suggestGoods(key) {
            return service.suggestHS(key, customs.toUpperCase()).then(function(resp) {
                // console.log(resp);
                if(resp.returnVal == null){
                    vm.HSerrorMsg = true;
                }
                else{
                    vm.HSerrorMsg = false;
                }
                return formatSuggest(resp.returnVal);
            })
        }*/

        //预查询数据排列方式
        /*function formatSuggest(data) {
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ code: data[i].code, value: data[i].name, label: data[i].code + '  (' + data[i].name + ')', raw: data[i] })
            }
            return obj;
        }*/
    }]);
})
