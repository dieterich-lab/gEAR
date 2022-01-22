<template>
      <div id="svg-display">
        <gene-symbol-input
        v-model='config.gene_symbol'
        @gene-updated='is_gene_available = $event'
        :analysis='config.analysis ? config.analysis.id : null'
        >
          <div slot="svg_options">
            <hr>
            <b-col class='mt-2'>
              <b-row>
                <label for='low'>Low Color</label>
                  <b-form-input
                    type="color"
                    name="low"
                    v-model='low_color'
                  >
                  </b-form-input>
              </b-row>
              <b-row>
                <label for="mid">Mid Color</label>
                <b-form-input
                  type="color"
                  name="mid"
                  v-model='mid_color'
                >
                </b-form-input>
              </b-row>
              <b-row>
                <label for="high">High Color</label>
                <b-form-input
                  type="color"
                  name="high"
                  v-model='high_color'
                >
                </b-form-input>
              </b-row>
            </b-col>
            <b-row class='mt-3'>
              <b-col>
                <b-button
                  :disabled="config.gene_symbol === '' || !is_gene_available"
                  class='btn-purple float-right'
                  @click="preview"
                  >Preview SVG</b-button>
              </b-col>
            </b-row>
          </div>
        </gene-symbol-input>
        <transition name="fade" mode="out-in">
          <display-name-input
            v-if='is_there_data_to_draw && is_gene_available'
          ></display-name-input>
        </transition>
        <transition name="fade" mode="out-in">
          <save-display-button
            v-if="is_there_data_to_draw && is_gene_available"
            :display_id='display_id'
          ></save-display-button>
      </transition>
      </div>
</template>

<script>
// svg-display.vue

const geneSymbolInput = httpVueLoader('./gene-symbol-input.vue');
const displayNameInput = httpVueLoader('./display-name-input.vue');
const saveDisplayButton = httpVueLoader('./save-display-button.vue');

export const props={
  display_id: {
    type: String,
    default: null,
  },
};
export const components={
  geneSymbolInput,
  displayNameInput,
  saveDisplayButton,
};
export function data() {
  return {
    loading: false,
    is_gene_available: true,
  };
}
export const computed={
  ...Vuex.mapState(['dataset_id', 'config', 'chart_data']),
  low_color: {
    get() {
      return this.config.colors.low_color;
    },
    set(color) {
      this.set_color({ name: 'low_color', color });
    },
  },
  mid_color: {
    get() {
      return this.config.colors.mid_color;
    },
    set(color) {
      this.set_color({ name: 'mid_color', color });
    },
  },
  high_color: {
    get() {
      return this.config.colors.high_color;
    },
    set(color) {
      this.set_color({ name: 'high_color', color });
    },
  },
  is_creating_new_display() {
    return this.display_id===null;
  },
  is_there_data_to_draw() {
    return (
      Object.entries(this.chart_data).length!==0&&
      this.chart_data.constructor===Object
    );
  },
  is_there_data_to_save() {
    return 'colors' in this.config&&'gene_symbol' in this.config;
  },
};
export async function created() {
  if(!this.is_creating_new_display) {
    // if we are creating a new display, we do not
    // want to automatically generate a chart, and
    // wait for user to specify config options
    const { gene_symbol }=this.config;
    const dataset_id=this.dataset_id;

    this.fetch_svg_data({ gene_symbol, dataset_id });
  }
}
export const methods={
  ...Vuex.mapActions(['fetch_svg_data', 'set_color']),
  preview() {
    const { gene_symbol }=this.config;
    const dataset_id=this.dataset_id;

    this.fetch_svg_data({ gene_symbol, dataset_id });
  },
};
</script>