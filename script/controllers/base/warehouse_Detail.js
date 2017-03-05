//warehouseDetailCtrl

define(['app'], function(app) {

    return app.controller('warehouseDetailCtrl', ['$scope','warehouse', '$stateParams','$state','oms','$location',
        function($scope, service,$stateParams,$state,oms,$location) {

        //$scope.warehouseTypes = [{"warehouseType":"1",value:"跨境仓"},{"warehouseType":"2",value:"境内仓"}];
        $scope.wTypes = {"1":"跨境仓","2":"境内仓"};

        var vm = $scope,
            paras = $stateParams,
            isEdit = paras.id !== 'create';

        var config = {
                area: [],
                warehouseTypes:[
                    {value:1,name:"跨境仓"},
                    {value:2,name:"境内仓"}
                ]
            };

        var model = {
            id: '',
            name: '',
            code: '',
            address: '',
            warehouseType: '',
            remark: '',
            replenishRule:'',
            ccaCode:'',  //关区code 3015 8000
            ccaId:'',  //关区id
            wmsCode:'',
            wcCode: '',
            isValid: '',
            zipCode: '',
            country: '',
            province: '',
            city: '',
            district: '',
            address: '',
            contactsInfoListVO: ''
        };
        vm.isEdit = isEdit;
        vm.data = {};
        vm.config = config;

        vm.addContact = addContact;
        vm.removeContact = removeContact;
        vm.getCities = getCities;

        vm.updateWarehouse = updateWarehouse;

        init();

        //获取数据
        function Detail(){
            service.Detail(paras.id).then(function(resp) {
                vm.data = oms.pick(resp.returnVal, model);
                if (vm.data.province) {
                    getCities(0);
                }
            }, function() {
                console.log('Error while Detail!');
            });
        }

        function init() {
            oms.config('area', true).then(function(resp) {
                config.area = resp;
                config.area_hash = oms.hash(resp, 'key');
            });
            getPro();
        }

        function getPro() {
            // 获取省
            service.getProvince().then(function(resp) {
                if (resp.returnVal) {
                    config.province = resp.returnVal;
                    config.province_hash = oms.hash(config.province, 'areaname', 'id');
                    if(isEdit){
                        Detail();
                    }
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

        function updateWarehouse() {
            if (isEdit) {
                service.update(getData(vm.data), isEdit).then(function(resp) {
                    if (resp.returnCode == 0) {
                        oms.notify('修改成功');
                        //location.hash = "/warehouse_list";
                    }
                    else if (resp.returnCode == -4) {
                        oms.alert('修改失败，关区重复！请重新填写');

                        //$location.path(path);
                    }
                }, function() {
                    oms.alert('修改失败');
                });
            } else {
                service.update(getData(vm.data), isEdit).then(function(resp) {
                    if (resp.returnCode == 0) {
                        oms.notify('添加成功');
                        $state.go('app.warehouse');
                    }
                    else if (resp.returnCode == -4) {
                        alert('添加失败，关区重复！请重新填写');
                    }
                }, function() {
                    oms.alert("添加失败！");
                });
            }
        }

        function getData(data) {
            data['ccaid'] = config.area_hash[vm.data.ccaCode].raw['id'];
            var models = {
                'name': '',
                'telephone': '',
                'mobilePhone': '',
                'fax': '',
                'email': '',
                'conType': ''
            };
            if (data.contactsInfoListVO && data.contactsInfoListVO.length) {
                for(var i in data.contactsInfoListVO) {
                    if (data.contactsInfoListVO[i].id) {
                        model.id = '';
                    }
                    data.contactsInfoListVO[i] = oms.pick(data.contactsInfoListVO[i], models);
                }
            }
            else {
                delete data.contactsInfoListVO;
            }
            return oms.dig(data);
        }

        function addContact(e) {
            e.preventDefault();
            var obj = {
                'name': '',
                'telephone': '',
                'mobilePhone': '',
                'fax': '',
                'email': '' 
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
    }]);
})