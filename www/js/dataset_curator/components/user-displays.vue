<template>
  <b-row class="mt-4 justify-content-md-center">
    <div class="col-12">
      <h5 class="">Your Displays</h5>
      <div class="row">
        <div class="">
          <add-display-button class="m-2"></add-display-button>
        </div>
        <div
          v-for="display_data in user_displays"
          :key="display_data.id"
          class="display-card m-2"
        >
          <transition name="fade" mode="out-in">
            <b-card
              class="display-card elevation border-0"
              footer-bg-variant="white"
              header-bg-variant="white"
              body-class="border-0 p-0 col"
              header-class="border-0 pb-0"
              footer-class="border-0 pt-0"
            >
              <div slot="header">
                <p class="float-right">
                  <b-badge pill class="purple" variant="dark"
                    >{{ display_data.plotly_config.gene_symbol }}
                  </b-badge>
                  <b-badge
                    pill
                    class="purple"
                    v-if="display_data.is_default"
                    variant="dark"
                    >Default
                  </b-badge>
                </p>
              </div>
              <template v-if="display_data.plot_type === 'svg'">
                <svg-chart :display_data="display_data"></svg-chart>
              </template>
              <template v-else-if="is_type_tsne(display_data)">
                <tsne-chart
                  :display_data="display_data"
                  :preconfigured="true"
                ></tsne-chart>
              </template>
              <template v-else>
                <plotly-chart
                  :display_data="display_data"
                  :img="true"
                ></plotly-chart>
              </template>
              <div slot="footer" class="text-right">
                <b-button
                  style="color: red"
                  size="sm"
                  variant="link"
                  @click="delete_display(display_data.id)"
                  >Delete
                </b-button>
                <b-button
                  size="sm"
                  variant="link"
                  style="color: #562a6f"
                  @click="save_as_default(display_data.id)"
                  >Make Default</b-button
                >
                <b-button
                  style="color: #562a6f"
                  variant="link"
                  size="sm"
                  @click="edit_display(display_data.id)"
                  >Edit
                </b-button>
              </div>
            </b-card>
          </transition>
        </div>
      </div>
      <!-- end .row -->
    </div>
    <!-- end .col12 -->
  </b-row>
</template>

<script>
// user-displays.vue

const plotlyChart = httpVueLoader("./plotly-chart.vue");
const svgChart = httpVueLoader("./svg-chart.vue");
const tsneChart = httpVueLoader("./tsne-chart.vue");
const addDisplayButton = httpVueLoader("./add-display-button.vue");

module.exports = {
  components: {
    plotlyChart,
    svgChart,
    tsneChart,
    addDisplayButton,
  },
  data() {
    return {
      // deleteModal: false,
      loading: false,
    };
  },
  computed: {
    ...Vuex.mapState(["user", "dataset_id", "default_display_id", "config"]),
    ...Vuex.mapGetters(["user_displays"]),
    get_config_analysis_id() {
      if (
        typeof this.config.analysis == "undefined" ||
        this.config.analysis == null
      ) {
        return null;
      } else {
        return this.config.analysis.id;
      }
    },
    user_id() {
      return this.user.id;
    },
  },
  methods: {
    ...Vuex.mapActions([
      "fetch_user_displays",
      "fetch_default_display",
      "remove_display",
      "update_default_display_id",
    ]),
    is_type_tsne(display_data) {
      return (
        display_data.plot_type === "tsne_static" ||
        display_data.plot_type === "umap_static" ||
        display_data.plot_type === "pca_static" ||
        display_data.plot_type === "tsne"
      );
    },
    edit_display(display_id) {
      // this.$router.replace(`/dataset/${this.dataset_id}/displays/${display_id}/edit`)
      this.$router.push(`displays/${display_id}/edit`);
    },
    get_default_display() {
      const user_id = this.user_id;
      const dataset_id = this.dataset_id;

      return $.ajax({
        url: "/cgi/get_default_display.cgi",
        type: "POST",
        data: { user_id, dataset_id },
        dataType: "json",
      });
    },
    async save_as_default(display_id) {
      const payload = {
        display_id,
        user_id: this.user.id,
        dataset_id: this.dataset_id,
      };
      await $.ajax({
        url: "/cgi/save_default_display.cgi",
        type: "POST",
        data: payload,
        dataType: "json",
      });

      this.update_default_display_id({ display_id });
    },
    async delete_display(display_id) {
      const payload = {
        id: display_id,
        user_id: this.user_id,
      };

      const res = await $.ajax({
        url: "/cgi/delete_dataset_display.cgi",
        type: "POST",
        data: payload,
        dataType: "json",
      });

      if (res.success) {
        // update our displays so it is removed from the
        // cards that are currently rendered
        this.remove_display({ display_id });
      }
    },
  },
  created() {
    if (this.dataset_id) {
      const user_id = this.user_id;
      const dataset_id = this.dataset_id;

      this.fetch_default_display({ user_id, dataset_id });
      this.fetch_user_displays({ user_id, dataset_id });
    }
  },
  beforeMount() {
    if (this.dataset_id) {
      const user_id = this.user_id;
      const dataset_id = this.dataset_id;

      this.fetch_default_display({ user_id, dataset_id });
      this.fetch_user_displays({ user_id, dataset_id });
    }
  },
};
</script>
