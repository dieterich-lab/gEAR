<template>
      <div>
        <div v-if='!display_data' class='elevation border-0 mb-5 sticky-chart'>
          <div v-if='!is_there_data'>
            <img class='ml-5 m-5' style="width:50px;height:50px;" src='/img/loading_search.gif'/>
          </div>
          <div v-else ref='chart'>
            <img class='img-fluid' v-if='img' :src='imgData'/>
          </div>
          <template v-if='success > 1'>
            <b-card bg-variant="warning" title="Warning">
            <p class='card-text'>{{ message }}</p>
            </b-card>
          </template>
        </div>
        <div v-else ref='chart'>
          <div v-if='!imgData' class='col align-middle text-center mt-5 pt-4'>
            <p class=''>Loading</p>
          </div>
          <div v-else>
            <img class='img-fluid' v-if='img' :src='imgData'/>
          </div>
        </div>
      </div>
</template>

<script>
// plotly-chart.vue

module.exports = {
    props: {
      data: {
        type: Object,
        default: null,
      },
      display_data: {
        type: Object,
        default: null,
      },
      img: Boolean,
    },
    data() {
      return {
        loading: false,
        imgData: '',
        success: 0,
        message: ""
      };
    },
    async created() {
      if (this.display_data) {
        this.loading = true;
        const { plotly_config, plot_type } = this.display_data;
        const payload = { ...plotly_config, plot_type };
        const { data } = await axios.post(
          `/api/plot/${this.dataset_id}`,
          payload
        );
        this.loading = false;
        this.draw_chart(data);
      }
    },
    mounted() {
      if (this.is_there_data) this.draw_chart();
    },
    computed: {
      ...Vuex.mapState(['dataset_id']),
      is_there_data() {
        if (this.data === null) return false;
        return (
          Object.entries(this.data).length !== 0 &&
          this.data.constructor === Object
        );
      },
    },
    watch: {
      data() {
        // because data isn't included in template it
        // is not reactive. So here we explicitly watch
        // for changes and redraw
        this.draw_chart();
      },
    },
    methods: {
      draw_chart(data) {
        if (data) {
          this.loading = false;
          const { plot_json, plot_config } = data;
          this.success = data.success;
          this.message = data.message;
          if (this.img) {
            Plotly.toImage({ ...plot_json, plot_config }).then(url => {
              this.imgData = url;
            });
          } else {
            Plotly.newPlot(this.$refs.chart, { ...plot_json, plot_config });
          }
        } else {
          const { plot_json, plot_config } = this.data;
          this.success = this.data.success;
          this.message = this.data.message;
          if (this.img) {
            Plotly.toImage({ ...plot_json, plot_config }).then(url => {
              this.imgData = url;
            });
          } else {
            Plotly.newPlot(this.$refs.chart, { ...plot_json, plot_config });
          }
        }
      },
    },
  };
</script>