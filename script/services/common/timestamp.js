define(['app'], function(app) {
    app.config(function($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function($injector) {
                return $injector.get('TimeStampInterceptor');
            }
        ]);
    })

    .factory('TimeStampInterceptor', function() {

        function fix0(v) {
            return (v < 9) ? ('0' + v) : v;
        }

        function conv_time(t) {
            // var d = new Date( Number(t) );
            var d = new Date( t );
            return t ?
                (
                    d.getFullYear() + '-' +
                    fix0(d.getMonth() + 1) + '-' +
                    fix0(d.getDate()) + ' ' +
                    fix0(d.getHours()) + ':' +
                    fix0(d.getMinutes()) + ':' +
                    fix0(d.getSeconds())
                ) : t;
        }

        function conv(d) {

            var piece = angular.isArray(d) ? d[0] : d,
                islist = angular.isArray(d);
            if(!islist) d = [d];
                
            if (piece != undefined) {
                //商户 列表
                if ('companyDesc' in piece) {
                    if (islist) {
                        for (var i in d) {
                            if (d[i].createTime) {
                                d[i].createTime = conv_time(d[i].createTime);
                            }
                            if (d[i].createTime) {
                                d[i].updateTime = conv_time(d[i].updateTime);
                            }
                        }
                    } else {
                        piece.createTime = conv_time(piece.createTime);
                        piece.updateTime = conv_time(piece.updateTime);
                    }
                }

                //用户 列表
                if ('lastLoginIp' in piece) {
                    if (islist) {
                        for (var i in d) {
                            if (d[i].createTime) {
                                d[i].createTime = conv_time(d[i].createTime);
                            }
                        }
                    } else {
                        piece.createTime = conv_time(piece.createTime);
                    }
                }

                //审单规则列表
                if ('sceneDesc' in piece) {
                    if (islist) {
                        for (var i in d) {
                            if (d[i].updateTime) {
                                d[i].updateTime = conv_time(d[i].updateTime);
                            }
                        }
                    } else {
                        piece.updateTime = conv_time(piece.updateTime);
                    }
                }

                //消息 列表
                if ('notify' in piece) {
                    if (islist) {
                        for (var i in d) {
                            if (d[i].updateTime) {
                                d[i].updateTime = conv_time(d[i].updateTime);
                            }
                        }
                    } else {
                        piece.updateTime = conv_time(piece.updateTime);
                    }
                }

                //申报单详情页
                if ('packingTime' in piece) {
                    piece.orderInfo.dealDate = conv_time(piece.orderInfo.dealDate);
                    piece.orderInfo.createTime = conv_time(piece.orderInfo.createTime);
                    //piece.toCustomTime = conv_time(piece.toCustomTime);     //推送海关时间
                    //piece.toWmsTime = conv_time(piece.toWmsTime);            //推送wms时间
                    piece.distributeTime = conv_time(piece.distributeTime);  //分配时间
                    piece.packingTime = conv_time(piece.packingTime);  //装箱时间
                    piece.completeTime = conv_time(piece.completeTime);  //完成时间

                    if (piece.orderPayInfoVo)
                        piece.orderPayInfoVo.payTime = conv_time(piece.orderPayInfoVo.payTime);
                }

                //申报单列表页
                if ('dealDate' in piece) {
                    for (var i in d) {
                        d[i].dealDate = conv_time(d[i].dealDate);
                        d[i].payTime = conv_time(d[i].payTime);
                        d[i].createTime = conv_time(d[i].createTime);
                    }
                }

                //入库单详情页
                if ('orderWarehouseEntryVo' in piece) {
                    piece.orderWarehouseEntryVo.preArrivalDate = conv_time(piece.orderWarehouseEntryVo.preArrivalDate);

                    piece.orderWarehouseEntryVo.createTime = conv_time(piece.orderWarehouseEntryVo.createTime);

                    piece.orderWarehouseEntryVo.payTime = conv_time(piece.orderWarehouseEntryVo.payTime);

                    piece.shelfTime = conv_time(piece.shelfTime);
                    piece.toCustomTime = conv_time(piece.toCustomTime);
                    piece.toWmsTime = conv_time(piece.toWmsTime);

                    if ('orderGoodsList' in piece) {
                        //orderGoodsList
                        var d = piece['orderGoodsList'];
                        for (var i in d) {
                            d[i].productDate = conv_time(d[i].productDate);

                            d[i].expireDate = conv_time(d[i].expireDate);
                        }

                    }
                }

                //入库单列表页
                if ('predictDate' in piece) {
                    for (var i in d) {
                        d[i].createTime = conv_time(d[i].createTime);
                        d[i].predictDate = conv_time(d[i].predictDate);
                    }
                }

                // 备案商品详情
                if ('toWmsTime' in piece) {
                    piece.toCustomTime = conv_time(piece.toCustomTime);
                    piece.toWmsTime = conv_time(piece.toWmsTime);
                    piece.createTime = conv_time(piece.createTime);
                }
            }
        }

        return {
            response: function(resp) {
                if (resp.data) {
                    if (angular.isArray(resp.data.list)) {
                        conv(resp.data.list);
                    } else if (angular.isObject(resp.data.returnVal)) {
                        conv(resp.data.returnVal);
                    }
                }
                return resp;
            }
        };
    })
})
