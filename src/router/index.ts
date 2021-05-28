import Router from "vue-router";
import store from "@/stores";
import DeviceView from "@/views/DeviceView.vue";
import ErrorView from "@/views/ErrorView.vue";
import GroupsView from "@/views/GroupsView.vue";
import GroupView from "@/views/GroupView.vue";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RecordingsView from "@/views/RecordingsView.vue";
import RegisterView from "@/views/RegisterView.vue";
import RecordingView from "@/views/RecordingView.vue";
import MonitoringView from "@/views/MonitoringView.vue";
import AddEmailView from "@/views/AddEmailView.vue";
import AnalysisView from "@/views/AnalysisView.vue";
import VisitsView from "@/views/VisitsView.vue";
import TaggingView from "@/views/TaggingView.vue";
import EndUserAgreementView from "@/views/EndUserAgreementView.vue";
import MonitoringTimeline from "@/views/MonitoringTimeline.vue";

// TODO(jon): We should be lazy loading some of these components for better code-splitting

function createRouter() {
  const router = new Router({
    mode: "history",
    fallback: false,
    scrollBehavior: () => ({
      x: 0,
      y: 0,
    }),
    routes: [
      {
        path: "/groups/:groupName/device/:deviceName/:tabName?",
        name: "device",
        component: DeviceView,
      },
      {
        path: "/error",
        component: ErrorView,
      },
      {
        path: "/groups",
        name: "groups",
        component: GroupsView,
      },
      {
        path: "/groups/:groupName/:tabName?",
        name: "group",
        component: GroupView,
      },
      {
        path: "/",
        name: "home",
        component: HomeView,
      },
      {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: {
          noAuth: true,
        },
      },
      {
        path: "/recordings",
        component: RecordingsView,
      },
      {
        path: "/monitoring",
        component: MonitoringView,
      },
      {
        path: "/monitoring-timeline",
        component: MonitoringTimeline,
      },
      {
        path: "/register",
        component: RegisterView,
        meta: {
          noAuth: true,
        },
      },
      {
        path: "/recording/:id/:trackId?",
        component: RecordingView,
      },
      {
        path: "/add_email",
        name: "addEmail",
        component: AddEmailView,
        meta: {
          noEmail: true,
        },
      },
      {
        path: "/analysis",
        name: "analysis",
        component: AnalysisView,
      },
      {
        path: "/visits",
        name: "visits",
        component: VisitsView,
      },
      {
        path: "/tagging",
        name: "tagging",
        component: TaggingView,
      },
      {
        path: "/end_user_agreement",
        name: "endUserAgreement",
        component: EndUserAgreementView,
      },
    ],
  });

  router.beforeEach(async (to, from, next) => {
    const now = new Date().getTime();
    const euaUpdatedAt = new Date(store.getters["User/euaUpdatedAt"]).getTime();
    // Update latest User Agreement once an hour
    if (now - euaUpdatedAt > 1000 * 60 * 60) {
      await store.dispatch("User/GET_END_USER_AGREEMENT_VERSION");
    }
    const isLoggedIn = store.getters["User/isLoggedIn"];
    const hasEmail = store.getters["User/hasEmail"];
    const acceptedEUA = store.getters["User/acceptedEUA"];
    if (isLoggedIn && hasEmail && acceptedEUA) {
      if (
        ["login", "register", "addEmail", "endUserAgreement"].includes(to.name)
      ) {
        return next({
          name: "home",
        });
      } else {
        return next();
      }
    } else if (isLoggedIn && !hasEmail) {
      if (to.name !== "addEmail") {
        return next({
          name: "addEmail",
        });
      } else {
        return next();
      }
    } else if (isLoggedIn && !acceptedEUA) {
      if (to.name !== "endUserAgreement") {
        return next({
          name: "endUserAgreement",
          query: {
            nextUrl: to.fullPath,
          },
        });
      } else {
        return next();
      }
    } else if (to.matched.some((record) => record.meta.noAuth)) {
      return next();
    }
    next({
      path: "/login",
      query: {
        nextUrl: to.fullPath,
      },
    });
  });

  return router;
}

export default createRouter();
