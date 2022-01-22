<template>
  <div id="dataset-displays">
    <user-displays></user-displays>
    <owner-displays v-if="owner_id && !is_user_owner"></owner-displays>
  </div>
</template>

<script>
// dataset-displays.vue

const userDisplays = httpVueLoader("./user-displays.vue");
const ownerDisplays = httpVueLoader("./owner-displays.vue");

export const computed={
  ...Vuex.mapState(["owner_id"]),
  ...Vuex.mapGetters(["is_user_owner"]),
};
export const components={
  userDisplays,
  ownerDisplays,
};
</script>
