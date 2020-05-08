<template>
    <div id="cuiMessageBox">
        confirm
        <button type="text"
                @click="Alert">
            点击打开23 popup
        </button>
    </div>
</template>

<script>
// @route('/cui-msg','msg')


export default {
    // components: {
    //     CUIPopup
    // },
    name: "HelloWorld",
    data () {
        return {
            dialogVisible: false,
            msg: '开心的'
        };
    },
    created () {
        this.Alert()
    },
    methods: {
        Alert () {
            //  使用直之前绑定到原型上的方法
            this.$msg({
                title: '标题2',
                msg: '内容2',
                confirmText: '确定2',
                // cancelText: '取消2',
                success: (res) => {
                    console.log('res', res);
                }
            })
        },
    }
};
</script>

<style lang="less" scoped>
#cuiMessageBox {
    width: 100%;
    height: 1500px;
}
</style>
