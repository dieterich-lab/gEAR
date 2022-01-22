<template>
       <div id="choose-stored-analysis">
        <b-row>
          <b-col>
            <h3>Stored Analysis</h3>
            <b-form-select v-model="selected_analysis" class="mb-3" :disabled='loading'>
              <option v-if='loading' slot="first" :value="null">Loading stored analyses...</option>
              <option v-else :value="null">Please select stored analysis</option>
              <hr>
              <optgroup label="Public saved analysis">
                <option v-for="analysis in public_analyses" :value="{ id: analysis.id, type: analysis.type }"> {{ analysis.label }}</option>
                <option v-if="!public_analyses.length" disabled>No public analyses for this dataset</option>
                </optgroup>
                <hr>
                <optgroup label="Your saved analysis">
                <option v-for="analysis in private_analyses" :value="{ id: analysis.id, type: analysis.type }"> {{ analysis.label }} </option>
                <option v-if="!private_analyses.length" disabled>No saved analyses for this dataset</option>
              </optgroup>
            </b-form-select>
          </b-col>
        </b-row>
  </div>
</template>

<script>
// choose-stored-analysis.vue

export function data() {
  return {
    selected_analysis: null,
    loading: true,
    public_analyses: [],
    private_analyses: [],
  };
}
export async function created() {
  this.loading=true;
  const { data }=await axios.get(
    `/./api/h5ad/${this.dataset_id}/analyses`
  );
  const { public: public_analyses, private: private_analyses }=data;

  this.public_analyses=public_analyses;
  this.private_analyses=private_analyses;
  this.loading=false;
}
export const watch={
  selected_analysis(new_analysis, old_analysis) {
    this.set_analysis(new_analysis);
  },
};
export const methods={
  ...Vuex.mapActions(['set_analysis']),
};
export const computed={
  ...Vuex.mapState(['dataset_id', 'config']),
};
</script>