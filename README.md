# 大屏开发框架

## 更新

- 2018-11-22

1. 重构了Screen组件，删除Layout，简化配置项，如下：

```
config: {
    // dom id
    id: null,
    // 基础配置
    base: {
        class: null,
        style: null,
    },
    // 菜单配置
    menu: {
    // 一级菜单索引
    index: 0,
    // 二级菜单默认激活索引
    subIndex: 0,
    },
    // 地图组件配置
    map: [],
    // 地图以外的各区域的组件布局，每个layout对应一个二级菜单
    // 每个layout的索引与subIndex相等时显示
    layouts: [{
        // 左面板配置
        leftPanel: [{
            path: 'components/base/Plugin',
            config: {
                id: 'abc',
                option: {type: 'container', html: 'hello world!'}
            }
        }],
        // 右面板配置
        rightPanel: [],
        // 左漂浮面板配置
        leftFloat: [],
        // 右漂浮面板配置
        rightFloat: [],
        // 漂浮条配置
        floatBar: [],
        // 漂浮组件配置
        floatCmp: [],
    }, {
        // 另一个layout
    }],
    // 状态绑定规则，其中 menuIndex 和 subMenuIndex 为保留名称，禁止使用
    binder: {}
    }
}
```

2. 重构了基本组件，设置了顶级子组件`src/components/base/Base.vue`，组件的基本配置如下：

```
config: {
    // id
    id: null,
    // 基本配置
    base: {
    	// 显示/隐藏，此处由hidden改为show，避免反向思考的逻辑地狱
        show: true,
        // dom的class
        class: null,
        // 样式，除了以下尺寸和定位外，还可以接受其他参数，
        // 例如：backgroundColor，fontSize等，可参考vue的:style样式绑定规则
        // 其中，`position='absolute'`为固定样式，无法修改
        style: {
            top: 0,
            left: 0,
            width: 400,
            height: 300,
            zIndex: 0,
        },
     },
     // 原始数据存储位置，包括远端数据或静态数据
     data: null,
     // 组件配置项，根据组件不同而不同
     option: null,
     // 数据代理
     proxy: {
         // 是否从服务端取数，如果否，则不会执行AJAX请求
         remote: true,
         url: null,
         method: 'GET',
         param: null
     },
     // 储存绑定全局状态的本地变量，需显式声明
     state: {
     },
     // 数据绑定规则
     binder: {
         // name: 绑定规则命名
         // prop: 当前组件的属性路径，进行数据绑定的属性，必须在实例化后存在显式声明，
         // 例如：param.region，必须在config中配置 config: { param: {region: null} }
         // storeProp: Vuex中的属性路径
         // prop与storeProp进行单向数据绑定，当storeProp变化时，prop随之变化，
         // 并会触发当前组件的watch
         name:[prop, storeProp]
      },
      event: {
          // 初始化前
          beforeInit: (this) => {},
          // 初始化完成
          onInit: (this) => {},
          // 获得数据后，加载配置钱
          beforeRender: (data, option, this) => {}
          // 加载配置后，如果加载配置的过程出现异步，则会在异步回调开始前触发
          onRender: (this) => {},
      }
}
```

3. 分离了Menu和SubMenu，使其适配一二级菜单分离的场景；
4. 修复了Chart隐藏后再显示时，尺寸不正常的问题；


## 1. 概述

开发框架主要面向大屏的开发进行设计，基于Vue 2.x + ElementUI进行开发，使用Webpack打包，所以不支持IE8及更早版本，只支持所有兼容ES5的浏览器。主要进行了以下工作：

- 大屏（Screen）和各类组件（Component）进行了抽象和封装，包括表格（Table）、图表（Chart）、地图（Map）、插件（Plugin）、引用（Iframe）；
- 组件库和样式分离，在具体页面（View）开发时进行集成；
- Vuex实现状态的订阅和分发；



## 2. 开发规范

为了规范开发行为，减少合作开发的冲突，便于后期维护，进行如下规范：

- 技术负责人对Vuex状态存储统筹规划和划分模块，避免模块间的状态冲突；

- 组件库由专人维护，维护人员进行修改后，必须进行更新内容分发，通知所有开发人员；
- 未得到授权的开发人员只可提意见，不可修改（包含bug修复）；



## 3. 工程目录 

```
src
 |- assets		资源文件夹
 	 |- images	图片资源
 	 |- styles	Less样式
 |- components	组件库
 |- config		全局配置文件
 	 |- api.js	管理所有后台服务URL
 	 |- config.js	常量声明管理
 |- fonts		iconfont文件夹
 |- router		路由管理
 |- store		Vuex状态存储
 |- utils		工具库
 |- views		业务页面，主要开发工作内容
 |- static		静态资源
 	 |- data	静态数据，在正式发布时用到的数据
 	 |- test	测试数据，开发/测试时使用，正式发布时弃用的静态资源，例如演示用数据
 |- App.vue
 |- main.js
```



## 4. 架构

![image-20181122152413205](https://ws1.sinaimg.cn/large/006tNbRwgy1fxgvbn0yw9j31ji0qiql6.jpg)

- 带阴影框表示页面（View），无阴影框表示组件（Component），虚线框表示插槽（Slot）；

- 各插槽中的组件全部通过配置动态调用；



## 5. 组件生命周期

![image-20180822154042130](https://ws1.sinaimg.cn/large/006tNbRwgy1fuiisamjg8j31k00viaff.jpg)

- Vuex作为全局状态存储；

- 各组件创建后，根据binder配置信息向Vuex订阅数据，将自身属性与Vuex储存的状态进行绑定，

此处为单向绑定，当Vuex状态变更时，会对各相关组件的属性进行修改，而组件自身属性修改

不会影响Vuex状态；

- 组件如需修改Vuex状态，通过组件内置方法commit进行提交；
- 提交修改后，Vuex会对订阅该状态的各组件推送修改；
- 组件收到推送后，会触发监听，在监听中对组件本身进行重载或修改；
- 组件销毁前，会取消所有订阅。



## 6. 组件

所有组件（包括自定义组件）统一对外暴露config属性，用于接收配置项。



### 6.1 Screen - 大屏

```
config: {
    // dom id
    id: null,
    // 基础配置
    base: {
        class: null,
        style: null,
    },
    // 菜单配置
    menu: {
    // 一级菜单索引
    index: 0,
    // 二级菜单默认激活索引
    subIndex: 0,
    },
    // 地图组件配置
    map: [],
    // 地图以外的各区域的组件布局，每个layout对应一个二级菜单
    // 每个layout的索引与subIndex相等时显示
    layouts: [{
        // 左面板配置
        leftPanel: [{
            path: 'components/base/Plugin',
            config: {
                id: 'abc',
                option: {type: 'container', html: 'hello world!'}
            }
        }],
        // 右面板配置
        rightPanel: [],
        // 左漂浮面板配置
        leftFloat: [],
        // 右漂浮面板配置
        rightFloat: [],
        // 漂浮条配置
        floatBar: [],
    }, {
        // 另一个layout
    }],
    // 状态绑定规则，其中 menuIndex 和 subMenuIndex 为保留名称，禁止使用
    binder: {}
    }
}
```



### 6.2 Base - 基础父组件

```
config: {
    // id
    id: null,
    // 基本配置
    base: {
    	// 显示/隐藏，此处由hidden改为show，避免反向思考的逻辑地狱
        show: true,
        // dom的class
        class: null,
        // 样式，除了以下尺寸和定位外，还可以接受其他参数，
        // 例如：backgroundColor，fontSize等，可参考vue的:style样式绑定规则
        // 其中，`position='absolute'`为固定样式，无法修改
        style: {
            top: 0,
            left: 0,
            width: 400,
            height: 300,
            zIndex: 0,
        },
     },
     // 原始数据存储位置，包括远端数据或静态数据
     data: null,
     // 组件配置项，根据组件不同而不同
     option: null,
     // 数据代理
     proxy: {
         // 是否从服务端取数，如果否，则不会执行AJAX请求
         remote: true,
         url: null,
         method: 'GET',
         param: null
     },
     // 储存绑定全局状态的本地变量，需显式声明
     state: {
     },
     // 数据绑定规则
     binder: {
         // name: 绑定规则命名
         // prop: 当前组件的属性路径，进行数据绑定的属性，必须在实例化后存在显式声明，
         // 例如：param.region，必须在config中配置 config: { param: {region: null} }
         // storeProp: Vuex中的属性路径
         // prop与storeProp进行单向数据绑定，当storeProp变化时，prop随之变化，
         // 并会触发当前组件的watch
         name:[prop, storeProp]
      },
      event: {
          // 初始化前
          beforeInit: (this) => {},
          // 初始化完成
          onInit: (this) => {},
          // 获得数据后，加载配置前
          beforeRender: (data, option, this) => {}
          // 加载配置后，如果加载配置的过程出现异步，则会在异步回调开始前触发
          onRender: (this) => {},
      }
}
```

方法：

- 修改Vuex Store的值

```
commit: function(stateProp, value) { }
stateProp：vuex store中的属性，例如screen.govern.showCamera
value：给所有绑定的属性赋值
```



- 修改数据绑定的值

```
commitBinder: function(binderName, value) { }
binderName：binder规则的name属性
value：给所有绑定的属性赋值
```



### 6.3 Plugin - 插件

```
config: {
    // 各类元素的配置参数：
    //// 按钮
    option: {
        type: 'button',
        style: 'plain-原始 / round-圆角 / circle-圆形',
        icon: '',
        html: '提交',
        disabled: false,
    },
    event: {
        onClick: (plugin) => { }
    },

    //// 按钮组
    option: {
        type: 'button-group',
        data: [
            {html: '上页', disabled: false},
            {html: '下页', disabled: true}
        ],
    },
    event: {
        onClick: (index, plugin) => { }
    },

    //// Radio
    option: {
        type: 'radio',
        style: 'button',
        value: null,
        data: [
            {value: 0, icon: 'icon-play', text: '选项1', disabled: false},
            {value: 1, icon: 'icon-play', text: '选项2', disabled: false},
        ],
    },
    event: {
        onChange: (label, index, option, plugin) => { }
    },

    //// Checkbox
    option: {
        type: 'check',
        // 样式，button / undefined
        style: 'button',
        value: [],
        data: [
            {value: 0, icon: 'icon-play', text: '选项1', checked: false, disabled: false},
            {value: 1, icon: 'icon-play', text: '选项2', checked: false, disabled: false},
        ],
    },
    event: {
        onChange: (value, index, option, plugin) => { }
    },

    //// 下拉框
    option: {
        type: 'select',
        disabled: false,
        clear: true,
        multiple: true,
        value: null,
        placeholder: '请选择',
        data: [
            {text: '选项1', value: '选项1', disabled: false},
            {text: '选项2', value: '选项2', disabled: false},
        ],
    },
    event: {
        onChange: (value, selectedValues, plugin) => { }
        onFocus: (event, plugin) => { }
        onBlur: (event, plugin) => { }
        onClear: (plugin) => { }
    },

    //// 输入框
    option: {
        type: 'input',
        disabled: false,
        clearable: false,
        value: null,
        placeholder: '请输入',
    },
    event: {
        onChange: (value, plugin) => { }
        onFocus: (event, plugin) => { }
    	onBlur: (event, plugin) => { }
    	onClear: (plugin) => { }
    },

    //// 标签
    option: {
        type: 'label',
        html: "",
    },

    //// 图片
    option: {
        type: 'image',
        src: "",
        alt: "",
    },

    //// 链接
    option: {
        type: 'link',
        html: "",
    },
    event: {
        onClick: (plugin) => { }
    },

    //// 链接组
    option: {
        type: 'link-group',
        data: [
            {html: '上页', disabled: false},
            {html: '下页', disabled: true}
        ],
    },
    event: {
        onClick: (index, plugin) => { }
    },

    //// DIV
    option: {
        type: 'container',
        html: html内容
    },
}
```

方法：

- 修改Vuex Store的值

```
commit: function(stateProp, value) { }
stateProp：vuex store中的属性，例如screen.govern.showCamera
value：给所有绑定的属性赋值
```



- 修改数据绑定的值

```
commitBinder: function(binderName, value) { }
binderName：binder规则的name属性
value：给所有绑定的属性赋值
```



### 6.4 Chart - 图表

```
config: {
    // 报表配置，参考echarts配置
    option: null

    // 事件
    event: {
    // 参考echarts的鼠标事件
	},
}
```

方法：

- 修改Vuex Store的值

```
commit: function(stateProp, value) { }
stateProp：vuex store中的属性，例如screen.govern.showCamera
value：给所有绑定的属性赋值
```



- 修改数据绑定的值

```
commitBinder: function(binderName, value) { }
binderName：binder规则的name属性
value：给所有绑定的属性赋值
```



### 6.5 Table - 表格

```
config: {
    // 表格配置
    option: {
        columns: [{
            // 此列对应的数据的属性
            prop: "name",
            // 此列对应的抬头文本
            text: "姓名",
            // 列固定
            fixed: false,
            // 带排序
            sortable: false,
        }],
        // 数据
        data: [],
        // 带条纹
        stripe: false,
        // 带边框
        border: false,
        // 超过最大高度可以固定表头
        maxHeight: 250
        // 高亮选中行
        highlightCurrentRow: false,
        // 默认排序
        defaultSort: {
            // 属性名
            prop: 'date',
            // 顺序ascending / 倒序descending
            order: 'descending'
        },
    },
    // 事件
    event: {
        // 初始化完成
        onInit: (plugin) { },
        // 加载完成
        onLoad: (plugin) { },
        // 点击行
        onRowClick: (row, column, cell, table) => { }
        // 点击单元格
        onCellClick: (row, event, column, table) => { }
        // 点击表头
        onHeaderClick: (column, event, table) => { }
    },
}
```

方法：

- 修改Vuex Store的值

```
commit: function(stateProp, value) { }
stateProp：vuex store中的属性，例如screen.govern.showCamera
value：给所有绑定的属性赋值
```



- 修改数据绑定的值

```
commitBinder: function(binderName, value) { }
binderName：binder规则的name属性
value：给所有绑定的属性赋值
```



- 重新加载报表

```
reload: function() { }
```



### 6.6 Iframe

```
// 配置项
config: {
  option: {
    url: iframe引用页面的地址
  },
}

// 消息对象
{
    id: 消息id,
    type: "send",
    parentId: 父组件id,
    action: 操作,
    data: 参数
}

// 结果对象
{
    id: 消息id,
    type: "back",
    parentId: 组件标识符,
    success: 操作是否成功,
    message: 成功或失败异常等提示消息,
    data: 结果数据
}
```



### 6.7 Player

```
config: {
    // 配置
    option: {
        // 是否有播放功能，即播放停止按钮是否显示
        playable: true
        // 图表，iconfont的图标
        icon: {
            play: 'play',
            stop: 'stop',
            pause: 'pause'
        },
        // 播放间隔，秒
        interval: 1,
        // 提示class
        tooltipClass: '',
    },
    // 事件
    event: {
        // 初始化完成
        onInit: (plugin) { },
        // 加载完成
        onLoad: (plugin) { },
        // 到某个节点触发事件
        onHandlerNode: (index, data, player) { },
        // 播放时事件
        onPlay: (index, data, player) { },
        // 暂停时事件
        onPause: (player) { },
        // 停止时事件
        onStop: (player) { },
        // 重置时事件
        onReset: (player) { },
    },
}
```

方法：

- 修改Vuex Store的值

```
commit: function(stateProp, value) { }
stateProp：vuex store中的属性，例如screen.govern.showCamera
value：给所有绑定的属性赋值
```



- 修改数据绑定的值

```
commitBinder: function(binderName, value) { }
binderName：binder规则的name属性
value：给所有绑定的属性赋值
```



- 重新加载组件

```
reload: function() { }
```



- 播放

```
play: function() { }
```



- 暂停

```
pause: function() { }
```



- 停止

```
stop: function() { }
```



- 重置

```
reset: function() { }
```



## 7. 约定优于配置（重要）

为了加强项目的可维护性，进行如下开发约定：

- 禁止在全局范围内声明变量、函数，组件的属性方法声明在组件内部，公用库模块化后在各处引入；

- 所有URL必须在`src/config/api.js`中统一管理，各处通过常量属性引用；
- 所有常量在`src/config/config.js`中统一管理，各处通过常量属性引用；
- 组件将自身属性绑定到Vuex时，需要显式声明自身属性，否则会无法绑定；
- Vuex中被绑定的属性，需要显式声明为一个对象，值保存在value属性中，并写明注释，方便其他开发人员将属性绑定到对应的状态，声明方式如下：

```
// 地图是否显示摄像头位置
showCamera: { value: false },
```

- 自定义组件开发时，统一通过向外暴露config属性进行参数接收，否则无法动态加载；
- 所有组件的config必须声明一个id，用于唯一标识该组件，不可重复，命名规则如下：

```
// 主题+二级标题+组件内容+组件类型
// 组件类型为Chart, Map, Plugin, Table, Insight的首字母小写
id: "govern-pop-house-c"
```

