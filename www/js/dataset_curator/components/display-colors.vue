<template>
  <div id="display-colors">
    <b-row>
      <b-col>
        <h3>Color</h3>
        <b-row v-for="{ name, color } in colors_array" :key="name">
          <b-col>
            <label :for="name">{{ name }}</label>
            <b-form-input
              :key="name"
              type="color"
              :name="name"
              :value="color"
              @change="update_color(name, $event)"
            ></b-form-input>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// display-colors.vue

module.exports = {
  data() {
    return {
      colors_array: [],
    };
  },
  computed: {
    ...Vuex.mapState(["config"]),
  },
  created() {
    // Needed for initial display after first plotting preview
    this.get_colors_array();

    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "set_colors") {
        //console.log("triggered set_colors");
        this.get_colors_array();
      }
    });
  },
  beforeDestroy() {
    // If not present, subscriber will not stop even after component is destroyed
    this.unsubscribe();
  },
  methods: {
    ...Vuex.mapActions(["set_color"]),
    get_colors_array() {
      this.colors_array = Object.entries(this.config.colors).map(
        ([key, val]) => {
          return {
            name: key,
            color: val,
          };
        }
      );
    },
    update_color(name, color) {
      this.set_color({ name, color });
    },
  },
};
</script>
