/**
 * Created by lsy on 2016/8/2.
 * 入库单导入控制器 orderWarehouseInImportCtrl
 */

define(['app'], function(app) {

    return app.controller('orderWarehouseInImportCtrl', ['$scope', 'orderWarehouseInImportService', '$log', '$timeout', 'oms', function($scope, service, $log, $timeout, oms) {
        var vm = $scope;

        var verifyKey;

        var paras = {

            pageCount: 0,

            search: {
                pageSize: 5,
                pageNum: 1,

            },

            file: '',

            condition: {
                customAreaCode: '',
                businessCompany: '',
                verifyKey: ''
            }
        };

        var config = {
            'fields': [
                { "key": "rowNo", "value": "导入行号", "display": true },
                { "key": "code", "value": "订单号", "display": true, 'sort': 1 },
                { "key": "message", "value": "消息", "display": true }
            ],
            'area': [],

            'page_size_options': [5, 10, 20, 50]
        };


        vm.data = [];

        vm.message = '';

        vm.paras = paras;

        vm.status = {
            uploading : false,

            progress : 0,

            import: function() {
                return (
                    vm.status.uploading ||
                    !paras.file ||
                    !paras.condition.customAreaCode ||
                    !paras.condition.businessCompany ||
                    !paras.condition.verifyKey
                );
            },

            verify: function() {
                return (
                    vm.status.uploading ||
                    !paras.file ||
                    !paras.condition.customAreaCode ||
                    !paras.condition.businessCompany
                );
            }

        }

        vm.config = config;


        vm.verify = function() {
            paras.condition.verifyKey = '';
            vm.status.uploading = true;
            service
                .verify(paras.condition, paras.file)
                .then(function(resp) {
                    setData(resp);
                    vm.status.uploading = false;
                }, function(resp) {

                }, function(resp) {
                    console.log(resp)
                    vm.status.progress = resp;
                });
        }

        vm.import = function() {
            vm.status.uploading = true;
            service
                .import(paras.condition, paras.file)
                .then(function(resp) {
                    setData(resp);
                    vm.status.uploading = false;
                    paras.condition.verifyKey = '';

                }, function(resp) {

                }, function(resp) {
                    console.log(resp)
                    vm.status.progress = resp;
                });
        }

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


        vm.sort = function(tableState) {
            var sorts = tableState.sort;
            //console.log(sorts)
            for (var key in sorts) {
                var ind = sorts[key] == 2 ? -1 : 1;
                vm.data.sort(function(a, b) {
                    return (a[key] > b[key] ? 1 : -1) * ind;
                })
            }
            //console.log(sorts);
        }

        //下载
        vm.downloadFile = function() {
            var url = getTemplateByArea();
             //var url = 'templates/orderEnterWarehouse.xls';
            if (url) {
                try {
                    var elemIF = document.createElement("iframe");
                    elemIF.src = url;
                    elemIF.style.display = "none";
                    document.body.appendChild(elemIF);
                } catch (e) {

                }
            }

        }

        function setData(resp) {
            vm.message = repo(resp.error, resp.message);

            if (resp.error != 1 && !resp.verifyKey) {
                //alert(resp.message);
            }

            if (resp.verifyKey) {
                vm.paras.condition.verifyKey = resp.verifyKey;
            } else {
                vm.paras.condition.verifyKey = '';
            }

            if (resp.data) {
                vm.data = resp.data.rows;
            }
        }

        function getTemplateByArea() {
            var temp = 'templates/%sOrderEnterWarehouse.xls';
            var codes = { 'NBC': 'nb', 'CQC': 'cq','DGC': 'st' };
            var hg = paras.condition.customAreaCode;
            if (hg && config.area_hash) {
                var code = codes[config.area_hash[hg].raw['customCode']];
                console.log(code);
                if (code == 'cq') {
                    return oms.url(temp.replace('%s', code));
                }
                else if (code == 'st') {
                    return oms.url(temp.replace('%s', code));
                }
                else {
                    console.log("暂无！");
                }
            }

            return '';
        }

        function repo(code, v) {
            var codes = [
                '成功：%s',
                '错误：%s；以下是错误信息，请核对信息后重新校验！',
                '警告：%s；以下是警告信息，若确认导入，优惠金额将自动调整，也可自行计算修改再校验导入！',
            ];

            var str = codes[code] || codes[1];
            return str.replace('%s', v);
        }

        function init() {
            oms.config('area', true).then(function(resp) {
                config.area = resp;
                config.area_hash = oms.hash(resp, 'key');
            });
        }

        init();
    }])
})

