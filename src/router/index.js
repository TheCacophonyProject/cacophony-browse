import Vue from 'vue';
import Router from 'vue-router';
import store from '../stores';

import DevicesView from '../views/DevicesView.vue';
import DeviceView from '../views/DeviceView.vue';
import ErrorView from '../views/ErrorView.vue';
import GroupsView from '../views/GroupsView.vue';
import GroupView from '../views/GroupView.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RecordingsView from '../views/RecordingsView.vue';
import RegisterView from '../views/RegisterView.vue';
import RecordingVue from '../views/RecordingView.vue';
import AddEmailView from '../views/AddEmailView.vue';
import AnalysisView from '../views/AnalysisView.vue';
import AudioTaggingView from '../views/AudioTaggingView.vue';

Vue.use(Router);

function createRouter() {
  const router = new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({
      y: 0
    }),
    routes: [{
      path: '/devices',
      name: 'devices',
      component: DevicesView
    },
    {
      path: '/devices/:devicename',
      name: 'device',
      component: DeviceView
    },
    {
      path: '/error',
      component: ErrorView
    },
    {
      path: '/groups',
      name: 'groups',
      component: GroupsView
    },
    {
      path: '/groups/:groupname',
      name: 'group',
      component: GroupView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        noAuth: true
      }
    },
    {
      path: '/recordings',
      component: RecordingsView
    },
    {
      path: '/register',
      component: RegisterView,
      meta: {
        noAuth: true
      }
    },
    {
      path: '/recording/:id',
      component: RecordingVue
    },
    {
      path: '/add_email',
      name: 'addEmail',
      component: AddEmailView,
      meta: {
        noEmail: true
      }
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisView
    },
    {
      path: '/audiotagging',
      name: 'audioTagging',
      component: AudioTaggingView
    },
    ]
  });

  router.beforeEach((to, from, next) => {
    const isLoggedIn = store.getters['User/isLoggedIn'];
    const hasEmail = store.getters['User/hasEmail'];
    if (isLoggedIn && hasEmail) {
      if (['login', 'register', 'addEmail'].includes(to.name)) {
        return next({
          name: 'home'
        });
      } else {
        return next();
      }
    } else if (isLoggedIn && !hasEmail) {
      if (to.name !== 'addEmail') {
        return next({
          name: 'addEmail'
        });
      } else {
        return next();
      }
    } else if (to.matched.some(record => record.meta.noAuth)) {
      return next();
    }
    next({
      path: '/login',
      params: {
        nextUrl: to.fullPath
      }
    });
  });

  return router;
}

export default createRouter();
