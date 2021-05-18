<template>
  <div id="plotly-arguments">
    <b-row>
      <b-col>
        <h3>Display Parameters</h3>
        <b-form-group>
          <b-form-group label-align-sm="right">
            <label class="mb-0">X</label>
            <!-- NOTE: b-icon has a 'title' property which conflicts with the 'title' property v-b-tooltip uses -->
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for X axis.'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select :options="columns" v-model="x_axis" size="sm">
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
            <b-form-checkbox v-model="hide_x_labels">
              Hide X Tickmarks
            </b-form-checkbox>
          </b-form-group>
          <b-form-group label-align-sm="right">
            <label class="mb-0">Y</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for Y axis.'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select :options="columns" v-model="y_axis" size="sm">
              <template slot="first">
                <option value="raw_value">expression</option>
              </template>
            </b-form-select>
            <b-form-checkbox v-model="hide_y_labels">
              Hide Y Tickmarks
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            label-align-sm="right"
            v-if="['contour'].includes(plot_type)"
          >
            <label class="mb-0">Z</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for Z axis.'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select :options="columns" v-model="z_axis" size="sm">
              <template slot="first">
                <option value="raw_value">expression</option>
              </template>
            </b-form-select>
          </b-form-group>
          <b-form-group label-align-sm="right">
            <label class="mb-0">Color</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for coloring'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select :options="columns" v-model="color_name" size="sm">
              <template slot="first">
                <option :value="null"></option>
              </template>
              <option value="raw_value">expression</option>
            </b-form-select>
          </b-form-group>
          <b-form-group
            label-align-sm="right"
            v-if="['scatter', 'tsne_dynamic', 'tsne/umap_dynamic'].includes(plot_type)"
          >
            <label class="mb-0">Size</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for marker size'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select :options="columns" v-model="size_by_group" size="sm">
              <template slot="first">
                <option :value="null"></option>
              </template>
              <option value="raw_value">expression</option>
            </b-form-select>
          </b-form-group>
          <b-form-group label-align-sm="right" v-if="plot_type !== 'contour'">
            <label class="mb-0">Label</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="
                'Data series for tooltip when hovering over a data marker'
              "
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select :options="columns" v-model="point_label" size="sm">
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>
          <b-form-group label-align-sm="right">
            <label class="mb-0">Facet Row</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for row facets'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select
              :options="Object.keys(levels)"
              v-model="facet_row"
              size="sm"
            >
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>
          <b-form-group label-align-sm="right">
            <label class="mb-0">Facet Column</label>
            <b-icon
              class="float-right"
              v-b-tooltip.hover="'Data series for column facets'"
              icon="question-circle-fill"
            ></b-icon>
            <b-form-select
              :options="Object.keys(levels)"
              v-model="facet_col"
              size="sm"
            >
              <template slot="first">
                <option :value="null"></option>
              </template>
            </b-form-select>
          </b-form-group>

          <!-- 'advanced options' collapsable -->
          <b-form-group>
            <b-button block v-b-toggle.adv-collapse variant="outline-secondary"
              >Advanced Options</b-button
            >
          </b-form-group>
          <b-collapse id="adv-collapse">
            <b-form-group
              label-align-sm="right"
              v-if="!(hide_x_labels || x_axis in levels)"
            >
              <label class="mb-0">X Tick Range</label>
              <b-icon
                class="float-right"
                icon="question-circle-fill"
                v-b-tooltip.hover="
                  'Set X-axis range of plot.  Both numbers must be filled in.  Not applicable for categorical data series.'
                "
              >
              </b-icon>
              <validation-observer slim>
                <b-input-group
                  class="flex-nowrap"
                  size="sm"
                  prepend="min"
                  append="max"
                >
                  <validation-provider
                    name="x-min"
                    vid="xmin_value"
                    rules="required_if:xmax_value"
                    v-slot="{ errors }"
                  >
                    <b-form-input
                      class="pr-0"
                      type="number"
                      v-model="x_min"
                      :state="errors[0] ? false : null"
                    >
                    </b-form-input>
                    <b-form-invalid-feedback>{{
                      errors[0]
                    }}</b-form-invalid-feedback>
                  </validation-provider>
                  <span class="mt-2"> - </span>
                  <validation-provider
                    name="x-max"
                    vid="xmax_value"
                    rules="required_if:xmin_value"
                    v-slot="{ errors }"
                  >
                    <b-form-input
                      class="pr-0"
                      type="number"
                      v-model="x_max"
                      :state="errors[0] ? false : null"
                    >
                    </b-form-input>
                    <b-form-invalid-feedback>{{
                      errors[0]
                    }}</b-form-invalid-feedback>
                  </validation-provider>
                </b-input-group>
              </validation-observer>
            </b-form-group>

            <b-form-group label-align-sm="right">
              <label class="mb-0">X Axis Title</label>
              <b-icon
                class="float-right"
                v-b-tooltip.hover="'Title of axis'"
                icon="question-circle-fill"
              ></b-icon>
              <b-form-input v-model="x_title"></b-form-input>
            </b-form-group>

            <!-- SAdkins TOOD: Try to have the invalid-feedback outside of b-input-group for just one error msg (also in x_axis) -->
            <b-form-group
              label-align-sm="right"
              v-if="!(hide_y_labels || y_axis in levels)"
            >
              <label class="mb-0">Y Tick Range</label>
              <b-icon
                class="float-right"
                icon="question-circle-fill"
                v-b-tooltip.hover="
                  'Set Y-axis range of plot.  Both numbers must be filled in.  Not applicable for categorical data series.'
                "
              >
              </b-icon>
              <validation-observer slim>
                <b-input-group
                  class="flex-nowrap"
                  size="sm"
                  prepend="min"
                  append="max"
                >
                  <validation-provider
                    name="y-min"
                    vid="ymin_value"
                    rules="required_if:ymax_value"
                    v-slot="{ errors }"
                  >
                    <b-form-input
                      class="pr-0"
                      type="number"
                      v-model="y_min"
                      :state="errors[0] ? false : null"
                    >
                    </b-form-input>
                    <b-form-invalid-feedback>{{
                      errors[0]
                    }}</b-form-invalid-feedback>
                  </validation-provider>
                  <span class="mt-2"> - </span>
                  <validation-provider
                    name="y-max"
                    vid="ymax_value"
                    rules="required_if:ymin_value"
                    v-slot="{ errors }"
                  >
                    <b-form-input
                      class="pr-0"
                      type="number"
                      v-model="y_max"
                      :state="errors[0] ? false : null"
                    >
                    </b-form-input>
                    <b-form-invalid-feedback>{{
                      errors[0]
                    }}</b-form-invalid-feedback>
                  </validation-provider>
                </b-input-group>
              </validation-observer>
            </b-form-group>

            <b-form-group label-align-sm="right">
              <label class="mb-0">Y Axis Title</label>
              <b-icon
                class="float-right"
                v-b-tooltip.hover="'Title of axis'"
                icon="question-circle-fill"
              ></b-icon>
              <b-form-input v-model="y_title"></b-form-input>
            </b-form-group>

            <b-form-group
              label-align-sm="right"
              v-if="['scatter', 'tsne_dynamic', 'tsne/umap_dynamic'].includes(plot_type)"
            >
              <label class="mb-0">Marker Size (sm <--> lg)</label>
              <b-icon
                class="float-right"
                icon="question-circle-fill"
                v-b-tooltip.hover="
                  'Set a constant marker size.  If Size series is also selected, this will set the minimum marker size.'
                "
              >
              </b-icon>
              <b-form-input
                type="range"
                v-model="marker_size"
                min="1"
                max="15"
                number
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label-align-sm="right"
              v-if="['scatter', 'violin'].includes(plot_type)"
            >
              <b-icon
                class="float-right"
                v-if="plot_type === 'scatter'"
                v-b-tooltip.hover="
                  'Check to convert scatter plot into strip plot'
                "
                icon="question-circle-fill"
              ></b-icon>
              <b-icon
                class="float-right"
                v-if="plot_type === 'violin'"
                v-b-tooltip.hover="
                  'Check to convert violin plot to a beeswarm plot'
                "
                icon="question-circle-fill"
              ></b-icon>
              <b-form-checkbox v-model="jitter">
                Jitter points
              </b-form-checkbox>
            </b-form-group>

            <b-form-group label-align-sm="right">
              <b-icon
                class="float-right"
                v-b-tooltip.hover="'Check to not display legend in plot'"
                icon="question-circle-fill"
              ></b-icon>
              <b-form-checkbox v-model="hide_legend">
                Hide Legend
              </b-form-checkbox>
            </b-form-group>

            <!-- vertical lines -->
            <b-form-group
              label-align-sm="right"
              v-if="(!(x_axis in levels) && ['scatter'].includes(plot_type))"
            >
              <label class="mb-0">Vertical Line Information</label>
              <b-icon
                class="float-right"
                icon="question-circle-fill"
                v-b-tooltip.hover="
                  'Add vertical lines to plot with various properties.  Not applicable if X-axis is categorical.'
                "
              >
              </b-icon>
              <vertical-line
                v-for="(vl, index) in vlines"
                v-bind.sync="vl"
                v-bind:key="vl.id"
              ></vertical-line>
              <div>
                <b-icon icon="plus-circle-fill" @click="addRow"></b-icon>
                <b-icon
                  icon="dash-circle-fill"
                  @click="removeLast"
                  v-if="vlines.length"
                ></b-icon>
              </div>
            </b-form-group>
          </b-collapse>

          <b-col>
            <b-button
              @click="preview"
              :disabled="x_axis === null"
              class="btn-purple float-right"
              size="sm"
            >
              Preview Chart
            </b-button>
          </b-col>
        </b-form-group>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// plotly-arguments.vue

const verticalLine = httpVueLoader("./vertical-line.vue");

module.exports = {
  components: {
    verticalLine,
  },
  data() {
    return {
      x_axis: null,
      y_axis: "raw_value",
      z_axis: "raw_value",
      point_label: null,
      color_name: null,
      facet_row: null,
      facet_col: null,
      size_by_group: null, // Marker size is based on a group.
      marker_size: 3, // if size_by_group set, then this will be min marker size
      jitter: false,
      hide_x_labels: false,
      hide_y_labels: false,
      hide_legend: false,
      x_min: null,
      x_max: null,
      y_min: null,
      y_max: null,
      x_title: null,
      y_title: null,

      vlines: [],
      vline_counter: 1,
    };
  },
  computed: {
    ...Vuex.mapState([
      "dataset_id",
      "config",
      "columns",
      "levels", // Can use to determine categorical series
      "plot_type",
    ]),
  },
  created() {
    if ("x_axis" in this.config) this.x_axis = this.config.x_axis;
    if ("y_axis" in this.config && this.config.y_axis) {
      // we only want to change y_axis if there's a value other than null so
      // it defaults to "raw_value" set in data above
      this.y_axis = this.config.y_axis;
    }
    if ("z_axis" in this.config && this.config.z_axis) {
      // we only want to change z_axis if there's a value other than null so
      // it defaults to "raw_value" set in data above
      this.z_axis = this.config.z_axis;
    }
    if ("hide_x_labels" in this.config)
      this.hide_x_labels = this.config.hide_x_labels;
    if ("hide_y_labels" in this.config)
      this.hide_y_labels = this.config.hide_y_labels;
    if ("hide_legend" in this.config)
      this.hide_legend = this.config.hide_legend;
    if ("color_name" in this.config) this.color_name = this.config.color_name;
    if ("facet_row" in this.config) this.facet_row = this.config.facet_row;
    if ("facet_col" in this.config) this.facet_col = this.config.facet_col;
    if ("size_by_group" in this.config)
      this.size_by_group = this.config.size_by_group;
    if ("marker_size" in this.config && this.config.marker_size) {
      // we only want to change marker_size if there's a value other than null so
      // it defaults to the default size (3)
      this.marker_size = this.config.marker_size;
    }
    if ("jitter" in this.config && this.config.jitter) {
      // see 'marker_size' comment
      this.jitter = this.config.jitter;
    } else if (this.plot_type === 'violin') {
      this.jitter = true;
    }
    if ("point_label" in this.config)
      this.point_label = this.config.point_label;
    if ("x_min" in this.config) this.x_min = this.config.x_min;
    if ("x_max" in this.config) this.x_max = this.config.x_max;
    if ("y_min" in this.config) this.y_min = this.config.y_min;
    if ("y_max" in this.config) this.y_max = this.config.y_max;
    if ("x_title" in this.config) this.x_title = this.config.x_title;
    if ("y_title" in this.config) this.y_title = this.config.y_title;
    if ("vlines" in this.config) this.vlines = this.config.vlines;
  },
  watch: {
    // Ensure a group is not used for two parameters
    x_axis(val) {
      if (this.y_axis === val) this.y_axis = null;
      if (this.z_axis === val) this.z_axis = null;
      if (this.size_by_group === val) this.size_by_group = null;
      if (this.facet_row === val) this.facet_row = null;
      if (this.facet_col === val) this.facet_col = null;
    },
    y_axis(val) {
      if (this.x_axis === val) this.x_axis = null;
      if (this.z_axis === val) this.z_axis = null;
      if (this.size_by_group === val) this.size_by_group = null;
      if (this.facet_row === val) this.facet_row = null;
      if (this.facet_col === val) this.facet_col = null;
    },
    z_axis(val) {
      if (this.x_axis === val) this.x_axis = null;
      if (this.y_axis === val) this.y_axis = null; // TODO: 'Y' and 'Z' start as "raw_value"... need to prevent that
      if (this.size_by_group === val) this.size_by_group = null;
      // 'z' must be continuous and facets must be discrete so they will not overlap
    },
    color_name(val) {
      // Colors need to be cleared since the category is different.  New colors will be set after plot creation
      this.set_colors(null);
      this.set_color_palette(null);
      this.set_reverse_palette(false);
    },
    size_by_group(val) {
      if (this.x_axis === val) this.x_axis = null;
      if (this.y_axis === val) this.y_axis = null;
      if (this.z_axis === val) this.z_axis = null;
      if (this.facet_row === val) this.facet_row = null;
      if (this.facet_col === val) this.facet_col = null;
    },
    facet_row(val) {
      if (this.x_axis === val) this.x_axis = null;
      if (this.y_axis === val) this.y_axis = null;
      if (this.size_by_group === val) this.size_by_group = null;
      if (this.facet_col === val) this.facet_col = null;
    },
    facet_col(val) {
      if (this.x_axis === val) this.x_axis = null;
      if (this.y_axis === val) this.y_axis = null;
      if (this.size_by_group === val) this.size_by_group = null;
      if (this.facet_row === val) this.facet_row = null;
    },
  },
  methods: {
    ...Vuex.mapActions([
      "fetch_plotly_data",
      "set_colors",
      "set_color_palette",
      "set_reverse_palette",
    ]),
    preview() {
      const {
        gene_symbol,
        analysis,
        colors,
        color_palette,
        reverse_palette,
      } = this.config;

      const config = {
        gene_symbol,
        analysis,
        colors,
        color_palette,
        reverse_palette,
        x_axis: this.x_axis,
        y_axis: this.y_axis,
        z_axis: this.z_axis,
        point_label: this.point_label,
        color_name: this.color_name,
        facet_row: this.facet_row,
        facet_col: this.facet_col,
        size_by_group: this.size_by_group,
        marker_size: this.marker_size,
        jitter: this.jitter,
        hide_x_labels: this.hide_x_labels,
        hide_y_labels: this.hide_y_labels,
        hide_legend: this.hide_legend,
        x_min: this.x_min,
        x_max: this.x_max,
        y_min: this.y_min,
        y_max: this.y_max,
        x_title: this.x_title,
        y_title: this.y_title,
        vlines: this.vlines,
      };

      const plot_type = this.plot_type;
      const dataset_id = this.dataset_id;
      this.fetch_plotly_data({ config, plot_type, dataset_id });
    },
    addRow() {
      // Add new 'vertical-line' component
      this.vlines.push({
        id: this.vline_counter++,
        vl_pos: null,
        vl_style: "solid",
      });
    },
    removeLast() {
      // Remove last 'vertical-line component
      this.vlines.pop();
    },
  },
};
</script>
