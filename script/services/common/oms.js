define(['app'], function(app) {

    app.factory('oms', ['$http', '$q', 'Upload', '$state', 'ngNotify', 'ModalService', function($http, $q, Uploader, $state, ngNotify, ModalService) {

        var base = 'http://192.168.1.19:8080/nroms/',
            base_img = '';
        //var base = 'http://192.168.1.4:9080/nroms-web/';
        var URL = {
            'dev-Yang.YK': ['http://192.168.1.90',':8080/nroms/','http://121.196.224.76:8080/nrtms/'],

            'dev-Hu.JW': ['http://192.168.1.58',':8280/nroms/',':8180/nrtms/'],

            'dev-Zhang.RF': ['http://192.168.1.49',':8888/nroms-web/',':8888/nrtms/'],

            'dev-Cao.MW': ['http://192.168.1.6',':9080/nroms/',':9080/nrtms/'],

            'dev-Zhang.PJ': ['http://192.168.1.63',':8080/nroms/',':8080/nrtms/'],

            'dev-Du.DC': ['http://192.168.1.4',':8080/nroms-web/',':8080/nrtms/'],

            'pub': ['http://121.196.224.76',':9022/nroms/',':8484/nrtms/'],

            // 'prod': ['http://114.55.149.118',':8282/nroms/',':8686/nrtms/']
            'prod': ['http://112.124.4.186',':8282/nroms/','http://114.55.149.118:8686/nrtms/']
        }

        var env = (
            location.search.match(/env=([^&]+)/) || ['', window.sessionStorage['env'] || '']
        )[1];

        if (!URL[env]) env = 'dev-Yang.YK';

        if (location.hostname == '121.196.224.76') {
            env = 'pub';
        }

        if (location.hostname == '114.55.149.118') {
            env = 'prod';
        }

        window.sessionStorage['env'] = env;

        base = URL[env][0];

        base_res = base + ':8383/';

        var options = { loadingLatency: 100 };

        var store = {};

        var cache = {};
        
        function setRealPath(data, fields) {
            fields = fields || key(data);
            for (var i = fields.length, v; i--;) {
                v = fields[i];
                if (data[v]) {
                    data[v] = base_res + data[v];
                }
            }
        }

        // 将键收集为数组
        function key(obj) {
            var ret = [];
            for (var i in obj) {
                ret.push(i);
            }
            return ret;
        }

        //将值收集为数组, 如果 obj 是数组对象时，则从改对象中 取出 field 字段并组成新数组
        function coll(obj, field) {
            var arr = [];
            for (var i in obj) {
                if (obj[i]) arr.push(field ? obj[i][field] : obj[i]);
            }
            return arr;
        }

        // [{key:,value:}] -> raw ? obj[key] = value : obj[key] = obj[i];
        function hash(data, key, value) {
            var obj = {};
            key = key || 'key';
            for (var i in data) {
                if (data[i][key])
                    obj[data[i][key]] = value ? data[i][value] : data[i];
            }
            return obj;
        }


        function select(src, field, value) {
            var arr = [];
            for (var i in src) {
                if (src[i][field] == value) {
                    arr.push(src[i]);
                }
            }
            return arr;
        }

        /**
         * 过滤对象
         * @param  {[object]} obj [对象]
         * @param  {[object]} m   [过滤条件]
         * @return {[array]}     []
         */
        function filter(obj, m) {
            var ret = [];
            for (var i in obj) {
                var r = true;
                for (var j in m) {
                    if (obj[i][j] != m[j]) {
                        r = false;
                        break;
                    }
                }
                if (r) {
                    ret.push(obj[i])
                };
            }
            return ret;
        }

        // 从 src 中遴选出 dist 所需的字段
        function pick(src_t, dist, exclude) {
            var ret = [];
            var isarr = angular.isArray(src_t);
            var dis = {};
            if( angular.isArray(exclude) ){
                for(var i in exclude) {
                    dis[exclude[i]] = true;
                }
            }
            //if(angular.isArray(src)){
            var src = !isarr ? [src_t] : src_t;

            for (var j = 0, l = src.length; j < l; j++) {
                var obj = {};
                for (var i in dist) {
                    if(!(i in dis))
                        obj[i] = src[j][i] === null ? dist[i] : src[j][i];

                }
                ret.push(obj);
            }

            return isarr ? ret : ret[0];
        }

        /**
         * 将数组转换为 树
         * @return {[type]} [description]
         */
        function tree(data, id, parentId, children) {
            var obj = {},
                root = [];
            var field_id = id || 'id',
                parentId = parentId || 'parentId',
                children = children || 'children';

            for (var i in data) {
                obj[data[i][field_id]] = data[i];
                if (children in data[i]) {
                    delete data[i][children]
                }
            }

            for (var i in data) {
                var pid = data[i][parentId],
                    id = data[i][field_id];
                if (pid == 0) {
                    root.push(data[i]);
                } else {
                    if (obj[pid]) {
                        if (!obj[pid][children]) {
                            obj[pid][children] = [];
                        }
                        obj[pid][children].push(data[i]);
                    }
                }
            }
            return root;
        }

        //格式化提交数据
        function dig(obj) {
            var ret = {};
            for (var i in obj) {
                var key = i,
                    value = obj[i];
                // 数组 转 List<>
                if (angular.isArray(value)) {
                    for (var j = 0, l = value.length; j < l; j++) {
                        if (angular.isObject(value[j])) {
                            for (var k in value[j]) {
                                ret[key + '[' + j + '].' + k] = value[j][k];
                            }
                        } else {
                            ret[key + '[' + j + ']'] = value[j];
                        }
                    }
                }
                // 对象 转 object
                else if (angular.isObject(value) || key == 'user') {
                    for (var k in value) {
                        ret[key + '.' + k] = value[k];
                    }
                } else {
                    ret[key] = value;
                }

            }
            return ret;
        }

        function url_(url, paras) {
            var tempBase = base;
            if (/\:\/\//.test(url)) {
                return url.replace(/local\:\/\/([\w\W]+)/g,'/data/$1.json');
            }
            else {
                if (angular.isObject(paras)) {
                    url += '?' + serialize(paras);
                }
                var p = url.split(':') , fix = URL[env][1];
                if(p.length == 2){
                    if(p[0] == 'tms'){
                        fix = URL[env][2];
                        url = p[1];
                        tempBase = "";
                    }    
                }
                // 'prod': ['http://112.124.4.186',':8282/nroms/','http://114.55.149.118:8686/nrtms/']
                return tempBase + fix + url;
            }

        }

        function get_(url, data) {
            return $http.get(
                url_(url) + '?' +
                (angular.isString(data) ? data : serialize(data))
            );
        }

        function post(url, data, conv) {
            return http('POST', url, data, conv);
        }

        function put(url, data) {
            return http('PUT', url, data);
        }

        function http(type, url, data, conv) {
            conv = !!conv;
            var req = {
                method: type,
                url: url_(url)
            }
            req.data = conv ? data : serialize(data);
            if (!conv) req.headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };

            return $http(req);
        }

        function upload(url, data) {
            return Uploader.upload({
                url: url_(url),
                data: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        }

        //TODO input[type=file] 需要处理
        function serialize(obj) {
            var arr = [];
            for (var i in obj) {
                arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]))
            }
            return arr.join('&');
        }


        function config(v, raw) {
            var args = Array.prototype.slice.call(arguments);

            var raw = false;
            if (args[args.length - 1] === true || args[args.length - 1] === false) {
                raw = args[args.length - 1];
                //删除末尾
                args.splice(-1, 1);
            }

            var conv = function(data) {
                var objs = [];
                for (var i in data) {
                    var obj = { 'key': data[i].code, 'value': data[i].name }
                    if (raw) obj['raw'] = data[i];
                    objs.push(obj);
                }
                return objs;
            }

            var config_urls = {
                area: 'customArea/queryAllAreaList',
                customs: 'chinaCustom/queryCustomList',
                menu: 'menu/query',
                role: 'role/queryAll',
                persissions: 'menu/queryAll',
                atom: 'permission/queryAll',
                warehouse: 'warehouseInfo/queryAll',
                area_info: 'tms:preferredLogisticsConfig/queryAreaInfo',
                areas: 'cityInfo/queryAreaTree'
            }

            function query(url) {
                var deferred = $q.defer();

                if(cache[url]){
                    deferred.resolve(cache[url]);
                }else{
                    get_(url).then(function(d) {
                        cache[url] = d.data;
                        deferred.resolve(d.data);
                    });
                }

                return deferred.promise;
            }

            var act = args;
            var q = [];

            for (var i = 0; i < act.length; i++) {
                var u = config_urls[act[i]] || act[i];
                q.push(query(u));
            }

            return $q.all(q).then(function(d) {
                for (var i = d.length - 1; i >= 0; i--) {
                    if (act[i] == 'area' || act[i] == 'customs') {
                        d[i] = conv(d[i].returnVal)
                    }
                }
                return d.length == 1 ? d[0] : d;
            });

        }

        function notify(v, type) {
            var status = {
                '1001': '请登录'
            }
            if (angular.isObject(v)) {
                if (v.returnCode && status[v.returnCode]) {
                    ngNotify.set(status[v.returnCode], 'error');
                }
            } else {
                ngNotify.set(v, type);
            }
        }

        function alert_(v, callback) {
            ModalService.open({
                alert: true,
                content: v
            }).then(function(modal) {
                modal.close.then(function(result) {
                    callback && callback();
                })
            });
        }

        return {
            'env': function(v) {
                if (v === undefined) return URL;
                else {
                    if (v === 0) {
                        return env;
                    }
                    if (URL[v]) {
                        window.sessionStorage['env'] = env = v;

                        base = URL[env][0];

                        base_res = URL[env][0] + ':8383/';

                        $state.reload();
                    }
                }
            },

            'reload': function() {
                $state.reload();
            },

            'serialize': serialize,

            'options': options,

            'config': config,

            'hash': hash,
            'key': key,
            'pick': pick,
            'coll': coll,
            'dig': dig,
            'filter': filter,

            'select': select,
            'tree': tree,

            'upload': upload,
            'get': get_,
            'post': post,
            'put': put,

            'url': url_,

            'store': store,
            'notify': notify,
            'alert': alert_,

            'path': setRealPath
        }
    }]);

})
