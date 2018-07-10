import Vue from 'vue'
import Vuex from 'vuex'
import User from './User.store'
//import actions from './actions'
//import mutations from './mutations'
//import getters from './getters'

Vue.use(Vuex)
const store = new Vuex.Store({
	state: {
		count: 5
	},
	mutations: {
		increment (state) {
			state.count++
		}
	},
	modules: {
		User
	}
})
export default store
