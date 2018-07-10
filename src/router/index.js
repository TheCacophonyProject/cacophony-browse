import Vue from 'vue'
import Router from 'vue-router'

import AudioBaitView from '../views/AudioBaitView.vue'
import AudioView from '../views/AudioView.vue'
import DevicesView from '../views/DevicesView'
import ErrorView from '../views/ErrorView.vue'
import GroupsView from '../views/GroupsView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RecordingsView from '../views/RecordingsView.vue'
import RegisterView from '../views/RegisterView.vue'


Vue.use(Router)


export function createRouter() {
	return new Router({
		mode:'history',
		fallback:false,
		scrollBehavior:() => ({y:0}),
		routes:[
			{path:'/audiobait',component:AudioBaitView},
			{path:'/audio',component:AudioView},
			{path:'/devices',component:DevicesView},
			{path:'/error',component:ErrorView},
			{path:'/groups',component:GroupsView},
			{path:'/',component:HomeView},
			{path:'/login',component:LoginView},
			{path:'/recordings',component:RecordingsView},
			{path:'/register',component:RegisterView},
//			{path:'/',redirect:'/home'}
		]
	})
}
