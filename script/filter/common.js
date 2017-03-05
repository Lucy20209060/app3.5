define(['app'], function(app) {

    //驼峰转蛇形
    app.filter("snake", function() {
        return function(input) {
            return input ? input.replace(/([A-Z])/g, function(m) {
                return '_' + m.toLowerCase();
            }) : '';
        }
    });

    //统计字段数量
    app.filter("count", function() {
        return function(obj, m) {

            var c = 0;
            for (var i in obj) {
                var r = true;
                for (var j in m) {
                    if (obj[i][j] != m[j]) r = false;
                }
                if (r) c++;

            }
            return c;
        }
    });

    //add
    app.filter("add", function() {
        return function(input , v) {
            return input + v;
        }
    });

    //从url中猜测文件名
    app.filter("filename", function() {
        return function(input) {
            if(input){
                var r = input.split('/');
                return r[r.length-1];
            }else{
                return '';
            }
            
        }
    });

    //将权限从tree 转换成 数组，obj => array
    app.filter("flat", function() {
        var arr = [];

        var lo = function(v, tail) {
            var tail = tail || [];
            //if(!label) label = [];
            for (var i in v) {
                v[i].tail = tail.concat(v[i].name);
                arr.push(v[i]);

                if (v[i].children && v[i].children.length) {
                    arr.concat(lo(v[i].children, v[i].tail))
                }
                //console.log('dot',arr)
            }
            return arr;
        }

        return function(obj) {
            arr = [];
            return lo(obj);
        }
    });
});
