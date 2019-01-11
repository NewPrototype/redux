import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

/**
 * Creates a Redux store that holds the state tree.
 * 创建redux 永久 保存state值的 树
 * The only way to change the data in the store is to call `dispatch()` on it.
 * 更改store中data唯一的方式操作`dispatch()`
 *
 * There should only be a single store in your app. 
 * app应该只有唯一的存储仓库
 * To specify how different parts of the state tree respond to actions,
 * 指定状态树的不同部分如何响应操作
 *  you may combine several reducers into a single reducer function by using `combineReducers`.
 * 你可以 使用 combineReducers  将reducers 组合成一个reducer 函数
 * 
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 * reducer 是一个函数返回的下一个状态树，当前状态和活动的操作
 * 
 * @param {any} [preloadedState]  预加载状态
 * The initial state.
 * 这是初始状态
 * You may optionally specify it to hydrate the state from the server in universal apps,or to restore a previously serialized user session.
 * 您可以选择将其指定为在通用应用程序中从服务器补水状态，或恢复以前序列化的用户会话
 * If you use `combineReducers` to produce the root reducer function, this must be n object with the same shape as `combineReducers` keys.
 *你可以使用 combineReducers 生成 根部 reducer 函数 ，这必须是n个和 'combineReducers'key相似的对象
 * @param {Function} [enhancer] 强化剂
 * The store enhancer. 
 * 商店的强化剂
 * You may optionally specify it to enhance the store with third-party capabilities such as middleware,time travel, persistence, etc. 
 * 您可以选择指定它来使用第三方功能(如中间件)来增强存储，时间旅行、坚持等等。
 * The only store enhancer that ships with Redux is `applyMiddleware()`.
 * Redux附带的唯一存储增强器是“applyMiddleware()”。
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore(reducer, preloadedState, enhancer) {
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function'
    )
    //看起来您正在向createStore()传递几个存储增强器。这是不支持的。相反，将它们组合成一个函数
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * Reads the state tree managed by the store.
   * 读取托管的状态树
   *
   * @returns {any} The current state tree of your application. 返回当前状态
   */
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  /**
   * Adds a change listener.
   * 添加更改侦听器。
   *  It will be called any time an action is dispatched,
   * 它将在任何时候调用一个动作，
   * and some part of the state tree may potentially have changed. 
   * 状态树的某些部分可能已经改变。
   * You may then call `getState()` to read the current state tree inside the callback.
   * 然后可以调用' getState() '来读取回调中的当前状态树。
   * You may call `dispatch()` from a change listener, with the following caveats:
   **您 可以从更改侦听器调用“dispatch()”，但要注意以下事项:
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   * 每次“dispatch()”调用之前都会对订阅进行快照。如果在调用侦听器时订阅或取消订阅，
   * 这将不会对当前正在进行中的“dispatch()”产生任何影响。
   * 但是，下一个' dispatch() '调用，无论是否嵌套，
   * 都将使用订阅列表的最新快照。
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   * 侦听器不应该期望看到所有的状态更改，因为在调用侦听器之前，
   * 在嵌套的“dispatch()”中状态可能已经更新了多次。但是，
   * 可以保证在“dispatch()”启动之前注册的所有订阅者在退出时都将使用最新的状态被调用。
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * 每个分派都要调用的回调。
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {  //订阅器
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   * 分派一个动作。这是触发状态更改的惟一方法。
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   * 用于创建存储的“reducer”函数将使用当前状态树和给定的“action”调用。它的返回值将被视为树的**下一个**状态，并将通知更改侦听器。
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   * 基本实现只支持普通对象操作。如果您希望分派一个Promise、一个Observable、
   * 一个thunk或其他东西，那么您需要将您的store创建函数包装到相应的中间件中。
   * 例如，请参阅“redx -thunk”包的文档。即使中间件最终也将使用此方法分派普通对象操作。
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   * 表示“发生了什么变化”的普通对象。保持操作的序列化是一个好主意，这样您就可以记录和回放用户会话，或者使用时间旅行的“redu -devtools”。
   * 一个动作必须有一个“类型”属性，这个属性不能是“未定义的”。将字符串常量用于操作类型是一个好主意。
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   * 为方便起见，使用您分派的相同操作对象。
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   * 请注意，如果使用自定义中间件，它可能会包装' dispatch() '以返回其他内容(例如，您可以等待的承诺)。
   */
  function dispatch(action) { //派遣
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   * 替换存储区当前用于计算状态的减速机。
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   * 如果你的应用程序实现了代码分割，并且你想动态加载一些reducer，你可能需要这个。如果要为Redux实现热重加载机制，可能还需要这样做。
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {   //替换Reducer
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * 可观察/反应库的互操作性点。
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   * 状态变化的最小可观测值。有关更多信息，请参见可观察提案:https://github.com/tc39/proposal-observable
   */
  function observable() { //可观察
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  // 创建存储时，将分派一个“INIT”操作，以便每个reducer返回它们的初始状态。这有效地填充了初始状态树。
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
