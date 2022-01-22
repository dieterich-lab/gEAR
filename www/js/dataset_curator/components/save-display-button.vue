<template>
    <b-form-group>
      <b-button @click='save' class='btn-purple float-right'>Save Display</b-button>
    </b-form-group>
</template>

<script>
// save-display-button.vue

export const props={
  display_id: String,
};
export function data() {
  return {
    variant: '',
  };
}
export const computed={
  ...Vuex.mapState(['user', 'dataset_id', 'plot_type', 'config', 'label']),
};
export const methods={
  ...Vuex.mapActions(['update_display']),
  async save() {
    const payload={
      id: this.display_id,
      dataset_id: this.dataset_id,
      user_id: this.user.id,
      label: this.label,
      plot_type: this.plot_type,
      plotly_config: JSON.stringify({
        // depending on display type, this object will
        // have different properties
        ...this.config,
      }),
    };

    const res=await $.ajax({
      url: '/cgi/save_dataset_display.cgi',
      type: 'POST',
      data: payload,
      dataType: 'json',
    });

    if(res&&res.success) {
      if(this.display_id) {
        this.update_display(payload);
      }
      this.$router.push(`/dataset/${this.dataset_id}/displays`);
    } else {
      // not used
      this.variant='danger';
    }
  },
};
</script>