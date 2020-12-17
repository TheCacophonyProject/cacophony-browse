import Vue from "vue";
import Vuex from "vuex";
import User from "./modules/User.store";
import Devices from "./modules/Devices.store";
import Groups from "./modules/Groups.store";
import Video from "./modules/Video.store";
import Messaging from "./modules/Messaging.store";

Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    User,
    Groups,
    Messaging,
    Video,
    Devices,
  },
});
export default store;
