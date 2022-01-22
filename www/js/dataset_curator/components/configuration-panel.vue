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

export const components={
  primaryConfig,
  storedAnalysisConfig,
};
export function data() {
  return {
    selected: "primary",
  };
}
export const computed={
  ...Vuex.mapState(["dataset_type"]),
};
export const watch={
  selected(newValue) {
    this.set_dataset_type(newValue);
  },
};
export function created() {
  this.selected=this.dataset_type;
}
export const methods={
  ...Vuex.mapActions(["set_dataset_type"]),
};
</script>
