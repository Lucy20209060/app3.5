define(['app'], function(app) {

    //驼峰转蛇形
    app.filter("i18n", function() {
        return function(input) {
            return input ? input.replace(/([A-Z])/g, function(m) {
                return '_' + m.toLowerCase();
            }) : '';
        }
    });
});