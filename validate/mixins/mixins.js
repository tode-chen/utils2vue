import bindUser from "@/components/bind-user.vue"
export default {
    components: {
        bindUser
    },
    data() {
        return {
            showPopup: false
        }
    },
    methods: {
        showPopupFn(val) {
            console.log('showPopupFn')
            this.showPopup = false
        }
    }
}