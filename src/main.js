// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vuelazyload from 'vue-lazyload'
import Vuex from 'vuex'
import vueinfiniteScroll from 'vue-infinite-scroll'
import {currency} from './util/currency'

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(vuelazyload,{
	loading:"/static/loading-svg/loading-bars.svg"
})
Vue.use(vueinfiniteScroll)
Vue.filter("currency",currency)

const store = new Vuex.Store({
	state:{
		nickNames:'',
		cartCount:0
	},
	mutations:{
		updateUserInfo(state,nickName){
			state.nickName = nickName;
		},
		updateCartCount(state,cartCount){
			state.cartCount+=cartCount;
		},
		cartCount(state,cartCount){
			state.cartCount=cartCount;
		}
	}
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
