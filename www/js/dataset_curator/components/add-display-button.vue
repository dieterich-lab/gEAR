<template>
  <b-card
    @mouseover="isHovering = true"
    @mouseout="isHovering = false"
    @click="routeToAddDisplay"
    :class="classed"
  >
    <div class="mt-4 pt-5 card-body text-center id=&quot;add-display-btn&quot;">
      <div class="display-4">
        <i class="fas fa-plus"></i>
      </div>
      <p class="card-text">Add Display</p>
    </div>
  </b-card>
</template>

<script>
// add-display-button.vue
export function data() {
  return {
    isHovering: false,
    displayCard: true,
  };
}
export const computed={
  ...Vuex.mapState(["dataset_id"]),
  classed() {
    return {
      hovering: this.isHovering,
      "display-card": true,
      elevation: true,
      "border-0": true,
    };
  },
};
export const methods={
  routeToAddDisplay() {
    this.$router.push(`displays/new`);
  },
};
</script>
