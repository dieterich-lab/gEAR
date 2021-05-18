const store = new Vuex.Store({
  state: {
    display_id: null,

    is_public: false,
    title: "",
  },


  mutations: {




  },

  actions: {






    set_order({ commit }, order) {
      commit("set_order", order);
      commit("set_levels", order);
    },
    set_color({ commit }, { name, color }) {
      commit("set_color", { name, color });
    },
    set_colors({ commit }, colors) {
      commit("set_colors", colors);
    },




    set_display_data({ commit }, display) {
      let { label, plot_type, plotly_config: config } = display;

      commit("set_label", label);
      commit("set_plot_type", plot_type);
    },



  },
});
