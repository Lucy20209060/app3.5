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

    app.directive('nrTree', ['$compile', 'RecursionHelper', '$rootScope', function($compile, RecursionHelper, $rootScope) {
        return {
            restrict: 'EA',
            scope: {
                nrTree: '=',
                treeModel: "=",
                nodeChild: "="
            },
            replace : true,
            template: '<ul>' +
                '<li ng-repeat="node in treeModel" class="parent_li">' +
                '<span>' +
                '<i ng-if="node[nodeChildren] && node[nodeChildren].length" class="fa fa-lg" ng-class="{\'fa-plus-circle\': node.collapsed,\'fa-minus-circle\': !node.collapsed}" ng-show="node[nodeLabel].length" ng-click="node.collapsed = !node.collapsed"></i>' +
                '<label>' +
                '<input type="checkbox" ng-model="node.checked" /><i></i> {{node[nodeLabel]}}' +
                '</label>' +
                '</span>' +
                '<nr-tree ng-hide="node.collapsed" node-child="true" tree-model="node[nodeChildren]" node-id="{{nodeId}}" node-label="{{nodeLabel}}" node-children="{{nodeChildren}}" nodeChild="true"></nr-tree>' +
                '</li>' +
                '</ul>',
            compile: function(element) {

                //扫描树
                function renderTreeByData(nv, ov, mode , scope) {
                    // console.log( nv, ov );

                    var child_pointer = compare(nv, ov);

                    // console.log(child_pointer);
                    if (!child_pointer) return;


                    var cur_checked = !!child_pointer.checked;

                    process_child(child_pointer);

                    process_ancient(nv);

                    renderProcess = false;

                    function clear(d , cur) {

                        // console.log(cur);
                        if (d) {
                            for (var i in d) {
                                if(d[i] != cur){
                                    d[i].checked = false;
                                }
                                clear(d[i].children , cur);
                            }
                        }
                    }

                    //比较出不同的值的位置
                    function compare(nv, ov) {
                        if(!nv || !ov) return null;

                        for (var i in nv) {

                            if (nv[i].checked != ov[i].checked) {
                                return nv[i];
                            }

                            else {
                                var r = compare(nv[i].children, ov[i].children);
                                if( r ) return r;
                            }
                        }

                        return null;
                    }

                    //处理所有子节点
                    function process_child(d) {
                        if(!d.children) return;
                        //自动处理机制触发的 树结构变化 需要处理特殊情况
                        //一下两种情况无需处理子节点
                        //1. 当前选中，且子节点已有选中
                        //2. 当前未选中，其子节点已无选中
                        var checked = !!d.checked;
                        var hasChild = hasChildChecked(d.children);

                        //(checked && !hasChild ) || (!checked && hasChild)
                        if( checked != hasChild) {
                            for (var i in d.children) {
                                d.children[i].checked = checked;
                                process_child(d.children[i], checked)
                            }
                        }
                        
                        
                    }


                    function hasChildChecked(d){
                        for (var i = d.length - 1; i >= 0; i--) {
                            if( d[i].checked ) return true;
                        }
                        return false;
                    }

                    //从底层遍历到顶层
                    function process_ancient(d) {

                        var r = false;

                        //通过遍历子节点的 checked 状态计算当前结点
                        if (d && d.length) {
                            for (var i in d) {
                                //节点状态由children状态计算
                                var t = !!d[i].checked;

                                //如果有子节点，则通过子节点递归计算
                                if (d[i].children && d[i].children.length) {
                                    t = process_ancient(d[i]['children'])
                                }

                                //没子节点返回自身 checked
                                d[i].checked = t;

                                r = r || t;
                            }
                        }

                        return r;
                    }

                }

                return RecursionHelper.compile(element, function($scope, iElement, attrs, controller, transcludeFn) {
                    var treeModel = attrs.treeModel;

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
                        $scope.$watch('treeModel', function(nv, ov) {
                            renderTreeByData(nv, ov);
                        } , true);
                    }
                });
            }

        };
    }]);
});
