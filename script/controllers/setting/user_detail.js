define(['app'], function(app) {

    return app.controller('UserDetailCtrl', ['$scope', 'UserService', '$timeout', '$stateParams','$state', 'oms', 'flatFilter',function($scope, service, $timeout, $stateParams,$state ,oms, flat) {

        var vm = $scope;

        var id = $stateParams.id;

        var isCreate = (id === undefined || id === 'create');

        var loadingLatency = oms.options.loadingLatency || 100,
            loadingTimeout;

        //默认数据模型
        var model = {
            id:'',
            account: '',
            name: '',
            userType: 0,
            phone: '',
            isValid: 1,
            password: '',
            email:'',
            remark:'',
            userPermissions:[],
            userHierarchys:[],
            roles:[]
        };

        //用于预处理的数据模型
        var model_dep = {
            roles:null,
            atom:null
        }
        
        //绑定视图所用的数据模型
        vm.data = {};

        //视图状态绑定
        vm.page = {
            isLoading : true,
            title: isCreate ? '新增用户' : '编辑用户',
            userTypeOptions: [
                { 'id': 1, 'label': '系统管理员' },
                { 'id': 2, 'label': '库内操作员' },
                { 'id': 3, 'label': '订单管理员' },
                { 'id': 4, 'label': '客户' },
            ],
            roles: [],
            isCreate :isCreate
        }

        vm.save = save;

        vm.reset = reset;

        init();

        function init() {
            oms.config('role','atom','persissions','/user/queryLoginUserHierarchy').then(function(ret) {
                var role  = ret[0], 
                    atom = ret[1], 
                    persissions = ret[2],
                    hierarchys = ret[3];

                if (!role.returnCode) {
                    model_dep.roles = role.returnVal;
                }

                if (!atom.returnCode) {
                    model_dep.atom = atom.returnVal;
                }

                if(!hierarchys.returnCode){
                    model_dep.hierarchys = hierarchys.returnVal;
                }

                if (!isCreate) {
                    service.get(id).then(function(d) {
                        if (!d.returnCode) {
                            setData(d.returnVal);
                        }
                        vm.page.isLoading = false;
                    });

                } else {
                    var d =  angular.copy(model);
                    d.userRolePermissions = persissions.returnVal;
                    d.userHierarchys = model_dep.hierarchys;
                    setData(d);
                    vm.page.isLoading = false;
                }
            });
        }

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
                        $state.go('app.user');
                    }else{
                        init();
                    }
                } else {
                    oms.alert(resp.returnMsg);
                }

            }, function(resp) {
                //console.log('==>',resp)
                oms.alert('发生错误请重试！');
                $timeout.cancel(loadingTimeout);
                vm.page.isLoading = false;
            });
        }

        function reset() {
            $state.go('app.user');
            //init();
        }


        /**
         * 获取提交数据
         * @return {[type]} [description]
         */
        function getData(){
            var d = vm.data;
            var paras = {
                account: d.account,
                name: d.name,
                userType: d.userType,
                phone: d.phone,
                isValid: d.isValid,
                email:d.email,
                remark:d.remark,
                roles: oms.coll( oms.filter(d.roles , {checked:true}) , 'id'),
                userPermissions:getPermissions(d.userPermissions),
                hierarchy:getHierarchys(d.userHierarchys)
            }

            if(!isCreate) {
                paras.id = d.id;
            }
            else{
                paras.password = d.password;
            }
            // console.log(oms.dig(paras))
            return oms.dig(paras);
        }

        /**
         * 格式化数据
         * @param {[]} predata [预格式化数据]
         */
        function setData(d) {
            //转角色
            d.roles = convRoles(d.roles, model_dep.roles);

            //转换组织关系
            d.userHierarchys = convHierarchys(d.userHierarchys);

            //转换权限树，末端添加原子操作
            d.userPermissions = convPermissions(d.userRolePermissions , model_dep.atom);
            vm.data = oms.pick(d , model);
            // console.log(vm.data)
        }

        function convHierarchys(hierarchys){
            for(var i in hierarchys){
                hierarchys[i].checked = !!hierarchys[i].isChoose;
            }
            var t = oms.tree(hierarchys);

            return t;
        }

        function convRoles(r , roles){
            for (var i in r) {
                for (var j in roles) {
                    if (roles[j].id == r[i]) {
                        roles[j].checked = true;
                    }
                }
            }
            return roles;
        }

        function getHierarchys(d){
            var v = oms.filter( flat(d) , {'checked':true});
            var ret = [];

            for(var i in v){
                ret.push({'id':v[i].id,'appSystem':v[i].appSystem,'objType':v[i].objType , 'parentId':v[i].parentId , 'objId':v[i].objId , 'hierarchyLevel':v[i].hierarchyLevel})
            }

            return JSON.stringify( oms.tree(ret,'id','parentId','child') );
        }

        /**
         * 获取权限值
         * @return {[type]} [description]
         */
        function getPermissions(permissions){
            var d = oms.filter( flat(permissions) , {'checked':true});
            var obj = {};
            for (var i = d.length - 1; i >= 0; i--) {
                var parentId = d[i].parentId;
                var menuId = d[i].id;
                var appSystem = d[i].appSystem || '';

                if( d[i].last ){
                    
                    if(!obj[parentId]){
                        obj[parentId] = {'perType':'1','appSystem':'','perObjId':parentId , 'permissions':[]};
                    }
                    if(d[i].checked) obj[parentId].permissions.push(d[i].code);
                }else{
                    if(!obj[menuId]){
                        obj[menuId] = {'perType':'1','appSystem':appSystem,'perObjId':menuId , 'permissions':[]};
                    }else{
                        obj[menuId]['appSystem'] = appSystem;
                    }
                    //obj[parentId].permissions.push(d[i].code);
                }
            }

            for(var i in obj){
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
        function convPermissions(d , atom) {

            //预处理权限
            for (var i in d) {
                d[i].userId = d[i].id;
                d[i].checked = !!d[i].permissionsCode;

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

            //重新遍历权限数组 给树的末端添加原子操作
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

            // console.log(p_tree)
            return p_tree;
        }
    }]);
})
