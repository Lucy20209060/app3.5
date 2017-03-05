/*!
 * @desc 状态监控
 */
define(['app'], function(app) {
    // stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){function h(a){c.appendChild(a.dom);return a}function k(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="";c.addEventListener("click",function(a){a.preventDefault();k(++l%c.children.length)},!1);var g=(performance||Date).now(),e=g,a=0,r=h(new Stats.Panel("FPS","#0ff","#002")),f=h(new Stats.Panel("MS","#0f0","#020"));
if(self.performance&&self.performance.memory)var t=h(new Stats.Panel("MB","#f08","#201"));k(0);return{REVISION:16,dom:c,addPanel:h,showPanel:k,begin:function(){g=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();f.update(c-g,200);if(c>e+1E3&&(r.update(1E3*a/(c-e),100),e=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){g=this.end()},domElement:c,setMode:k}};
Stats.Panel=function(h,k,l){var c=Infinity,g=0,e=Math.round,a=e(window.devicePixelRatio||1),r=80*a,f=48*a,t=3*a,u=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=f;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,f);b.fillStyle=k;b.fillText(h,t,u);b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(f,
v){c=Math.min(c,f);g=Math.max(g,f);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=k;b.fillText(e(f)+" "+h+" ("+e(c)+"-"+e(g)+")",t,u);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,e((1-f/v)*p))}}};"object"===typeof module&&(module.exports=Stats);
    
    function getWatchers(root) {
      root = angular.element(root || document.documentElement);
      var watcherCount = 0;
     
      function getElemWatchers(element) {
        var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
        var scopeWatchers = getWatchersFromScope(element.data().$scope);
        var watchers = scopeWatchers.concat(isolateWatchers);
        angular.forEach(element.children(), function (childElement) {
          watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
        });
        return watchers;
      }
      
      function getWatchersFromScope(scope) {
        if (scope) {
          return scope.$$watchers || [];
        } else {
          return [];
        }
      }
     
      return getElemWatchers(root);
    }


    app.directive('stats', ['oms','$document',function(oms,$document) {
        return {
            restrict: 'E',
            replace: true, 
            scope:{
                expand : '=?'
            },
            template:'<div ng-hide="!expand" style="position: fixed; top: 0; left:0; cursor: pointer; opacity: 0.9; z-index: 10001;background:#fff;box-shadow:0 0 2px #eee;"><div class="stats-p"></div><div style="display:inline-block;vertical-align: top;"><label style="display:block;" ng-repeat="id in envs"><input type="radio" value="{{id}}" name="env" ng-model="env" ng-change="change(id)">{{id}}</label></div></div>',
            link : function($scope, element){
                var stats = new Stats();
                var watcher_stats = stats.addPanel( new Stats.Panel( 'ws', '#ff8', '#221' ) );
                stats.showPanel( 3 );
                element.find('.stats-p').append(stats.dom);

                $scope.envs = oms.key(oms.env());

                $scope.env = oms.env(0);

                $scope.expand = window.localStorage['CFG_DEV'] == 'true';

                $document.bind('keypress', function(e) {
                    if(
                        (e.which == 83 && e.shiftKey )
                    ){
                        $scope.expand = !$scope.expand;
                        window.localStorage['CFG_DEV'] = $scope.expand;
                        $scope.$apply();
                    }
                });


                $scope.change = function(id){
                    oms.env(id);
                }

                function animate() {
                    stats.begin();

                    stats.end();

                    watcher_stats.update( getWatchers().length, 460 );

                    requestAnimationFrame( animate );
                }

                animate();
            }
        }
    }])

    
});