define(['app'], function(app) {

    return app.controller('GoodsRecordImportCtrl', ['$scope', 'GoodsRecordService', '$log', '$timeout', 'oms', function($scope, service, $log, $timeout, oms) {
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
                customCode: '',
                verifyKey: ''
            }
        };

        var config = {
            'fields': [
                { "key": "rowNo", "value": "导入行号", "display": true },
                { "key": "name", "value": "商品名称", "display": true },
                { "key": "code", "value": "商品条码", "display": true },
                { "key": "message", "value": "消息内容", "display": true }
            ],
            'customs': [],

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
                    !paras.condition.customCode ||
                    !paras.condition.verifyKey
                );
            },

            verify: function() {
                return (
                    vm.status.uploading ||
                    !paras.file ||
                    !paras.condition.customCode
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
            var url = getTemplateByCustoms();
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

        function getTemplateByCustoms() {
            var temp = 'templates/%sGoodsImportTemplate.xls';
            var codes = { 'NBC': 'nb', 'CQC': 'cq' , 'DGC': 'st' };
            var customesCode = paras.condition.customCode;
            if (customesCode) {
                var tmpCode = codes[customesCode];
                return oms.url(temp.replace('%s', tmpCode));
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
            oms.config('customs', true).then(function(resp) {
                config.customs = resp;
                config.customs_hash = oms.hash(resp);
            });
        }

        init();
    }])
})
