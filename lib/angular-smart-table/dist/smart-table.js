/** 
* @version 2.1.8
* @license MIT
*/
(function (ng, undefined){
    'use strict';

ng.module('smart-table', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/smart-table/pagination.html',
        '<nav ng-if="numPages && pages.length >= 2"><ul class="pagination">' +
        '<li ng-if="currentPage>1"><a href="javascript: void(0);" ng-click="selectPage(currentPage-1)">上一页</a></li>'+
        '<li ng-repeat="page in pages" ng-class="{active: page==currentPage}"><a href="javascript: void(0);" ng-click="selectPage(page)">{{page}}</a></li>' +
        '<li ng-if="currentPage<numPages"><a href="javascript: void(0);" ng-click="selectPage(currentPage+1)">下一页</a></li>' +
        '<li><span style="padding-right:3px;">共{{numPages}}页 到第</span></li>'+
        '<li style="margin-right:15px;"><input type="text" class="form-control" style="width:60px;float:left;padding:0 3px;height:32px;text-align:center;" ng-model="gotoPage" max="{{numPages}}" ng-number min="1"> 页</li>'+
        '<li><button class="btn btn-op" ng-click="selectPage(gotoPage)">前往</button></li>'+
        '</ul></nav>');
}]);


//配置项
ng.module('smart-table')
  .constant('stConfig', {
    pagination: {
      template: 'template/smart-table/pagination.html',
      itemsByPage: 10,
      displayedPages: 5
    },
    search: {
      delay: 400, // ms
      inputEvent: 'input'
    },
    select: {
      mode: 'single',
      selectedClass: 'st-selected'
    },
    sort: {
      ascentClass: 'sorting_asc',
      descentClass: 'sorting_desc',
      defaultClass: 'sorting',

      descendingFirst: false,
      skipNatural: false,
      delay:300
    },
    pipe: {
      delay: 100 //ms
    }
  });

ng.module('smart-table')
  .controller('stTableController', ['$scope', '$parse', '$filter', '$attrs', function StTableController ($scope, $parse, $filter, $attrs) {
    var propertyName = $attrs.stTable;
    var displayGetter = $parse(propertyName);
    var displaySetter = displayGetter.assign;
    var safeGetter;
    var orderBy = $filter('orderBy');
    var filter = $filter('filter');
    var safeCopy = copyRefs(displayGetter($scope));
    var tableState = {
      sort: {},
      search: {},
      pagination: {
        start: 0,
        totalItemCount: 0
      }
    };
    var filtered;
    var pipeAfterSafeCopy = true;
    var ctrl = this;
    var lastSelected;

    function copyRefs (src) {
      return src ? [].concat(src) : [];
    }

    //保存数据后 pipe
    function updateSafeCopy () {
      safeCopy = copyRefs(safeGetter($scope));
      if (pipeAfterSafeCopy === true) {
        console.log('==> pipe')
        ctrl.pipe();
      }
    }

    function deepDelete (object, path) {
      if (path.indexOf('.') != -1) {
        var partials = path.split('.');
        var key = partials.pop();
        var parentPath = partials.join('.');
        var parentObject = $parse(parentPath)(object)
        delete parentObject[key];
        if (Object.keys(parentObject).length == 0) {
          deepDelete(object, parentPath);
        }
      } else {
        delete object[path];
      }
    }

    if ($attrs.stSafeSrc) {
      safeGetter = $parse($attrs.stSafeSrc);
      $scope.$watch(function () {
        var safeSrc = safeGetter($scope);
        return safeSrc && safeSrc.length ? safeSrc[0] : undefined;
      }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          updateSafeCopy();
        }
      });
      $scope.$watch(function () {
        var safeSrc = safeGetter($scope);
        return safeSrc ? safeSrc.length : 0;
      }, function (newValue, oldValue) {
        if (newValue !== safeCopy.length) {
          updateSafeCopy();
        }
      });
      $scope.$watch(function () {
        return safeGetter($scope);
      }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          tableState.pagination.start = 0;
          updateSafeCopy();
        }
      });
    }

    /**
     * sort the rows
     * @param {Function | String} predicate - function or string which will be used as predicate for the sorting
     * @param [reverse] - if you want to reverse the order
     */
     // 修改排序参数 然后执行 pipe 
    
    this.sortBy = function sortBy (predicate, reverse) {
      
      console.log(predicate, reverse)
      tableState.sort.predicate = predicate;
      tableState.sort.reverse = reverse === true;

      if (ng.isFunction(predicate)) {
        tableState.sort.functionName = predicate.name;
      } else {
        delete tableState.sort.functionName;
      }

      tableState.pagination.start = 0;

      return this.pipe();
    };

    this.setSort = function(predicate){
      if(tableState.sort[predicate] === undefined){
        tableState.sort[predicate] = 0;
      }
      
      tableState.sort[predicate] = ++tableState.sort[predicate] % 3;
      
      this.search();
    }

    // 修改搜索 和 分页参数 然后 pipe
    this.search = function search () {
      tableState.pagination.start = 0;
      return this.pipe();
    };

    //设置搜索条件
    /**
     * set search options
     * @param {[type]} input     the input string
     * @param {[type]} predicate the property name against you want to check the match, otherwise it will search on all properties
     */
    this.setSearch = function setSearch(input, predicate){
      var predicateObject = tableState.search.predicateObject || {};
      var prop = predicate ? predicate : '$';
      input = ng.isString(input) ? input.trim() : input;

      $parse(prop).assign(predicateObject, input);
      // to avoid to filter out null value
      if (!input) {
        deepDelete(predicateObject, prop);
      }
      console.log("set Search options",predicateObject)
      tableState.search.predicateObject = predicateObject;
    }
    /**
     * this will chain the operations of sorting and filtering based on the current table state (sort options, filtering, ect)
     */
    //这一部分 在使用 st-pipe 时会被override，默认的是 对当前数据进行排列
    this.pipe = function pipe () {
      
      
    };

    /**
     * select a dataRow (it will add the attribute isSelected to the row object)
     * @param {Object} row - the row to select
     * @param {String} [mode] - "single" or "multiple" (multiple by default)
     */
    // 更改行的选中状态
    this.select = function select (row, mode) {
      var rows = copyRefs(displayGetter($scope));
      var index = rows.indexOf(row);
      if (index !== -1) {
        if (mode === 'single') {
          row.isSelected = row.isSelected !== true;
          if (lastSelected) {
            lastSelected.isSelected = false;
          }
          lastSelected = row.isSelected === true ? row : undefined;
        } else {
          rows[index].isSelected = !rows[index].isSelected;
        }
      }
    };

    /**
     * take a slice of the current sorted/filtered collection (pagination)
     *
     * @param {Number} start - start index of the slice
     * @param {Number} number - the number of item in the slice
     */
    this.slice = function splice (start, number) {
      tableState.pagination.start = start;
      tableState.pagination.number = number;
      return this.pipe();
    };

    /**
     * return the current state of the table
     * @returns {{sort: {}, search: {}, pagination: {start: number}}}
     */
    this.tableState = function getTableState () {
      return tableState;
    };

    this.getFilteredCollection = function getFilteredCollection () {
      return filtered || safeCopy;
    };

    /**
     * Use a different filter function than the angular FilterFilter
     * @param filterName the name under which the custom filter is registered
     */
    this.setFilterFunction = function setFilterFunction (filterName) {
      filter = $filter(filterName);
    };

    /**
     * Use a different function than the angular orderBy
     * @param sortFunctionName the name under which the custom order function is registered
     */
    this.setSortFunction = function setSortFunction (sortFunctionName) {
      orderBy = $filter(sortFunctionName);
    };

    /**
     * Usually when the safe copy is updated the pipe function is called.
     * Calling this method will prevent it, which is something required when using a custom pipe function
     */
    this.preventPipeOnWatch = function preventPipe () {
      pipeAfterSafeCopy = false;
    };
  }])
  .directive('stTable', function () {
    return {
      restrict: 'A',
      controller: 'stTableController',
      link: function (scope, element, attr, ctrl) {

        if (attr.stSetFilter) {
          ctrl.setFilterFunction(attr.stSetFilter);
        }

        if (attr.stSetSort) {
          ctrl.setSortFunction(attr.stSetSort);
        }
      }
    };
  });

// pass
ng.module('smart-table')
  .directive('stSearch', ['stConfig', '$timeout','$parse', function (stConfig, $timeout, $parse) {
    return {
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {
        var tableCtrl = ctrl;
        var promise = null;
        //
        var throttle = attr.stDelay || stConfig.search.delay;
        var event = attr.stInputEvent || stConfig.search.inputEvent;

        //监听 元素值变化并 出发搜索
        /*
        attr.$observe('stSearch', function (newValue, oldValue) {
          var input = element[0].value;
          if (newValue !== oldValue && input) {
            ctrl.tableState().search = {};
            console.log(input , newValue)
            tableCtrl.search(input, newValue);
          }
        });*/

        //table state -> view 可以去了 取消数据模型 到 视图的绑定。
        /*
        scope.$watch(function () {
          return ctrl.tableState().search;
        }, function (newValue, oldValue) {
          console.log(newValue)
          var predicateExpression = attr.stSearch || '$';
          if (newValue.predicateObject && $parse(predicateExpression)(newValue.predicateObject) !== element[0].value) {
            element[0].value = $parse(predicateExpression)(newValue.predicateObject) || '';
          }
        }, true);*/

        // view -> table state
        element.bind(event, function (evt) {
          evt = evt.originalEvent || evt;
          if (promise !== null) {
            $timeout.cancel(promise);
          }

          promise = $timeout(function () {
            tableCtrl.setSearch(evt.target.value, attr.stSearch || '');
            promise = null;
          }, throttle);
        });
      }
    };
  }]);



/*ng.module('smart-table')
  .directive('stSelectRow', ['stConfig', function (stConfig) {
    return {
      restrict: 'A',
      require: '^stTable',
      scope: {
        row: '=stSelectRow'
      },
      link: function (scope, element, attr, ctrl) {
        var mode = attr.stSelectMode || stConfig.select.mode;
        element.bind('click', function () {
          scope.$apply(function () {
            ctrl.select(scope.row, mode);
          });
        });

        scope.$watch('row.isSelected', function (newValue) {
          if (newValue === true) {
            element.addClass(stConfig.select.selectedClass);
          } else {
            element.removeClass(stConfig.select.selectedClass);
          }
        });
      }
    };
  }]);*/

// pass
ng.module('smart-table')
  .directive('stSort', ['stConfig', '$timeout','$parse', function (stConfig, $timeout, $parse) {
    return {
      restrict: 'A',
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {
        var tableCtrl = ctrl;
        var promise = null;
        //
        var throttle = attr.stDelay || stConfig.sort.delay;
        var event = 'click';

        var predicate = attr.stSort;
        var enable = attr.stSortEnable;
        if(!enable) return;

        var classAscent = attr.stClassAscent || stConfig.sort.ascentClass;
        var classDescent = attr.stClassDescent || stConfig.sort.descentClass;
        var classDefault = attr.stClassDefault || stConfig.sort.defaultClass;

        var stateClasses = [classDefault, classAscent, classDescent];


        //state -> view
        scope.$watch(function () {
          return ctrl.tableState().sort[predicate];
        }, function (newValue, oldValue) {
          
          if(newValue == 1){
            element
              .addClass(classAscent)
              .removeClass(classDescent);
          }
          else if(newValue == 2){
            element
              .removeClass(classAscent)
              .addClass(classDescent);
          }else
          {
            element
              .removeClass(classAscent)
              .removeClass(classDescent);
          }
          
        }, true);

        // view -> table state
        element.bind(event, function () {
          if (promise !== null) {
            $timeout.cancel(promise);
          }

          promise = $timeout(function () {
            tableCtrl.setSort(predicate);
            promise = null;
          }, throttle);
        }).addClass(classDefault);
      }
    };
  }]);

//排序 pass
ng.module('smart-table')
  .directive('stQuickSort', ['stConfig', '$parse', '$timeout', function (stConfig, $parse, $timeout) {
    return {
      restrict: 'A',
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {
        var predicate = attr.stSort;

        //如果 st-sort 是表达式 或者 函数（比如过滤器） 需要在 sort 时转换为最终值
        var getter = $parse(predicate); 
        var index = 0;

        //排序样式
        var classAscent = attr.stClassAscent || stConfig.sort.ascentClass;
        var classDescent = attr.stClassDescent || stConfig.sort.descentClass;
        var stateClasses = [classAscent, classDescent];

        //默认排序
        var sortDefault;

        var skipNatural = attr.stSkipNatural !== undefined ? attr.stSkipNatural : stConfig.sort.skipNatural;
        
        //默认降序
        var descendingFirst = attr.stDescendingFirst !== undefined ? attr.stDescendingFirst : stConfig.sort.descendingFirst;
        var promise = null;
        var throttle = attr.stDelay || stConfig.sort.delay;

        if (attr.stSortDefault) {
          sortDefault = scope.$eval(attr.stSortDefault) !== undefined ? scope.$eval(attr.stSortDefault) : attr.stSortDefault;
        }

        //排序
        //view --> table state
        function sort () {
          if (descendingFirst) {
            index = index === 0 ? 2 : index - 1;
          } else {
            index++;
          }

          var func;
          //转换为最终值
          predicate = ng.isFunction(getter(scope)) || ng.isArray(getter(scope)) ? getter(scope) : attr.stSort;
          
          //三种状态 normal 0, desc 1 ,asc 2
          //nomal 重置 sort参数 和 分页参数
          if (index % 3 === 0 && !!skipNatural !== true) {
            //manual reset
            index = 0;
            ctrl.tableState().sort = {};
            ctrl.tableState().pagination.start = 0;
            func = ctrl.pipe.bind(ctrl);
          } 
          //正常排序时 1 2 ,执行sortBy,sortBy 会再调用 pipe
          else {

            func = ctrl.sortBy.bind(ctrl, predicate, index % 2 === 0);
          }

          console.log('pre run')
          //promise 和 延迟执行
          if (promise !== null) {
            $timeout.cancel(promise);
          }

          if (throttle < 0) {
            func();
          } else {
            promise = $timeout(func, throttle);
          }
        }

        // 视图绑定，执行排序过程
        element.bind('click', function sortClick () {
          if (predicate) {
            scope.$apply(sort);
          }
        });

        //初始化时执行
        if (sortDefault) {
          index = sortDefault === 'reverse' ? 1 : 0;
          sort();
        }

        //table state --> view, 修改视图样式
        scope.$watch(function () {
          return ctrl.tableState().sort;
        }, function (newValue) {
          console.log(newValue,'||||')
          if (newValue.predicate !== predicate) {
            index = 0;
            element
              .removeClass(classAscent)
              .removeClass(classDescent);
          } else {
            index = newValue.reverse === true ? 2 : 1;
            element
              .removeClass(stateClasses[index % 2])
              .addClass(stateClasses[index - 1]);
          }
        }, true);
      }
    };
  }]);

//分页指令
ng.module('smart-table')
  .directive('stPagination', ['stConfig', function (stConfig) {
    return {
      restrict: 'EA',
      require: '^stTable',
      scope: {
        stItemsByPage: '=?',
        stDisplayedPages: '=?',
        stPageChange: '&'
      },
      templateUrl: function (element, attrs) {
        if (attrs.stTemplate) {
          return attrs.stTemplate;
        }
        return stConfig.pagination.template;
      },
      link: function (scope, element, attrs, ctrl) {
        scope.stItemsByPage = scope.stItemsByPage ? +(scope.stItemsByPage) : stConfig.pagination.itemsByPage;
        scope.stDisplayedPages = scope.stDisplayedPages ? +(scope.stDisplayedPages) : stConfig.pagination.displayedPages;

        scope.currentPage = 1;
        scope.pages = [];

        function redraw () {
          var paginationState = ctrl.tableState().pagination;
          var start = 1;
          var end;
          var i;
          var prevPage = scope.currentPage;
          scope.totalItemCount = paginationState.totalItemCount;
          scope.currentPage = Math.floor(paginationState.start / paginationState.number) + 1;

          start = Math.max(start, scope.currentPage - Math.abs(Math.floor(scope.stDisplayedPages / 2)));
          end = start + scope.stDisplayedPages;

          if (end > paginationState.numberOfPages) {
            end = paginationState.numberOfPages + 1;
            start = Math.max(1, end - scope.stDisplayedPages);
          }

          scope.pages = [];
          scope.numPages = paginationState.numberOfPages;

          for (i = start; i < end; i++) {
            scope.pages.push(i);
          }
          if (prevPage !== scope.currentPage) {
            scope.stPageChange({newPage: scope.currentPage});
          }
        }

        //table state --> view
        scope.$watch(function () {
          return ctrl.tableState().pagination;
        }, redraw, true);

        //scope --> table state  (--> view)
        scope.$watch('stItemsByPage', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            scope.selectPage(1);
          }
        });

        scope.$watch('stDisplayedPages', redraw);

        //view -> table state
        scope.selectPage = function (page) {
          console.log(page)
          if (page > 0 && page <= scope.numPages) {
            ctrl.slice((page - 1) * scope.stItemsByPage, scope.stItemsByPage);
          }
        };

        if (!ctrl.tableState().pagination.number) {
          ctrl.slice(0, scope.stItemsByPage);
        }
      }
    };
  }]);


// pipe 管道 pass
ng.module('smart-table')
  .directive('stPipe', ['stConfig', '$timeout', function (config, $timeout) {
    return {
      require: 'stTable',
      scope: {
        stPipe: '='
      },
      link: {

        pre: function (scope, element, attrs, ctrl) {

          var pipePromise = null;

          if (ng.isFunction(scope.stPipe)) {
            ctrl.preventPipeOnWatch();
            ctrl.pipe = function () {

              if (pipePromise !== null) {
                $timeout.cancel(pipePromise)
              }

              //执行 pipe 对应的函数
              pipePromise = $timeout(function () {
                scope.stPipe(ctrl.tableState(), ctrl);
              }, config.pipe.delay);

              return pipePromise;
            }
          }
        },

        post: function (scope, element, attrs, ctrl) {
          ctrl.pipe();
        }
      }
    };
  }]);

ng.module('smart-table')
  .directive('stAction', ['stConfig', '$timeout','$parse', function (stConfig, $timeout, $parse) {
    return {
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {
        var tableCtrl = ctrl;
        var promise = null;
        var throttle = attr.stDelay || stConfig.search.delay;
        var event = 'click';

        // view -> table state
        element.bind(event, function (evt) {
          if (promise !== null) {
            $timeout.cancel(promise);
          }

          promise = $timeout(function () {
            tableCtrl.search();
            promise = null;
          }, throttle);
        });
      }
    };
  }]);

})(angular);