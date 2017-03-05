define(['app'], function(app) {
    //<input type="text" placeholder="请输入关键字" class="form-control" ng-model="query" />
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/areainfo.html',
            '<div class="custom-area row col-lg-6"><div class="area-select"><div class="ui-dropdown" sl-dropdown><span class="dd-toggle" ng-bind="current.province.areaname"></span><ul class="dd-menu"><li ng-repeat="row in group.province"><a ng-click="select_province(row)">{{row.areaname}}</a></li></ul></div><div class="ui-dropdown" sl-dropdown><span class="dd-toggle" ng-bind="current.city.areaname"></span><ul class="dd-menu"><li ng-repeat="row in group.city"><a ng-click="select_city(row)">{{row.areaname}}</a></li></ul></div><div class="ui-dropdown" sl-dropdown><span class="dd-toggle">请选择地区</span><ul class="dd-menu"><li ng-repeat="row in group.district"><a ng-click="select_district(row)">{{row.areaname}}</a></li></ul></div></div><div class=""><ul class="remove"><li tabindex="0" ng-repeat="row in slAreaSelect"><span>{{row.fullpath}}</span><span class="menu"><a ng-click="remove(row)"><i class="fa fa-fw fa-close"></i></a></span></li></ul></div></div></div>');
    }]);

    app.directive('slArea', ['$timeout', '$parse', 'ModalService', function($timeout, $parse, ModalService) {

        return {
            restrict: 'A',
            scope: {
                slArea: '=',
                slAreaSelect: '=',
            },
            templateUrl:'template/common/areainfo.html',

            link: function(scope, element, attr, ctrl) {

                //var area = angular.copy(scope.slArea);
                //原始数据，display 状态会被更改
                var group = {
                    province : [],
                    city : [],
                    district : []
                }

                var current = {
                    province:'',
                    city:''
                };

                scope.group = group;

                scope.current = current;

                scope.select_province = select_province;

                scope.select_city = select_city;

                scope.select_district = select_district;

                scope.remove = remove;

                scope.$watch(function(){
                    return scope.slArea;
                }, function(nv){
                    parse(nv);
                });

   

                function parse(v){
                    if(v){
                        group.province = v;
                        current.province = v[0];

                        select_province(v[0]);
                    }
                }

                function select_province(v){
                    current.province = v;

                    group.city = v.children;

                    select_city(v.children[0])
                }

                function select_city(v) {
                    current.city = v;
                    group.district = v.children;
                    group.district.unshift({id:0,areaname:'全部'})
                }

                function select_district(v){
                    var id = v.id;
                    if(id == 0){
                        for(var i=1;i<group.district.length;i++){
                            add(group.district[i]);
                        }
                    }else{
                        add(v);
                    }
                }

                function add(v){
                    var id = v.id;
                    var areas = scope.slAreaSelect;
                    for(var i in areas){
                        if(areas[i].id == id){
                            return;
                        }
                    }
                    areas.push( v ); 
                }

                function remove(v){
                    var id = v.id;
                    var areas = scope.slAreaSelect
                    for(var i in areas){
                        if(areas[i].id == id){
                            areas.splice(i,1);
                        }
                    }
                }
            }
        };
    }]);
})
