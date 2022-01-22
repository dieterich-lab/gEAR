<template>
  <div id="stored-analysis-config">
    <choose-stored-analysis></choose-stored-analysis>
    <hr v-if="analysis" />
    <primary-config v-if="analysis"></primary-config>
  </div>
</template>

<script>
// stored-analysis-config.vue

const chooseStoredAnalysis = httpVueLoader("./choose-stored-analysis.vue");
const primaryConfig = httpVueLoader("./primary-config.vue");

export const components={ chooseStoredAnalysis, primaryConfig };
export const computed={
  ...Vuex.mapState(["analysis"]),
};
</script>
