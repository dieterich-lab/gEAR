<template>
  <div id="tsne-dynamic-display">
    <gene-symbol-input
      v-model="config.gene_symbol"
      :analysis="config.analysis ? config.analysis.id : null"
      @gene-updated="is_gene_available = $event"
    ></gene-symbol-input>
    <transition name="fade" mode="out-in">
      <plotly-arguments v-if="config.gene_symbol !== '' && is_gene_available" />
    </transition>
    <slot name="chart"></slot>
    <transition name="fade" mode="out-in">
      <display-order
        v-if="
          'order' in config &&
          Object.entries(config.order).length !== 0 &&
          is_gene_available
        "
      ></display-order>
    </transition>
    <transition name="fade" mode="out-in">
      <display-colors
        v-if="
          is_there_data_to_save &&
          is_gene_available &&
          Object.entries(this.config.colors).length !== 0
        "
      ></display-colors>
    </transition>
    <transition name="fade" mode="out-in">
      <display-palettes
        v-if="
          is_there_data_to_save &&
          is_gene_available &&
          this.config.color_name !== null &&
          Object.entries(this.config.colors).length === 0
        "
      ></display-palettes>
    </transition>
    <transition name="fade" mode="out-in">
      <display-name-input
        v-if="is_there_data_to_save && is_gene_available"
      ></display-name-input>
    </transition>
    <transition name="fade" mode="out-in">
      <save-display-button
        v-if="is_there_data_to_save && is_gene_available"
        :display_id="display_id"
      ></save-display-button>
    </transition>
  </div>
</template>

<script>
// tsne-plotly-displays.vue

const plotlyArguments = httpVueLoader("./plotly-arguments.vue");
const geneSymbolInput = httpVueLoader("./gene-symbol-input.vue");
const displayNameInput = httpVueLoader("./display-name-input.vue");
const displayOrder = httpVueLoader("./display-order.vue");
const displayColors = httpVueLoader("./display-colors.vue");
const displayPalettes = httpVueLoader("./display-palettes.vue");
const saveDisplayButton = httpVueLoader("./save-display-button.vue");

// Just a clone of bar-display.vue
export const components={
  plotlyArguments,
  geneSymbolInput,
  displayNameInput,
  displayOrder,
  displayColors,
  displayPalettes,
  saveDisplayButton,
};
export const props={
  display_id: String,
};
export function data() {
  return {
    is_gene_available: true,
  };
}
export const computed={
  ...Vuex.mapState(["config"]),
  is_there_data_to_save() {
    return (
      "x_axis" in this.config&&
      "gene_symbol" in this.config&&
      this.config.gene_symbol!==""
    );
  },
};
</script>
