<template>
  <div id="tsne-display">
    <gene-symbol-input
      v-model="config.gene_symbol"
      :analysis="config.analysis ? config.analysis.id : null"
      @gene-updated="is_gene_available = $event"
    ></gene-symbol-input>
    <transition name="fade" mode="out-in">
      <tsne-arguments v-if="config.gene_symbol !== '' && is_gene_available" />
    </transition>
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
      <display-name-input v-if="is_gene_available"></display-name-input>
    </transition>
    <transition name="fade" mode="out-in">
      <save-display-button
        v-if="is_gene_available"
        :display_id="display_id"
      ></save-display-button>
    </transition>
  </div>
</template>

<script>
// tsne-display.vue

const tsneArguments = httpVueLoader("./tsne-arguments.vue");
const geneSymbolInput = httpVueLoader("./gene-symbol-input.vue");
const displayNameInput = httpVueLoader("./display-name-input.vue");
const displayOrder = httpVueLoader("./display-order.vue");
const saveDisplayButton = httpVueLoader("./save-display-button.vue");

module.exports = {
  props: {
    display_id: String,
  },
  components: {
    tsneArguments,
    geneSymbolInput,
    displayNameInput,
    displayOrder,
    saveDisplayButton,
  },
  data() {
    return {
      is_gene_available: true,
      show_tsne: false,
      loading: false,
    };
  },
  computed: {
    ...Vuex.mapState(["dataset_id", "config", "dataset_type", "analysis"]),
  },
};
</script>
