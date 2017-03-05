/**
 * desc: 入口文件
 * date: 2016-07-08
 */

require.config({
    baseUrl: 'script/',

    urlArgs: "?" + Date.now(),

    packages: [
        {
            name: 'moment',
            // This location is relative to baseUrl. Choose bower_components
            // or node_modules, depending on how moment was installed.
            location: '../lib/moment',
            main: 'moment'
        }
    ],

    //配置文件路径
    paths: {
        'jquery': '../lib/jquery/dist/jquery.min',
        'datepicker':'../lib/bootstrap-datepicker/dist/js/bootstrap-datepicker',
        'angular': '../lib/angular/angular.min',
        'angular_route': '../lib/angular-route/angular-route.min',
        'ui_router': '../lib/angular-ui-router/release/angular-ui-router.min',
        'angular_sanitize': '../lib/angular-sanitize/angular-sanitize.min',
        'angular_animate': '../lib/angular-animate/angular-animate.min',
        'angular_loading_bar':'../lib/angular-loading-bar/build/loading-bar',
        'angular_smart_table':'../lib/angular-smart-table/dist/smart-table',
        //'admin_lte': '../lib/AdminLTE/dist/js/app',
        'angular_touch': '../lib/angular-touch/angular-touch.min',
        'bootstrap_ui': '../lib/bootstrap-bower/ui-bootstrap-tpls',
        // 'angular_strap':'../lib/angular-strap/dist/angular-strap.min',

        'daterangepicker':'../lib/bootstrap-daterangepicker/daterangepicker',
        'angular_daterangepicker':'../lib/angular-daterangepicker/js/angular-daterangepicker.min',
        'ng_file_upload':'../lib/ng-file-upload/ng-file-upload',

        'ng_notify':'../lib/ng-notify/dist/ng-notify.min',
        'ui_select':'../lib/angular-ui-select/dist/select.min',
        'datetime_picker':'../lib/datetime-picker.min'
    },
    //引入依赖时候的包名
    shim: {
        'jquery':{
            exports:'jquery'
        },
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'ui_router':{
            deps: ['angular'],
            exports: 'ui_router'
        },
        'angular_sanitize': {
            deps: ['angular'],
            exports: 'angular_sanitize'
        },
        'angular_animate': {
            deps : ['angular'],
            exports : 'angular_animate'
        },
        'angular_loading_bar':{
            deps : ['angular','angular_animate'],
            exports : 'angular_loading_bar'
        },
        'angular_smart_table':{
            deps : ['angular'],
            exports : 'angular_smart_table'
        },
        'admin_lte': {
            deps: ['jquery'],
            exports: 'admin_lte'
        },
        'angular_touch': {
            deps: ['angular'],
            exports: 'angular_touch'
        },
        'bootstrap_ui': {
            deps: ['angular'],
            exports: 'bootstrap_ui'
        },
/*        'angular_strap':{
            deps: ['angular'],
            exports: 'angular_strap'
        },*/
        'angular_daterangepicker':{
            deps:['jquery','angular','moment','daterangepicker'],
            exports:'angular_daterangepicker'
        },
        'ng_file_upload':{
            deps: ['angular'],
            exports: 'ng_file_upload'
        },
        'ng_notify':{
            deps: ['angular'],
            exports: 'ng_notify'
        },
        'ui_select':{
            deps:['angular'],
            exports:'ui_select'
        },
        'datetime_picker':{
            deps:['angular','bootstrap_ui'],
            exports:'datetime_picker'
        }
        /*,
        'moment':{
            exports:'moment'
        },*/
    }
});


require([
    //基础
    
    'jquery','angular', 'moment','moment/locale/zh-cn',
    'ui_router', 'angular_sanitize','angular_animate','angular_loading_bar' ,'angular_smart_table','angular_daterangepicker',
    'angular_touch', 'bootstrap_ui','datepicker' ,'ng_file_upload','ng_notify','ui_select','datetime_picker',

    // 'admin_lte',
    'app', 'route', 'layout',
    'filter/common',
    'services/common/oms',
    'services/common/modal',
    'services/common/timestamp',

    //指令
    'directives/customFields', 
    'directives/common',
    'directives/tree',
    'directives/treeRadio',
    'directives/autoComplete',
    'directives/sl.area',
    'directives/stats',

    'services/index',
    'controllers/index',

    'services/account',
    'controllers/account/detail',

    //users_list用户管理--系统管理userslistCtrl
    'services/setting/users',
    'controllers/setting/usersList',
    'controllers/setting/user_detail',

    //基础资料--仓库管理
    'services/base/warehouse',
    'controllers/base/warehouse_list',
    'controllers/base/warehouse_Detail',

    'services/common/auth',
    'controllers/login/login',

    //跨境业务
    'services/goods_declare',
    'controllers/cross_border/goods_declare_list',
    'controllers/cross_border/goods_declare_detail',
    'controllers/cross_border/goods_declare_edit',
    // 异常单
    'controllers/cross_border/exception_order_list',

    'services/goods_record',
    'controllers/cross_border/goods_record_list',
    'controllers/cross_border/goods_record_detail',
    'controllers/cross_border/goods_record_import',

    'services/orderWarehouseIn',
    'services/orderWarehouseIn_Import',

    'controllers/cross_border/orderWarehouseIn_List',
    'controllers/cross_border/orderWarehouseIn_Detail',
    'controllers/cross_border/orderWarehouseIn_Import',

    // 航班设置
    'services/flight_setting',
    'controllers/cross_border/flight_logistic_list',
    'controllers/cross_border/flight_order_list',
    'controllers/cross_border/flight_setting_edit',
    'controllers/cross_border/flight_setting_detail',

    'services/order_import',
    'controllers/cross_border/order_import',

    'services/setting/role',
    'controllers/setting/role',
    'controllers/setting/role_detail',

    'services/setting/permission',
    'controllers/setting/permission',

    // 商家管理
    'services/base/customerManage',
    'controllers/base/customer_list',
    'controllers/base/customer_detail',
    // 接口管理
    'services/base/interfaceManage',
    'controllers/base/interface_list',
    'controllers/base/interface_detail',

    //快递管理
    'services/number_manage/number_manage',
    'controllers/number_manage/section_number',
    'controllers/number_manage/logistic_list',
    'controllers/number_manage/logistic_detail',
    'controllers/number_manage/warehouse_logistic_list',
    'controllers/number_manage/warehouse_logistic_detail',

    // 跨境审单规则
    'services/rule_manage/abroad_checkorder',
    'controllers/rule_manage/abroad_checkorder_list',
    'controllers/rule_manage/abroad_checkorder_detail',

    // 消息通知
    'services/system_monitor/notification_message',
    'controllers/system_monitor/notification_message_list',

    //外部系统管理
    'services/base/external',
    'controllers/base/external_list',
    'controllers/base/external_detail',

    //库存管理
    'services/inventory',
    'controllers/cross_border/inventory_list'

], function($, angular, moment) {

    $(function() {
        moment.locale('zh-cn');
        angular.element(document.body).removeClass('loading');
        angular.bootstrap(document, ['oms']);
    })

});
