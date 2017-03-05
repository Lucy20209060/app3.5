define(['app'], function(app) {
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/custom-fields.html',
            '<div class="modal fade in modal-custom-fields" style="display:block;"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><h4 class="modal-title">自定义字段</h4></div><div class="modal-body"><p>请选择您想要在表单中显示的字段信息</p><div class="row"><label class="col-sm-4" ng-repeat="row in data.fields"><input type="checkbox" class="minimal-green hide" ng-model="row.display"> <i class="fa"></i> <span ng-bind="row.value"></span></label></div></div><div class="modal-footer text-center"><button class="btn btn-primary pull-center" ng-click="close(true)">确定</button> <button class="btn btn-default pull-center" ng-click="close(false)">取消</button></div></div></div></div>');
    }]);

    app.directive('customFields', ['$timeout', '$parse','ModalService', function($timeout, $parse , ModalService) {
        return {
            restrict: 'A',
            link: function(scope, element, attr, ctrl) {

                var event = 'click';
                
                element.bind(event, function(evt) {
                    var getter = $parse(attr.customFields);
                    var fields = angular.copy(getter(scope)); 
                    var setter = getter.assign;
   
                    ModalService.open( {
                        fields:fields,
                        template:'template/common/custom-fields.html'
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            if(result){
                                setter(scope , fields);
                            }
                        })
                    }); 
                });
            }
        };
    }]);
})
