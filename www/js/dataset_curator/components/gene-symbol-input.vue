<template>
  <div id="gene-symbol-input">
    <b-row>
      <b-col>
        <b-icon
          class="float-right"
          v-b-tooltip.hover="
            'Enter gene to curate on.  Gene does not exist if autosearch box does not find it.'
          "
          icon="question-circle-fill"
        ></b-icon>
        <h3>Gene Symbol</h3>
        <b-form-group>
          <b-form-input
            v-show="loading"
            disabled
            placeholder="Loading gene symbols..."
          ></b-form-input>
          <vue-bootstrap-typeahead
            v-show="!loading"
            ref="gene_type_ahead"
            placeholder="Gene symbol"
            :value="config.gene_symbol"
            @hit="update_gene_symbol($event)"
            :data="gene_symbols"
            size="sm"
          />
          <slot name="svg_options"></slot>
          <slot name="button"></slot>
        </b-form-group>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// gene-symbol-input.vue

export const props={
  analysis: String,
};
export const components={
  VueBootstrapTypeahead,
};
export function data() {
  return {
    loading: false,
  };
}
export const watch={
  analysis(analysis_id) {
    // when the analysis changes creating a tsne,
    // we want to fetch gene symbols for this h5ad
    const dataset_id=this.dataset_id;
    this.fetch_gene_symbols({ dataset_id, analysis_id });
  },
};
export const computed={
  ...Vuex.mapState(["dataset_id", "config", "gene_symbols"]),
  is_gene_available() {
    return this.gene_symbols
      .map((gene) => gene.toLowerCase())
      .includes(this.config.gene_symbol.toLowerCase());
  },
};
export async function created() {
  const dataset_id=this.dataset_id;
  const analysis_id=this.analysis;
  this.loading=true;
  await this.fetch_gene_symbols({ dataset_id, analysis_id });
  this.loading=false;
}
export async function mounted() {
  // small hack to get around typeahead not allowing
  // a default value
  // https://github.com/alexurquhart/vue-bootstrap-typeahead/issues/22
  if(this.config.gene_symbol) {
    this.$refs.gene_type_ahead.inputValue=this.config.gene_symbol;
    // if there's a gene symbol we know that this is a saved
    // analysis and this gene exists
    this.$emit("gene-updated", true);
  }
}
export const methods={
  ...Vuex.mapActions(["set_gene_symbol", "fetch_gene_symbols"]),
  update_gene_symbol(gene_symbol) {
    this.set_gene_symbol(gene_symbol);
    this.$emit("gene-updated", this.is_gene_available);
  },
};
</script>
