define(['app'], function(app) {

    return app.controller('GoodsRecordDetailCtrl',['$scope', 'oms', 'GoodsRecordService', '$stateParams', '$timeout', '$state',
        function($scope, oms, service, $stateParams, $timeout, $state) {

            var loadingLatency = oms.options.loadingLatency || 100,
                loadingTimeout;

            var vm = $scope;

            var paras = $stateParams;

            var id = paras.id;

            var customs = paras.customs;
            // add 1 , modify 0;
            var isCreate = (id === undefined || id === 'create') ? 1 : 0;

            vm.HSerrorMsg = false;
            vm.UnitErrorMsg =false;  //cq申报计量单位
            vm.QuerybarerrorMsg = false;    //商品编码

            var data = {
                "id": "", //ID
                "bcode": "", //商家代码
                "name": "", //中文名称
                "nameEn": "", //英文名称
                "hsCode": "", //HS编码
                "tariffNo": "", //进口税规则
                "weight": "", //净重
                "property": "", //规格型号
                "gproduction": "", //原产地
                "brand": "", //品牌
                "unit": "", //常用单位
                "guse": "", //用途
                "gcomposition": "", //成分
                "gfunction": "", //功能
                "detail": "", //商品描述
                "dsSku": "", //电商SKU
                "dsSkuCode": "", //电商条码
                "comments": "", //商品备注
                "warehouseCode": "", //仓库代码
                "bizType": "", //清关模式，1:"",//保税备货，2:"",//保税集货
                "supplier": "", //供应商
                "hsFileName": "", //商品图片文件名
                "hsFileUrl": "", //hs_file_url
                "cnFileName": "", //中文标签图片文件名
                "cnFileUrl": "", //中文标签图片文件地址
                "attachFile1Name": "", //宁波:"",//附件1-(商品或生产企业取得的认证、注册、备案等资质)。 重庆:"",//食药监局、国家认监委备案附件（cnca_por_doc）"
                "attachFile2Name": "", //宁波:"",//附件2-(商品取得的自由销售证明、第三方检验鉴定证书)。\n            重庆:"",//原产地证书 origin_place_cert",
                "attachFile3Name": "", //宁波:"",//附件3-(产品说明的中文对照资料)。 重庆:"",//境外官方及第三方机构的检测报告 test_report",
                "attachFile4Name": "", //宁波:"",//附件4-(消费警示)。\n            重庆:"",//合法采购证明（国外进货发票或小票）legal_ticket",
                "attachFile5Name": "", //宁波:"",//附件5-(其他可提供的证明材料)。\n            重庆:"",//外文标签的中文翻译件mark_exchange",
                "cpFileName": "", //成分图片文件名
                "legalQty": "", // "宁波:"",//法定数量，重庆:"",//法定计量单位折算数量",
                "secondQty": "", // double DEFAULT NULL COMMENT "第二数量",
                "isValid": "", //  int(11) DEFAULT "1" COMMENT "数据状态-数据是否有效:"",//0:"",//无效,1:"",//有效",
                "createTime": "", //  datetime DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间",
                "updatetime": "", //  datetime DEFAULT CURRENT_TIMESTAMP COMMENT "更新时间",
                "remark": "", //varchar(500) DEFAULT NULL COMMENT "备注信息",
                "syncStatus": "", //"同步状态",
                "productId": "", //"货号-（跨境平台商品备案时产生的唯一编码）",
                "customId": "", //"海关ID:"",//china_customs.id",
                "customCode": "", //"海关编码-海关CODE:"",//china_customs.code",
                "tax": "", // "税率（小数显示，例:"",//0.1=10%）审核通过的商品才有",
                "customStatusDesc": "", //海关状态（0=未申报,1=待审批,2=审批通过,3=审批不通过,9=锁定）",
                "gjStatusDesc": "", //"国检状态（1=锁定,0=正常）",
                "warehouseName": "", //"仓库名称",
                "tariff": "", //"关税税率",
                "addedValueTax": "", //"增值税税率",
                "consumptionDuty": "", //消费税税率",
                "declareUnit": "", //申报计量单位",
                "inAreaUnit": "", //入区计量单位",
                "convInAreaUnitNum": "", //入区计量单位折算数量",
                "isExperimentGoods": "", //是否试点商品，0:"",否1:"",//是\n            ",
                "isCncaPorDoc": "", //是否存在食药监局、国家认监委备案附件0:"",//否1:"",//是",
                "isOriginPlaceCert": "", //是否存在原产地证书，0:"",//否1:"",是\n            ",
                "isTestReport": "", //是否存在境外官方及第三方机构的检测报告0:"",否1:"",是",
                "isLegalTicket": "", //是否存在合法采购证明（国外进货发票或小票）0:"",否1:"",是",
                "isMarkExchange": "", //是否存外文标签的中文翻译件0:"",//否1:"",//是",
                "goodsTypeCode": "", //varchar(10) DEFAULT NULL COMMENT "商品分类代码",
                "externalNo": "", //varchar(30) DEFAULT NULL COMMENT "外部系统编号",
                "goodsSpec": "", //varchar(600) DEFAULT NULL COMMENT "行邮税号",
                "originCountryCode": "", //varchar(4) DEFAULT NULL COMMENT "国家地区代码",
                "isCncaPor": "", //"国外生产企业是否在中国注册备案（食药监局、国家认监委）",
                "checkOrgCode": "", //varchar(10) DEFAULT NULL COMMENT "施检机构的代码",
                "producerName": "", //varchar(200) DEFAULT NULL COMMENT "生产企业名称",
                "goodsNameChinese": "", //varchar(500) DEFAULT NULL COMMENT "中文翻译名",
                "shelfLifeFlag": "", //是否管理有效期
                "cycleClass":"",//储存条件
                "isToCustom": "",//是否推送至海关
                "createTime": "",//创建时间
                "toCustomTime": "",//推送海关时间
                "toWmsTime": "",//推送WMS时间
                "statusDesc": "",//最新状态
                "remark": "",//最新失败消息
                "customStatus": "",//海关状态（0=未申报,1=待审批,2=审批通过,3=审批不通过,9=锁定）
                "gjStatus": "",//国检状态  
                "dsSkuCode": "",//商品条码
                "declareUnit": "" //第二单位
            }

            var field = {
                NBC: {
                    "productId": "",
                    "brand": "",
                    "name": "",
                    "nameEn": "",
                    "hsCode": "",
                    "tariff": "",
                    "addedValueTax": "",
                    "consumptionDuty": "",
                    "tariffNo": "",
                    "supplier": "",
                    "gproduction": "",
                    "weight": "",
                    "property": "",
                    "unit": "",
                    "guse": "",
                    "dsSku": "",
                    "gcomposition": "",
                    "gfunction": "",
                    "warehouseCode": "",
                    "legalQty": "",
                    "secondQty": "",
                    "comments": "",
                    "detail": "",
                    "isToCustom": "",
                    "price":"", //单价
                    "createTime": "",//创建时间
                    "toCustomTime": "",//推送海关时间
                    "statusDesc": "",//最新状态
                    "remark": "",//最新失败描述
                    "customStatusDesc": "",//海关状态（0=未申报,1=待审批,2=审批通过,3=审批不通过,9=锁定）
                    "gjStatusDesc": "",//国检状态
                    "dsSkuCode": "", //商品条码    
                    "declareUnit": "" //第二单位
                },
                CQC: { "productId": "", "name": "", "hsCode": "", "tariff": "", "addedValueTax": "", "consumptionDuty": "", "property": "",
                    "declareUnit": "", "unit": "", "legalQty": "", "inAreaUnit": "", "convInAreaUnitNum": "", "dsSkuCode": "", "isExperimentGoods": "0" ,
                    "gproduction": "", "shelfLifeFlag": 0, "shelfLife": "", "shelfLifeAlertDays": "", "inBoundLifeDays": "", "brand": "", "price": "",
                    "skuCube": "", "grossWeight": "", "weight": "", "tare": "", "foamWeight": "", "skuLength": "", "skuWidth": "", "skuHeight": "", "nameEn": "",
                    "goodsNameChinese": "", "goodsTypeCode": "", "supplier": "", "checkOrgCode": "500400", "isCncaPor": "", "producerName": "", "comments": "",
                    "detail": "","cycleClass":'1',"outBoundLifeDays":'',"shelfLifeType":'',"bakSkuCode":"", "isToCustom": "",
                    "createTime": "","toWmsTime": "","remark": "","toCustomTime": "","statusDesc": "","customStatusDesc": "","gjStatusDesc": ""},

                DGC: {
                    "productId": "","name":"","dsSkuCode":"",
                    "brand": "","shelfLifeFlag":"",
                    "hsCode": "","gproduction":"",
                    "addedValueTax": "","price":"","tariff":"",
                    "consumptionDuty": "","currency":"",
                    "property": "","cycleClass":"",
                    "declareUnit": "","nameEn":"",
                    "dsSkuCode": "","shelfLifeFlag":"",
                    "isExperimentGoods": 0 ,
                    "unit": "","bakSkuCode":"",
                    "legalQty": "","shelfLifeType":"",
                    "inAreaUnit": "","shelfLife": "","shelfLifeAlertDays":"",
                    "convInAreaUnitNum": "","inBoundLifeDays": "","outBoundLifeDays": "",
                    "nameEn": "","skuCube": "", "nameEn": "",
                    "grossWeight": "","weight": "", "tare": "","foamWeight": "",
                    "skuLength": "","skuWidth": "", "skuHeight": "",
                    "goodsNameChinese": "",
                    "goodsTypeCode": "",
                    "isCncaPor": "",
                    "isToCustom": "",
                    "checkOrgCode": "",
                    "supplier": "","tax":"",
                    "originCountryCode": '',
                    "producerName": "",
                    "comments": "","tariffNo": "",
                    "detail": "","secondQty":"",
                    "tariff": "", "consumptionDuty": "", "addedValueTax": "",  //关税、增值税、消费税
                    "firstQty":"","firstLegalUnits":"","secondLegalUnits":"",
                    "convInAreaUnitNum":"",
                    "statusDesc": "","createTime": "","toWmsTime": "","remark": ""
                }
            };

            var page = {
                title: (isCreate ? '新增' : '查看') + '备案商品',

                bizTypes: [
                    { value: '1', name: '保税备货' },
                    { value: '2', name: '保税集货' }
                ],
                
                shelfLifeTypes: [
                    { value: 'R', name: '入库日期' },
                    { value: 'M', name: '生产日期' },
                    { value: 'E', name: '失效日期' }
                ],

                checkOrgCodes: [
                    { value: '500060', name: '重庆局经开办' },
                    { value: '500600', name: '重庆机场局本部' },
                    { value: '500601', name: '重庆机场局空港工作点' },
                    //默认
                    { value: '500400', name: '重庆两路-寸滩保税港区局本部' },
                    { value: '500500', name: '西永局本部' },
                    { value: '500020', name: '重庆铁路口岸B保' },

                ],

                cycleClasses : [
                    { value: '1', name: "常温" },
                    { value: '2', name: "恒温" }
                ],

                hsCodeName: '',

                verify:{
                    'declareUnit':true,
                    'inAreaUnit':true,
                    'unit':true,
                    'hsCode':true,
                    "dsSkuCode":true,
                },

                // 'status': [{"key":"2","value":"全部"},{"key":"0","value":"未设置"},{"key":"1","value":"已设置"}],

            };
            // console.log(page.status);
            // var status_hash = oms.hash(page.status, 'key', 'value');
            // console.log(status_hash);
            // console.log(status_hash[0])

            var upfiles = {
                'attachFile1': null,
                'attachFile2': null,
                'attachFile3': null,
                'attachFile4': null,
                'attachFile5': null,
                'hsFile': null,
                'cnFile': null
            }

            var field_extend = {
                'hsFileUrl': '',
                'cnFileUrl': '',
                'attachFile1Name': '',
                'attachFile2Name': '',
                'attachFile3Name': '',
                'attachFile4Name': '',
                'attachFile5Name': ''
            }

            vm.isLoading = true;

            vm.upfiles = upfiles;

            vm.page = page;

            vm.update = update;

            vm.reset = reset;

            vm.toCQCustom = toCQCustom;

            vm.isCreate = isCreate;

            vm.suggestUnit = suggestUnit;

            // 11/1新增两个按钮，推送和更新
            vm.updateGoods = updateGoods;

            vm.toInternational = toInternational;

            vm.Querybarcodes = Querybarcodes;

            //检验商品条码是否重复
            var olddsSkuCode;
            function Querybarcodes() {
                if (olddsSkuCode == vm.data.dsSkuCode) {
                    return;
                }
                else {
                    service.Querybarcodes(vm.data.dsSkuCode, customs.toUpperCase()).then(function(resp) {
                        if(resp.returnCode == -2){
                            oms.alert('商品条码重复，请确认');
                            // oms.notify('商品条码重复，请确认','error');
                        }
                    })
                }
            }

            //推送商品至海关
            function toCQCustom() {
                vm.isLoading = true;
                service.toCustom(id).then(function(resp) {
                    if(!resp.returnCode){
                        oms.notify('操作完成');
                        //oms.reload();
                    }else{
                        oms.alert(resp.returnMsg);
                    }
                    vm.isLoading = false;
                }, function(resp) {
                    oms.notify('操作失败，请重试','error');
                    vm.isLoading = false;
                })
            }

            //推送国际物流
            function toInternational() {
                vm.isLoading = true;
                service.toInternational(id).then(function(resp) {
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
                oms.reload();
            }

            //更新宁波备案商品
            function updateGoods() {

                vm.isLoading = true;
                service.updateGoods(vm.data.productId).then(function(resp) {
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
                oms.reload();
            }

            vm.ac_options = {
                suggest: suggestHS,
                key:'code',
                select: function(item) {
                    vm.data.hsCode = item.code;
                    vm.data.consumptionDuty = item.raw.consumptionDuty;
                    vm.data.tariff = item.raw.exportTaxRate;   //关税率
                    vm.data.addedValueTax = item.raw.addedValueTax;   //增值税率
                    vm.data.goodsTypeCode = item.raw.goodsTypeCode;     //消费税率
                    vm.data.declareUnit = item.raw.declareUnit;     //第二单位
                    if (page.customs == '沙田海关') {
                        vm.data.inAreaUnit = item.raw.firstLegalUnits;   //第一单位
                        vm.data.declareUnit = item.raw.secondLegalUnits;     //第二单位
                    }
                    else if (page.customs == '宁波海关') {
                        vm.data.declareUnit = item.raw.secondLegalUnits;     //第二单位
                    }
                },
                verify:function(r){
                    vm.page.verify.hsCode = r;
                }
            }

            //税则号suggestTariffNo提示
            vm.ac_optionsTariffNo = {
                suggest: suggestTariffNo,
                select: function(item) {
                    vm.data.tariffNo = item.value;
                    vm.data.tax = item.raw.taxRate;  //税率
                }
            }

            //原产地输入提示
            vm.ac_optionsCountry = {
                suggest: suggestCountry,
                select: function(item) {
                    vm.data.gproduction = item.value;
                }
            }

            //单位输入提示
            vm.ac_optionsDeclareUnit = {
                suggest: suggestUnit,
                key:'value',
                select: function(item) {
                    vm.data.declareUnit = item.value;
                },
                verify:function(r){
                    vm.page.verify.declareUnit = r;
                }
            }

            //单位输入提示
            vm.ac_optionsUnit = {
                suggest: suggestUnit,
                key:'value',
                select: function(item) {
                    vm.data.unit = item.value;
                },
                verify:function(r){
                    vm.page.verify.unit = r;
                }
            }

            //单位输入提示
            vm.ac_optionsInAreaUnit = {
                suggest: suggestUnit,
                key:'value',
                select: function(item) {
                    vm.data.inAreaUnit = item.value;
                },
                verify:function(r){
                    vm.page.verify.inAreaUnit = r;
                }
            }

            //商品分类提示
            vm.ac_optionsGoodsType = {
                suggest: suggestGoodsType,
                select: function(item) {
                    vm.data.goodsTypeCode = item.value;
                }
            }

            init();

            function update(type) {
                if (page.customs == '沙田海关') {
                    if (vm.data.declareUnit != undefined || vm.data.declareUnit != null) {
                        if (vm.data.secondQty != undefined && vm.data.secondQty != "") {
                            updateNow(type);
                        }
                        else {
                            oms.alert("请输入第二数量！");
                            return;
                        }
                    }
                    else {
                        if (vm.data.secondQty != undefined && vm.data.secondQty != "") {
                            oms.alert("没有第二单位不需要填第二数量！");
                            // vm.data.secondQty = "";
                            return;
                        }
                        else {
                            updateNow(type);
                        }
                    }
                }
                else if (page.customs == '宁波海关') {
                    if (vm.data.declareUnit != 0) {//vm.data.declareUnit != undefined || vm.data.declareUnit != null || 
                        if (vm.data.secondQty != 0) {//vm.data.secondQty != undefined || vm.data.secondQty != "" || 
                            updateNow(type);
                        }
                        else {
                            oms.alert("请输入第二数量！");
                            return;
                        }
                    }
                    else {
                        if (vm.data.secondQty != undefined && vm.data.secondQty != "") {
                            oms.alert("没有第二单位不需要填第二数量！");
                            // vm.data.secondQty = "";
                            return;
                        }
                        else {
                            updateNow(type);
                        }
                    }
                }
                else {
                    updateNow(type);
                }
            }

            function updateNow(type) {
                loadingTimeout = $timeout(function() {
                    vm.isLoading = false;
                }, loadingLatency);
                service.update(getData(type), isCreate).then(function(resp) {
                    
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                    
                    if (!resp.data.returnCode) {
                        oms.notify('保存成功');

                        if (isCreate) {
                            $state.go('app.goods_record');
                        }
                    } else {
                        oms.alert('操作失败！' + resp.data.returnMsg);
                    }

                }, function(resp) {
                    //console.log('==>',resp)
                    oms.alert('发生错误请重试！');
                    $timeout.cancel(loadingTimeout);
                    vm.isLoading = false;
                });
            }

            function getData(type) {
                var obj1 = angular.copy(vm.data);
                var delArr = ["createTime","toCustomTime","toWmsTime","statusDesc","remark","customStatusDesc","gjStatusDesc"];
                var customCode = paras.customs.toUpperCase();
                //var delArr = new Array ([createTime,toCustomTime,toWmsTime,statusDesc,remark]);
                var fields = field[customCode];
                var obj = oms.pick(obj1,fields,delArr);
                // console.log(obj);
                for (var i in upfiles) {
                    if (upfiles[i]) {
                        obj[i] = upfiles[i];
                    }
                }

                //更新时需要id,添加时需要关区
                if (isCreate) {
                    obj['customCode'] = customCode;
                } else {
                    obj['id'] = id;
                }

                //保存并推送时，增加一个字段isToPushCustom=1
                if (type == 1) {
                    obj['isToPushCustom'] = 1;
                }
                return obj;
            }

            function setData(data) {
                var gate = data.customCode;
                var fields = field[gate];
                vm.data = oms.pick(data, fields);
                vm.data_file = oms.pick(data, field_extend);
                oms.path(vm.data_file);
            }

            function init() {

                oms.config('customs').then(function(resp) {
                    var customs_hash = oms.hash(resp, 'key', 'value');
                    page.customs = customs_hash[paras.customs.toUpperCase()];
                });

                if (!isCreate) {
                    service.get(id).then(function(resp) {
                        if (resp.returnVal) {
                            setData(resp.returnVal);
                            olddsSkuCode = resp.returnVal.dsSkuCode ? resp.returnVal.dsSkuCode : '';
                        } else {
                            alert('没有数据');
                        }

                        vm.isLoading = false;

                    }, function() {
                        console.log('Error while Detail!');
                    });
                } else {
                    vm.data = {};
                    vm.data_file = {};
                    vm.isLoading = false;
                }
            }

            function reset() {
                //init();
                $state.go('app.goods_record');
            }

            //预查询方法
            function suggestHS(key) {
                return service.suggestHS(key, customs.toUpperCase()).then(function(resp) {
                    if(resp.returnVal == null){
                        vm.HSerrorMsg = true;
                    }
                    else{
                        vm.HSerrorMsg = false;
                    }
                    return formatSuggest(resp.returnVal);
                })
            }

            function suggestTariffNo(key) {
                return service.suggestTariffNo(key, customs.toUpperCase()).then(function(resp) {
                    if (resp.returnVal.length == 0) {
                        return;
                    }
                    else {
                        return formatSuggestTariffNo(resp.returnVal);
                    }
                })
            }

            function suggestCountry(key) {
                return service.suggestCountry(key, customs.toUpperCase()).then(function(resp) {
                    return formatSuggest(resp.returnVal);
                })
            }

            function suggestUnit(key) {
                return service.suggestUnit(key, customs.toUpperCase()).then(function(resp) {
                    return formatSuggest(resp.returnVal);
                })
            }

            //商品种类预查询suggestGoodsType
            function suggestGoodsType(key) {
                return service.suggestGoodsType(key, customs.toUpperCase()).then(function(resp) {
                    return formatSuggest(resp.returnVal);
                })
            }

            //预查询数据排列方式
            function formatSuggest(data) {
                if (!data) return [];
                var obj = [];

                for (var i in data) {
                    obj.push({ code: data[i].code, value: data[i].name, label: data[i].code + '  (' + data[i].name + ')', raw: data[i] })
                }
                return obj;
            }

            //税则号预查询数据排列方式
            function formatSuggestTariffNo(data) {
                if (!data) return [];
                var obj = [];

                for (var i in data) {
                    obj.push({ tariffNo: data[i].tariffNo, value: data[i].tariffName, label: data[i].tariffNo + '  (' + data[i].tariffName + ')', raw: data[i] })
                }
                return obj;
            }

            //页面预查询数据显示
            function showSuggest() {
                page.hsCodeName = '';
            }
        }
    ]);
})
