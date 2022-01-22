<template>
  <b-container v-if="!loading" fluid id="dataset-display">
    <b-row>
      <b-col cols="2">
        <plotly-display
          v-if="is_type_plotly"
          :display_id="display_id"
        ></plotly-display>
        <svg-display
          v-if="is_type_svg"
          :display_id="display_id"
        ></svg-display>
        <tsne-display
          v-if="is_type_tsne"
          :display_id="display_id"
        ></tsne-display>
      </b-col>
      <b-col cols="10">
        <plotly-chart
          v-if="is_type_plotly && is_there_data_to_draw"
          :data="chart_data"
          class="sticky-chart"
        ></plotly-chart>
        <svg-chart
          v-else-if="is_type_svg && is_there_data_to_draw"
          :chart_data="chart_data"
          class="sticky-chart"
          :low_color="config.colors.low_color"
          :mid_color="config.colors.mid_color"
          :high_color="config.colors.high_color"
        >
        </svg-chart>
        <tsne-chart
          v-else-if="is_type_tsne"
          :analysis_id="config.analysis ? config.analysis.id : null"
          :gene_symbol="config.gene_symbol"
        ></tsne-chart>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// dataset-display.vue

const plotlyDisplay = httpVueLoader("./plotly-display.vue");
const svgDisplay = httpVueLoader("./svg-display.vue");
const tsneDisplay = httpVueLoader("./tsne-display.vue");
const svgChart = httpVueLoader("./svg-chart.vue");
const plotlyChart = httpVueLoader("./plotly-chart.vue");
const tsneChart = httpVueLoader("./tsne-chart.vue");

export const props={
  display_id: String,
};
export const components={
  plotlyDisplay,
  svgDisplay,
  tsneDisplay,
  svgChart,
  plotlyChart,
  tsneChart,
};
export function data() {
  return {
    loading: false,
  };
}
export const computed={
  ...Vuex.mapState(["plot_type", "chart_data", "config"]),
  ...Vuex.mapGetters(["user_display"]),
  is_creating_new_display() {
    return this.display_id==="new";
  },
  is_type_plotly() {
    // handle legacy tsne dynamic plot option
    var plot_type=this.plot_type;
    if(plot_type==='tsne_dynamic') {
      plot_type='tsne/umap_dynamic';
    }
    return (
      plot_type==="bar"||
      plot_type==="scatter"||
      plot_type==="line"||
      plot_type==="violin"||
      plot_type==="contour"||
      plot_type==="tsne/umap_dynamic"
    );
  },
  is_type_svg() {
    return this.plot_type==="svg";
  },
  is_type_tsne() {
    return (
      this.plot_type==="tsne_static"||
      this.plot_type==="umap_static"||
      this.plot_type==="pca_static"||
      this.plot_type==="tsne"
    );
  },
  is_there_data_to_draw() {
    return (
      Object.entries(this.chart_data).length!==0&&
      this.chart_data.constructor===Object
    );
  },
};
export function created() {
  const display_data=this.user_display(this.display_id);
  this.set_display_data(display_data);
}
export const methods={
  ...Vuex.mapActions(["set_display_data"]),
};
</script>
