const store = new Vuex.store({
  state: () => ({
    // these can be reset to default in the mutations
    plot_type: null,
    gene_symbol: "",
    label: "",
    colors: {},
    order: {},

    // These will be set upon initialization of module
    analysis: null,
    columns: [],
    available_plot_types: [],
    levels: {},

    loading_chart: false,
  }),
  mutations: {
    set_gene_symbol(state, gene_symbol) {
      state.config.gene_symbol = gene_symbol;
    },
    set_label(state, label) {
      state.label = label;
    },
    set_plot_type(state, plot_type) {
      // reset config, as different display types
      // has different configs
      state.gene_symbol = "";
      state.plot_type = plot_type;
     if (plot_type === "svg") {
       state.colors = {
          // default colors (purple)
          low_color: "#e7d1d5",
          mid_color: null,
          high_color: "#401362",
        };
      }
    },
    set_available_plot_types(state, available_plot_types) {
      state.available_plot_types = { ...available_plot_types };
    },
    set_analysis(state, analysis) {
      // reset config, as different display types
      // has different configs
      state.plot_type = null;
      state.available_plot_types = {};

      state.analysis = analysis;
    },
    set_columns(state, columns) {
      state.columns = [...columns];
    },
    set_levels(state, levels) {
      state.levels = { ...levels };
    },
    set_colors(state, colors) {
      if (typeof colors !== "string") state.colors = { ...colors };
    },
    set_order(state, order) {
      state.order = { ...order };
    },
    set_loading_chart(state, is_chart_loading) {
      state.loading_chart = is_chart_loading;
    },
    reset_display(state) {
      state.plot_type = null;
      state.gene_symbol = "";
      state.label = "";
      state.colors = {};
      state.order = {};
    },
  },
  actions: {
    reset({ commit }) {
      commit("set_label", "");
      commit("set_plot_type", null);
      commit("reset_display");
    },
    set_gene_symbol({ commit }, gene_symbol) {
      commit("set_gene_symbol", gene_symbol);
    },
    set_analysis({ commit }, analysis) {
      commit("set_analysis", analysis);
    },
    set_label({ commit }, label) {
      commit("set_label", label);
    },
    set_plot_type({ commit }, plot_type) {
      commit("set_plot_type", plot_type);
      // When display type is changed, we want to
      // reset these other settings so dependent
      // components
      commit("set_chart_data", {});
      commit("set_gene_symbol", "");
    },
    async fetch_available_plot_types(
      { commit, state },
      { user_id, session_id, dataset_id }
    ) {
      const { config } = state;
      const analysis_id = config.analysis ? config.analysis.id : null;
      const { data: available_plot_types } = await axios.post(
        `/api/h5ad/${dataset_id}/availableDisplayTypes`,
        {
          user_id,
          session_id,
          dataset_id,
          analysis_id,
        }
      );
      commit("set_available_plot_types", available_plot_types);
    },
    async fetch_h5ad_info({ commit }, payload) {
      const { dataset_id, analysis } = payload;

      let data;
      if (analysis) {
        const response = await axios.get(
          `/api/h5ad/${dataset_id}?analysis_id=${analysis.id}`
        );
        data = response.data;
      } else {
        const response = await axios.get(`/api/h5ad/${dataset_id}`);
        data = response.data;
      }
      const { obs_columns, obs_levels } = data;
      commit("set_columns", obs_columns);
      commit("set_levels", obs_levels);
    },
  },
  getters: {},
});
