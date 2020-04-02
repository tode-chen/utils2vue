# 使用方法：
* 用于表单验证，使用mixins方法
> 放在common文件夹
```c
<input type="text"
    v-model="name"
    ref="name">
rules: {
    name: [
        { required: true, message: '[姓名]不能为空', trigger: 'blur' },
        { type: 'name', message: '[姓名]请写正确格式', trigger: 'blur' },
    ],
    mobile: [
        { type: 'mobile', required: true, message: '[电话]请使用正确格式!', trigger: 'blur' },
    ]
}
onSubmit () {
    if (verifyData(this.rules, this)) { return false };
},
```