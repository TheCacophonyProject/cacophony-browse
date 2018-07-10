import api from '../api/index'

// initial state
// shape: [{ id, quantity }]
//const state = {
//	items: [],
//	checkoutStatus: null
//}

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

//	cartProducts: (state, getters, rootState) => {
//		return state.items.map(({ id, quantity }) => {
//			const product = rootState.products.all.find(product => product.id === id)
//			return {
//				title: product.title,
//				price: product.price,
//				quantity
//			}
//		})
//	},
//
//	cartTotalPrice: (state, getters) => {
//		return getters.cartProducts.reduce((total, product) => {
//			return total + product.price * product.quantity
//		}, 0)
//	}

}

// actions https://vuex.vuejs.org/guide/actions.html
//Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
	login () {
		api.user.login("blah", "pblah")
			.then(() => {

			}).catch()

	}
//	checkout ({ commit, state }, products) {
//		const savedCartItems = [...state.items]
//		commit('setCheckoutStatus', null)
//		// empty cart
//		commit('setCartItems', { items: [] })
//		shop.buyProducts(
//			products,
//			() => commit('setCheckoutStatus', 'successful'),
//			() => {
//				commit('setCheckoutStatus', 'failed')
//				// rollback to the cart saved before sending the request
//				commit('setCartItems', { items: savedCartItems })
//			}
//		)
//	},
//
//	addProductToCart ({ state, commit }, product) {
//		commit('setCheckoutStatus', null)
//		if (product.inventory > 0) {
//			const cartItem = state.items.find(item => item.id === product.id)
//			if (!cartItem) {
//				commit('pushProductToCart', { id: product.id })
//			} else {
//				commit('incrementItemQuantity', cartItem)
//			}
//			// remove 1 item from stock
//			commit('products/decrementProductInventory', { id: product.id }, { root: true })
//		}
//	}
}

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {


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
