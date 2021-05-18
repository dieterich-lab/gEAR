const store = new Vuex.store({
  state: () => ({
    x_axis: null,
    y_axis: null,

    colorize_legend_by: null,
    plot_by_group: null,
    max_columns: null,
    skip_gene_plot: null,

    image_data: null,
    success: 0,
    message: "",
  }),
  mutations: {
    set_x_axis(state, x_axis) {
      state.x_axis = x_axis;
    },
    set_y_axis(state, y_axis) {
      state.y_axis = y_axis;
    },

    set_colorize_legend_by(state, legend_by) {
      state.colorize_legend_by = legend_by;
    },
    set_plot_by_group(state, group) {
      state.plot_by_group = group;
    },
    set_skip_gene_plot(state, skip_plot) {
      state.skip_gene_plot = skip_plot;
    },
    set_max_columns(state, max_cols) {
      state.max_columns = max_cols;
    },

    set_image_data(state, image_data) {
      state.image_data = image_data;
    },
    set_success(state, success) {
      state.success = success;
    },
    set_message(state, message) {
      state.message = message;
    },
  },
  actions: {
    set_image_data({ commit }, image_data) {
      commit("set_image_data", image_data);
    },
    set_success({ commit }, success) {
      commit("set_success", success);
    },
    set_message({ commit }, message) {
      commit("set_message", message);
    },
    async fetch_tsne_image(
      { commit },
      { config, plot_type, dataset_id, analysis_id }
    ) {
      commit("set_loading_chart", true);

      const { data } = await axios.get(`/api/plot/${dataset_id}/tsne`, {
        params: {
          gene: config.gene_symbol,
          analysis: analysis_id,
          colorize_by: config.colorize_legend_by,
          skip_gene_plot: config.skip_gene_plot,
          x_axis: config.x_axis,
          y_axis: config.y_axis,
          plot_type: plot_type,
          plot_by_group: config.plot_by_group,
          max_columns: config.max_columns,
          analysis_owner_id: this.user_id,
          colors: config.colors,
          order: config.order,
          // helps stop caching issues
          timestamp: new Date().getTime(),
        },
      });

      commit("set_order", config.order);
      commit("set_image_data", data.image);
      commit("set_loading_chart", false);
    },
  },
  getters: {},
});
