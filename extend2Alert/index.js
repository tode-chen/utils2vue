import Vue from 'vue'
import Msg from './msg.vue'

let confirmStructor = Vue.extend(Msg) //返回一个实例创建的构造器，但实例构造器需要进行挂载到页面中

let theConfirm = (option) => {
        let confirmDom = new confirmStructor({
            data: {
                ...option
            }
        })
        //在body中动态创建一个div元素，之后此div将会替换成整个vue文件的内容
        //此时的confirmDom通俗讲就是相当于是整个组件对象，通过对象调用属性的方法来进行组件中数据的使用
        //可以通过$el属性来访问创建的组件实例
        confirmDom.$mount()
        document.body.appendChild(confirmDom.$el)
        
        //此时进行创建组件的逻辑处理
        // confirmDom.option = option //将需要传入的文本内容传给组件实例
        // confirmDom.onConfirm = () => { //箭头函数，在（）和{}之间增加=>,且去掉function
        //     confirmDom.option.success({
        //         confirm: true
        //     })
        //     confirmDom.flag = false;
        // }
        // confirmDom.onCancel = () => {
        //     confirmDom.option.success({
        //         cancel: true
        //     })
        //     confirmDom.flag = false;
        // }
}

//将逻辑函数进行导出和暴露
Vue.prototype.$msg = theConfirm