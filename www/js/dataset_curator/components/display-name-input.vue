<template>
  <div id="display-name-input">
    <b-row class="mt-3">
      <b-col>
        <h3>Display Name</h3>
        <b-form-group>
          <b-form-input
            type="text"
            :value="label"
            @input="update_display_name($event)"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// display-name-input.vue

module.exports = {
  computed: {
    ...Vuex.mapState(["label"]),
  },
  methods: {
    ...Vuex.mapActions(["set_label"]),
    update_display_name(label) {
      this.set_label(label);
    },
  },
};
</script>
