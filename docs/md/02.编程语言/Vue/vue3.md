## vue3.5 

(1) **useTemplateRef** --> 我不理解

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// 第一个参数必须与模板中的 ref 值匹配
const input = useTemplateRef('my-input')

onMounted(() => {
  input.value.focus()
})
</script>

```

<template>
  <input ref="my-input" />
</template>

3.5以前是这样的:

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

## vue2 -> vue3

(1) **script setup**

​	vue3 推荐组合式<script setup>, 避免暴露大量的状态和方法

(2) **ref、reactive**, **toRef、toRefs**

​	当作vue2 的响应式的精细理解, 过程还是一样的: 虚拟DOM在nextTick刷新实际DOM, 刷新的范围由粗到细.

​	ref()、reactive() 将普通对象转为响应式对象(也就是getter、setter), 概念抽象到不理解:

​	(1) reactive() 不能是js原始类型, ref() 可以是任意类型, 官方建议是ref()

​	(2) ref() Object 以 reactive() 的方式进行 Proxy ??

​	(2) ref() 默认具有深层访问性, 而reactive() 只有浅层(也就是第一层)

如果只考虑怎么用的问题:

​	(1) js原始类型 -> ref()包装, 通过.value在代码中访问, 但绘制上时不必

​	(2) 其他的Object -> 理论上ref()包装更好, 但是也会reactive()包装, 再通过**toRef、toRefs**转换

```js
const open = ref(false);
const ids = ref([]);

const data = reactive({
  form: {},
  queryParams: {},
  rules: {}
});
const {queryParams, form, rules} = toRefs(data);
```

(3) **this**

​	在vue3 不再是this, 而是:

```js
const {proxy} = getCurrentInstance();	// proxy 相当于 this
```

(4) **event**

I. 访问原生 DOM 事件 -> 传入一个特殊的 `$event` 变量，或者使用内联箭头函数

```vue
<!-- 使用特殊的 $event 变量 -->
<button @click="warn('Form cannot be submitted yet.', $event)">
  Submit
</button>

<!-- 使用内联箭头函数 -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">
  Submit
</button>
```

```js
function warn(message, event) {
  // 这里可以访问原生事件
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
```

II. 上面的代码中的`event.preventDefault()` 可以使用v-on的**事件修饰符**替换，包含以下这些：

- `.stop`
- `.prevent`
- `.self`
- `.capture`
- `.once`
- `.passive`

```vue
<!-- 单击事件将停止传递 -->
<a @click.stop="doThis"></a>

<!-- 提交事件将不再重新加载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰语可以使用链式书写 -->
<a @click.stop.prevent="doThat"></a>

<!-- 也可以只有修饰符 -->
<form @submit.prevent></form>

<!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
<!-- 例如：事件处理器不来自子元素 -->
<div @click.self="doThat">...</div>
```

III. **按键修饰符** 参照官方文档

https://cn.vuejs.org/guide/essentials/event-handling.html#key-aliases

(5) **组件**

defineProps

defineEmits

defineExpose : 

​	script setup 的组件是**默认关闭**的——即通过模板引用或者 `$parent` 链获取到的组件的公开实例，**不会**暴露任何在 `script setup` 中声明的绑定



以翻页组件为例:

```vue
<pagination v-show="total>0" 
            :total="total" 
            :page.sync="listQuery.page" 
            :limit.sync="listQuery.limit" 
            @pagination="getList" />
```

```vue
<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>
```



```vue
<pagination v-show="total > 0" 
            :total="Number(total)" 
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" 
            @pagination="getList"/>
```

```vue
<script setup>
import {scrollTo} from '@/utils/scroll-to'

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50]
    }
  },
  // 移动端页码按钮的数量端默认值5
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits();
const currentPage = computed({
  get() {
    return props.page
  },
  set(val) {
    emit('update:page', val)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(val) {
    emit('update:limit', val)
  }
})

function handleSizeChange(val) {
  if (currentPage.value * val > props.total) {
    currentPage.value = 1
  }
  emit('pagination', {page: currentPage.value, limit: val})
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

function handleCurrentChange(val) {
  emit('pagination', {page: val, limit: pageSize.value})
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

</script>
```











