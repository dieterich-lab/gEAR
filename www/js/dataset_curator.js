'use strict';

/*
 This script relies on the source having also included the
 common.js within this project (for login purposes)
*/

// Import some Vue-related components
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

// Install VeeValidate components globally
Vue.component("ValidationObserver", VeeValidate.ValidationObserver);
Vue.component("ValidationProvider", VeeValidate.ValidationProvider);

// Load .vue pages in as JS
const datasetCurator = httpVueLoader(
  "./js/dataset_curator/components/dataset-curator.vue"
);
const datasetDisplays = httpVueLoader(
  "./js/dataset_curator/components/dataset-displays.vue"
);
const newDisplay = httpVueLoader(
  "./js/dataset_curator/components/new-display.vue"
);
const datasetDisplay = httpVueLoader(
  "./js/dataset_curator/components/dataset-display.vue"
);

const store = new Vuex.Store({
  state: {
    user: null,
    display_id: null,
    user_displays: [],
    owner_displays: [],
    default_display_id: 0,
    dataset_id: "",
    owner_id: null,
    config: {
      gene_symbol: "",
      analysis: null,
      colors: null, // Color mapping for dataseries groups
      color_palette: null, // Predefined swatches for continuous data
      reverse_palette: false,
      order: null,
      // Other properties will be set reactive (must add via Vue.set)
      // depending on the chart type
      // TODO: Branch off into its own module with states/getters/mutations/actions
    },
    gene_symbols: [],
    dataset_type: "primary",
    // why is analysis here too and within config?
    analysis: null,
    columns: [],
    levels: {},
    chart_data: {},
    is_public: false,
    label: "",
    title: "",
    plot_type: null,
    loading_chart: false,
    available_plot_types: {},
    plot_type_cancel_source: null,    // Cancel token for API call
    image_data: null,
    tsne_is_loading: false,
    success: 0,
    message: "",
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

  mutations: {
    set_user(state, user) {
      state.user = user;
    },
    set_dataset_id(state, dataset_id) {
      state.dataset_id = dataset_id;
    },
    set_default_display_id(state, default_display_id) {
      state.default_display_id = default_display_id;
    },
    set_owner_id(state, owner_id) {
      state.owner_id = owner_id;
    },
    set_is_public(state, is_public) {
      state.is_public = is_public;
    },
    set_title(state, title) {
      state.title = title;
    },
    set_dataset_type(state, dataset_type) {
      state.dataset_type = dataset_type;
    },
    set_plot_type(state, plot_type) {
      // reset config, as different display types
      // has different configs
      state.config = {
        gene_symbol: "",
        analysis: state.config.analysis,
        colors: null,
      };

      if (
        plot_type === "bar" ||
        plot_type === "line" ||
        plot_type === "violin" ||
        plot_type === "scatter" ||
        plot_type === "contour" ||
        plot_type === "tsne/umap_dynamic"
      ) {
        Vue.set(state.config, "x_axis", null);
        Vue.set(state.config, "y_axis", null);
        Vue.set(state.config, "z_axis", null);
        Vue.set(state.config, "x_min", null);
        Vue.set(state.config, "y_min", null);
        Vue.set(state.config, "x_max", null);
        Vue.set(state.config, "y_max", null);
        Vue.set(state.config, "x_title", null);
        Vue.set(state.config, "y_title", null);
        Vue.set(state.config, "point_label", null);
        Vue.set(state.config, "hide_x_labels", false);
        Vue.set(state.config, "hide_y_labels", false);
        Vue.set(state.config, "hide_legend", false);
        Vue.set(state.config, "color_name", null);
        Vue.set(state.config, "facet_row", null);
        Vue.set(state.config, "facet_col", null);
        Vue.set(state.config, "size_by_group", null);
        Vue.set(state.config, "marker_size", null);
        Vue.set(state.config, "jitter", null);
        Vue.set(state.config, "vlines", []);
        Vue.set(state.config, "colors", {});
        Vue.set(state.config, "color_palette", null);
        Vue.set(state.config, "reverse_palette", false);
        Vue.set(state.config, "order", {});
      } else if (plot_type === "svg") {
        Vue.set(state.config, "colors", {
          // arbituary default colors (purple)
          low_color: "#e7d1d5",
          high_color: "#401362",
        });
      } else if (
        plot_type === "tsne_static" ||
        plot_type === "umap_static" ||
        plot_type === "pca_static" ||
        plot_type === "tsne"
      ) {
        // tsne
        Vue.set(state.config, "x_axis", null);
        Vue.set(state.config, "y_axis", null);
        Vue.set(state.config, "colors", {});
        Vue.set(state.config, "order", {});
        Vue.set(state.config, "colorize_legend_by", null);
        Vue.set(state.config, "plot_by_group", null);
        Vue.set(state.config, "max_columns", null);
        Vue.set(state.config, "skip_gene_plot", null);
      }
      state.plot_type = plot_type;
    },
    set_display_label(state, display_label) {
      state.display_label = display_label;
    },
    set_user_displays(state, user_displays) {
      state.user_displays = [...user_displays];
    },
    set_owner_displays(state, owner_displays) {
      state.owner_displays = [...owner_displays];
    },
    set_available_plot_types(state, available_plot_types) {
      state.available_plot_types = { ...available_plot_types };
    },
    set_plot_type_cancel_source (state, cancel_source) {
      state.cancel_source = cancel_source;
    },
    set_columns(state, columns) {
      state.columns = [...columns];
    },
    set_levels(state, levels) {
      state.levels = { ...levels };
    },
    reset_config(state) {
      state.config = { gene_symbol: "" };
    },
    set_config(state, config) {
      state.config = { ...config };
    },
    set_chart_data(state, data) {
      state.chart_data = { ...data };
    },
    set_x_axis(state, x_axis) {
      state.config.x_axis = x_axis;
    },
    set_y_axis(state, y_axis) {
      state.config.y_axis = y_axis;
    },
    set_z_axis(state, z_axis) {
      state.config.z_axis = z_axis;
    },
    set_x_min(state, x_min) {
      state.config.x_min = x_min;
    },
    set_y_min(state, y_min) {
      state.config.y_min = y_min;
    },
    set_x_max(state, x_max) {
      state.config.x_max = x_max;
    },
    set_y_max(state, y_max) {
      state.config.y_max = y_max;
    },
    set_x_title(state, x_title) {
      state.config.x_title = x_title;
    },
    set_y_title(state, y_title) {
      state.config.y_title = y_title;
    },
    set_vlines(state, vlines) {
      state.config.vlines = vlines;
    },
    set_point_label(state, point_label) {
      state.config.point_label = point_label;
    },
    set_hide_x_labels(state, hide) {
      state.config.hide_x_labels = hide;
    },
    set_hide_y_labels(state, hide) {
      state.config.hide_y_labels = hide;
    },
    set_hide_legend(state, hide) {
      state.config.hide_legend = hide;
    },
    set_color_name(state, color) {
      state.config.color_name = color;
    },
    set_facet_row(state, facet_row) {
      state.config.facet_row = facet_row;
    },
    set_facet_col(state, facet_col) {
      state.config.facet_col = facet_col;
    },
    set_size_by_group(state, size_by_group) {
      state.config.size_by_group = size_by_group;
    },
    set_marker_size(state, marker_size) {
      state.config.marker_size = marker_size;
    },
    set_jitter(state, jitter) {
      state.config.jitter = jitter;
    },
    set_order(state, order) {
      state.config.order = { ...order };
    },
    set_colors(state, colors) {
      if (typeof colors !== "string") state.config.colors = { ...colors };
    },
    set_color_palette(state, palette) {
      state.config.color_palette = palette;
    },
    set_reverse_palette(state, isReverse) {
      state.config.reverse_palette = isReverse;
    },
    set_color(state, { name, color }) {
      if (state.plot_type !== "svg") {
        // update plotly chart data
        const { data } = state.chart_data.plot_json;
        data
          .filter((el) => el.name === name)
          .forEach(({ marker }) => {
            marker.color = color;
          });
      }
      state.config.colors[name] = color;

      // because vue wont detect these changes
      // we explitly reassign chart data with
      // new object
      state.chart_data = { ...state.chart_data };
    },
    set_gene_symbol(state, gene_symbol) {
      state.config.gene_symbol = gene_symbol;
    },
    set_gene_symbols(state, gene_symbols) {
      state.gene_symbols = [...gene_symbols];
    },
    set_label(state, label) {
      state.label = label;
    },
    set_analysis_id(state, analysis) {
      state.config.analysis_id = analysis;
    },
    set_analysis(state, analysis) {
      // reset config, as different display types
      // has different configs
      state.config = {
        gene_symbol: "",
        colors: null,
      };
      state.plot_type = null;
      state.available_plot_types = {};

      state.analysis = analysis;
      state.config.analysis = analysis;
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
    set_loading_chart(state, is_chart_loading) {
      state.loading_chart = is_chart_loading;
    },
    set_colorize_legend_by(state, legend_by) {
      state.config.colorize_legend_by = legend_by;
    },
    set_skip_gene_plot(state, skip_plot) {
      state.config.skip_gene_plot = skip_plot;
    },
    set_plot_by_group(state, group) {
      state.config.plot_by_group = group;
    },
    set_max_columns(state, max_cols) {
      state.config.max_columns = max_cols;
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
    set_tsne_is_loading(state, is_loading) {
      state.tsne_is_loading = is_loading;
    },
  },

  actions: {
    set_dataset_type({ commit }, dataset_type) {
      commit("set_dataset_type", dataset_type);
      // When display type is changed, we want to
      // reset these other settings so dependent
      // components
      commit("set_plot_type", null);
      commit("set_chart_data", {});
      commit("set_gene_symbol", "");
      commit("set_analysis", null);
    },
    update_display_label({ commit }, display_label) {
      commit("set_display_label", display_label);
    },
    set_dataset_id({ commit }, dataset_id) {
      commit("set_dataset_id", dataset_id);
    },
    set_owner_id({ commit }, owner_id) {
      commit("set_owner_id", owner_id);
    },
    set_is_public({ commit }, is_public) {
      commit("set_dataset_id", is_public);
    },
    set_title({ commit }, title) {
      commit("set_title", title);
    },
    set_tsne_is_loading({ commit }, is_loading) {
      commit("set_tsne_is_loading", is_loading);
    },
    set_dataset_info({ commit }, payload) {
      const { dataset_id, title, owner_id, is_public } = payload;
      commit("set_dataset_id", dataset_id);
      commit("set_owner_id", owner_id);
      commit("set_is_public", is_public);
      commit("set_title", title);
    },
    set_plot_type({ commit }, plot_type) {
      commit("set_plot_type", plot_type);
      // When display type is changed, we want to
      // reset these other settings so dependent
      // components
      commit("set_chart_data", {});
      commit("set_gene_symbol", "");
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
    async fetch_available_plot_types(
      { commit, state },
      { user_id, session_id, dataset_id, analysis_id }
    ) {
      // Cancelling last axios call, if applicable
      if (state.cancel_source) {
        state.cancel_source.cancel('Newer "fetch_available_plot_types" call detected.');
      }

      // Create cancel token to cancel last request of this to prevent race condition
      // reference: https://github.com/axios/axios#cancellation
      const CancelToken = axios.CancelToken;
      const cancel_source = CancelToken.source()
      commit('set_plot_type_cancel_source', cancel_source);

      const { data: available_plot_types } = await axios.post(
        `/api/h5ad/${dataset_id}/availableDisplayTypes`,
        {
          user_id,
          session_id,
          dataset_id,
          analysis_id,
        },
        { cancelToken: cancel_source.token
        }).then(function (response) {
          commit('set_available_plot_types', response.data);
        }).catch(function (thrown) {
          if (axios.isCancel(thrown)) {
            console.log('Request canceled:', thrown.message);
          } else {
            // handle error
          }
        });
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
    async fetch_tsne_image(
      { commit },
      { config, plot_type, dataset_id, analysis_id }
    ) {
      commit("set_tsne_is_loading", true);

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
      commit("set_tsne_is_loading", false);
    },
    set_index({ commit }, index) {
      commit("set_index", index);
    },
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
    set_color_palette({ commit }, palette) {
      commit("set_color_palette", palette);
    },
    set_reverse_palette({ commit }, isReverse) {
      commit("set_reverse_palette", isReverse);
    },
    set_gene_symbol({ commit }, gene_symbol) {
      commit("set_gene_symbol", gene_symbol);
    },
    async fetch_gene_symbols({ commit }, { dataset_id, analysis_id }) {
      const base = `./api/h5ad/${dataset_id}/genes`;
      const query = analysis_id ? `?analysis=${analysis_id}` : "";

      const { data } = await axios.get(`${base}${query}`);
      commit("set_gene_symbols", data.gene_symbols);
    },
    set_label({ commit }, label) {
      commit("set_label", label);
    },
    set_display_data({ commit }, display) {
      let { label, plot_type, plotly_config: config } = display;

      commit("set_label", label);
      commit("set_plot_type", plot_type);
      commit("set_config", config);
    },
    reset({ commit }) {
      commit("set_label", "");
      commit("set_plot_type", null);
      commit("reset_config");
    },
    async fetch_svg_data({ commit }, { gene_symbol, dataset_id }) {
      const { data } = await axios.get(
        `/api/plot/${dataset_id}/svg?gene=${gene_symbol}`
      );
      commit("set_chart_data", data);
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
    set_analysis_id({ commit }, analysis) {
      commit("set_analysis_id", analysis);
    },
    set_analysis({ commit }, analysis) {
      commit("set_analysis", analysis);
    },
    update_display({ commit }, display) {
      commit("update_display", display);
    },
    set_image_data({ commit }, image_data) {
      commit("set_image_data", image_data);
    },
    set_success({ commit }, success) {
      commit("set_success", success);
    },
    set_message({ commit }, message) {
      commit("set_message", message);
    },
    remove_display({ commit }, display_id) {
      commit("delete_display", display_id);
    },
    update_default_display_id({ commit }, { display_id }) {
      commit("set_default_display_id", display_id);
    },
  },
});

const routes = [
  {
    path: "/dataset/:dataset_id/displays",
    component: datasetCurator,
    props: true,
    children: [
      {
        path: "",
        name: "dashboard",
        component: datasetDisplays,
      },
      {
        path: "new",
        name: "new",
        component: newDisplay,
        beforeEnter(to, from, next) {
          // We want to reset our data that may have been loaded
          // from a previous display
          store.dispatch("reset");
          next();
        },
      },
      {
        path: ":display_id/edit",
        name: "edit",
        component: datasetDisplay,
        props: true,
      },
    ],
  },
];

const router = new VueRouter({
  //default: "dashboard",
  routes,
});

const app = new Vue({
  router,
  store,
  beforeCreate() {
    // check if the user is already logged in
    check_for_login();
    // We want to check for session when the curator app is first created
    session_id = Cookies.get("gear_session_id");
  }
}).$mount("#app");
