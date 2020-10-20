<template>
	<view id="EDemoPage">
		<div class="containter">
			<button @tap="initializeD">数据1</button>
			<button @tap="initializeD_2">数据2</button>
			<button @tap="onSavePoster">保存海报</button>
			<button @tap="onPreviewPoster">预览海报</button>
			<button @tap="onGetPath">合成海报并获取地址</button>
			<image class="image"
						 :src="posterTemp"
						 alt="" />
		</div>
		<k-canvas ref="k_Canvas"
							@change="canvasChange"
							:canvasId="'uCanvas'"
							width="650"
							height="876"
							:defaultSet="canvasDefaultSet"
							:canvasItems="canvasArr"></k-canvas>
	</view>
</template>

<script>
import kCanvas from '@/components/k-canvas/k-canvas'
export default {
	components: {
		kCanvas
	},
	data () {
		return {
			canvasArr: [],
			canvasDefaultSet: {},
			posterTemp: ''
		}
	},
	mounted () {
		let that = this
		this.initializeD()
		// setTimeout(() => {
		//     that.$refs.k_Canvas.canvasHandle()
		// }, 500);
		uni.openSetting({
			success (settingdata) {
				if (settingdata.authSetting['scope.writePhotosAlbum']) {
					console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
				} else {
					console.log('获取权限失败，给出不给权限就无法正常使用的提示')
				}
			}
		})
	},
	methods: {
		initializeD () {
			this.canvasDefaultSet = {
				backgroundColor: "#fff",
				font: '28px "微软雅黑"',
				fillStyle: '#fff',
				textBaseline: 'top',
				globalAlpha: 1
			}
			this.canvasArr = [
				// {
				// 	type: 'img',
				// 	drawSet: [0, 0, 650, 876],
				// 	path: 'https://www.krtimg.com/group1/M00/01/A9/rAA0KV3qOTmAas4sAAYoD3r5xug867.png'
				// },
				{
					type: 'img',
					drawSet: [470, 700, 150, 150],
					path: 'https://www.krtimg.com/group1/M00/02/97/rAA0KV8rdDWAf2eWAAF1oYZoYE8374.png'
				},
				{
					type: 'img',
					drawSet: [20, 820, 30, 25,],
					path: 'https://www.krtimg.com/group1/M00/02/97/rAA0KV8rfT-AVPw3AAAwOW7rHk4628.png'
				},
				{
					type: 'text',
					drawSet: [20, 670],
					content: '我在参加‘赣智旅’平台，',
				},
				{
					type: 'text',
					drawSet: [20, 717],
					content: '江西旅游公益助力活动，',
				},
				{
					type: 'text',
					drawSet: [20, 764],
					content: '请为我助力吧！',
				},
				{
					type: 'text',
					drawSet: [58, 825],
					content: '赣州智慧旅游小程序',
					ctxSet: {
						font: '18px "微软雅黑"',
						fillStyle: '#2ba245',
						globalAlpha: 1
					},
				},
			]
			console.log('this.canvasArr', this.canvasArr);
		},
		initializeD_2 () {
			this.canvasDefaultSet = {
				font: '28px "微软雅黑"',
				fillStyle: '#666666',
				textBaseline: 'top',
			}
			this.canvasArr = [
				{
					type: 'img',
					drawSet: [0, 0, 650, 876],
					path: 'https://www.krtimg.com/group1/M00/02/6D/rAA0Kl8spKaAMH3uAAIztaEvggI831.jpg'
				},
				{
					type: 'base64',
					drawSet: [470, 700, 150, 150],
					path: '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'
				},
				{
					type: 'img',
					drawSet: [20, 820, 30, 25,],
					path: 'https://www.krtimg.com/group1/M00/02/97/rAA0KV8rfT-AVPw3AAAwOW7rHk4628.png'
				},
				{
					type: 'text',
					drawSet: [20, 670],
					content: '我是第 112344 名参加，',
				},
				{
					type: 'text',
					drawSet: [20, 717],
					content: '助力送赣南脐橙活动，',
				},
				{
					type: 'text',
					drawSet: [20, 764],
					content: '请为我助力吧！',
				},
				{
					type: 'text',
					drawSet: [58, 825],
					content: '科睿特软件集团股份有限公司',
					ctxSet: {
						font: '18px "微软雅黑"',
						fillStyle: '#000000',
						globalAlpha: 1
					},
				},
			]
			console.log('this.canvasArr', this.canvasArr);
		},
		canvasChange (e) {
			var act = this.canvasAct
			this.posterTemp = e
			if (act === 'preview') {
				uni.showModal({ title: '温馨提示', content: e, showCancel: false })
			}
		},
		onGetPath () {
			this.canvasAct = 'preview'
			this.$refs.k_Canvas.getPath()
		},
		onSavePoster () {
			this.canvasAct = ''
			this.$refs.k_Canvas.save()
		},
		onPreviewPoster () {
			this.canvasAct = ''
			this.$refs.k_Canvas.preview()
		},
		saveImageToPhotosAlbum (img) {
			return new Promise((resovle, reject) => {
				uni.saveImageToPhotosAlbum({
					filePath: img,
					success (res) {
						console.log('saveImageToPhotosAlbum:', res)
						resovle(res)
					},
					fail (ret) {
						console.log(ret);
					}
				})
			})
		},
	},
	onShareAppMessage: function (res) {
		var posterTemp = this.posterTemp
		return {
			title: '转发海报',
			path: '/viewsE/demo',
			imageUrl: posterTemp // imgsize = 5:4
		}
	}
}
</script>

<style lang= "less" scoped>
.containter {
	position: relative;
	z-index: 1000;
}
</style>
