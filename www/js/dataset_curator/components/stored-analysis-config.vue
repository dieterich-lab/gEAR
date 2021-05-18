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

module.exports = {
  components: { chooseStoredAnalysis, primaryConfig },
  computed: {
    ...Vuex.mapState(["analysis"]),
  },
};
</script>
