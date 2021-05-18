const store = new Vuex.store({
  state: () => ({
    x_axis: null,
    y_axis: null,
    z_axis: null,

    x_min: null,
    y_min: null,
    x_max: null,
    y_max: null,

    x_title: null,
    y_title: null,

    hide_x_labels: null,
    hide_y_labels: null,
    hide_legend: null,

    facet_row: null,
    facet_col: null,

    color_palette: null,
    reverse_palette: false,

    color_name: null,
    jitter: null,
    point_label: null,
    marker_size: null,
    size_by_group: null,
    vlines: [],

    chart_data: {},
  }),
  mutations: {
    set_x_axis(state, x_axis) {
      state.x_axis = x_axis;
    },
    set_y_axis(state, y_axis) {
      state.y_axis = y_axis;
    },
    set_z_axis(state, z_axis) {
      state.z_axis = z_axis;
    },

    set_x_min(state, x_min) {
      state.x_min = x_min;
    },
    set_y_min(state, y_min) {
      state.y_min = y_min;
    },
    set_x_max(state, x_max) {
      state.x_max = x_max;
    },
    set_y_max(state, y_max) {
      state.y_max = y_max;
    },

    set_x_title(state, x_title) {
      state.x_title = x_title;
    },
    set_y_title(state, y_title) {
      state.y_title = y_title;
    },

    set_hide_x_labels(state, hide) {
      state.hide_x_labels = hide;
    },
    set_hide_y_labels(state, hide) {
      state.hide_y_labels = hide;
    },
    set_hide_legend(state, hide) {
      state.hide_legend = hide;
    },

    set_facet_row(state, facet_row) {
      state.facet_row = facet_row;
    },
    set_facet_col(state, facet_col) {
      state.facet_col = facet_col;
    },

    set_color_palette(state, palette) {
      state.color_palette = palette;
    },
    set_reverse_palette(state, isReverse) {
      state.reverse_palette = isReverse;
    },

    set_color_name(state, color) {
      state.color_name = color;
    },
    set_jitter(state, jitter) {
      state.jitter = jitter;
    },
    set_point_label(state, point_label) {
      state.point_label = point_label;
    },
    set_marker_size(state, marker_size) {
      state.marker_size = marker_size;
    },
    set_size_by_group(state, size_by_group) {
      state.size_by_group = size_by_group;
    },
    set_vlines(state, vlines) {
      state.vlines = vlines;
    },
    set_success(state, success) {
      state.success = success;
    },
    set_message(state, message) {
      state.message = message;
    },
    set_chart_data(state, data) {
      state.chart_data = { ...data };
    },
  },
  actions: {
    async fetch_plotly_data({ commit }, { config, plot_type, dataset_id }) {
      commit("set_loading_chart", true);
      const payload = { ...config, plot_type };
      const { data } = await axios.post(`/api/plot/${dataset_id}`, payload);
      commit("set_chart_data", data);

      const {
        plot_colors,
        plot_palette,
        reverse_palette,
        plot_order,
        x_axis,
        y_axis,
        z_axis,
        point_label,
        hide_x_labels,
        hide_y_labels,
        hide_legend,
        color_name,
        facet_row,
        facet_col,
        size_by_group,
        marker_size,
        jitter,
        x_min,
        y_min,
        x_max,
        y_max,
        x_title,
        y_title,
        vlines,
        success,
        message,
      } = data;

      commit("set_order", plot_order);
      commit("set_colors", plot_colors);
      commit("set_color_palette", plot_palette);
      commit("set_reverse_palette", reverse_palette);
      commit("set_x_axis", x_axis);
      commit("set_y_axis", y_axis);
      commit("set_z_axis", z_axis);
      commit("set_point_label", point_label);
      commit("set_hide_x_labels", hide_x_labels);
      commit("set_hide_y_labels", hide_y_labels);
      commit("set_hide_legend", hide_legend);
      commit("set_color_name", color_name);
      commit("set_facet_row", facet_row);
      commit("set_facet_col", facet_col);
      commit("set_size_by_group", size_by_group);
      commit("set_marker_size", marker_size);
      commit("set_jitter", jitter);
      commit("set_x_min", x_min);
      commit("set_y_min", y_min);
      commit("set_x_max", x_max);
      commit("set_y_max", y_max);
      commit("set_x_title", x_title);
      commit("set_y_title", y_title);
      commit("set_vlines", vlines);
      commit("set_success", success);
      commit("set_message", message);

      commit("set_loading_chart", false);
    },
    set_color_palette({ commit }, palette) {
      commit("set_color_palette", palette);
    },
    set_reverse_palette({ commit }, isReverse) {
      commit("set_reverse_palette", isReverse);
    },
  },
  getters: {},
});
