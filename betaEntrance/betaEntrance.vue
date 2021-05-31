<template>
	<view>
		<!-- login -->
		<view class="login"
					v-if="!isPassed">
			<view class="k-form">
				<view class="k-cells">
					<view class="k-cell ">
						<view class="k-cell__hd">
							<view class="k-label">vCode:</view>
						</view>
						<view class="k-cell__bd">
							<input type="text"
										 v-model.trim="yzm"
										 placeholder="please enter the vCode">
						</view>
					</view>
					<view class="k-cell noLine">
						<view class="k-btn primary"
									@tap="onYzm">confirm</view>
					</view>
				</view>
			</view>
		</view>
		<!-- panel -->
		<view class="k-cm-wrap"
					v-else>
			<view class="k-form" v-show="storageFormShow">
				<view class="k-cells">
					<view class="k-cell ">
						<view class="k-cell__hd">
							<view class="k-label">token:</view>
						</view>
						<view class="k-cell__bd">
							<input type="text"
										 v-model.trim="tokenStr"
										 placeholder="please enter the token">
						</view>
					</view>
					<view class="k-cell noLine">
						<view class="k-btn primary"
									@tap="onSetStorage">set storage</view>
					</view>
				</view>
			</view>
			<!-- grid -->
			<view class="k-form">
				<view class="k-form-tit">
					Quick Entrance
				</view>
				<ul class="grid">
					<li v-for="(item,index) in gridList"
							:key="index"
							@tap="onGrid(item)">
						<i></i>
						<text class="text">{{item.name}}</text>
					</li>
				</ul>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * betaEntrance 
 * # 开发内测入口页，把各个入口集中起来方便测试。
 * 1，简单密码校验。
 * 2，自带简单样式。
 * # 调用方法
 * gridList参数里写入口地址，URL=有值进行路由跳转，method=有值执行本页的方法
 */
export default {
    name: "betaEntrance",
	data () {
		return {
            storageFormShow: false,
			isPassed: false,
			yzm: '',
			tokenStr: '',
			gridList: [], // 
		}
	},
	onLoad () {
        var isPassed =  uni.getStorageSync('isPassed', '1');
        if (isPassed === '1') this.isPassed = true
		this.initGridData()
	},
	methods: {
		onYzm () {
			if (this.yzm === '836679') {
				this.isPassed = true
                uni.setStorageSync('isPassed', '1');
			} else {
				uni.showToast({ title: 'The verification code is incorrect!', icon: 'none' })
			}
		},
		onSetStorage () {
			if (this.tokenStr.length === 32) {
				uni.setStorageSync('accessToken', this.tokenStr)
				uni.showToast({ title: 'change successfully', icon: 'success' })
			} else {
				uni.showToast({ title: 'The token is incorrect!', icon: 'none' })
			}
		},
		initGridData () {
			var token = uni.getStorageSync('accessToken')
			var arr = [
                // {
				// 	name: 'setStorage',
				// 	url: '',
				// 	method: 'showStorageForm',
				// },
				{
					name: '个人通行证的扫码页',
					url: '/pages/selfPersonalPassV2',
					method: '',
				},
			]
			this.gridList = arr
		},
		onGrid (item) {
			if (item.url) {
                uni.navigateTo({ url: item.url})
			} else if (item.method) {
				this[item.method]()
			}

		},
        showStorageForm () {
            this.storageFormShow = !this.storageFormShow
        }
	}
}
</script>

<style lang="scss">
page {
	background: #f3f3f3;
}
</style>
<style lang="scss" scoped>
$w: 130rpx;
$h: 130rpx;
$gap: 10rpx;
.login {
	margin: 10vh auto;
	width: 90vw;
	height: 60vh;
}
.k-btn {
	width: 100%;
	height: 60rpx;
	line-height: 60rpx;
	border-radius: 8rpx;
}
.k-form {
    .k-form-tit {
        padding: 20rpx;
    }
    border-radius: 8rpx;
	margin: 30rpx 30rpx 30rpx;
	// 690 = 4 * x + 4 * 10 => 650 / 4 = 16
    background: #fff;

	.grid {
		display: grid;
		grid-template-columns: $w $w $w $w $w;
		grid-template-rows: $h $h $h $h $h;
		grid-row-gap: $gap;
		grid-column-gap: $gap;
		li {
			i {
				display: block;
				margin: 0 auto;
				width: 80rpx;
				height: 80rpx;
				background: #007aff;
			}
			.text {
				display: block;
                margin-top: 10rpx;
				height: 50rpx;
				line-height: 24rpx;
				text-align: center;
				font-size: 22rpx;
				overflow: hidden;
			}
		}
	}
}
</style>