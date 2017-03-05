/*!
 * @desc 树形checkbox
 * @Date 2016/08/10
 */

define(['app'], function(app) {
    app.factory('RecursionHelper', ['$compile', function($compile) {
        return {
            /**
             * Manually compiles the element, fixing the recursion loop.
             * @param element
             * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
             * @returns An object containing the linking functions.
             */
            compile: function(element, link) {
                // Normalize the link parameter
                if (angular.isFunction(link)) {
                    link = { post: link };
                }

                // Break the recursion loop by removing the contents
                var contents = element.contents().remove();
                var compiledContents;
                return {
                    pre: (link && link.pre) ? link.pre : null,
                    /**
                     * Compiles and re-adds the contents
                     */
                    post: function(scope, element) {
                        // Compile the contents
                        if (!compiledContents) {
                            compiledContents = $compile(contents);
                        }
                        // Re-add the compiled contents to the element
                        compiledContents(scope, function(clone) {
                            element.append(clone);
                        });

                        // Call the post-linking function, if any
                        if (link && link.post) {
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        };
    }]);

    app.directive('treeRadio', ['$compile', 'RecursionHelper', '$rootScope', function($compile, RecursionHelper, $rootScope) {
        return {
            restrict: 'EA',
            scope: {
                treeRadio: '=',
                treeModel: "=",
                nodeChild: "=",
                treeParms: "="
            },
            replace : true,
            template: '<ul>' +
                '<li ng-repeat="node in treeModel" class="parent_li">' +
                '<span>' +
                '<i ng-if="node[nodeChildren] && node[nodeChildren].length" class="fa fa-lg" ng-class="{\'fa-plus-circle\': node.collapsed,\'fa-minus-circle\': !node.collapsed}" ng-show="node[nodeLabel].length" ng-click="node.collapsed = !node.collapsed"></i>' +
                '<label>' +
                '<input type="radio" ng-checked="node[nodeId] == treeParms.ids" ng-click="select(node[nodeId])" /> {{node[nodeLabel]}}' +
                '</label>' +
                '</span>' +
                '<tree-radio ng-hide="node.collapsed" node-child="true" tree-model="node[nodeChildren]" node-id="{{nodeId}}" node-label="{{nodeLabel}}" node-children="{{nodeChildren}}" nodeChild="true"></tree-radio>' +
                '</li>' +
                '</ul>',

            compile: function(element) {

                return RecursionHelper.compile(element, function($scope, iElement, attrs, controller, transcludeFn) {
                    var treeModel = attrs.treeModel;

                    var treeParms = attrs.treeParms;

                    var nodeId = attrs.nodeId || 'value';
                    $scope.nodeId = nodeId;

                    //绑定的数据标签字段
                    var nodeLabel = attrs.nodeLabel || 'label';
                    $scope.nodeLabel = nodeLabel;

                    //绑定的数据子集字段
                    var nodeChildren = attrs.nodeChildren || 'children';
                    $scope.nodeChildren = nodeChildren;


                    //在 root 上扫描
                    if (!$scope.nodeChild) {
                        /*$scope.$watch('treeModel', function(nv, ov) {
                            renderTreeByData(nv, ov);
                        } , true);*/

                    }
                });
            }

        };
    }]);
});
