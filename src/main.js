import * as area from './data/GEBIEDEN22.json';
import * as bev from './data/bev_amsterdam.json';
import Vue from 'vue'
import Vuex from 'vuex';
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'


Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    amsterdamArea: area.default,
    amsterdamBev: bev
  }
});
new Vue({
  render: h => h(App),
  store,
}).$mount('#app')
