<template>
  <div id="primary-config">
    <choose-display-type
      :analysis_id='config.analysis ? config.analysis.id : null'>
    </choose-display-type>
    <div v-if="is_type_plotly">
      <plotly-display></plotly-display>
    </div>
    <div v-else-if="is_type_svg">
      <svg-display></svg-display>
    </div>
    <div v-else-if="is_type_tsne">
      <tsne-display></tsne-display>
    </div>
  </div>
</template>

<script>
// primary-config.vue

const chooseDisplayType = httpVueLoader("./choose-display-type.vue");
const plotlyDisplay = httpVueLoader("./plotly-display.vue");
const svgDisplay = httpVueLoader("./svg-display.vue");
const tsneDisplay = httpVueLoader("./tsne-display.vue");

export const components={
  chooseDisplayType,
  plotlyDisplay,
  svgDisplay,
  tsneDisplay,
};
export const computed={
  ...Vuex.mapState(["config", "plot_type", "dataset_type"]),
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
    return (
      this.plot_type==="tsne_static"||
      this.plot_type==="umap_static"||
      this.plot_type==="pca_static"||
      this.plot_type==="tsne"
    );
  },
};
</script>
