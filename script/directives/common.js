/*!
 * @desc 功能指令库
 * @date 2016/08/29
 */

define(['app'], function(app) {

    app.directive('slDropdown', ['$document', function($document) {
        return {
            restrict: 'A',

            link: function($scope, element, attr) {
                var menu = element.find('.dd-menu'),
                    trigger = element.find('.dd-toggle');
                var capture = false;    
                trigger.on('click',function(e){
                    capture = true;
                    element.toggleClass('open');
                    //e.stopPropagation();
                });

                $document.on('click' , function(e){
                    if(!capture){
                        element.removeClass('open');
                    }
                    capture = false;
                    
                    //element.removeClass('open');
                    /*if( !(element[0].compareDocumentPosition(e.target) & 16) ){
                        if(flag)
                            element.removeClass('open');
                    }*/
                })
            }
        }
    }])

    app.directive('ngBack', ['$window', function($window) {
        return {
            restrict: 'A',

            link: function($scope, element, attr) {
                element.on('click', function() {
                    $window.history.back();
                });
            }
        };
    }]);

    //此指令依赖 jquery
    app.directive('ngTableCheck', [function() {
        return {
            restrict: 'A',

            link: function($scope, element, attr) {

                var toggle = function(v) {
                    var key = attr['ngTableCheck'] || 'data';
                    var data = $scope[key];

                    for (var i in data) {
                        data[i].checked = v;
                    }

                    $scope.$apply();
                }


                var header = element.find('tr th input[type="checkbox"]');
                header.on('click', function() {
                    var el = angular.element(this);
                    if (el.prop('checked')) {
                        toggle(true);
                    } else {
                        toggle(false);
                    }

                });

                element.on('click', 'tr td input[type="checkbox"]', function(e) {
                    if (element.find('tr td input[type="checkbox"]:not(:checked)').length == 0) {

                        header.prop('checked', true);
                    } else {
                        header.prop('checked', false);
                    }

                })

            }
        };
    }]);

    app.directive('batchOp', ['ModalService', 'filterFilter', function(ModalService, filter) {
        return {
            restrict: 'A',
            scope: {
                'batchOp': '='
            },
            link: function($scope, element, attr) {
                element.bind('click', function() {
                    /*var getter = $parse(attr.batchRemove);
                    var items = getter(scope); 
                    var setter = getter.assign;*/

                    var items = $scope.batchOp.data;

                    var options = {
                        'title': $scope.batchOp.title || '提示',
                        'content': $scope.batchOp.content || '确定要操作吗？',
                    }

                    var callback = $scope.batchOp.callback;

                    var key = $scope.batchOp.key || 'checked';

                    var select = $scope.batchOp.select || 'id';

                    var filter_opt = $scope.batchOp.filter;

                    var arr = []; // oms.coll(items , 'checked' , true);

                    if (filter_opt) {
                        items = filter(items, filter_opt);
                    }

                    for (var i in items) {
                        if (items[i][key]) arr.push(items[i][select]);
                    }

                    if (arr.length) {
                        ModalService.open(options).then(function(modal) {
                            modal.close.then(function(result) {
                                if (result) {
                                    callback && callback(arr);
                                }
                            })
                        });
                    } else {
                        callback && callback([]);
                    }
                })
            }
        };
    }]);

    app.directive('pageReset', ['$state', function($state) {
        return {
            restrict: 'A',

            link: function($scope, element) {
                // Prevent html5/browser auto completion.
                var input = element.find('.ac-trigger input');

                element.bind('click', function() {
                    $state.reload();
                })
            }
        };
    }]);

    app.directive('ngNumber', [function($state, $location) {
        return {
            scope: {
                ngModel: '=',
            },
            link: function(scope, element, attr) {

                element.bind('propertychange keyup change paste', function() {
                    var min = attr['min'],
                    max = attr['max'];
                    scope.$apply(function() {

                        var v = element.val();
                        v = parseInt(v.replace(/\D/g, ''));
                        if (!isNaN(v)) {
                            if (v < min) v = min;
                            if (v > max) v = max;
                        }
                        scope.ngModel = v;
                    });
                });



            }
        }
    }]);

    app.directive('nrHref', ['$state', '$location', function($state, $location) {
        return function(scope, element, attr) {
            element.bind('click', function() {
                if (attr.href == $location.path()) {
                    $state.reload();
                }
            })

        };
    }]);

    app.directive('ngVisible', function() {
        return function(scope, element, attr) {
            scope.$watch(attr.ngVisible, function(visible) {
                element.css('visibility', visible ? 'visible' : 'hidden');
            });
        };
    });

    /**
     * 生成导航面包屑
     * @param  {[type]} oms){                 }] [description]
     * @return {[type]}        [description]
     */
    app.directive('nrBreadcrumb', ['Session', '$state', '$timeout', function(Session, $state, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: '<ol class="breadcrumb"><li>首页</li><li ng-repeat="item in data"><span ng-if="!item.url">{{item.name}}</span><a ng-if="item.url" href="{{item.url}}">{{item.name}}</a></li></ol>',
            link: function($scope) {
                var process = function() {
                    var menu = Session.getPermissions();
                    if (menu.length == 0) {
                        $timeout(process, 100);
                    } else {
                        format(menu, location.pathname);
                    }
                }

                function hit(d, c) {
                    for (var i in d) {
                        if (c.indexOf(i) >= 0) {
                            return d[i];
                        }
                    }
                    return null;
                }

                function format(d, c) {
                    var hash_id = {},
                        hash_url = {};
                    for (var i in d) {
                        hash_id[d[i].id] = d[i];
                        if (d[i].url) {
                            hash_url[d[i].url] = d[i];
                        }
                    }
                    var cur = hit(hash_url, c),
                        arr = [];
                    while (cur) {
                        arr.unshift(cur);
                        if (cur.parentId) {
                            cur = hash_id[cur.parentId];
                        } else {
                            cur = null;
                        }
                    }
                    $scope.data = arr;
                }

                process();
            }
        }
    }]);

    app.directive("fileread", [function() {
        return {
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    scope.$apply(function() {
                        scope.fileread = changeEvent.target.files[0];
                        console.log(scope.fileread);
                        // or all selected files:
                        // scope.fileread = changeEvent.target.files;
                    });
                });
            }
        }
    }]);

    app.directive("nrUploadFile", ['Upload', function(Upload) {
        var mime = {
            'image/*': ['png', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff']
        }

        function checkExt(v, accept) {
            if (accept) {
                var ext = v.split('.').pop();
                var allow = mime[accept] || (accept.split('.'));

                for (var i in allow) {
                    if (allow[i] == ext) {
                        return true;
                    }
                }
                return false;
            } else
                return true;

        }

        return {
            scope: {
                nrUploadFile: "=",
                nrFile: "=?"
            },
            template: '<div class="select"><span>选择文件</span><input type="file" accept="{{accept}}"></div><span ng-bind="nrUploadFile.name"></span><a href="{{nrFile}}" target="_blank" class="ori" ng-show="nrFile"><i class="fa fa-paperclip"></i>{{nrFile | filename}}</a>',
            link: function(scope, element, attributes) {
                element.addClass('upload-file');
                var name = attributes.name;
                var file = element.find('input[type="file"]');
                var accept = attributes.accept;
                scope.accept = accept;
                file.attr('name', name);
                file.bind("change", function(changeEvent) {
                    //Upload.rename(file, name)
                    if (changeEvent.target.files.length) {
                        if (checkExt(changeEvent.target.files[0].name, accept)) {
                            scope.$apply(function() {
                                scope.nrUploadFile = changeEvent.target.files[0];
                                // scope.nrUploadFile._name = name;
                                //Upload.rename( changeEvent.target.files[0] ,name);
                            });
                        }
                    }

                });
            }
        }
    }]);


    /*    app.directive('nrBg', function() {
            return function(scope, element, attrs) {
                attrs.$observe('nrBg', function(value) {
                    console.log(value)
                    element.css({
                        'background-image': 'url(' + value + ')',
                        'background-size': 'cover'
                    });
                    //element.css("background", "url(" +scope.nrBg+ ") center center / cover");
                });
            };
        });*/

    app.directive('nrThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            scope: {
                nrThumb: "="
            },
            template: '<canvas/>',
            link: function(scope, element, attrs) {


                if (!helper.support) return;


                var canvas = element.find('canvas');
                var reader = new FileReader();
                var width = element.width();
                var height = element.height();
                canvas.attr({ width: width, height: height });

                scope.$watch('nrThumb', function(file) {

                    if (!helper.isFile(file)) return;
                    if (!helper.isImage(file)) return;

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(file);
                });


                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var r = 1;
                    // if(this.width > width || this.height > height){
                    //     r = Math.min( width / height , this.width / this.height);
                    // }

                    var r = Math.min(width / this.width, height / this.height)
                    var w = this.width * r,
                        h = this.height * r;
                    var ix = (width - w) / 2,
                        iy = (height - h) / 2;

                    canvas[0].getContext('2d').clearRect(0, 0, width, height);

                    //将源图像所有内容都绘制出来
                    canvas[0].getContext('2d').drawImage(this, 0, 0, this.width, this.height, ix, iy, w, h);

                }
            }
        };
    }]);

    app.directive('nrUpload', ['$window', '$parse', function($window, $parse) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            scope: {
                nrUpload: "=",
                nrUploadBg: "="
            },
            template: '<span class="upload-btn" ng-visible="!nrUpload && !nrUploadBg">点击选择上传</span><input type="file" ng-model="nrUpload"><div class="thumb" style="background:url({{nrUpload ? \'\' :nrUploadBg}}) center center / contain no-repeat"><canvas></canvas></div>',
            link: function(scope, element, attrs) {
                // console.log('nrUpload')
                var required = attrs['nrRequired'];
                var canvas = element.find('canvas'),
                    fileinput = element.find('input[type="file"]');

                var width = element.width(),
                    height = element.height();
                //console.log(JSON.stringify(attrs))

                if (required == 1) {
                    fileinput.attr('required', 'required')
                }

                canvas.attr({ width: width, height: height });

                fileinput.bind("change", function(changeEvent) {
                    scope.$apply(function() {
                        scope.nrUpload = changeEvent.target.files[0];
                        render(scope.nrUpload);
                    });
                });

                if (!helper.support) return;

                var reader = new FileReader();


                function render(file) {
                    if (!helper.isFile(file) || !helper.isImage(file)) {
                        clear();
                    } else {
                        reader.onload = onLoadFile;
                        reader.readAsDataURL(file);
                    }

                }

                function clear() {
                    canvas[0].getContext('2d').clearRect(0, 0, width, height);
                }

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {

                    var r = Math.min(width / this.width, height / this.height)
                    var w = this.width * r,
                        h = this.height * r;
                    var ix = (width - w) / 2,
                        iy = (height - h) / 2;
                    canvas[0].getContext('2d').clearRect(0, 0, width, height);
                    canvas[0].getContext('2d').drawImage(this, 0, 0, this.width, this.height, ix, iy, w, h);
                }
            }
        };
    }]);
});
