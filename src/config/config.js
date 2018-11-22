const CONFIG = {
  AJAX: {
    POST: 'post',
    GET: 'get'
  },
  // Vuex mutations 方法名
  MUTATIONS: {
    REGISTER: 'REGISTER',
    MODIFY: 'MODIFY',
    UNREGISTER: 'UNREGISTER',

  },

  // 跨域消息文档
  CORS_MESSAGE: {
    TYPE: {
      SEND: 'send',
      BACK: 'back'
    },
    ACTION: {
      INIT: 'init',
      RELOAD: 'reload',
      RESIZE: 'resize',
      CLEAR: 'clear',
      DISPOSE: 'dispose',
      DISPATCH_ACTION: 'dispatchAction',
      SHOW_LOADING: 'showLoading',
      HIDE_LOADING: 'hideLoading',
      GET: 'get',
      EVENT: 'event',
    }
  }
};

export default CONFIG;
