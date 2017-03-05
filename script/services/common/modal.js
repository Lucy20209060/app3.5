/**
 * [模态框指令]
 * 
 * ng-confirm="{
 *     'title':'注意',
 *     'content':'确定删除角色？',
 *     'callback':remove
 * }"
 *
 * @param {object} option
 * 
 * ModalService.open({
 *     //标题
 *     "title":"",
 *
 *     //内容
 *     "content":"内容",
 *
 *     //是否作为alert弹层显示,
 *     "alert":true,
 *
 *      //使用自定义模板
 *     "template":"",
 *
 *     //其他数据, 可用于自定义模板里 的数据绑定，
 *     //在模板里 必须以 data.foo 的方式绑定 
 *     "foo":""
 *     
 * }).then(function(modal) {
 *      //result 结果 true , false
 *      // data 绑定的所有数据
 *      modal.close.then(function(result , data) {
 *          
 *      })
 * }); 
 */

define(['app'], function(app) {
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/modal.html',
            '<div class="modal fade in" ng-class={"modal-alert":data.__alert__} style="display:block;"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><h4 class="modal-title">{{data.title}}</h4></div><div class="modal-body text-center"><h4>{{data.content}}</h4></div><div class="modal-footer"><button ng-if="!data.__alert__" type="button" class="btn btn-default/* pull-left*/" data-dismiss="modal" ng-click="close(false)">取消</button><button type="button" class="btn btn-primary" ng-click="close(true)">确定</button></div></div></div></div>');
    }]);

    /**
     * [模态框控制器]
     */
    app.controller('ModalDefaultController', ['$scope', 'close', 'data', function($scope, close, data) {
        $scope.data = data;
        $scope.close = function(result) {
            close && close(result);
        };
    }]);

    app.factory('ModalService', ['$templateRequest', '$q', '$compile', '$document', '$rootScope', '$controller', '$timeout', '$animate', function($templateRequest, $q, $compile, $document, $rootScope, $controller, $timeout, $animate) {
        function ModalService() {
            var getTemplate = function(templateUrl) {
                var deferred = $q.defer();
                $templateRequest(templateUrl, true)
                    .then(function(template) {
                        deferred.resolve(template);
                    }, function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };

            var getData = function(obj) {
                var ext = ['onClose', 'onClosed', 'parent','alert','template'];
                var ret = {};
                for (var i in obj) {
                    if (ext.indexOf(i) == -1) {
                        ret[i] = obj[i];
                    }
                }
                ret.__alert__ = !!obj.alert;
                return ret;
            }

            var appendChild = function(child, parent) {
                var children = parent.children();
                if (children.length > 0) {
                    return $animate.enter(child, parent, children[children.length - 1]);
                }
                return $animate.enter(child, parent);
            };

            var stamp = 0;

            this.open = function(options) {

                var body = angular.element($document[0].body);

                var deferred = $q.defer();

                var tpl = options.template || 'template/common/modal.html';

                getTemplate(tpl).then(function(template) {
                    var closeDeferred = $q.defer();
                    var linkFn = $compile(template);

                    //申明scope
                    var modalScope = $rootScope.$new();

                    //申明模板视图
                    var vm = {
                        $scope: modalScope,
                        data: getData(options),
                        close: function(result, delay) {
                            if (delay === undefined || delay === null) delay = 0;
                            $timeout(function() {

                                cleanUpClose(result);

                            }, delay);
                        }
                    };

                    var parent = options.parent || body;

                    var rootScopeOnClose = $rootScope.$on('$locationChangeSuccess', cleanUpClose);

                    //关联视图模板的scope
                    var modalElement = linkFn(modalScope);
                    vm.$element = modalElement;

                    //将自定的视图模板注入到控制器
                    var modalController = $controller('ModalDefaultController', vm);

                    //添加到dom中
                    appendChild(modalElement, parent);

                    var modal = {
                        controller: modalController,
                        scope: modalScope,
                        element: modalElement,
                        close: closeDeferred.promise,
                        data : vm.data
                    };

                    deferred.resolve(modal);

                    function cleanUpClose(result) {
                        closeDeferred.resolve(result);
                        $animate.leave(modalElement)
                            .then(function() {
                                modalScope.$destroy();
                                vm.close = null;
                                deferred = null;
                                closeDeferred = null;
                                modal = null;
                                vm = null;
                                modalElement = null;
                                modalScope = null;
                            });
                        rootScopeOnClose && rootScopeOnClose();
                    }
                });

                return deferred.promise;
            }
        }
        return new ModalService();
    }]);

    app.directive('ngConfirm', ['$state', function($state) {
        return {
            restrict: 'A',
            scope: {
                'ngConfirm': '='
            },
            link: function($scope, element) {
                element.bind('click', function() {
                    $scope.open($scope.ngConfirm);
                })
            },

            controller: ['$scope', 'ModalService', function($scope, ModalService) {
                $scope.open = function(options) {
                    ModalService.open(options).then(function(modal) {
                        modal.close.then(function(result) {
                            options.callback && options.callback(result);
                        })
                    });
                }
            }]
        };
    }]);
})
