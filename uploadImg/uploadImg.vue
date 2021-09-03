<template>
	<view class="k-uploader">
		<view class="k-uploader__hd">
			<view class="k-uploader__title">{{title}}</view>
			<view class="k-uploader__info">{{imgList.length}}/{{maxCount}}</view>
		</view>
		<view class="k-uploader__bd">
			<ul class="k-uploader__files">
				<li v-for="(item, index) in imgList"
						:key="index">
					<image class="image"
								 :src="item"
								 alt="uploadImage"
								 @tap="onViewImg(index)"
								 mode="aspectFill" />
					<view @tap="delImg(index)"
								class="deleteBtn">
						<image class="deleteIcon"
									 src="/static/images/clear.png" />
					</view>
				</li>
				<li class="k-uploader__input-box"
						@tap="addImg"
						v-if="imgList.length < maxCount"></li>
			</ul>
		</view>
		<!-- <view class="drawCanvas">
			<canvas :id="idName"
							:canvas-id="idName"
							:style="canvasStyle"></canvas>
		</view> -->
	</view>
</template>
<script>
/*
	组件简介：图片压缩上传（可支持多图上传） 
	如果同个页面调用两个一定要设置idNames,否则压缩图片会出现尺寸不对的问题
	<upload-img @change="uploadImgHandle($event, 'isZjjg')"
													 :maxCount="3" />
*/
export default {
	props: {
		title: {
			type: String,
			default: '上传图片'
		},
		defaultImgList: { // 默认图片列表
			type: Array,
			default: () => []
		},
		count: { // 图片一次上传限制数量
			type: Number,
			default: 1
		},
		maxCount: { // 最大上传数量
			type: Number,
			default: 9
		},
		sizeType: { // 可以指定是原图还是压缩图，默认是压缩都有 ['original', 'compressed']
			type: Array,
			default: () => ['compressed']
		},
		sourceType: { // album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
			type: Array,
			default: () => ['album', 'camera']
		},
		destWidth: { // 输出图片的最大宽度
			type: Number,
			default: 500,
		},
		quality: { // 输出图片的质量，取值范围为 (0, 1]，不在范围内时当作1.0处理
			type: Number,
			default: 0.6
		},
		idName: {
			type: String,
			default: 'firstCanvas'
		},
		_uploadUrl: {
			type: String,
			default: ''
		},
		_token: {
			type: String,
			default: ''
		},
	},
	data () {
		return {
			imgList: [], // 图片列表
			token: '',
			uploadUrl: '', // 上传图片的服务器请求地址
			visiable: false, // 显示组件的标识
			context: undefined, // canvas 绘图上下文
			canvasWidth: 300, // 默认宽度 300px、高度 225px
			canvasHeight: 225,
		};
	},
	mounted () {
		if (this.defaultImgList.length > 0) {
			this.imgList = this.defaultImgList;
		}

		// this.context = uni.createCanvasContext(this.idName, this);
		this.uploadUrl = this._uploadUrl ? this._uploadUrl : this.$apiPath + '/file/v1/file/upload'
		this.token = this._token ? this._token : this.$getStorage('token')
	},
	computed: {
		canvasStyle () {
			var rst,
				w = this.canvasWidth,
				h = this.canvasHeight
			rst = 'width:' + w + 'px;height:' + h + 'px;'
			return rst
		}
	},
	methods: {
		/* 预览图片 */
		onViewImg (i) {
			uni.previewImage({
				current: this.imgList[i], // 当前显示图片的http链接
				urls: this.imgList, // 需要预览的图片http链接列表
			})
		},
		/* 删除图片 */
		delImg (index) {
			uni.showModal({
				title: '',
				content: '确认删除当前图片？',
				success: (res) => {
					if (res.confirm) {
						this.imgList.splice(index, 1);
						this.$emit('change', this.imgList);
						uni.showToast({
							title: '删除成功！'
						});
					}
				}
			});
		},
		/* 添加图片 */
		addImg () {
			// 从本地相册选择图片或使用相机拍照
			uni.chooseImage({
				count: this.count, // 默认5
				sizeType: this.sizeType, // 可以指定是原图还是压缩图，默认二者都有
				sourceType: this.sourceType, //从相册选择
				success: (res) => {
					console.debug(JSON.stringify(res.tempFilePaths));
					const tempFilePaths = res.tempFilePaths;
					// this.compressImg(tempFilePaths, [], 0);
					// 上传服务器
					this.uploadImg(tempFilePaths, 0);
				}
			});
		},
		/* 压缩图片 */
		compressImg (tempFilePaths, compressPaths, index) {
			uni.showLoading({
				title: '处理中'
			});
			let i = index;
			let arr = [...compressPaths];
			uni.getImageInfo({
				src: tempFilePaths[i],
				success: (res) => {
					let canvasWidth = res.width // 图片原始长宽
					let canvasHeight = res.height;
					let base = canvasWidth / canvasHeight;
					if (canvasWidth > this.destWidth) {
						canvasWidth = this.destWidth;
						canvasHeight = Math.floor(canvasWidth / base);
					}
					this.canvasWidth = canvasWidth;
					this.canvasHeight = canvasHeight;
					/* 
							canvas宽高重新设置后会有一段渲染的间隔，这个间隔可能导致画到画布的图片出现大小不一致的bug，这里做下300ms延迟处理兼容
					 */
					setTimeout(() => {
						this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
						this.context.drawImage(res.path, 0, 0, this.canvasWidth, this.canvasHeight);
						this.context.draw(false, () => {
							// 将图片画到canvas上面，使用Canvas压缩
							uni.canvasToTempFilePath({
								x: 0,
								y: 0,
								width: this.canvasWidth,
								height: this.canvasHeight,
								destWidth: this.canvasWidth,
								destHeight: this.canvasHeight,
								canvasId: this.idName,
								fileType: 'jpg', // 目标文件的类型，只支持 'jpg' 或 'png'。默认为 'png'
								quality: this.quality,
								success: (res) => {
									// 在H5平台下，tempFilePath 为 base64
									i++;
									arr.push(res.tempFilePath);
									if (i < tempFilePaths.length) {
										this.compressImg(tempFilePaths, arr, i);
									} else {
										console.debug('压缩后的图片：', arr);
										uni.hideLoading();
										// 上传服务器
										this.uploadImg(arr, 0);
									}
								},
								fail: (err) => {
									console.debug(err)
								}
							}, this);
						});
					}, 300);
				},
				fail: (err) => {
					console.debug(err)
				}
			});
		},
		/* 上传图片 */
		uploadImg (tempFilePaths, index) {
			let i = index
			let that = this
			var imgList = this.imgList.length > 0 ? this.imgList : []
			uni.uploadFile({
				url: this.uploadUrl,
				filePath: tempFilePaths[i],
				name: 'file',
				header: {
					'Authorization': this.token,
				},
				formData: {
					dir: 'image',
					storage: 'fastdfs',
				},
				success (res) {
					var rs = JSON.parse(res.data);
					if (rs.code === 200 && rs.data.url) {
						imgList.push(rs.data.url)
						that.imgList = imgList
						i++
						if (i < tempFilePaths.length) {
							that.uploadImg(tempFilePaths, i);
						} else {
							console.debug('服务器返回的图片列表：', that.imgList)
							that.$emit('change', that.imgList)
						}
					}
				}
			})
		}
	}
}
</script>
<style lang="less" scoped>
.k-uploader {
	font-size: 34rpx;
	color: #333;

	.k-uploader__hd {
		display: flex;
		justify-content: flex-start;
		box-sizing: initial;
		padding-bottom: 32rpx;

		.k-uploader__title {
			flex: 1;
			width: 100%;
			line-height: 1.5;
		}

		.k-uploader__info {
			line-height: 1.5;
			color: #999;
		}
	}

	.k-uploader__bd {
		.k-uploader__files {
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
			margin: -16rpx 0 0 -16rpx;
			width: 100%;

			li {
				position: relative;
				margin: 16rpx 0 0 16rpx;
				width: 192rpx;
				height: 192rpx;
				background: #f3f3f3;

				.deleteBtn {
					position: absolute;
					top: 0;
					right: 0;
					width: 50rpx;
					height: 50rpx;
					background: rgba(255, 255, 255, 0.75);
					.deleteIcon {
						display: block;
						margin: 0 auto;
						margin-top: 10rpx;
						width: 30rpx;
						height: 30rpx;
					}
				}

				&.k-uploader__input-box {
					&:after,
					&:before {
						content: ' ';
						position: absolute;
						top: 50%;
						left: 50%;
						-webkit-transform: translate(-50%, -50%);
						transform: translate(-50%, -50%);
						background-color: #a3a3a3;
					}

					&:after {
						width: 4rpx;
						height: 64rpx;
					}

					&:before {
						width: 64rpx;
						height: 4rpx;
					}
				}

				&:active {
					opacity: 0.5;
				}
			}
		}
	}
	.drawCanvas {
		position: absolute;
		left: 750rpx;
	}
}
</style>