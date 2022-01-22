<template>
  <div id="display-palettes">
    <b-row>
      <b-col>
        <h3>Color</h3>
        <b-row id="color-palette">
          <b-col>
            <b-form-group label-align-sm="right">
              <b-form-select size="sm" :options="options" v-model="palette">
                <template slot="first">
                  <b-form-select-option :value="null" disabled
                    >Please select an option
                  </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>

            <b-form-group label-align-sm="right">
              <b-form-checkbox v-model="reverse_palette">
                Reverse colorscale
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// display-palettes.vue

export function data() {
  return {
    options: [
      {
        label: "Multi-color scales",
        options: [
          { value: "YlOrRd", text: "Yellow-Orange-Red" },
          { value: "Viridis", text: "Viridis" },
        ],
      },
      {
        label: "Single-color scales",
        options: [
          { value: "Greys", text: "Greyscale" },
          { value: "Blues", text: "Bluescale" },
        ],
      },
      {
        label: "Diverging Colorscales",
        options: [
          { value: "RdBu", text: "Red-Blue" },
          { value: "PiYG", text: "Pink-Yellow-Green" },
        ],
      },
    ],
    palette: null,
    reverse_palette: false,
  };
}
export const computed={
  ...Vuex.mapState(["config", "plot_type", "dataset_id"]),
};
export function created() {
  // Needed for initial display after first plotting preview
  if("color_palette" in this.config)
    this.palette=this.config.color_palette;
  if("reverse_palette" in this.config)
    this.reverse_palette=this.config.reverse_palette;
}
export const watch={
  palette: function(newval) {
    this.set_color_palette(newval);
    this.update_display();
  },
  reverse_palette: function(newval) {
    this.set_reverse_palette(newval);
    this.update_display();
  },
};
export const methods={
  ...Vuex.mapActions([
    "set_color_palette",
    "set_reverse_palette",
    "fetch_plotly_data",
  ]),
  update_display() {
    const config=this.config;
    const plot_type=this.plot_type;
    const dataset_id=this.dataset_id;

    this.fetch_plotly_data({ config, plot_type, dataset_id });
  },
};
</script>
