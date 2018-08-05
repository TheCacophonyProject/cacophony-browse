import Vue from 'vue';
import Router from 'vue-router';

import AudioBaitView from '../views/AudioBaitView.vue';
import AudioView from '../views/AudioView.vue';
import DevicesView from '../views/DevicesView.vue';
import DeviceView from '../views/DeviceView.vue';
import ErrorView from '../views/ErrorView.vue';
import GroupsView from '../views/GroupsView.vue';
import GroupView from '../views/GroupView.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RecordingsView from '../views/RecordingsView.vue';
import RegisterView from '../views/RegisterView.vue';
import VideoView from '../views/VideoView.vue';

Vue.use(Router);

function createRouter() {
  const router =  new Router({
    mode:'history',
    fallback:false,
    scrollBehavior:() => ({y:0}),
    routes:[
      {path:'/audiobait',component:AudioBaitView, meta: {requiresAuth: true}},
      {path:'/audio',component:AudioView, meta: {requiresAuth: true}},
      {path:'/devices',component:DevicesView, meta: {requiresAuth: true}},
      {path:'/devices/:devicename', name: 'device', component: DeviceView, meta: {requiresAuth: true}},
      {path:'/error',component:ErrorView, meta: {requiresAuth: true}},
      {path:'/groups', name: 'groups', component:GroupsView, meta: {requiresAuth: true}},
      {path:'/groups/:groupname', name: 'group', component: GroupView, meta: {requiresAuth: true}},
      {path:'/', name: 'home', component:HomeView, meta: {requiresAuth: true}},
      {path:'/login', name: 'login', component:LoginView},
      {path:'/recordings',component:RecordingsView, meta: {requiresAuth: true}},
      {path:'/register',component:RegisterView},
      {path:'/video/:id',component:VideoView, meta: {requiresAuth: true}}
    ]
  });

  router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('JWT');

    if (isLoggedIn) {
      if(to.name === 'login' || to.name === 'register') {
        return next({ name: 'home'});
      }else {
        return next();
      }
    } else if(to.matched.some(record => record.meta.requiresAuth)) {
      return next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      });
    }
    next();
  });

  return router;
}

export default createRouter();
