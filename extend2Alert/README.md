# 功能说明：

- extend 方法全局写一个 alert，并用

# 使用方法：

- 用于表单验证，使用 mixins 方法
  > 放在 common 文件夹，保证使用'rules'命名规则，并实例规则进行配置

```c
            this.$msg({
                title: '标题2',
                msg: '内容2',
                confirmText: '确定2',
                // cancelText: '取消2',
                success: (res) => {
                    if (res.confirm) {

                    } else if (res.cancel) {

                    }
                }
            })
```
