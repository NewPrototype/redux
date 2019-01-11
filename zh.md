 #### 文件说明
 - applyMiddlewar.js 使用自定义的middleware来扩展Redux
 - bindActionCreators.js 把action creators 转换成拥有同名kes的对象，使用时直接使用
 - combineReducers.js 一个比较大的应用，需要对reducer函数进行拆分，拆分后的每一块独立负责管理独自的state
 - compose.js 从右到左来组合多个函数，函数编程中常用到
 - createStore.js 创建一个Redux Store 来放所有的state
 - utils/warnimng.js 控制台警告


#### redux 个人理解
```
import { Provider } from 'react-redux';
<Provider store={store}></Provider>

Provider 组件初始化时候会执行store.subscribe();
每一次执行dispatch（）都会执行所有的监听 listener();执行所有监听的getState();
reducer为什么是一个纯函数？因为返回的是新对象，通过比较前后state是否相等来决定是否渲染，使用immutable 能够快速的比较，降低了性能


```