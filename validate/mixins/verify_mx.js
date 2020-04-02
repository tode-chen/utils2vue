import {
    verifyData
} from "@/common/verify_fn";
export default {
    data() {
        return {};
    },
    mounted() {
        if (this.rules) {
            var items,
                trigger,
                removeDuplicate = {}; // 避免重复添加相同的事件
            for (let key in this.rules) {
                items = this.rules[key];
                for (let i = 0; i < items.length; i++) {
                    trigger = items[i]["trigger"] || "";
                    if (trigger) {
                        if (!removeDuplicate[key]) removeDuplicate[key] = {};
                        if (
                            removeDuplicate[key] !== undefined &&
                            removeDuplicate[key][trigger] === undefined
                        ) {
                            removeDuplicate[key][trigger] = true;
                            this.$refs[key].$el.addEventListener(
                                trigger,
                                () => {
                                    this.verifySingle(key);
                                },
                                true
                            );
                        }
                    }
                }
            }
        }
    },
    methods: {
        validate() {
            return verifyData(this.rules, this);
        },
        verifySingle(name) {
            verifyData(this.rules, this, name);
        }
    }
};