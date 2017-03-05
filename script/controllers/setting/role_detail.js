/**
 * @desc  角色详情控制器
 * @date  2016/08/08
 * WUTING (return@gmail.com)
 */

define(['app'], function(app) {

    return app.controller('RoleDetailCtrl', ['$scope', 'RoleService', '$stateParams', '$state', '$timeout', 'oms', 'flatFilter', function($scope, service, $stateParams, $state, $timeout, oms, flat) {
        var vm = $scope;

        var id = $stateParams.id;

        var isCreate = (id === undefined || id === 'create');

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        var model = {
            id:id,
            name: '',
            isValid: 1,
            remark: '',
            rolePersissionsVOs: {}
        };

        var model_dep = {
            atom: []
        }


        vm.data = {};

        vm.page = {
            isLoading: true,
            title: isCreate ? '新增角色' : '编辑角色',
        }

        vm.save = save;

        vm.reset = reset;
        
        init();

        /**
         * 初始化
         */
        function init() {

            oms.config('atom').then(function(cfg) {
                if (!cfg.returnCode) {
                    model_dep.atom = cfg.returnVal;
                }

                if (!isCreate) {
                    service.get(id).then(function(resp) {
                        setData(resp.returnVal);
                        vm.page.isLoading = false;
                    });
                } else {

                    oms.config('persissions').then(function(resp) {
                        var d = angular.copy(model);
                        d.rolePersissionsVOs = resp.returnVal;
                        setData(d);
                        vm.page.isLoading = false;
                    });
                }
            })

        }


        /**
         * 保存
         * @return {[type]} [description]
         */
        function save() {
            loadingTimeout = $timeout(function() {
                vm.page.isLoading = true;
            }, loadingLatency);

            service.update(getData(), isCreate).then(function(resp) {
                
                $timeout.cancel(loadingTimeout);
                vm.page.isLoading = false;

                if (!resp.returnCode) {
                    oms.notify('保存成功');

                    if (isCreate) {
                        $state.go('app.role');
                    }
                } else {
                    oms.notify(resp.data.returnMsg,'error');
                }

            }, function(resp) {
                oms.alert('发生错误请重试！');
                $timeout.cancel(loadingTimeout);
                vm.page.isLoading = false;
            });

        }

        /**
         * 重置数据
         * @return {[type]} [description]
         */
        function reset(){
            $state.go('app.role');
        }
        /**
         * 格式化数据
         * @param {[]} predata [预格式化数据]
         */
        function setData(d) {
            if (d && d.rolePersissionsVOs) {

                //转换权限树，末端添加原子操作
                d.rolePersissionsVOs = convPermissions(d.rolePersissionsVOs, model_dep.atom);
                vm.data = oms.pick(d, model);
            }

        }

        /**
         * 获取提交数据
         * @return {[object]} [description]
         */
        function getData() {
            var d = vm.data;
            var paras = {
                name: d.name,
                isValid: d.isValid,
                remark: d.remark,
                permissions: JSON.stringify(getPermissions(d.rolePersissionsVOs))
            }
            if (!isCreate) paras.id = d.id;

            return paras;
        }

        /**
         * 获取权限值
         * @return {[type]} [description]
         */
        function getPermissions(permissions) {
            var d = oms.filter(flat(permissions), { 'checked': true });
            var obj = {};
            for (var i = d.length - 1; i >= 0; i--) {
                var parentId = d[i].parentId;
                var menuId = d[i].id;
                var appSystem = d[i].appSystem || '';

                //末级
                if (d[i].last) {
                    if (!obj[parentId]) {
                        obj[parentId] = { 'perType': '1', 'appSystem':'','perObjId': parentId, 'permissions': [] };
                    }
                    if (d[i].checked) obj[parentId].permissions.push(d[i].code);
                } else {
                    if (!obj[menuId]) {
                        obj[menuId] = { 'perType': '1','appSystem':appSystem, 'perObjId': menuId, 'permissions': [] };
                    }else{
                        obj[menuId]['appSystem'] = appSystem;
                    }
                    //obj[parentId].permissions.push(d[i].code);
                }
            }

            for (var i in obj) {
                obj[i].permissions = obj[i].permissions.join(',');
            }
            return oms.coll(obj);
        }

        /**
         * 转换权限数组为 权限树
         * @param  {[type]} d    [权限数组]
         * @param  {[type]} atom [权限原子操作]
         * @return {[type]}      [权限树]
         */
        function convPermissions(d, atom) {

            //预处理权限,给有选中状态的标记
            for (var i in d) {
                d[i].checked = !!d[i].roleId;
                d[i].rid = d[i].id;
                if (d[i].menuId) d[i].id = d[i].menuId;
                if (d[i].menuName) d[i].name = d[i].menuName;
            }

            // 预处理原子操作
            var atom_hash = {},
                atom_enum = oms.coll(atom, 'code');
            for (var i in atom) {
                atom_hash[atom[i].code] = atom[i];
            }

            //生成临时树
            var p_tree = oms.tree(d);

            //遍历权限数组 给树的末端添加原子操作
            for (var i in d) {
                if (!d[i].children) {
                    var c = [];
                    var atom_all = d[i].menuPermissions;
                    var atom_allow = d[i].permissions;

                    if (atom_all == '*' || atom_all == null) {
                        atom_all = atom_enum.join(',');
                    }
                    if (atom_allow == '*' || atom_allow == null) {
                        atom_allow = atom_all;
                    }

                    atom_all = atom_all.split(',');
                    atom_allow = atom_allow.split(',');

                    var ident = Date.now();
                    for (var j in atom_all) {
                        var obj = {
                            code: atom_all[j],
                            last: true,
                            id: ident + j,
                            name: atom_hash[atom_all[j]].name,
                            parentId: d[i].id
                        }

                        if (d[i].checked && atom_allow.indexOf(atom_all[j]) != -1) {
                            obj.checked = true;
                        }
                        c.push(obj);
                    }

                    d[i].children = c;
                }
            }
            return p_tree;

        }

    }]);
})
