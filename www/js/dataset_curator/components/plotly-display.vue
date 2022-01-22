<template>
  <div v-if="plot_type === 'bar'" id="plotly-display">
    <div>
      <transition name="fade" mode="out-in">
        <bar-display v-if="!loading" :display_id="display_id"> </bar-display>
      </transition>
    </div>
  </div>
  <div v-else-if="plot_type === 'line'" id="plotly-display">
    <div>
      <transition name="fade" mode="out-in">
        <line-display v-if="!loading" :display_id="display_id"> </line-display>
      </transition>
    </div>
  </div>
  <div v-else-if="plot_type === 'violin'" id="plotly-display">
    <div>
      <transition name="fade" mode="out-in">
        <violin-display v-if="!loading" :display_id="display_id">
        </violin-display>
      </transition>
    </div>
  </div>
  <div v-else-if="plot_type === 'scatter'" id="plotly-display">
    <div>
      <transition name="fade" mode="out-in">
        <scatter-display v-if="!loading" :display_id="display_id">
        </scatter-display>
      </transition>
    </div>
  </div>
  <div v-else-if="plot_type === 'contour'" id="plotly-display">
    <div>
      <transition name="fade" mode="out-in">
        <contour-display v-if="!loading" :display_id="display_id">
        </contour-display>
      </transition>
    </div>
  </div>
  <div v-else-if="['tsne_dynamic', 'tsne/umap_dynamic'].includes(plot_type)" id="plotly-display">
    <div>
      <transition name="fade" mode="out-in">
        <tsne-plotly-display v-if="!loading" :display_id="display_id">
        </tsne-plotly-display>
      </transition>
    </div>
  </div>
</template>

<script>
// plotly-display.vue

const barDisplay = httpVueLoader("./bar-display.vue");
const lineDisplay = httpVueLoader("./line-display.vue");
const violinDisplay = httpVueLoader("./violin-display.vue");
const scatterDisplay = httpVueLoader("./scatter-display.vue");
const contourDisplay = httpVueLoader("./contour-display.vue");
const tsnePlotlyDisplay = httpVueLoader("./tsne-plotly-display.vue");

export const props={
  display_id: {
    type: String,
    default: null,
  },
};
export const components={
  barDisplay,
  lineDisplay,
  violinDisplay,
  scatterDisplay,
  contourDisplay,
  tsnePlotlyDisplay,
};
export function data() {
  return {
    loading: false,
  };
}
export const computed={
  ...Vuex.mapState(["dataset_id", "plot_type", "config", "chart_data"]),
  is_creating_new_display() {
    return this.display_id===null;
  },
  is_there_data_to_draw() {
    return (
      Object.entries(this.chart_data).length!==0&&
      this.chart_data.constructor===Object
    );
  },
};
export function created() {
  this.fetch_h5ad_info({
    dataset_id: this.dataset_id,
    analysis: this.config.analysis,
  });
  if(!this.is_creating_new_display) {
    // if we are creating a new display, we do not
    // want to automatically generate a chart, and
    // wait for user to specify config options
    const config=this.config;
    const plot_type=this.plot_type;
    const dataset_id=this.dataset_id;
    this.fetch_plotly_data({ config, plot_type, dataset_id });
  }
}
export const methods={
  ...Vuex.mapActions(["fetch_h5ad_info", "fetch_plotly_data"]),
  update_color({ name, color }) {
    const { data }=this.chart_data.plot_json;
    data
      .filter((el) => el.name===name)
      .forEach(({ marker }) => {
        marker.color=color;
      });

    const { colors }=this.config;
    colors[name]=color;

    // because vue wont detect these changes
    // we explitly reassign chart data with
    // new object
    this.chart_data={ ...this.chart_data };
  },
};
</script>
