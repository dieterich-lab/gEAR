const store = new Vuex.store({
  state: {
    dataset_id: "",
    dataset_type: "primary",
    default_display_id: 0,
    title: "",
    gene_symbols: [],

    user: null,
    owner_id: null,

    user_displays: [],
    owner_displays: [],

    //let plotConfig = {};  // Plot config that is passed to API or stored in DB
    //let displayId = null;
    //let obsLevels = null;

  },
  mutations: {
    set_dataset_id(state, dataset_id) {
      state.dataset_id = dataset_id;
    },
    set_dataset_type(state, dataset_type) {
      state.dataset_type = dataset_type;
    },
    set_default_display_id(state, default_display_id) {
      state.default_display_id = default_display_id;
    },
    set_is_public(state, is_public) {
      state.is_public = is_public;
    },
    set_title(state, title) {
      state.title = title;
    },
    set_gene_symbols(state, gene_symbols) {
      state.gene_symbols = [...gene_symbols];
    },
    set_user(state, user) {
      state.user = user;
    },
    set_owner_id(state, owner_id) {
      state.owner_id = owner_id;
    },
    set_user_displays(state, user_displays) {
      state.user_displays = [...user_displays];
    },
    set_owner_displays(state, owner_displays) {
      state.owner_displays = [...owner_displays];
    },
    update_display(state, display) {
      const { id } = display;
      const i = state.user_displays.findIndex((el) => el.id == id);
      Vue.set(state.user_displays, i, display);
    },
    delete_display(state, { display_id }) {
      state.user_displays = [
        ...state.user_displays.filter((display) => display.id != display_id),
      ];
    },
  },
  actions: {
    set_dataset_id({ commit }, dataset_id) {
      commit("set_dataset_id", dataset_id);
    },
    set_is_public({ commit }, is_public) {
      commit("set_dataset_id", is_public);
    },
    set_title({ commit }, title) {
      commit("set_title", title);
    },
    set_dataset_info({ commit }, payload) {
      const { dataset_id, title, owner_id, is_public } = payload;
      commit("set_dataset_id", dataset_id);
      commit("set_owner_id", owner_id);
      commit("set_is_public", is_public);
      commit("set_title", title);
    },
    set_dataset_type({ commit }, dataset_type) {
      commit("set_dataset_type", dataset_type);
      // When display type is changed, we want to
      // reset these other settings so dependent
      // components
      commit("set_plot_type", null);
      commit("set_chart_data", {});
      commit("set_gene_symbol", "");
      commit("set_analysis", null); //TODO: set in display.js
    },
    set_owner_id({ commit }, owner_id) {
      commit("set_owner_id", owner_id);
    },
    remove_display({ commit }, display_id) {
      commit("delete_display", display_id);
    },
    update_default_display_id({ commit }, { display_id }) {
      commit("set_default_display_id", display_id);
    },
    update_display({ commit }, display) {
      commit("update_display", display);
    },
    async fetch_dataset_info({ commit }, dataset_id) {
      commit("set_dataset_id", dataset_id);
      const { title, is_public, owner_id } = await $.ajax({
        url: "/cgi/get_dataset_info.cgi",
        type: "POST",
        data: { dataset_id },
        dataType: "json",
      });
      console.log("Dataset info was fetched");
      commit("set_owner_id", owner_id);
      commit("set_is_public", is_public);
      commit("set_title", title);
    },
    async fetch_default_display({ commit }, { user_id, dataset_id }) {
      const { default_display_id } = await $.ajax({
        url: "/cgi/get_default_display.cgi",
        type: "POST",
        data: { user_id, dataset_id },
        dataType: "json",
      });
      commit("set_default_display_id", default_display_id);
    },
    async fetch_user_displays({ commit }, { user_id, dataset_id }) {
      let displays = await $.ajax({
        url: "/cgi/get_dataset_displays.cgi",
        type: "POST",
        data: { user_id, dataset_id },
        dataType: "json",
      });
      commit("set_user_displays", displays);
    },
    async fetch_owner_displays({ commit }, { owner_id, dataset_id }) {
      const displays = await $.ajax({
        url: "/cgi/get_dataset_displays.cgi",
        type: "POST",
        data: { user_id: owner_id, dataset_id },
        dataType: "json",
      });

      commit("set_owner_displays", displays);
    },
    async fetch_gene_symbols({ commit }, { dataset_id, analysis_id }) {
      const base = `./api/h5ad/${dataset_id}/genes`;
      const query = analysis_id ? `?analysis=${analysis_id}` : "";

      const { data } = await axios.get(`${base}${query}`);
      commit("set_gene_symbols", data.gene_symbols);
    },
  },

  getters: {
    is_user_owner(state) {
      return state.user.id === state.owner_id;
    },
    user_display(state) {
      return (display_id) =>
        state.user_displays.find((display) => display.id == display_id);
    },
    owner_display(state) {
      return (display_id) =>
        state.owner_displays.find((display) => display.id == display_id);
    },
    user_displays(state) {
      return state.user_displays.map((display) => {
        return {
          is_default: state.default_display_id == display.id ? true : false,
          ...display,
        };
      });
    },
    owner_displays(state) {
      return state.owner_displays.map((display) => {
        return {
          is_default: state.default_display_id == display.id ? true : false,
          ...display,
        };
      });
    },
  },
});
