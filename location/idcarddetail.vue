<template>
  <div>
    <idcardInput @idmess="idbase" ></idcardInput>
    <div>
      <p><span>出生年月:</span><span>{{idmess.birthday}}</span></p>
      <p><span>年龄:</span><span>{{idmess.age}}</span></p>
      <p><span>性别:</span><span>{{idmess.sex}}</span></p>
    </div>

    <inputSelect :selectarr="selectarr" :taptitle="taptitle" :choose="true" :min="1" :max="5" @change="change"></inputSelect>

    <tableSelect :tableData="tableData" :tabletitle="tabletitle" :choose="true" :keyname="true" :min="1" :max="5" @change="change"></tableSelect>

    <div>
      <span>{{tablereturn.indexarr}}</span>
      <p>{{tablereturn.namearr}}</p>
    </div>
    <!--showSearch:是否需要搜索导航 showway:是否需要展示导航文字 toolBar:是否需要工具栏 mapType:是否需要多种地图类型 overView:鹰眼 searchBtn:周边服务-->
    <!-- <AmapLocation :showSearch="true" :showway="true" :toolBar="true" :mapType="true" :overView="true" :searchBtn="searchBtn"></AmapLocation> -->
    <!-- 百度地图 needtransit是否需要导航，transit为公交导航 driving为开车导航 walking为步行导航 searchBtn是否需要周边服务-->
    <BmapLocation :needtransit="'walking'" :searchBtn="baiduBtn"></BmapLocation>
  </div>
</template>

<script>
  import idcardInput from '@/components/idcard'
  import inputSelect from '@/components/inputSelect'
  import tableSelect from '@/components/tableSelect'
  import AmapLocation from '@/components/AmapLocation'
  import BmapLocation from '@/components/BmapLocation'
  import mapPlugin from '@/lib/LngLatTrans.js'
  import {lazyAMapApiLoaderInstance} from 'vue-amap'
  import Vue from 'vue'
  import axios from 'axios'
  Vue.prototype.$http = axios
  export default{
    components:{
      idcardInput,
      inputSelect,
      tableSelect,
      AmapLocation,
      BmapLocation
    },
    data(){
      return{
         idmess:{},
         selectarr:[],
         taptitle:['名1','名2','名3','名4'],
         tableData: [{
           date: '2016-05-03',
           name: '王小虎',
           address: '上海市普陀区金沙江路 1518 弄',
           remark:'备注',
           notchoose:true,
           index:0
         }, {
           date: '2016-05-02',
           name: '王小虎',
           address: '上海市普陀区金沙江路 1518 弄',
           remark:'备注',
           index:1
         }, {
           date: '2016-05-04',
           name: '王小虎',
           address: '上海市普陀区金沙江路 1518 弄',
           remark:'备注',
           index:2
         }],
         tabletitle:[{
           name:'时间',
           prop:'date',
           width:120
         },{
           name:'姓名',
           prop:'name',
           width:65
         },{
           name:'地址',
           prop:'address',
           width:''
         },{
           name:'备注',
           prop:'remark',
           width:''
         }],
         hadchoose:'',
         hadtable:'',
         hadindex:[],
         tablereturn:{},
         point:[[
           '114.93590908',
           '25.84529554'
        ],[
          '113.175209',
          '24.455343'
        ],[
          '114.975209',
          '23.175343'
        ]],
        searchBtn:['美食','KTV','地铁站','公交站'],
        baiduBtn:['美食','酒店','购物','生活服务','丽人','旅游景点','休闲娱乐']
      }
    },
    methods:{
      idbase(data){
        this.idmess = data;
      },
      idnum(data){
        this.idnum = data;
      },
      change(data){
        console.log(data,'555')
        this.tablereturn = data;
      },
      location(data){
        console.log('当前地址:'+data)
      },
      clocalname(data){
        console.log('当前位置中文信息：'+data)
        this.cpointname = data;
      }
    },
    mounted() {
      var that = this;
      for(var i = 0 ; i < 30 ; i ++ ){
        this.selectarr.push({
          id:i,
          name:'名字'+i,
          showarr:['num'+i,'second'+i,'third'+i,'fouth'+i],
          index:i
        })
      }


      //高德地图经纬度转百度地图经纬度  接口方式，计算方式结果一致。
      /* mapPlugin.pointTrans(this.point,'gaode','baidu',function(data){
        console.log('高德=》百度，接口方式',data)
      },axios)

      mapPlugin.pointTrans(this.point,'gaode','baidu',function(data){
        console.log('高德=》百度，计算方式',data)
      })
      mapPlugin.pointTrans(this.point,'gaode','baidu',function(data){
        console.log('高德=》百度，API方式',data)
      },'api')*/

      //百度地图经纬度转高德地图经纬度  使用api，高德地图计算方式和api方式计算结果一样，接口方式有些偏差。
      /* lazyAMapApiLoaderInstance.load().then(() => {
        //baidu=>gaode   gps=>gaode   mapbar=>gaode
         mapPlugin.pointTrans(this.point,'baidu','gaode',function(data){
           console.log('百度=》高德，API方式',data)
         },'api')
      });
      mapPlugin.pointTrans(this.point,'baidu','gaode',function(data){
        console.log('百度=》高德，接口方式',data)
      },axios)*/
      /* mapPlugin.pointTrans(this.point,'gps','baidu',function(data){
        console.log('百度=》GPS，计算方式',data)
      },axios) */

    }
  }
</script>

<style>

</style>
