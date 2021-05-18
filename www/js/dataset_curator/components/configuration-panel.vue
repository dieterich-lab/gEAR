<template>
  <div id="configuration-panel">
    <b-row>
      <b-col>
        <h3>Dataset Type</h3>
        <b-form-group>
          <b-form-radio v-model="selected" value="primary"
            >Primary Data</b-form-radio
          >
          <b-form-radio v-model="selected" value="analysis"
            >Stored Analysis</b-form-radio
          >
        </b-form-group>
      </b-col>
    </b-row>
    <hr />
    <b-row>
      <b-col>
        <div v-if="selected == 'primary'">
          <primary-config></primary-config>
        </div>
        <div v-else>
          <stored-analysis-config></stored-analysis-config>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// configuration-panel.vue

const primaryConfig = httpVueLoader("./primary-config.vue");
const storedAnalysisConfig = httpVueLoader("./stored-analysis-config.vue");

module.exports = {
  components: {
    primaryConfig,
    storedAnalysisConfig,
  },
  data() {
    return {
      selected: "primary",
    };
  },
  computed: {
    ...Vuex.mapState(["dataset_type"]),
  },
  watch: {
    selected(newValue) {
      this.set_dataset_type(newValue);
    },
  },
  created() {
    this.selected = this.dataset_type;
  },
  methods: {
    ...Vuex.mapActions(["set_dataset_type"]),
  },
};
</script>
