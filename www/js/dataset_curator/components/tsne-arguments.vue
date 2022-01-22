<template>
  <div id="tsne-arguments">
    <b-row>
      <b-col>
        <h3>Display Parameters</h3>
        <b-form-group>
          <b-form-group label-align-sm="right">
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for X axis'"
              icon="question-circle-fill"
            ></b-icon>
            <label class="mb-0">X</label>
            <b-form-select :options="columns" v-model="x_axis" size="sm">
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>

          <b-form-group label-align-sm="right">
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for Y axis'"
              icon="question-circle-fill"
            ></b-icon>
            <label class="mb-0">Y</label>
            <b-form-select :options="columns" v-model="y_axis" size="sm">
              <template slot="first">
                <option value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>

          <b-form-group label-align-sm="right">
            <b-icon
              class="float-right"
              v-b-tooltip.hover="
                'Check to enable ability to color by a category'
              "
              icon="question-circle-fill"
            ></b-icon>
            <b-form-checkbox v-model="show_colorized_legend">
              Show colorized legend
            </b-form-checkbox>
          </b-form-group>

          <b-form-group v-if="show_colorized_legend" label-align-sm="right">
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for coloring plot'"
              icon="question-circle-fill"
            ></b-icon>
            <label class="mb-0">Colorize legend by:</label>
            <b-form-select
              :options="columns"
              v-model="colorize_legend_by"
              size="sm"
            >
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>

          <b-form-group v-if="show_colorized_legend" label-align-sm="right">
            <b-icon
              class="float-right"
              v-b-tooltip.hover="
                'Data series for creating separate plots by individual entities in a group'
              "
              icon="question-circle-fill"
            ></b-icon>
            <label class="mb-0">Plot by group:</label>
            <b-form-select :options="columns" v-model="plot_by_group" size="sm">
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>

          <b-form-group
            v-if="show_colorized_legend && plot_by_group"
            label-align-sm="right"
          >
            <b-icon
              class="float-right"
              v-b-tooltip.hover="
                'Maximum number of plots per row.  If not provided, all plots will be on one row'
              "
              icon="question-circle-fill"
            ></b-icon>
            <label class="mb-0">Max columns per row:</label>
            <b-form-input
              type="number"
              v-model="max_columns"
              number
              size="sm"
              min="1"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            v-if="show_colorized_legend && !plot_by_group"
            label-align-sm="right"
          >
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Check to skip the gene symbol plot'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-checkbox v-model="skip_gene_plot">
              Skip gene symbol plot
            </b-form-checkbox>
          </b-form-group>
        </b-form-group>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// tsne-argument.vue

export function data() {
  return {
    show_colorized_legend: false,
  };
}
export const computed={
  ...Vuex.mapState([
    "dataset_id",
    "config",
    "columns",
    "plot_type",
    "image_data",
    "tsne_is_loading",
    "levels",
  ]),
  colorize_legend_by: {
    get() {
      return this.$store.state.config.colorize_legend_by;
    },
    set(value) {
      this.$store.commit("set_colorize_legend_by", value);
    },
  },
  plot_by_group: {
    get() {
      return this.$store.state.config.plot_by_group;
    },
    set(value) {
      this.$store.commit("set_plot_by_group", value);
    },
  },
  max_columns: {
    get() {
      return this.$store.state.config.max_columns;
    },
    set(value) {
      this.$store.commit("set_max_columns", value);
    },
  },
  skip_gene_plot: {
    get() {
      return this.$store.state.config.skip_gene_plot;
    },
    set(value) {
      this.$store.commit("set_skip_gene_plot", value);
    },
  },
  x_axis: {
    get() {
      return this.$store.state.config.x_axis;
    },
    set(value) {
      this.$store.commit("set_x_axis", value);
    },
  },
  y_axis: {
    get() {
      return this.$store.state.config.y_axis;
    },
    set(value) {
      this.$store.commit("set_y_axis", value);
    },
  },
};
export function created() {
  if("x_axis" in this.config)
    this.x_axis=this.config.x_axis;
  if("y_axis" in this.config)
    this.y_axis=this.config.y_axis;
  if("colorize_legend_by" in this.config)
    this.colorize_legend_by=this.config.colorize_legend_by;
  if("plot_by_group" in this.config)
    this.plot_by_group=this.config.plot_by_group;
  if("max_columns" in this.config)
    this.max_columns=this.config.max_columns;
  if("skip_gene_plot" in this.config)
    this.skip_gene_plot=this.config.skip_gene_plot;

  this.fetch_h5ad_info({
    dataset_id: this.dataset_id,
    analysis: this.config.analysis,
  });
}
export const watch={
  show_colorized_legend: function(val, oldval) {
    // if deselected, clear colorize legend select box
    if(this.show_colorized_legend===false) {
      this.colorize_legend_by=null;
      this.skip_gene_plot=null;
      this.plot_by_group=null;
      this.max_columns=null;
    }
  },
  colorize_legend_by: function(newval, oldval) {
    if(newval!=oldval&&this.plot_params_ready()) {
      // Set order in config so "display-order" will render
      if(newval!==null&&this.levels) {
        const colorize_key=this.colorize_legend_by;
        var order={};
        order[colorize_key]=this.levels[colorize_key];

        if(this.plot_by_group!==null) {
          // Add separately in case both are same dataseries group
          const group_key=this.plot_by_group;
          order[group_key]=this.levels[group_key];
        }
        this.$store.commit("set_order", order);
      }
    }
  },
  x_axis: function(newval, oldval) {
    if(newval!=oldval&&this.plot_params_ready()) {
      this.draw_image();
    }
  },
  y_axis: function(newval, oldval) {
    if(newval!=oldval&&this.plot_params_ready()) {
      this.draw_image();
    }
  },
  skip_gene_plot: function(newval, oldval) {
    if(newval!=oldval&&this.plot_params_ready()) {
      this.draw_image();
    }
  },
  plot_by_group: function(newval, oldval) {
    if(newval!=oldval&&this.plot_params_ready()) {
      // Plotting by group colors by gene symbol, so cannot skip gene plot
      if(newval!==null)
        this.skip_gene_plot=null;
      // Currently only works if colorize_legend_by is set
      if(this.colorize_legend_by!==null) {
        // Set order in config so "display-order" will render
        if(newval!==null&&this.levels) {
          const group_key=this.plot_by_group;
          // Add separately in case both are same dataseries group
          const colorize_key=this.colorize_legend_by;
          var order={};
          order[group_key]=this.levels[group_key];
          order[colorize_key]=this.levels[colorize_key];
          this.$store.commit("set_order", order);
        }

        this.draw_image();
      }
    }
  },
  max_columns: function(newval, oldval) {
    if(newval!=oldval&&this.plot_params_ready()) {
      this.draw_image();
    }
  },
};
export const methods={
  ...Vuex.mapActions([
    "fetch_h5ad_info",
    "set_image_data",
    "set_success",
    "set_message",
    "set_tsne_is_loading",
    "set_order",
  ]),
  plot_params_ready() {
    if(this.x_axis&&this.y_axis) {
      return true;
    } else {
      return false;
    }
  },
  get_image_data(gene_symbol) {
    // then craziness: https://stackoverflow.com/a/48980526
    // shift this out when the fetch_tsne_image method is done in Vuex
    var analysis_id=this.config.analysis? this.config.analysis.id:null;
    return axios
      .get(`/api/plot/${this.dataset_id}/tsne`, {
        params: {
          gene: this.config.gene_symbol,
          analysis: analysis_id,
          colorize_by: this.colorize_legend_by,
          skip_gene_plot: this.skip_gene_plot,
          plot_by_group: this.plot_by_group,
          max_columns: this.max_columns,
          x_axis: this.x_axis,
          y_axis: this.y_axis,
          plot_type: this.plot_type,
          analysis_owner_id: this.user_id,
          colors: this.colors,
          order: config.order,
          // helps stop caching issues
          timestamp: new Date().getTime(),
        },
      })
      .then((response) => {
        return response.data;
      });
  },
  draw_image() {
    this.set_tsne_is_loading(true);
    this.get_image_data(this.config.gene_symbol).then((data) => {
      this.set_tsne_is_loading(false);
      this.set_image_data(data.image);
      this.set_success(data.success);
      this.set_message(data.message);
    });
  },
};
</script>
