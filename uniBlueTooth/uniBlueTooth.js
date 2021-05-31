//兼容微信小程序 支付宝小程序 app
export default{
	//检测当前设备是否有蓝牙模块,type值:0优惠券,1景区,
	//way,根据什么来排商家优先级,1:表示设备距离的枚举值,2:iBeacon 设备的距离,3:表示设备的信号强度,其它都按照商家数量+蓝牙信号进行排列.
	openBluetooth(type,callback,way){
		var that  = this;
		uni.getSystemInfo({
			success:function(res){
				console.log('step1 res',res)
				let bluetooth = res.bluetoothEnabled;
				// #ifndef MP-ALIPAY
				if(bluetooth){
				// #endif
					that.openBluetoothAdapter(type,function(data){
						callback(data)
					},way);
				// #ifndef MP-ALIPAY
				}else{
					uni.showToast({
						title:'当前手机蓝牙功能不可用!',
						icon: 'none'
					})
					callback(false);
				}
				// #endif
			}
		})
	},
	
	
	//初始化蓝牙模块
	openBluetoothAdapter(type,callback,way){
		var that = this;
		uni.openBluetoothAdapter({
			success(res) {
				console.log("初始化蓝牙模块")
				if(res.errCode==10001){
					uni.showToast({
						title:'请检查手机蓝牙是否打开，如您已开启蓝牙，请确认是否打开微信蓝牙授权',
						icon: 'none'
					})
					callback(false);
				}else if(res.errMsg=='openBluetoothAdapter:ok'||res.isSupportBLE){
					that.bluetooth = false;
					that.searchbluetooth(type,function(data){
						callback(data)
					},way);
				}
			}
		})
	},
	
	//监听ibeacon服务状态改变事件
	changeIbeacon(){
		uni.onBeaconServiceChange({
			success(res){
				//console.log('ibeacon改变监听',res)
			}
		})
	},
	
	
	//监听 iBeacon 设备更新事件
	checkIbeacon(type,callback,way){
		let that=this;
		// 苹果需要使用这里的
		uni.onBeaconUpdate({
			success(res){
				//console.log('ibeacon更新监听',res)
				that.getlistIbeacon(type,function(data){
					callback(data)
				},way);
			}
		})
	},
	
	
	
	
	//开始搜索ibaecon
	searchbluetooth(type,callback,way){
		var that = this;
		uni.startBeaconDiscovery({
			uuids:['B9407F30-F5F8-466E-AFF9-25556B57FE6D'],
			success(res){
				console.log('获取ibeacon列表',res)
				setTimeout(function(){
					that.getlistIbeacon(type,function(data){
						callback(data)
					},way);
				},500)
			},
			fail(res){
				that.checkIbeacon(type,callback,way);
				console.log('获取ibeacon列表失败',res)
				if(res.errCode==11003){
					setTimeout(function(){
						that.getlistIbeacon(type,function(data){
							callback(data)
						},way);
					},2000)
				}else{
					callback(false)
				}
			}
		})
	},
	
	
	//获取已搜索的 iBeacon 列表
	getlistIbeacon(type,callback,way){
		var that = this;
		uni.getBeacons({
			success(res){
				console.log('获取ibeacon列表2',res)
				if(res.beacons.length){
					/* 智能筛选 */
					console.log('获取到的所有蓝牙信息',res.beacons.length)
					var array=res.beacons;
					var array1 = array,array2 = [];
					var a=0;
					
					//优先级按照商家数量+蓝牙信号进行排列
					for(var j=0;j<array.length;j++) {
						for (var k = 0; k < array1.length; k++) {
							if (array[j].minor == array1[k].minor) {
								a++;
							}
						 }
						//console.log('a',array2[j],a)
						array2[j]=a;
						a=0;
					}
					//console.log('排列顺序优先级',array2)
					var major = '';
					if(type==0){
						//匹配优惠券
						major = '11'; 
					}else if(type==1){
						//匹配景区
						major = '12';
					}
					//console.log('当前搜索蓝牙类型',major)
					//遍历蓝牙,匹配类型对上,同一家商家蓝牙最多的那一条数据,数量相同时,取排位靠前的数据.
					var maxnum = 0,hadnum = false;
					var hadthetype = false;
					for(var i = 0 ; i < array2.length ; i ++ ){
						var nowmajor = array[i].major.toString();
						nowmajor = nowmajor.substr(0,2);
						//console.log('数组判断返回',array2[maxnum],array2[i],array[i].major,nowmajor,major)
						if(nowmajor==major){
							hadthetype = true
							//优先取第一条满足条件的值
							if(hadnum){
								//当都满足条件,取优先级更高的数
								if(array2[maxnum]<array2[i]){
									maxnum = i;
								}
							}else{
								//遍历走到当前还未有满足全部条件的值,默认取第一个满足全部条件的
								if(array2[maxnum]<=array2[i]){
									maxnum = i;
									hadnum = true;
								}
							}
						}
					}
					if(!hadnum){
						//未识别到对应类型的蓝牙
						if(type==0){
							uni.showToast({
								title:'附近未匹配到优惠券蓝牙信号!',
								icon: 'none'
							})
						}else if(type==1){
							uni.showToast({
								title:'附近未匹配到景区蓝牙信号!',
								icon: 'none'
							})
						}
						callback(false)
					}else{
						//console.log('回调总优先级最高的蓝牙',array[maxnum])
						callback(array[maxnum])
					}
					that.stopIbeacon()
				}else{
					callback(false)
					uni.showToast({
						title:'附近未匹配到对应的蓝牙信号!',
						icon: 'none'
					})
					that.stopIbeacon()
				}
			},
			fail(res){
				//console.log('获取ibeacon列表失败',res)
			}
		})
	},
	
	
	//停止搜索ibaecon
	stopIbeacon(){
		uni.stopBeaconDiscovery({
			success(res){
				console.log('停止搜索ibeacon列表',res)
			},
			fail(res){
				//console.log('停止搜索ibeacon列表失败',res)
			}
		})
	}

}