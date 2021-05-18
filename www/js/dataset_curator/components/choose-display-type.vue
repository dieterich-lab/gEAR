<template>
  <div id="choose-display-type">
    <b-row>
      <b-col>
        <b-icon
          class="float-right"
          v-b-tooltip.hover="
            'Select plot type.  Some choices may not be available depending on observations in dataset.'
          "
          icon="question-circle-fill"
        ></b-icon>
        <h3>Display Type</h3>
        <b-form-group>
          <b-form-select
            :disabled="
              loading ||
              available_plot_types.success === -1 ||
              display_options.length === 0
            "
            :value="plot_type"
            @input="update_plot_type($event)"
            :options="display_options"
          >
            <option v-if="loading" slot="first" :value="null">
              Loading available displays...
            </option>
            <option
              v-else-if="available_plot_types.success === -1"
              slot="first"
            >
              {{ available_plot_types.message }}
            </option>
            <option v-else-if="display_options.length === 0" :value="null">
              No available display types
            </option>
            <option v-else slot="first" :value="null">
              Choose display type
            </option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <hr v-if="plot_type" />
  </div>
</template>

<script>
// choose-display-type.vue

module.exports = {
  props: ['analysis_id'],
  computed: {
    ...Vuex.mapState([
      "user",
      "plot_type",
      "dataset_id",
      "available_plot_types",
      "dataset_type",
    ]),
    display_options() {
      const display_options = Object.keys(this.available_plot_types)
        .filter((type) => this.available_plot_types[type])
        .map((type, i) => type);

      return display_options;
    },
    loading() {
      return (
        Object.entries(this.available_plot_types).length === 0 &&
        this.available_plot_types.constructor === Object
      );
    },
  },
  created() {
    const user_id = this.user.id;
    const session_id = this.user.session_id;
    const dataset_id = this.dataset_id;
    const analysis_id = this.analysis_id;

    this.fetch_available_plot_types({ user_id, session_id, dataset_id, analysis_id });
  },
  methods: {
    ...Vuex.mapActions(["fetch_available_plot_types", "set_plot_type"]),
    update_plot_type(plot_type) {
      this.set_plot_type(plot_type);
      this.$emit("input", plot_type);
    },
  },
  watch: {
    analysis_id(analysis_id) {
        // When analysis ID changes, update plot types dropdown list
        const user_id = this.user.id;
        const session_id = this.user.session_id;
        const dataset_id = this.dataset_id;

        this.fetch_available_plot_types({ user_id, session_id, dataset_id, analysis_id });
    },
  }
};
</script>
