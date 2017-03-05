/**
 * 建立angular.module
 */
define(['angular'], function(angular) {
    return angular.module('oms', [
            'ngAnimate','ngSanitize', 'ui.router',

            //upload组件
            'ngFileUpload','ngNotify',
            'angular-loading-bar', 'smart-table', 'daterangepicker', 
            'ui.bootstrap','ui.select','ui.bootstrap.datetimepicker'
        ])
        
        /*.config(function(massAutocompleteConfigProvider) {
            massAutocompleteConfigProvider.position_autocomplete = function(container, target) { };
        })*/
        .run(function($rootScope, $location, $state, AuthService , oms , AUTH_EVENTS,ngNotify) {
            ngNotify.config({
                theme: 'pure',
                position: 'top',
                duration: 2000,
                type: 'success',
                sticky: false,
                button: true,
                html: false
            });

            $rootScope.referrer;
            var last_state;
            //console.log('running');
            $rootScope.$on('$stateChangeStart', function(event, next , params) {
                if(last_state){
                    $rootScope.referrer = last_state;
                }
                
                last_state = ( { name: next.name , params : params});

                //判断角色是否拥有权限
                if (next.roles !== '*') {
                    if (!AuthService.isAuthenticated()) {
                        event.preventDefault();
                        $state.go('signin');
                    }
                }

                //无角色限制的页面
                else{

                    //是登录页则跳转
                    if(next.signin === true && AuthService.isAuthenticated())
                    {
                        event.preventDefault();
                        $state.go('app');
                    }
                }
            });

            //未登录
            $rootScope.$on(AUTH_EVENTS.unauthorized, function() {
                //$state.go('signin');
            });

            //登录失败
            $rootScope.$on(AUTH_EVENTS.signinFailed, function() {
                //AuthService.signout();
            });

            //退出成功
            $rootScope.$on(AUTH_EVENTS.signoutSuccess, function() {
                $state.go('signin');
            });
            
            //
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
                AuthService.signout( true )
            });
            //http://192.168.1.234:81/
        })


    /*.run(function($rootScope, AUTH_EVENTS, AuthService) {
        $rootScope.$on('$stateChangeStart', function(event, next) {
            var authorizedRoles = next.data.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                console.log('ok')
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    location.href = '#/signin'
                } else {
                    // user is not logged in
                    //$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        });
    })*/

});
