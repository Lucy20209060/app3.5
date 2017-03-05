define(['app'], function(app) {

    app.factory('GoodsRecordService', ['$q', 'oms', 'Upload', function($q, oms, uploader) {

        return {

            'get': function(id) {
                return oms.get('goodsRecord/query/' + id).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    console.error('Error while fetching record');
                    return $q.reject(errResponse);
                });
            },

            'list': function(paras) {
                return oms.get('goodsRecord/query/page', paras).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            'update': function(data, isCreate) {

                //https://angular-file-upload-cors-srv.appspot.com/upload
                //data = {id : 2};

                var url = isCreate ?
                    'goodsRecord/create' :
                    'goodsRecord/update';
                return oms.upload(url, data);
            },
            //备案商品推送海关
            'toCustom' : function(id){
                return oms.post('goodsRecord/updateToCustom',{id:id}).then(function(resp){
                    return resp.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                })
            },

            //更新备案商品
            'updateGoods' : function(productId){
                return oms.post('goodsRecord/updateNBGoodsFromCustom',{productIds:productId}).then(function(resp){
                    return resp.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                })
            },


            //备案商品推送国际物流
            'toInternational' : function(id){
                return oms.post('goodsRecord/createNBGoodsToCustom',{ids:id}).then(function(resp){
                    return resp.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                })
            },

            //hs编码预查询
            'suggestHS' : function(key,customCode){
                return oms.get('goodsHsInfo/query/listAll',{code:key , customCode:customCode}).then(function(resp){
                    return resp.data;
                })
            },
            //国家（原产地）预查询
            'suggestCountry' : function(key,customCode){
                return oms.get('countryInfo/queryAll',{name:key,customCode:customCode}).then(function(resp){
                    return resp.data;
                })
            },
            //单位预查询
            'suggestUnit' : function(key,customCode){
                return oms.get('customsBaseParam/query/unitInfo',{name:key,customCode:customCode}).then(function(resp){
                    return resp.data;
                })
            },
            //商品种类预查询
            'suggestGoodsType' : function(key,customCode){
                return oms.get('customsBaseParam/query/goodsCategoriesByName',{name:key,customCode:customCode}).then(function(resp){
                    return resp.data;
                })
            },
            //税则号预查询
            'suggestTariffNo' : function(key,customCode){
                return oms.get('/tariffInfo/query/listAll',{name:key,customCode:customCode}).then(function(resp){
                    return resp.data;
                })
            },
            //查询商品条码是否已存在
            'Querybarcodes' : function(key,customCode){
                return oms.get('goodsRecord/queryIfSkuCodeExist',{dsSkuCode:key , customCode:customCode}).then(function(resp){
                    return resp.data;
                })
            },

            'verify': function(obj, file) {

                var url = 'goodsImport/importXlsVerify';

                return oms.upload(url + '?' + oms.serialize(obj), { 'file': file }).then(function(resp) {
                    return resp.data;
                }, function(resp) {
                    return resp;
                    console.log('Error status: ' + resp.status);
                }, function(evt) {
                    var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    return progress;
                });
            },
            'import': function(obj , file) {
                var url = 'goodsImport/importXls';

                return oms.upload(url + '?' + oms.serialize(obj), { 'file': file }).then(function(resp) {
                    return resp.data;
                }, function(resp) {
                    return resp;
                    console.log('Error status: ' + resp.status);
                }, function(evt) {
                    var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    return progress;
                });
            }
        }
    }]);
})
