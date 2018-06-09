import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export const mutations = {
  USER_LOGGED (state, user) {
    state.user = user
  }
}

export const actions = {
  userLogged ({commit}, user) {
    commit('USER_LOGGED', user)
  }
}

export default new Vuex.Store({
  state: {
    user: {}
  },
  actions,
  mutations,
});