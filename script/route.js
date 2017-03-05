/**
 * 路由
 */
define(['app'], function(app){

    return app.config(['$stateProvider','$urlRouterProvider','$locationProvider',function($stateProvider,$urlRouterProvider,$locationProvider) {
        $urlRouterProvider
        //.when('/c?id', '/contacts/:id')
        //.when('/user/:id', '/contacts/:id')
        .otherwise('/cross_border/goods_declare');
        $stateProvider

            .state('app',{
                // abstract: true,
                url:'/',
                templateUrl:function(){
                    return 'view/index.html';
                },
                controller:'IndexCtrl'
            })
            .state('signin',{
                url:'/signin',
                templateUrl:function(){
                    return 'view/signin.html';
                },
                roles:'*',signin:true,
                controller:'LoginCtrl'
            })

            // 权限
            .state('app.permission',{
                url:'permission',
                templateUrl: function($routeParams){
                    return 'view/setting/permission.html';
                },
                controller: 'PermissionCtrl'
            })

            // 用户设置
            .state('app.user',{
                url:'user',
                templateUrl: function($routeParams){
                    return 'view/setting/user_list.html?'+Date.now();
                },
                controller: 'UsersListCtrl'
            })
            .state('app.user_detail',{
                url:'user/:id',
                templateUrl: function($routeParams){
                    return 'view/setting/user_detail.html';
                },
                controller: 'UserDetailCtrl'
            })

            // 申报单
            .state('app.goods_declare_list',{
                url:'cross_border/goods_declare',
                templateUrl:'view/goods_declare/goods_declare_list.html?'+Date.now(),
                controller: 'GoodsDeclareListCtrl'
            })
            // 异常单
            .state('app.exception_order_list', {
                url:'cross_border/exception_order_list',
                templateUrl: function(){
                    return 'view/exception_order/exception_order_list.html?'+Date.now();
                },
                controller: 'ExceptionOrderListCtrl'
            })
            .state('app.goods_declare_detail',{
                url:'cross_border/goods_declare_detail/:customs/:id/:type',
                templateUrl: function($routeParams){
                    return 'view/goods_declare/goods_declare_detail_'+$routeParams.customs+'.html?'+Date.now();
                },
                controller: 'GoodsDeclareDetailCtrl'
            })
            .state('app.goods_declare_edit',{
                url:'cross_border/goods_declare_edit/:customs/:id',
                templateUrl: function($routeParams){
                    return 'view/goods_declare/goods_declare_edit_'+$routeParams.customs+'.html?'+Date.now();
                },
                controller: 'GoodsDeclareEditCtrl'
            })

            // 航班设置
            .state('app.flight_setting_logistic_list',{
                url:'cross_border/flight_setting/logistic_list',
                templateUrl:'view/flight_setting/flight_logistic_list.html',
                controller: 'flightLogisticListCtrl'
            })
            .state('app.flight_setting_order_list',{
                url:'cross_border/flight_setting/order_list',
                templateUrl:'view/flight_setting/flight_order_list.html',
                controller: 'flightOrderListCtrl'
            })
            .state('app.flight_setting_edit',{
                url:'cross_border/flight_setting_0/:flightype/:id/:code/:codes/:ids',
                templateUrl:'view/flight_setting/flight_setting_edit.html',
                controller: 'flightSettingEditCtrl'
            })
            .state('app.flight_setting_detail',{
                url:'cross_border/flight_setting_1/:flightype/:id/:code/:codes/:ids',
                templateUrl:'view/flight_setting/flight_setting_detail.html',
                controller: 'flightSettingDetailCtrl'
            })

            // 订单导入
            .state('app.order_import',{ 
                url: 'cross_border/order_import',
                templateUrl: 'view/order_import.html',
                controller: 'OrderImportCtrl'
            })

            //入库单 orderWarehouseIn
            .state('app.orderWarehouseInList',{ 
                url : 'cross_border/orderWarehouseIn',
                templateUrl: 'view/order_warehouseIn/order_warehouseIn_list.html',
                controller: 'orderWarehouseInListCtrl'
            })
            .state('app.orderWarehouseInDetail',{
                url:'cross_border/orderWarehouseIn/:area/:id',
                templateUrl: function($routeParams){
                    return 'view/order_warehouseIn/order_warehouseIn_detail_'+$routeParams.area+'.html'
                },
                controller: 'orderWarehouseInDetailCtrl'
            })
            .state('app.orderWarehouseInImport', {
                url:'cross_border/orderWarehouseInImport',
                templateUrl: 'view/order_warehouseIn/order_warehouseIn_import.html',
                controller: 'orderWarehouseInImportCtrl'
            })

            // 备案商品
            .state('app.goods_record',{
                url:'cross_border/goods_record', 
                templateUrl: 'view/goods_record/goods_record_list.html?'+Date.now(),
                controller: 'GoodsRecordListCtrl',
                reloadOnSearch : false
            })
            .state('app.goods_record_create',{
                url:'cross_border/goods_record/:customs/create',
                templateUrl: function($routeParams){
                    return 'view/goods_record/goods_record_detail_'+$routeParams.customs+'.html?'+Date.now();
                },
                controller: 'GoodsRecordDetailCtrl'
            })
            .state('app.goods_record_detail',{
                url:'cross_border/goods_record/:customs/:id',
                templateUrl: function($routeParams){
                    return 'view/goods_record/goods_record_detail_'+$routeParams.customs+'.html?'+Date.now();
                },
                controller: 'GoodsRecordDetailCtrl'
            })
            .state('app.goods_record_import',{
                url:'cross_border/goods_record_import',
                templateUrl: function($routeParams){
                    return 'view/goods_record/goods_record_import.html?'+Date.now();
                },
                controller: 'GoodsRecordImportCtrl'
            })

            // 角色管理
            .state('app.role',{
                url:'setting/role/:id',
                templateUrl: function($routeParams){
                    return 'view/setting/role_detail.html?'+Date.now();
                },
                controller: 'RoleDetailCtrl'
            })
            .state('app.role_detail',{
                url:'setting/role',
                templateUrl: function($routeParams){
                    return 'view/setting/role.html?'+Date.now();
                },
                controller: 'RoleCtrl'
            })
            .state('app.setting_role_create',{
                url:'setting/role/create',
                templateUrl: function($routeParams){
                    return 'view/setting/role_detail.html?'+Date.now();
                },
                controller: 'RoleDetailCtrl'
            })

            //仓库管理
            .state('app.warehouse',{
                url:'base/warehouse',
                templateUrl: function($routeParams){
                    return 'view/base/warehouse_list.html?'+Date.now();
                },
                controller: 'warehouseListCtrl'
            })
            .state('app.warehouse_detail',{
                url:'base/warehouse/:id',
                templateUrl: function($routeParams){
                    return 'view/base/warehouse_detail.html?'+Date.now();
                },
                controller: 'warehouseDetailCtrl'
            })
            .state('app.warehouse_create',{
                url:'base/warehouse/create',
                templateUrl: function($routeParams){
                    return 'base/warehouse.html';
                },
                controller: 'warehouseDetailCtrl'
            })

            // 商家管理
            .state('app.customer_list',{
                url:'base/customer',
                templateUrl: function($routeParams){
                    return 'view/base/customer_list.html?'+Date.now();
                },
                controller: 'customerListCtrl'
            })
            .state('app.customer_create',{
                url:'base/customer/create',
                templateUrl: function($routeParams){
                    return 'view/base/customer_detail.html?'+Date.now();
                },
                controller: 'customerDetailCtrl'
            })
            .state('app.customer_detail',{
                url:'base/customer/:id',
                templateUrl: function($routeParams){
                    return 'view/base/customer_detail.html?'+Date.now();
                },
                controller: 'customerDetailCtrl'
            })

            // 接口管理
            .state('app.interface_list',{
                url:'base/interface',
                templateUrl: function($routeParams){
                    return 'view/base/interface_list.html?'+Date.now();
                },
                controller: 'interfaceListCtrl'
            })
            .state('app.interface_create',{
                url:'base/interface/create',
                templateUrl: function($routeParams){
                    return 'view/base/interface_detail.html?'+Date.now();
                },
                controller: 'interfaceDetailCtrl'
            })
            .state('app.interface_detail',{
                url:'base/interface/:id',
                templateUrl: function($routeParams){
                    return 'view/base/interface_detail.html?'+Date.now();
                },
                controller: 'interfaceDetailCtrl'
            })

            // 外部系统管理
            .state('app.external_list',{
                url:'base/external',
                templateUrl: function($routeParams){
                    return 'view/base/external_list.html?'+Date.now();
                },
                controller: 'externalListCtrl'
            })
            .state('app.external_create',{
                url:'base/external/create',
                templateUrl: function($routeParams){
                    return 'view/base/external_detail.html?'+Date.now();
                },
                controller: 'externalDetailCtrl'
            })
            .state('app.external_detail',{
                url:'base/external/:id',
                templateUrl: function($routeParams){
                    return 'view/base/external_detail.html?'+Date.now();
                },
                controller: 'externalDetailCtrl'
            })

            // 号段获取
            .state('app.section_number',{
                url:'number_manage/section_number',
                templateUrl: function($routeParams){
                    return 'view/number_manage/section_number.html?'+Date.now();
                },
                controller: 'sectionNumberCtrl'
            })
            .state('app.logistic_setting_list',{
                url:'number_manage/logistic_setting_list',
                templateUrl: function($routeParams){
                    return 'view/number_manage/logistic_setting_list.html?'+Date.now();
                },
                controller: 'logisticSettingListCtrl'
            })
            .state('app.logistic_setting_detail',{
                url:'number_manage/logistic_setting/:id',
                templateUrl: function($routeParams){
                    return 'view/number_manage/logistic_setting_detail.html?'+Date.now();
                },
                controller: 'logisticSettingDetailCtrl'
            })
            .state('app.logistic_setting_create',{
                url:'number_manage/logistic_setting/create',
                templateUrl: function($routeParams){
                    return 'view/number_manage/logistic_setting_detail.html?'+Date.now();
                },
                controller: 'logisticSettingDetailCtrl'
            })
            .state('app.warehouse_logistic_list',{
                url:'number_manage/warehouse_logistic_list',
                templateUrl: function($routeParams){
                    return 'view/number_manage/warehouse_logistic_list.html?'+Date.now();
                },
                controller: 'warehouseLogisticListCtrl'
            })
            .state('app.warehouse_logistic_detail',{
                url:'number_manage/warehouse_logistic/:id',
                templateUrl: function($routeParams){
                    return 'view/number_manage/warehouse_logistic_detail.html?'+Date.now();
                },
                controller: 'warehouseLogisticDetailCtrl'
            })
            .state('app.warehouse_logistic_create',{
                url:'number_manage/warehouse_logistic/create',
                templateUrl: function($routeParams){
                    return 'view/number_manage/warehouse_logistic_detail.html?'+Date.now();
                },
                controller: 'warehouseLogisticDetailCtrl'
            })

            // 修改密码
            .state('app.account_reset', {
                url:'account/reset',
                templateUrl: function(){
                    return 'view/account.html?'+Date.now();
                },
                controller: 'AccountDetailCtrl'
            })

            // 通知消息
            .state('app.notification_message_list',{
                url:'system_monitor/notification_message_list',
                templateUrl: function($routeParams){
                    return 'view/system_monitor/notification_message.html?'+Date.now();
                },
                controller: 'notificationMessageListCtrl'
            })

            // 跨境审单规则
            .state('app.abroad_check_order_list', {
                url:'rule_manage/abroad_check_order',
                templateUrl: function(){
                    return 'view/rule_manage/abroad_checkorder_list.html?'+Date.now();
                },
                controller: 'AbroadCheckOrderCtrl'
            })
            .state('app.abroad_check_order_create', {
                url:'rule_manage/abroad_check_order/create',
                templateUrl: function($routeParams){
                    return 'view/rule_manage/abroad_checkorder_detail.html?'+Date.now();
                },
                controller: 'AbroadCheckOrderDetailCtrl'
            })
            .state('app.abroad_check_order_detail', {
                url:'rule_manage/abroad_check_order/:id',
                templateUrl: function($routeParams){
                    return 'view/rule_manage/abroad_checkorder_detail.html?'+Date.now();
                },
                controller: 'AbroadCheckOrderDetailCtrl'
            })

            // 库存查询
            .state('app.inventory',{
                url:'cross_border/inventory', 
                templateUrl: 'view/inventory_manage/inventory_list.html',
                controller: 'inventoryListCtrl',
                // reloadOnSearch : false  
            })
            

        $locationProvider
        .html5Mode(true)
        .hashPrefix('!');
    }])

})