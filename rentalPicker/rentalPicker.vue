<!-- 本示例未包含完整css，获取外链css请参考上文，在hello uni-app项目中查看 -->
<template>
	<view class="k-rentalCalendar">
		<view class="topBar-wrap">
			<view class="date-show-wrap">
				<view class="date-box"
							v-if="d1_show">
					<view class="date-tit">
						<text>{{`${d1_show.M}月${d1_show.D}日`}}</text>
					</view>
					<view class="date-subTit">{{`周${week_dict[d1_show.W]} ${d1_show.h}:${d1_show.m}`}}</view>
				</view>
				<view class="date-box"
							v-else>
					取车时间
				</view>
				<view class="date-totalDay-box">
					<view class="date-totalDay">共<text class="text">{{totalDays}}</text>天</view>
				</view>
				<view class="date-box"
							v-if="d2_show">
					<view class="date-tit">
						<text>{{`${d2_show.M}月${d2_show.D}日`}}</text>
					</view>
					<view class="date-subTit">{{`周${week_dict[d1_show.W]} ${d2_show.h}:${d2_show.m}`}}</view>
				</view>
				<view class="date-box"
							v-else>
					还车时间
				</view>
			</view>
			<view class="week-box">
				<view class="week-li"
							v-for="(item,index) in week_arr"
							:Key="index">{{item}}</view>
			</view>
		</view>
		<view class="calendar-wrap">
			<view class="calendar-box"
						v-for="(item,index) in calendar_arr"
						:key="index">
				<view class="calendar-title">{{`${item.year}年${item.month}年`}}</view>
				<view class="calendar-li">
					<view class="calendar-item"
								v-for="(it,i) in item.month_arr"
								:key="i"
								:class="it.class"
								@tap="onCalendarItem(index,i)">
						<view class="calendar-item__hd">{{it.tit_hd}}</view>
						<view class="calendar-item__bd">{{it.day}}</view>
						<view class="calendar-item__ft">{{it.tit_ft}}</view>
					</view>
				</view>
			</view>
		</view>
		<!-- timepicker-wrap -->
		<view class="timepicker-wrap">
			<view class="timepicker-title">
				<view class="timepicker-title-item">取车时间</view>
				<view class="timepicker-title-item">还车时间</view>
			</view>
			<picker-view :indicator-style="indicatorStyle"
									 :value="time_pick_i"
									 @change="tiemPickerChange"
									 class="picker-view">
				<picker-view-column>
					<view class="item"
								v-for="(item,index) in time_pick_arr"
								:key="index">{{item}}</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item"
								v-for="(item,index) in time_pick2_arr"
								:key="index">{{item}}</view>
				</picker-view-column>
			</picker-view>
			<view class="user-msg">
				<text class="text"
							v-if="useMsg">{{useMsg}}</text>
			</view>
			<view class="btns-wrap">
				<view class="k-btn default left"
							@tap="onClear">清空</view>
				<view class="k-btn primary right"
							v-if="!calendarLock">确定</view>
				<view class="k-btn disabled right"
							v-else>确定</view>
			</view>
		</view>
	</view>
</template>
<script>
import { formatDate, _throttle } from '@/libs/utils/fns'
export default {
	data () {
		return {
			totalDays: '',
			d1_show: '',
			d2_show: '',
			// sys setting
			limitDay: 5,
			// 
			week_dict: {
				0: '七',
				1: '一',
				2: '二',
				3: '三',
				4: '四',
				5: '五',
				6: '六',
			},
			week_arr: ['日', '一', '二', '三', '四', '五', '六',],
			calendar_arr: [],
			calendar_PROTO: '', // 被JSON.stringify；3个月的日历数据，
			d1: '', // 选择取车时间 年月日 date 1
			d2: '', // 选择的还车时间 年月日 date 2
			t1: '', // 选择取车时间 时分秒 time 1
			t2: '', // 选择的还车时间 时分秒 time 2
			defTime1: '', // 默认值的 时分 取车 12:00
			defTime2: '', // 默认值的 时分 取车 12:00
			// 
			indicatorStyle: `height: 66rpx;`,
			time_pick_i: [0, 0],
			time_pick_arr: [],
			time_pick2_arr: [],
			time_pick_PROTO: '', // 被JSON.stringify；00:00-23:30的48个时间段的数据，
			calendarLock: false,
			useMsg: '',
		}
	},
	onLoad (e) {
		// 默认取车时间e.def1；默认还车时间e.def2
		// ?def1=2021-09-02%2020%3A00%3A00&def2=2021-09-03%2021%3A00%3A00
		// debugger
		// e.def1 = '2021-09-02 08:59:00'
		// e.def2 = '2021-09-04 10:00:00'
		this.initCalendar()
		this.initTimePickerData()
		this.handleDefaultDate(e.def1, e.def2)
	},
	methods: {
		// calendar
		initCalendar () {
			let calendar_arr = []
			calendar_arr.push(this.buildMonth(0))
			calendar_arr.push(this.buildMonth(1))
			calendar_arr.push(this.buildMonth(2))
			this.calendar_arr = calendar_arr
			this.calendar_PROTO = JSON.stringify(calendar_arr)
		},
		buildMonth (n) {
			// n: 0=当前月份
			let oDate = new Date(); //定义时间
			let tempDate = new Date(); //定义时间
			// console.log('t1', oDate.getMonth(), n, oDate.getMonth() + n);
			tempDate.setMonth(oDate.getMonth() + n, 1);//设置月份
			let year = tempDate.getFullYear(); //年
			let month = tempDate.getMonth(); //月
			// console.log('month', month);
			let day = oDate.getDate(); //日
			//计算本月有多少天
			let allDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
			let month_arr = []
			//判断闰年
			if (month == 1) {
				if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
					allDay = 29;
				}
			}
			//判断本月第一天是星期几
			oDate = new Date(`${year}/${month + 1}/01 00:00:00`) //时间调整到本月第一天
			let week = oDate.getDay(); //读取本月第一天是星期几
			for (let i = 0; i < week; i++) {
				month_arr.push('')
			}
			//日期插入到dateList
			for (let i = 1; i <= allDay; i++) {
				var isToday = false,
					isDiabled = false,
					className = '',
					tit_hd = '',
					tit_ft = '',
					d1 = false,
					d2 = false,
					ds = false
				if (n === 0) {
					if (i < day) {
						isDiabled = true
						className += ' past'
					} else if (i === day) {
						tit_hd = '今天'
					}
				}
				month_arr.push({
					class: className,
					disabled: isDiabled,
					tit_hd: tit_hd, // 日历item头部文字
					tit_ft: tit_ft, // 日历item底部文字
					day: i, // Boolean day 几号
					d1: d1, // Boolean 取车时间 / 开始时间 start day
					d2: d2, // Boolean 还车时间 / 结束时间 end day
					ds: ds, // Boolean 选择时间 day select
				})
			}
			return {
				year: year,
				month: month + 1,
				month_arr: month_arr,
			}
		},
		onCalendarItem (index, i) {
			let item = this.calendar_arr[index]
			let it = item.month_arr[i]
			if (!it || it.disabled) return
			let d1 = this.d1
			let d2 = this.d2
			let d1_s = `${d1.Y}/${d1.M}/${d1.D} 00:00:00`
			let Y = item.year
			let M = item.month
			let D = it.day
			let obj = {
				Y: Y,
				M: M,
				D: D
			}
			var d_s = `${Y}/${M}/${D} 00:00:00` // day selected
			if (!d1 && !d2) {
				this.d1 = obj
			} else if (d1 && !d2) {
				if (new Date(d_s) < new Date(d1_s)) {
					this.d1 = obj
				} else {
					this.d2 = obj
				}
			} else if (d1 && d2) {
				this.d1 = obj
				this.d2 = ''
			}
		},
		handleCalendarClass (item) {
			let rt = item.class
			// {'d1':it.d1,'d2':it.d2,'ds':it.ds,'d1d2':it.d1&&it.d2,}
			if (item.d1 && item.d2) {
				rt += ' d1d2'
			} else if (item.d1) {
				rt += ' d1'
			} else if (item.d2) {
				rt += ' d2'
			} else if (item.ds) {
				rt += ' ds'
			}
			return rt
		},
		// timepicker
		buildTime () {
			let time_pick_arr = []
			for (let i = 9; i < 24; i++) {
				var str = i < 10 ? '0' + i : i
				time_pick_arr.push(str + ':00')
				time_pick_arr.push(str + ':30')
			}
			this.time_pick_PROTO = JSON.stringify(time_pick_arr)
			// if (this.time_pick_arr.length >= 48) {
			// 	this.$set(this.time_pick_i, 0, 24)
			// 	this.t1 = this.time_pick_arr[24]
			// } else if (this.time_pick_arr.length > 0) {
			// 	this.$set(this.time_pick_i, 0, 0)
			// 	this.t1 = this.time_pick_arr[0]
			// }
			// if (this.time_pick2_arr.length >= 48) {
			// 	this.$set(this.time_pick_i, 1, 24)
			// 	this.t2 = this.time_pick2_arr[24]
			// } else if (this.time_pick2_arr.length > 0) {
			// 	this.$set(this.time_pick_i, 1, 0)
			// 	this.t2 = this.time_pick2_arr[0]
			// }
		},
		initTimePickerData () {
			this.buildTime()
			this.setTimePick(0)
			this.setTimePick(1)
		},
		tiemPickerChange (e) {
			const val = e.detail.value
			this.$set(this, 'time_pick_i', val)
			this.$set(this, 't1', this.time_pick_arr[val[0]])
			this.$set(this, 't2', this.time_pick2_arr[val[1]])
		},
		resetTimePicker (d1, d2) {
			// let str = '2021/08/30 23:01:00'
			let now = new Date()
			let Y = now.getFullYear()
			let M = now.getMonth()
			let D = now.getDate()
			let round30Time = this.round30Time()
			let _h = round30Time.h
			let _m = round30Time.m
			if (d1) {
				if (d1.Y === Y && d1.M === M + 1 && d1.D === D) {
					this.setTimePick(0, _h, _m)
				} else {
					this.setTimePick(0)
				}
			}
			if (d2) {
				if (d2.Y === Y && d2.M === M + 1 && d2.D === D) {
					this.setTimePick(1, _h, _m)
				} else {
					this.setTimePick(1)
				}
			}
		},
		round30Time (newDate = new Date()) {
			let now = newDate
			let h = now.getHours()
			let m = now.getMinutes()
			if (m >= 30) {
				now.setHours(h + 1, 0)
			} else {
				now.setHours(h, 30)
			}
			h = now.getHours()
			m = now.getMinutes()
			return { h: h, m: m, }
		},
		setTimePick (LorR = 0, h, m) {
			let PROTO = JSON.parse(this.time_pick_PROTO)
			let arr = []
			let index = 0
			let pickName = ''
			let tName = '' // t1 t2
			let defTimeName = '' // e1 e2
			let resetArr = true
			if (LorR === 0) {
				pickName = 'time_pick_arr'
				tName = 't1'
				defTimeName = 'defTime1'
			}
			if (LorR === 1) {
				pickName = 'time_pick2_arr'
				tName = 't2'
				defTimeName = 'defTime2'
			}
			if (h >= 0 && m >= 0) {
				h = h === 0 && m === 0 ? 24 : h // 上浮时间是00:00的话，则time pick为空，否则h=24(14:00)
				let x = m >= 30 ? 1 : 0
				let s = h - 9 > 0 ? (h - 9) * 2 + 1 + x : x
				arr = PROTO.slice(s)
			} else {
				if (this[pickName].length === 48) resetArr = false;
				arr = PROTO
				index = 10
			}
			if (this[defTimeName]) {
				for (let i = 0; i < arr.length; i++) {
					if (arr[i] === this[defTimeName]) {
						index = i
						break;
					}
				}
				this[defTimeName] = ''
			}
			if (resetArr) this.$set(this, pickName, arr)
			this.$set(this.time_pick_i, LorR, index)
			this.$set(this, tName, arr[index])
		},
		buildFullDate (d, t) {
			if (!d || !t) return false
			let Y = d.Y
			let M = d.M
			let D = d.D
			let h = t.split(':')[0]
			let m = t.split(':')[1]
			let s = '00'
			let rt = ''
			// rt = `${}`
		},
		handleDefaultDate (e1, e2) {
			e1 = formatDate(decodeURIComponent(e1), 99)
			e2 = formatDate(decodeURIComponent(e2), 99)
			const handleTime = (date, eName, defName) => {
				let YMD = formatDate(date, 11)
				if (!YMD) return
				let round30Time = this.round30Time(date)
				let _h = round30Time.h
				let _m = round30Time.m
				_h = _h < 10 ? `0${_h}` : _h
				_m = _m < 10 ? `0${_m}` : _m
				this[eName] = {
					Y: YMD[0],
					M: Number(YMD[1]),
					D: Number(YMD[2]),
				}
				this[defName] = `${_h}:${_m}`
				console.log('handleDefaultDate >', this[eName], this[defName]);
			}
			// 1，时间小于当前时间，设置默认为当前时间回显，并提示。
			let now = new Date()
			if (e1 && e2) {
				if (e1 < now) {
					uni.showToast({ title: '默认取车时间需大于当前时间', icon: 'none' })
					return
					// e1 = now
				}
				if (e2 < e1) {
					uni.showToast({ title: '默认还车时间需大于默认取车时间', icon: 'none' })
					e2 = new Date(e1)
					e2 = new Date(e2.setDate(e1.getDate() + 2, 0, 0, 0))
					console.log(e2);
				}
				handleTime(e1, 'd1', 'defTime1')
				handleTime(e2, 'd2', 'defTime2')
			}
			// this.round30Time(new Date(this.s1))
		},
		onClear () {
			this.d1 = ''
			this.d2 = ''
		},
		onConfirm: _throttle(function () {
			let d1 = this.d1_show
			let d2 = this.d1_show
			if (d1 && d2) {
				uni.$emit('rentalPickerChange', [
					`${d1.Y}/${d1.M}/${d1.D} ${d1.h}:${d1.m}:${d1.s}`,
					`${d2.Y}/${d2.M}/${d2.D} ${d2.h}:${d2.m}:${d2.s}`
				])
			} else {
				uni.showToast({ title: '取/还车时间不能为空!', icon: 'none' })
			}
		}, 1000, true)
	},
	computed: {
		d1d2 () {
			const { d1, d2 } = this
			return { d1, d2 }
		},
		verifyDate () {
			const { d1, d2, t1, t2 } = this
			return { d1, d2, t1, t2 }
		}
	},
	watch: {
		d1d2 (nVal) {
			let d1 = nVal.d1
			let d2 = nVal.d2
			let d1_s = `${d1.Y}/${d1.M}/${d1.D} 00:00:00`
			let d2_s = `${d2.Y}/${d2.M}/${d2.D} 00:00:00`
			let arr = JSON.parse(this.calendar_PROTO)
			if (d1 && !d2) {
				arr.forEach((item, index) => {
					if (item.year === d1.Y && item.month === d1.M) {
						item.month_arr.forEach((it, i) => {
							if (it) {
								if (it.day === d1.D) {
									it.d1 = true
									it.tit_ft = '取车'
								}
								it.class = this.handleCalendarClass(it)
							}
						})
					}
				})
			} else if (d1 && d2) {
				arr.forEach((item, index) => {
					item.month_arr.forEach((it, i) => {
						if (it) {
							var tempStr = `${item.year}/${item.month}/${it.day} 00:00:00`
							// console.log('t2', tempStr);
							if (new Date(tempStr) > new Date(d1_s) && new Date(tempStr) < new Date(d2_s)) {
								it.ds = true
							} else {
								if ((item.year === d1.Y && item.month === d1.M) && it.day === d1.D) it.d1 = true
								if ((item.year === d2.Y && item.month === d2.M) && it.day === d2.D) it.d2 = true
								if (it.d1 && it.d2) {
									it.tit_ft = '取车/还车'
								} else if (it.d1) {
									it.tit_ft = '取车'
								} else if (it.d2) {
									it.tit_ft = '还车'
								}
							}
							it.class = this.handleCalendarClass(it)
						}
					})
				})
			}
			this.$set(this, 'calendar_arr', arr)
			this.resetTimePicker(d1, d2)
		},
		verifyDate (nVal) {
			let d1 = nVal.d1
			let d2 = nVal.d2
			let t1 = nVal.t1
			let t2 = nVal.t2
			let s1 = formatDate(`${d1.Y}/${d1.M}/${d1.D} ${t1}:00`, 98) // selected time 1 取车时间
			let s2 = formatDate(`${d2.Y}/${d2.M}/${d2.D} ${t2}:00`, 98) // selected time 2 取车时间
			let now = new Date()
			let useMsg = ''
			let msg = {
				1: {
					1: '请选择取车日期',
					2: '取车时间需要晚于当前时间',
				},
				2: {
					1: '请选择还车日期',
					2: '还车时间需要晚于当前时间',
				},
				3: {
					1: '当天取还，取车时间需要早于还车时间',
					2: '不足24小时，按1天计费',
					3: `最低${this.limitDay}天起租`,
				}
			}
			this.d1_show = s1 ? formatDate(s1, 12) : ''
			this.d2_show = s2 ? formatDate(s2, 12) : ''
			if (s1 && s2 && (s2 - s1 >= 0)) {
				this.totalDays = Math.ceil((formatDate(`${d2.Y}/${d2.M}/${d2.D} 23:59:59`, 99) - formatDate(`${d1.Y}/${d1.M}/${d1.D} 00:00:00`, 99)) / (1000 * 60 * 60 * 24))
				if (Number(this.totalDays) < this.limitDay && ((s2 - s1) / (1000 * 60 * 60 * 24) < 1)) useMsg = msg[3][2]
			} else {
				this.totalDays = '0'
			}
			// 
			if (!s1) {
				useMsg = msg[1][1]
				this.calendarLock = true
			} else if (!s2) {
				useMsg = msg[2][1]
				this.calendarLock = true
			} else if (s1 && (s1 - now <= 0)) {
				useMsg = msg[1][2]
				this.calendarLock = true
			} else if (s2 && (s2 - now <= 0)) {
				useMsg = msg[2][2]
				this.calendarLock = true
			} else if (Number(this.totalDays) < this.limitDay) {
				useMsg = msg[3][3]
				this.calendarLock = true
			} else if ((s1 && s2) && (s2 - s1 <= 0)) {
				useMsg = msg[3][1]
				this.calendarLock = true
			} else {
				this.calendarLock = false
			}
			this.useMsg = useMsg ? useMsg : ''
		}
	},
}
</script>
<style lang="less" scoped>
.k-rentalCalendar {
	position: relative;
	width: 100%;
	color: #000;
	.topBar-wrap {
		position: fixed;
		top: 0;
		// #ifdef H5
		top: 44px;
		// #endif
		right: 0;
		left: 0;
		z-index: 100;
		.date-show-wrap {
			position: relative;
			z-index: 110;
			display: flex;
			justify-content: center;
			padding: 10rpx 30rpx 20rpx;
			box-sizing: border-box;
			width: 100%;
			height: 100rpx;
			background: #fff;
			.date-box {
				box-sizing: initial;
				width: 6em;
				height: 70rpx;
				line-height: 70rpx;
				font-size: 32rpx;
				text-align: center;
				.date-tit {
					width: 100%;
					height: 34rpx;
					line-height: 34rpx;
				}
				.date-subTit {
					margin-top: 10rpx;
					width: 100%;
					height: 26rpx;
					line-height: 26rpx;
					font-size: 24rpx;
					color: #999;
				}
			}
			.date-totalDay-box {
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 70rpx;
				text-align: center;
				line-height: 70rpx;
				&::before,
				&::after {
					flex: 1;
					content: ' ';
					display: block;
					height: 2rpx;
					color: #eee;
					background: #ccc;
				}
				.date-totalDay {
					margin: 0 20rpx;
					.text {
						margin: 0 10rpx;
					}
				}
			}
		}
		.week-box {
			position: relative;
			z-index: 100;
			display: flex;
			justify-content: center;
			box-shadow: 0rpx 0rpx 20rpx rgba(0, 0, 0, 0.1);
			width: 100;
			background: #fff;
			.week-li {
				flex: 1;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 24rpx;
				text-align: center;
			}
		}
	}

	.calendar-wrap {
		margin-top: 180rpx;
		padding: 0 30rpx 538rpx 30rpx;
		box-sizing: border-box;
		width: 100%;
		font-size: 28rpx;
		.calendar-box {
			width: 100%;
			.calendar-title {
				width: 100%;
				height: 88rpx;
				line-height: 88rpx;
				text-align: center;
			}
			.calendar-li {
				display: flex;
				justify-content: flex-start;
				flex-wrap: wrap;
				width: 100%;
				.calendar-item {
					display: flex;
					justify-content: flex-start;
					align-items: center;
					align-content: center;
					flex-wrap: wrap;
					width: calc(100% / 7);
					height: 100rpx;
					text-align: center;
					overflow: hidden;
					.calendar-item__hd,
					.calendar-item__ft {
						width: 100%;
						height: 22rpx;
						line-height: 22rpx;
						font-size: 20rpx;
						text-align: center;
					}
					.calendar-item__bd {
						padding: 2rpx 0;
						box-sizing: initial;
						width: 100%;
						height: 32rpx;
						line-height: 32rpx;
						font-size: 30rpx;
						text-align: center;
					}
					&.past {
						color: #ccc;
					}
					&.d1 {
						border-radius: 16rpx 0 0 16rpx;
						color: #fff;
						background: #5daaf8;
					}
					&.d2 {
						border-radius: 0 16rpx 16rpx 0;
						color: #fff;
						background: #5daaf8;
					}
					&.ds {
						background: #eef7fe;
					}
					&.d1d2 {
						border-radius: 16rpx;
						color: #fff;
						background: #5daaf8;
					}
				}
			}
		}
	}
	// 100rpx 100rpx
	.timepicker-wrap {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 100;
		padding-top: 20rpx;
		box-sizing: border-box;
		box-shadow: 0rpx 0rpx 20rpx rgba(0, 0, 0, 0.1);
		width: 100%;
		font-size: 30rpx;
		background: #fff;
		.timepicker-title {
			display: flex;
			justify-content: center;
			width: 100%;
			.timepicker-title-item {
				flex: 1;
				height: 40rpx;
				line-height: 40rpx;
				text-align: center;
			}
		}
		.picker-view {
			width: 750rpx;
			height: 220rpx;
			.item {
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				height: 66rpx;
				line-height: 66rpx;
				text-align: center;
			}
		}
		.user-msg {
			padding-top: 10rpx;
			box-sizing: initial;
			width: 100%;
			height: 26rpx;
			line-height: 26rpx;
			text-align: center;
			font-size: 24rpx;
			color: @themeColor;
		}
		.btns-wrap {
			display: flex;
			justify-content: center;
			padding: 10rpx 30rpx 20rpx 30rpx;
			box-sizing: border-box;
			width: 100%;
			.left {
				width: 290rpx;
			}
			.right {
				flex: 1;
				margin-left: 30rpx;
			}
		}
	}
}
</style>