/*!
 * @desc 搜索建议
 * @date 2016/08/09
 */

define(['app'], function(app) {

    app.factory('debounce', function($timeout) {
        return function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) {
                        func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                $timeout.cancel(timeout);
                timeout = $timeout(later, wait);
                if (callNow) {
                    func.apply(context, args);
                }
            };
        };
    })
    
    .run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/autoComplete.html',
            '<span class="ac-trigger" ng-transclude></span>' +

            '<div ng-show="isShow && results.length" class="ac-container"> ' +
                '<ul class="ac-menu"> ' +
                '<li ng-repeat="result in results"' +
                'class="ac-menu-item" ' +
                'role="option" ' +
                'id="{{result.id}}" ' +
                'ng-class="$index == selected_index ? \'ac-state-focus\': \'\'">' +
                '<a href ng-click="select($index)" ng-bind-html="result.label"></a>' +
                '</li>' +
                '</ul>' +
                '</div>'
            );
    }]);

    app.directive('autoComplete', ['$timeout', '$q', 'debounce', '$document','$parse', function($timeout, $q, debounce, $document,$parse) {
        return {
            restrict: 'A',

            scope: {
                'autoComplete': '='
            },

            transclude: true,

            templateUrl: 'template/common/autoComplete.html',

            link: function($scope, element, attrs, required) {
                var input = element.find('.ac-trigger input');
                
                var options = $scope.autoComplete;

                var require_verify = !!options.verify;

                var suggest = $scope.suggest = debounce(suggest_, 200);

                var verify_setter = $parse(options.verify).assign;

                var require_verify = !!options.verify;

                $scope.results = [];

                $scope.isShow = false;

                $scope.select = select;

                $scope.selected_index = 0;

                input.attr('autocomplete','off');

                input.bind('focus', function() {
                    attach();
                    suggest(this.value)
                })

                .bind('blur', function() {
                    $timeout(function() {
                        detach();
                    }, 200);
                })
                
                .bind('input', function() {
                    suggest(this.value)
                })
                
                .bind('keypress', function(e) {
                    var keycode = window.event ? e.keyCode : e.which;
                    if( keycode == 13 ){
                        select_default(this.value);
                    }
                    
                })
                .bind('keydown' , function(e){
                    var keycode = window.event ? e.keyCode : e.which;

                    if( keycode == 40){
                        //down
                        select_move(1);
                        e.preventDefault();
                    }
                    else if( keycode == 38){
                        //up
                        select_move(-1);
                        e.preventDefault();
                    }
                })

                function suggest_(key) {
                    $scope.selected_index = 0;
                    $scope.waiting = true;

                    if (typeof(key) === 'string' && key.length > 0) {
                        $q.when(options.suggest(key),
                            function suggest_succeeded(suggestions) {
                                if (suggestions && suggestions.length > 0) {
                                    
                                    $scope.results = [].concat(suggestions);

                                } else {
                                    $scope.results = [];
                                }
                            },
                            function suggest_failed(error) {
                                /*if (current_options.on_error) {
                                    current_options.on_error(error);
                                }*/
                            }
                        ).finally(function suggest_finally() {
                            $scope.waiting = false;
                        });
                    } else {
                        $scope.waiting = false;
                        $scope.results = [];
                        $scope.$apply();
                    }
                }

                function verify(){
                    var cur = input.val();
                    var results = $scope.results;
                    var key = options.key || 'name';
                    var ret = false;
                    for(var i in results){
                        if( results[i][key] == cur ){
                            ret = true;
                            break;
                        }
                    }

                    if (angular.isFunction( options.verify)) {
                        options.verify(ret);
                    }
                }

                function guess(){
                    var cur = input.val();
                    var results = $scope.results;
                    var key = options.code || 'code';
                    var ret;
                    for(var i in results){
                        if( results[i][key] == cur ){
                            ret = results[i];
                        }
                    }

                    if( ret ){
                        if (angular.isFunction( options.select )) {
                            options.select(ret);
                        }
                    }

                }

                function attach() {
                    $scope.isShow = true;
                }

                function detach() {
                    if(require_verify){
                        verify();
                    }

                    //触发guess
                    guess();

                    $timeout(function() {
                        $scope.isShow = false;
                    }, 1);
                }

                function select_default(){
                    select($scope.selected_index);
                    input.blur();
                }

                function select_move(offset){
                    var count = $scope.results ? $scope.results.length : 0;
                    var pt = $scope.selected_index + offset;
                    if(pt >= 0 && pt < count){
                        $scope.selected_index = pt;
                        $scope.$apply();
                    }
                }

                function select(i) {
                    var results = $scope.results;
                    selected = $scope.results[i];

                    if (angular.isFunction( options.select )) {
                        options.select(selected);
                    }
                    detach();
                };
            }
        };
    }]);
});
