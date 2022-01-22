<template>
  <b-container v-if="user" fluid>
    <transition name="fade" mode="out-in"> <!-- TODO: move in router-view for vue3 -->
      <router-view></router-view>  <!-- nested router for children paths -->
    </transition>
  </b-container>
</template>

<script>
//dataset-curator.vue

const datasetDisplays = httpVueLoader("./dataset-displays.vue");
const newDisplay = httpVueLoader("./new-display.vue");
const datasetDisplay = httpVueLoader("./dataset-display.vue");

export const components={
  datasetDisplay,
  datasetDisplays,
  newDisplay
};
export const props={
  dataset_id: String,
};
export const computed={
  ...Vuex.mapState(['user']),
};
export const watch={
  dataset_id() {
    // not elegant, but watch for ids to change
    // and force a reload...
    location.reload();
  },
};
export function created() {
  sleep(500).then(() => {
    // If CURRENT_USER is defined at this point, add information as placeholder test
    if(CURRENT_USER) {
      this.$store.commit('set_user', CURRENT_USER);
    }
  });
  this.fetch_dataset_info(this.dataset_id);
}
export const methods={
  ...Vuex.mapActions(["fetch_dataset_info"]),
};
</script>
