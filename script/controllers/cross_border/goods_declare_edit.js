define(['app'], function(app) {

    return app.controller('GoodsDeclareEditCtrl', ['$scope', 'oms', 'GoodsDeclareService', '$stateParams', '$state', '$timeout', 'ModalService', function($scope,oms, service, $stateParams, $state, $timeout, ModalService) {

        var vm = $scope;
        var paras = $stateParams;

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var id = paras.id;

        var custome = paras.customs.toUpperCase(); //获取海关名的参数

        var config = {
            'clearPorts': [{"key":"DG","value":"东莞"},{"key":"CZ","value":"郴州"}],
            'clearTypes': [{"key":"BC","value":"BC直邮"},{"key":"GR","value":"个人物品"}],
            'bizTypeCode': [{"key":"I10","value":"直购进口"},{"key":"I20","value":"网购保税进口"}],
            'customs': {"CQC":"重庆海关","NBC":"宁波海关","DGC":"沙田海关"},
            'idType':  {"1":"身份证","2":"其它"},
            'goods': [],
            'saveGoods': []
        };
        // 用于数据筛选
        var orderInfo = {
            NBC: {
                "id": '',
                "tariffAmount": '',
                "addedValueTaxAmount": '',
                "consumptionDutyAmount": '',
                "insuranceFee": '',
                "postFee": '',
                "taxAmount": '',
                "amount": '',
                "disAmount": '',
                "grossWeight": '',
                "customCode": ''
            },
            CQC: {
                "id": '',
                "tariffAmount": '',
                "addedValueTaxAmount": '',
                "consumptionDutyAmount": '',
                "insuranceFee": '',
                "postFee": '',
                "taxAmount": '',
                "amount": '',
                "disAmount": '',
                "goodsFee": '',
                "bizTypeCode": '',
                "customCode": ''
            },
            DGC: {
                "id": '',
                "postFee": '',
                "amount": '',
                "taxAmount": '',
                "clearPort": '',
                "clearType": '',
                "customCode": ''
            }
        };
        var orderPayInfoVo = {
            NBC: {
                'id': '',
                "paymentNo": '',
                "source": '',
                "payTime": '',
                "idnum": '',
                "name": ''
            },
            DGC: {
                'id': '',
                "payTime": ''
            }
        };
        var orderLogisticsVo = {
            NBC: {
                'id': '',
                "logisticsCode": '',
                "consignee": '',
                "consigneeTel": '',
                "mailNo": '',
                "province":　'',
                "city": '',
                "district": '',
                "consigneeAddr": ''
            },
            CQC: {
                'id': '',
                "logisticsCode": '',
                "consignee": '',
                "consigneeTel": '',
                "province":　'',
                "city": '',
                "district": '',
                "consigneeAddr": ''
            },
            DGC: {
                'id': '',
                "logisticsCode": '',
                "consignee": '',
                "consigneeTel": '',
                "mailNo": '',
                "province":　'',
                "city": '',
                "district": '',
                "consigneeAddr": '',
                "recieverIdnum": ''
            }
        };
        // 只有重庆
        var orderBuyerInfoVo = {
            "id": '',
            "idNum": ''
        };
        // 只有沙田海关
        var orderSenderInfoVo = {
            "id": '',
            "name": '',
            "tel": '',
            "country": '',
            "address": ''
        };
        // 三个海关都一样
        var orderGoodsList = {
            "id": '',
            "qty": '',
            "price": '',
            "goodsName": '',
            "amount": '',
            "productId": ''
        };

        vm.update = update;

        vm.config = config;

        vm.getCities = getCities;

        vm.data = {};

        vm.addItem = addItem;   //先定义 批量添加框
        vm.removeItem =removeItem;  //移除一条数据

        Detail();
        
        //获取快递公司
        function express() {
            var prams = {"customCode": custome};
            service.express(prams).then(function(resp) {
                config.express = resp.returnVal;
            });
        }

        //获取支付机构
        function payInstitution() {
            var prams = {"customCode": custome};
            service.payInstitution(prams).then(function(resp) {
                config.payInstitution = resp.returnVal;
            });
        }

        // 获取省
        function getLog() {
            service.getProvince().then(function(resp) {
                if (resp.returnVal) {
                    config.province = resp.returnVal;
                    config.province_hash = oms.hash(config.province, 'areaname', 'id');
                } else {
                    alert('没有数据');
                }
            }, function() {
                console.log('Error while Logistic!');
            });
        }

        //获取数据
        function Detail(){
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);
            express();
            payInstitution();
            getLog();
            service.getDetail(paras.id).then(function(resp) {
                vm.data = resp.returnVal;
                // 省市区初始化
                if(vm.data.orderLogisticsVo.province && vm.data.orderLogisticsVo.province.length) {
                    getCities(0);
                }
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while Detail!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        /**
         * 获取市区信息 还需要加一个初始化
         */
        function getCities(type) {
            var setStr, setId;
            setStr = type == 0 ? vm.data.orderLogisticsVo.province : vm.data.orderLogisticsVo.city;
            setId = type == 0 ? config.province_hash[setStr] : config.city_hash[setStr];
            if (setId != undefined) {
                service.getCity(setId).then(function(resp) {
                    if (resp.returnVal) {
                        if (type == 0) {
                            config.city = resp.returnVal;
                            config.city_hash = oms.hash(config.city, 'areaname', 'id');
                            if (vm.data.orderLogisticsVo.city && vm.data.orderLogisticsVo.city.length) {
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

        /**
         * 推送订单
         * @return {[type]} [description]
         */
        function update() {
            loadingTimeout = $timeout(function() {
               vm.isLoading = true;
            }, loadingLatency);
            service.updateOrder(getData(vm.data)).then(function(resp) {
                if (resp.returnCode == 0) {
                    ModalService.open({
                        "title": "",
                        "content": "保存成功，是否返回异常单列表",
                        "alert": false,
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if (result) {
                                $state.go('app.exception_order_list');
                            }
                        })
                    });
                }
                else {
                    oms.alert(resp.returnMsg);
                }

                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            }, function() {
                console.log('Error while cancel order!');
                $timeout.cancel(loadingTimeout);
                vm.isLoading = false;
            });
        }

        /**
         * 增加一行
         * @param {[]} predata [预格式化数据]
         * 稍后通过指令优化==\
         */
        function addItem(e) {
            e.preventDefault();
            var obj = {
                "goodsName": '', 
                "productId": '', 
                "qty": '', 
                "price": '', 
                "amount": '', 
                "currCode": '',
                "remark": 2
            };
            config.goods.push(obj);
        }
        var orderModel = {
            "id":'',
            "qty": '',
            "price": '',
            "goodsName": '',
            "amount": '',
            "productId": '',
            "remark": ''
        };
        function removeItem(row, e, index, type) {
            e.preventDefault();
            if (type == 0) {
                // 如为新增就直接删除
                config.goods.splice(index,1);
            }
            else {
                // 如为原来数据则需添加删除标识
                row.remark = 1;
                config.saveGoods.push(oms.pick(row, orderModel));
                vm.data.orderGoodsList.splice(index,1);
            }
        }

        function getData(data) {
            var datas;
            var orderinfos = data.orderInfo;
            var orderLogisticsVos = data.orderLogisticsVo;
            // 商品
            var orderGoodsLists = data.orderGoodsList;
            var allGoods = [];
            if (data.orderGoodsList && data.orderGoodsList.length > 0) {
                for(var i in data.orderGoodsList) {
                    data.orderGoodsList[i] = oms.pick(orderGoodsLists[i], orderGoodsList);
                    data.orderGoodsList[i].remark = 0;
                    allGoods.push(data.orderGoodsList[i]);
                }
            }
            if (config.goods && config.goods.length > 0) {
                for(var i in config.goods) {
                    var orderModels = {
                        "qty": '',
                        "price": '',
                        "goodsName": '',
                        "amount": '',
                        "productId": '',
                        "remark": ''
                    };
                    allGoods.push(oms.pick(config.goods[i], orderModels));
                }
            }
            if (config.saveGoods && config.saveGoods.length > 0) {
                for(var i in config.saveGoods) {
                    allGoods.push(config.saveGoods[i]);
                }
            }
            switch(custome) {
                case 'NBC':
                            // 宁波仓
                            var orderpayinfoVos = data.orderPayInfoVo;
                            data.orderInfo = oms.pick(orderinfos, orderInfo.NBC);    //在orderinfo 筛选model里面的数据
                            data.orderPayInfoVo = oms.pick(orderpayinfoVos, orderPayInfoVo.NBC);
                            if (data.orderLogisticsVo && data.orderLogisticsVo.id > 0) {
                                data.orderLogisticsVo = oms.pick(orderLogisticsVos, orderLogisticsVo.NBC);
                            }
                            datas = {
                                        orderInfo: data.orderInfo,
                                        orderPayInfoVo: data.orderPayInfoVo,
                                        orderLogisticsVo: data.orderLogisticsVo,
                                        orderGoodsList: allGoods
                                    };
                            break;
                case 'CQC':
                            // 重庆仓
                            var orderBuyerInfoVos = data.orderBuyerInfoVo;
                            data.orderInfo = oms.pick(orderinfos, orderInfo.CQC);    //在orderinfo 筛选model里面的数据
                            if (data.orderLogisticsVo && data.orderLogisticsVo.id > 0) {
                                data.orderLogisticsVo = oms.pick(orderLogisticsVos, orderLogisticsVo.CQC);
                            }
                            data.orderBuyerInfoVo = oms.pick(orderBuyerInfoVos, orderBuyerInfoVo);
                            datas = {
                                        orderInfo: data.orderInfo,
                                        orderBuyerInfoVo: data.orderBuyerInfoVo,
                                        orderLogisticsVo: data.orderLogisticsVo,
                                        orderGoodsList: allGoods
                                    };
                            break;
                case 'DGC':
                            // 沙田仓
                            var orderpayinfoVos = data.orderPayInfoVo;
                            var orderSenderInfoVos = data.orderSenderInfoVo;
                            data.orderInfo = oms.pick(orderinfos, orderInfo.DGC);    //在orderinfo 筛选model里面的数据
                            if (!data.orderInfo.taxAmount) {data.orderInfo.taxAmount = 0;}
                            data.orderPayInfoVo = oms.pick(orderpayinfoVos, orderPayInfoVo.DGC);
                            if (data.orderLogisticsVo && data.orderLogisticsVo.id > 0) {
                                data.orderLogisticsVo = oms.pick(orderLogisticsVos, orderLogisticsVo.DGC);
                            }
                            data.orderSenderInfoVo = oms.pick(orderSenderInfoVos, orderSenderInfoVo);
                            datas = {
                                        orderInfo: data.orderInfo,
                                        orderPayInfoVo: data.orderPayInfoVo,
                                        orderLogisticsVo: data.orderLogisticsVo,
                                        orderSenderInfoVo: data.orderSenderInfoVo,
                                        orderGoodsList: allGoods
                                    };
                            break;
            }
            return oms.dig(datas);
        }
    }]);
})
