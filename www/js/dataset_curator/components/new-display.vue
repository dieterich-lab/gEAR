<template>
  <b-container fluid id="new-display">
    <b-row>
      <b-col cols="2">
        <configuration-panel></configuration-panel>
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
          v-else-if="is_type_tsne && gene_selected"
          display
          :gene_symbol="config.gene_symbol"
        ></tsne-chart>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// new-display.vue

const plotlyChart = httpVueLoader("./plotly-chart.vue");
const svgChart = httpVueLoader("./svg-chart.vue");
const tsneChart = httpVueLoader("./tsne-chart.vue");
const configurationPanel = httpVueLoader("./configuration-panel.vue");

export const components={
  plotlyChart,
  svgChart,
  tsneChart,
  configurationPanel,
};
export const computed={
  ...Vuex.mapState(["config", "plot_type", "chart_data", "analysis"]),
  is_type_plotly() {
    return (
      this.plot_type==="bar"||
      this.plot_type==="scatter"||
      this.plot_type==="line"||
      this.plot_type==="violin"||
      this.plot_type==="contour"||
      this.plot_type==="tsne/umap_dynamic"
    );
  },
  is_type_svg() {
    return this.plot_type==="svg";
  },
  is_type_tsne() {
    // TODO: move to methods()
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
  gene_selected() {
    return this.config.gene_symbol;
  },
};
</script>
