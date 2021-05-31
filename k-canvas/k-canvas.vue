<template>
	<view class="crt-canvas"
				v-show="canvasShow">
		<canvas class="myCanvas"
						:canvas-id="canvasId"
						:style="{width:width+'px',height:height +'px'}" />
	</view>
</template>

<script>
export default {
	/**
	 * canvasItems 说明
	 * @、单位均为px
	 * @、数组key约小，画布层数越低，即数组第一个为底层，最后一个为最上面层。
	 * @、先绘制里如果有用相关设置会
	 * @、type：img=绘图，text=文字,circleImg=图片剪裁为正圆形
	 * @、ctxSet：某项的ctx个性设置，可能会影响到上一层的对应设置，所以需有个性设置的可以最后进行绘制。
	 * @、画布合成后会使用canvasToTempFilePath生成一张缓存图片，这个图片可用于分享的预览图片。
	 * 
	 * ## 基本设置
	 * 这个对象里的设置都是CanvasContext的设置可参考文档使用，例如cxt.font = '28px "微软雅黑"'；
		canvasDefaultSet = {
			font: '28px "微软雅黑"',
			fillStyle: '#333333',
			textBaseline: 'top'
		}
	 * @、backgroundColor：背景图片颜色，不填就是透明图片。 
	 * ## 图像绘制的数据格式
	 * （1）drawSet: [X轴距离，Y轴距离，宽度，高度]，对应ctx.drawImage(0,0,0,0)
	 * （2）path：图片路径
		canvasItems =[
			{
				type: 'img',
				drawSet: [0, 0, 800, 800], // 
				path: 'https://www.krtimg.com/group1/M00/02/6C/rAA0KV7m09-ASI3FAAfVShWwZ3M83.jpeg'
			},
		]
	 * ## 文本绘制的数据格式
	 * （1）drawSet: [X轴距离，Y轴距离，maxWidth]，对应ctx.fillText(textContent，X轴距离，Y轴距离，maxWidth)
	 * （2）content：当行文本内容
	 * （3）文本需注意计算文本宽度，使用了maxWidth或会压缩文本
		canvasItems =[
			{
				type: 'text',
				drawSet: [58, 825],
				content: '赣州智慧旅游小程序',
				ctxSet: {
					font: '18px "微软雅黑"', // 字体大小 字体
					fillStyle: '#2ba246', // 颜色
					globalAlpha: 0.8, // 透明度
				},
			},
		]
	 * ## 调用方法
	 * @、保存画布：父级调用方法this.$refs.crtCanvas.save()。
	 * @、预览画布：父级调用方法this.$refs.crtCanvas.preview()。
	 * @、获取画布地址：父级调用方法this.$refs.crtCanvas.getPath()。在组件里change事件会返回合成后的本地图片
		<crt-canvas ref="crtCanvas"
					@change="canvasChange"
					@act="canvasAct"
					:canvasId="'uCanvas'"
					width="650"
					height="876"
					backgroundColor="#fff"
					:defaultSet="canvasDefaultSet"
					:canvasItems="canvasArr"></crt-canvas>
	 */
	props: {
		canvasId: {
			type: String,
			default: 'myCanvas'
		},
		width: {
			type: Number,
			default: 600
		},
		height: {
			type: Number,
			default: 600
		},
		backgroundColor: {
			type: String,
			default: ''
		},
		canvasItems: {
			type: Array,
			default: () => []
		},
		defaultSet: {
			type: Object,
			default: () => (
				{
					font: '18px "微软雅黑"',
					fillStyle: 'black',
					textBaseline: 'top',
					globalAlpha: 1
				}
			)
		}
	},
	data () {
		return {
			canvasShow: false,
			canvasW: '200',
			canvasH: '200',
		}
	},
	methods: {
		canvasHandle () {
			return new Promise(async (resolve, reject) => {
				let that = this
				this.canvasShow = true
				uni.showLoading({ title: '加载中', mask: true });
				var defaultSet = this.defaultSet
				var canvasItems = this.canvasItems.concat()
				console.log('canvasItems', canvasItems);
				// initialize cavase
                var ctx = uni.createCanvasContext(this.canvasId, that)
                console.debug('如果报错[Property or method "toJSON" is not defined...]，或是小程序的createCanvasContext自身问题，真机访问则正常运行。');
                ctx.clearRect(0, 0, this.width, this.height)
				if (this.backgroundColor) {
					ctx.fillStyle = this.backgroundColor
					ctx.fillRect(0, 0, this.width, this.height)
				}
				for (var k in defaultSet) {
					ctx[k] = defaultSet[k]
				}
				// console.debug('canvasItems', canvasItems)
				for (var i = 0; i < canvasItems.length; i++) {
					var item = canvasItems[i]
					var set = item.drawSet
					// 进行个性的ctx设置
					if (item.ctxSet) {
						for (var n in item.ctxSet) {
							ctx[n] = item.ctxSet[n]
						}
					}
					// 图像绘制
					if (item.type === 'img') {
						await this.getImgInfo(item.path).then(res => {
							ctx.drawImage(res.path, set[0], set[1], set[2], set[3])
						}).catch(ret => {
							uni.hideLoading();
						})
					}
					if (item.type === 'circleImg') {
						await this.getImgInfo(item.path).then(res => {
							var unit = 1
							var avatorWidth = unit * set[2]
								, avatorHeight = unit * set[3];
							var avatarurlX = unit * set[0];   //绘制的头像在画布上的位置
							var avatarurlY = unit * set[1];   //绘制的头像在画布上的位置
							ctx.save(); // 保存当前状态
							ctx.beginPath(); //开始绘制
							ctx.arc(avatorWidth / 2 + avatarurlX, avatorHeight / 2 + avatarurlY, avatorWidth / 2, 0, Math.PI * 2, false); // 绘制圆形
							ctx.clip(); // 剪裁圆形
							ctx.drawImage(res.path, set[0], set[1], avatorWidth, avatorWidth);
							ctx.restore(); // 重置状态
						}).catch(ret => {
							uni.hideLoading();
						})
					}
					if (item.type === 'base64') {
						var base64Path = ''
						await this.base64ToImg(item.path).then(res => {
							base64Path = res
						}).catch(ret => {
							uni.hideLoading();
						})
						await this.getImgInfo(base64Path).then(res => {
							ctx.drawImage(res.path, set[0], set[1], set[2], set[3])
						}).catch(ret => {
							uni.hideLoading();
						})
					}
					// 文本绘制
					if (item.type === 'text') {
						var metrice = ctx.measureText(item.content)
						// ctx.fillRect(100, 100, 300, 300);
						console.log('content', item.content, 'metrice:', metrice);
						ctx.fillText(item.content, set[0], set[1], set[2])
					}
				}
				console.log('t0');

				ctx.draw(true, () => {
					console.log('t1');
					this.canvasToTempFilePath().then(res => {
						this.$emit('change', res.tempFilePath);
						resolve(res.tempFilePath)
						uni.hideLoading();
					}).catch(ret => {
						reject(ret)
						uni.hideLoading();
					})
					this.canvasShow = false
				})
			})
		},
		getImgInfo (img) {
			return new Promise((resolve, reject) => {
				uni.getImageInfo({
					src: img,
					success: res => {
						console.log('getImgInfo:', res)
						resolve(res)
					},
					fail (ret) {
						console.log(ret);
						reject(ret)
					}
				})
			})
		},
		canvasToTempFilePath (img) {
			return new Promise((resolve, reject) => {
				console.log('canvasToTempFilePath.canvasId', this.canvasId);
				uni.canvasToTempFilePath({
					canvasId: this.canvasId,
					success (res) {
						console.log('canvasToTempFilePath:', res)
						resolve(res)
					},
					fail (ret) {
						console.log(ret);
					}
				}, this)
			})
		},
		getPath () {
			this.canvasHandle()
		},
		save (imgPath) {
			this.canvasHandle().then(res => {
				this.saveImageToPhotosAlbum(res).then(res => {
					this.$emit('act', { status: 1, act: 'saveImageToPhotosAlbum', errMsg: res.errMsg })
				}).catch(ret => {
					this.$emit('act', { status: 0, act: 'saveImageToPhotosAlbum', errMsg: ret.errMsg })
				})
			})
		},
		preview (imgPath) {
            console.log('preview');
			this.canvasHandle().then(res => {
				uni.previewImage({
					current: res,
					urls: [res]
				})
			})
		},
		saveImageToPhotosAlbum (img) {
			console.log('save imgPath:', img);
			return new Promise((resovle, reject) => {
				uni.saveImageToPhotosAlbum({
					filePath: img,
					success (res) {
						console.log('saveImageToPhotosAlbum:', res)
						resovle(res)
					},
					fail (ret) {
						console.log(ret);
						reject(ret)
					}
				})
			})
		},
		base64ToImg (base64Data) {
			return new Promise((resolve, reject) => {
				let that = this
				// 先获得一个文件实例
				var fileManager = wx.getFileSystemManager()
				var tempImg = `${wx.env.USER_DATA_PATH}/tempImg${Math.random() * 100}.png`
				// 把图片base64格式转存到本地，用于canvas绘制
				fileManager.writeFile({
					filePath: tempImg,
					data: base64Data,
					encoding: 'base64',
					success: res => {
						console.log('base64ToImg:', tempImg)
						resolve(tempImg)
					},
					fail: ret => {
						console.log(ret)
						reject(ret)
					}
				})
			})
		}
	}
}
</script>

<style>
.myCanvas {
	position: absolute;
	left: 750rpx;
	top: 0;
}
</style>