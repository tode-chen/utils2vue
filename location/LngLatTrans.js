import Vue from 'vue'

//引用高德地图
import AMap from 'vue-amap';
Vue.use(AMap);
AMap.initAMapApiLoader({
    key: '65a649bf81b407e141905bb449dd6271',//刚刚开发者申请哪里的key
    plugin: ['AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType','AMap.Geocoder','AMap.Geolocation']
});

//引用百度地图
/* import {BMap,BmScale, BmGeolocation} from 'vue-baidu-map'
Vue.use(BMap, {
  ak: 'R3ryLDazFlGr5UBAxhdHfn82'    //这个地方是官方提供的ak密钥
}) */


export default{
  //计算  将腾讯/高德地图经纬度转换为百度地图经纬度  更精准
    qqMapTransBMaparray(point,callback){
      var resultpoint = [];
      for(var i = 0 ; i < point.length ; i++ ){
        resultpoint.push(this.qqMapTransBMap(point[i][0],point[i][1]))
      }
      callback(resultpoint)
    },
    qqMapTransBMap(lng, lat) {
      let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
      let x = lng;
      let y = lat;
      let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
      let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
      let lngs = z * Math.cos(theta) + 0.0065;
      let lats = z * Math.sin(theta) + 0.006;

      return {
        lng: lngs.toFixed(6),
        lat: lats.toFixed(6)
      }
    },
    // 计算 将百度地图经纬度转换为腾讯/高德地图经纬度 更精准
    bMapTransQQMaparray(point,callback){
      var resultpoint = [];
      for(var i = 0 ; i < point.length ; i++ ){
        resultpoint.push(this.bMapTransQQMap(point[i][0],point[i][1]))
      }
      callback(resultpoint)
    },
    bMapTransQQMap(lng, lat) {
      let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
      let x = lng - 0.0065;
      let y = lat - 0.006;
      let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
      let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
      let lngs = z * Math.cos(theta);
      let lats = z * Math.sin(theta);

      return {
        lng: lngs.toFixed(6),
        lat: lats.toFixed(6)
      }
    },

    //转到高德地图
    transGmap(point, fromtype, callback) {
      console.log(point,'point')
      //fromtype 可选值有gps:GPS原始坐标；baidu：百度经纬度；mapbar：图吧经纬度；
      window.AMap.convertFrom(point, fromtype, function(status, res) {
        console.log(res,status,'高德res')
        if(res.info=='ok'){
          callback(res.locations)
        }else{
          callback(res);
        }
      })
    },
    //转到百度地图
    transBaidu(point, fromtype, callback) {
      var ftype = '';
      if (fromtype == 'gps' || fromtype == 'WGS84') {
        ftype = 1
      } else if (fromtype == 'sogou') {
        ftype = 2
      } else if (fromtype == 'google' || fromtype == 'soso' || fromtype == 'aliyun' || fromtype == 'mapabc' || fromtype ==
        'gaode' || fromtype == 'amap' || fromtype == 'GCJ0') {
        ftype = 3
      } else if (fromtype == 'mapbar') {
        ftype = 7
      } else if (fromtype == '51') {
        ftype = 8
      }

      console.log(BMap.Convertor,BMap.components,window.BMap,BMap,point,ftype,'BMap.Convertor')
      BMap.Convertor.translate(point, ftype, 5, function(data) {
        console.log(data, '222');
        callback(data.points)
      })
    },










    pointTrans(point, fromtype, totype, callback,type) {
      //point是要转换的点,格式为[{lng,lat}],fromtype 是转换来源坐标类型,totype是要转换到的坐标类型,callback回调,
      //type为api时,使用地图方法,为其它值时使用接口调用方法,其中type为使用的接口方法,type不传时,使用计算的方法.
      var that = this;
      var result = [];
      if(fromtype!='baidu'){
        if(!type){
          type = true;
        }
      }
      if (totype == 'gaode') {
        //转高德地图
        if(type=='api'){
          //api转换
          that.transGmap(point,fromtype,function(data){
            callback(data)
          })
        }else if(type){
          //调用接口转换
          var location = '';
          for(let i = 0 ; i < point.length ; i ++){
          	if(i==point.length-1){
          		location+=point[i][0]+','+point[i][1]
          	}else{
          		location+=point[i][0]+','+point[i][1]+'|'
          	}
          }
          console.log(location,'location')
          var baseurl = 'https://restapi.amap.com/v3/assistant/coordinate/convert?key=048d038c42d130ec4875d2ee47bbd619'+'&locations='+location+'&output=JSON'
          type.get(baseurl).then(function(response){
            if(response.data.status==1){
              console.log('请求成功',response)
              var resultloc = response.data.locations;
              var resultarr = resultloc.split('|');
              for(var i = 0 ; i < resultarr.length ; i++ ){
                resultarr[i] = resultarr[i].split(',')
              }
              callback(resultarr)
            }else{
              console.log('请求失败,错误代码:',response.data.infocode,'原因:',response.data.info)
              callback(response)
            }
          }).catch(error=>{
            console.log('请求失败',error)
            callback(error)
          })
        }else{
          //计算
          that.bMapTransQQMaparray(point,function(data){
            callback(data)
          })
        }
      } else if (totype == 'baidu') {
        if(fromtype!='gaode'){
          if(!type){
            type = true;
          }
        }
        //转为百度地图
        /* if(){
          //api转换
          BMap.init().then((BMap)=>{
              console.log(BMap)
              console.log("加载成功...")
          })
          that.transBaidu(point,fromtype,function(data){
            callback(data)
          }) */
          if(type){
          //调用接口转换
          var ftype = '';
          if (fromtype == 'gps' || fromtype == 'WGS84') {
            ftype = 1
          } else if (fromtype == 'sogou') {
            ftype = 2
          } else if (fromtype == 'google' || fromtype == 'soso' || fromtype == 'aliyun' || fromtype == 'mapabc' || fromtype ==
            'gaode' || fromtype == 'amap' || fromtype == 'GCJ0') {
            ftype = 3
          } else if (fromtype == 'mapbar') {
            ftype = 7
          } else if (fromtype == '51') {
            ftype = 8
          }
          var location = '';
          for(let i = 0 ; i < point.length ; i ++){
          	if(i==point.length-1){
          		location+=point[i][0]+','+point[i][1]
          	}else{
          		location+=point[i][0]+','+point[i][1]+';'
          	}
          }
          var baseurl = 'http://api.map.baidu.com/geoconv/v1/?coords='+location+'&ak=R3ryLDazFlGr5UBAxhdHfn82&from='+ftype+'&to=5';
          type.get(baseurl).then(function(response){
            if(response.data.status==0){
              response.data.result.forEach((item)=>{
                item.x = item.x.toFixed(6)
                item.y = item.y.toFixed(6)
                return item
              })
              callback(response.data.result)
            }
          }).catch(error=>{
            console.log('请求失败',error)
            callback(error)
          })
        }else{
          //计算
          that.qqMapTransBMaparray(point,function(data){
            callback(data)
          })
        }
      }
    },

  /* mapPlugin(window,ajax,type,point,callback){
  	var baseurl = '',
    location = '',
    params='';
  	if(type == 0){
  		if(point.length>1){
  			for(let i = 0 ; i < point.length ; i ++){
  				if(i==point.length-1){
  					location+=point[i].lng+point[i].lat
  				}else{
  					location+=point[i].lng+point[i].lat+'|'
  				}
  			}
  		}

  	}else{
      if(point.length>1){
      	for(let i = 0 ; i < point.length ; i ++){
      		if(i==point.length-1){
      			location+=point[i].lng+point[i].lat
      		}else{
      			location+=point[i].lng+point[i].lat+'|'
      		}
      	}
      }
  	}
    var mapApi={
      baiduToAmap:function(){
        ajax.get(baseurl).then(function(response){
          console.log('请求成功',response)
        }).catch(error=>{
          console.log('请求失败',error)
        })
        ajax({
          ulr:baseurl,
          method: 'get'
        }).then(
        resolve => {
          console.log('res',resolve.data)
          callback(res)
        },
        reject => {
          console.log('请求失败',reject)
        }
        )
      }
    };
    console.log(baseurl,params,'555')
    window.mapApi=mapApi
    mapApi.baiduToAmap();
  } */
}
