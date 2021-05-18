const store = new Vuex.store({
  state: () => ({
    chart_data: {},
  }),
  mutations: {
    set_color(state, { name, color }) {
      // update plotly chart data
      const { data } = state.chart_data.plot_json;
      data
        .filter((el) => el.name === name)
        .forEach(({ marker }) => {
          marker.color = color;
        });
      state.colors[name] = color;

      // because vue wont detect these changes
      // we explitly reassign chart data with
      // new object
      state.chart_data = { ...state.chart_data };
    },
    set_chart_data(state, data) {
      state.chart_data = { ...data };
    },
  },
  actions: {
    async fetch_svg_data({ commit }, { gene_symbol, dataset_id }) {
      const { data } = await axios.get(
        `/api/plot/${dataset_id}/svg?gene=${gene_symbol}`
      );
      commit("set_chart_data", data);
    },
  },
  getters: {},
});
