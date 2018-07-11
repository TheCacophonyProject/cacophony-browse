import api from '../../api/index'

const state =  {
	isLoggingIn: false,
	didInvalidate: false,
	JWT: localStorage.getItem('JWT'),
	userData: {'username': localStorage.getItem('username')},
	errorMessage: undefined
}


// getters https://vuex.vuejs.org/guide/getters.html

const getters = {
	isLoggedIn: state => !!state.JWT
}

// actions https://vuex.vuejs.org/guide/actions.html
//Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
	LOGIN (context, payload) {
		context.commit('invalidateLogin')

		return new Promise((resolve, reject) => {
			api.user.login(payload.username, payload.password)
				.then(response => response.json())
				.then((json) => {
					if(!json.success) {
						context.commit('rejectLogin', json)
						reject(json)
					}
					api.user.persistUser(json.userData.username,json.token)
					context.commit('receiveLogin', json)
					resolve(json)
				})
		})

	},
	LOGOUT (context) {
		context.commit('invalidateLogin')
		api.user.logout()
	},
	REGISTER (context, payload) {
		return new Promise((resolve, reject) => {
			api.user.register(payload.username, payload.password)
				.then(response => response.json())
				.then((json) => {
					if(!json.success) {
						reject(json)
					}
					api.user.persistUser(json.userData.username,json.token)
					context.commit('receiveLogin', json)
					resolve(json)
				})
		})
	}
}

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
	invalidateLogin (state) {
		state.JWT = ""
	},
	rejectLogin (state, data) {
		state.JWT = '',
		state.errorMessage = data.messages || data.message
	},
	receiveLogin (state, data) {
		state.JWT = data.token
		state.userData= data.userData
	}
//	pushProductToCart (state, { id }) {
//		state.items.push({
//			id,
//			quantity: 1
//		})
//	},
//
//	incrementItemQuantity (state, { id }) {
//		const cartItem = state.items.find(item => item.id === id)
//		cartItem.quantity++
//	},
//
//	setCartItems (state, { items }) {
//		state.items = items
//	},
//
//	setCheckoutStatus (state, status) {
//		state.checkoutStatus = status
//	}
}

export default {
	namespaced: true, // If true access via this.$store.getters['User.isLoggedIn'] syntax
	state,
	getters,
	actions,
	mutations
}
