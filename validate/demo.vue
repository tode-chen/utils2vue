<template>
    <view id="list">
        <input type="text"
               v-model="name"
               ref="name">
        <input type="text"
               v-model="mobile"
               ref="mobile">
        <button @click="onSubmit">验证</button>
    </view>
</template>
<script>
import verify_mx from '@/common/mixins/verify_mx'
export default {
    mixins: [verify_mx],
    data () {
        return {
            name: '',
            mobile: '',
            rules: {
                name: [
                    { required: true, message: '[姓名]不能为空', trigger: 'blur' },
                    { type: 'name', message: '[姓名]请写正确格式', trigger: 'blur' },
                ],
                mobile: [
                    { type: 'mobile', required: true, message: '[电话]请使用正确格式!', trigger: 'blur' },
                ]
            }
        }
    },
    onLoad () {
    },

    watch: {
    },
    methods: {
        onSubmit () {
            if (!this.validate()) { return false };
            console.log('go submit');
        },
    }
}
</script>

<style lang= "less" scoped>
#list {
    position: absolute;
    width: 100%;
    min-height: 100%;
    background: #f3f3f3;
}
</style>