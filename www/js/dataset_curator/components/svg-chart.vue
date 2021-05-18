<template>
  <div>
    <div v-if="!display_data" class="elevation border-0 mb-5">
      <b-card-body no-body class="elevation border-0 mb-5">
        <div ref="chart"></div>
      </b-card-body>
      <template v-if='success > 1'>
        <b-card bg-variant="warning" title="Warning">
        <p class='card-text'>{{ message }}</p>
        </b-card>
      </template>
    </div>
    <div v-else ref="chart" style="height: 230px"></div>
  </div>
</template>

<script>
// svg-chart.vue

module.exports = {
  props: {
    chart_data: {
      type: Object,
      default: null,
    },
    low_color: {
      type: String,
      default: "",
    },
    high_color: {
      type: String,
      default: "",
    },
    display_data: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      paths: [],
      svg: {},
      scoring_method: "gene", // need to make this a toggle
      success: 0,
      message: "",
    };
  },
  computed: {
    ...Vuex.mapState(["dataset_id"]),
  },
  watch: {
    async svg(svg) {
      this.paths = svg.selectAll("path, circle");
      svg.select("svg").attr({
        width: "100%",
        height: this.display_data ? "200px" : "",
      });
      const snap = Snap(this.$refs.chart);
      snap.append(svg);

      if (this.display_data) {
        const { plotly_config } = this.display_data;
        const payload = { ...plotly_config };
        const { gene_symbol } = payload;
        const { data } = await axios.get(
          `/api/plot/${this.dataset_id}/svg?gene=${gene_symbol}`
        );
        this.color_svg(data);
      } else {
        this.color_svg();
      }
    },
    low_color() {
      this.color_svg();
    },
    high_color() {
      this.color_svg();
    },
    chart_data() {
      this.color_svg();
      this.success = this.chart_data.success;
      this.message = this.chart_data.message;
    },
  },
  async created() {
    const svg_path = `datasets_uploaded/${this.dataset_id}.svg`;
    Snap.load(svg_path, (svg) => {
      this.svg = svg;
    });

    if (this.display_data) {
      const { plotly_config } = this.display_data;
      const { gene_symbol } = { ...plotly_config };
      const { data } = await axios.get(
        `/api/plot/${this.dataset_id}/svg?gene=${gene_symbol}`
      );
      this.color_svg(data);
    }
  },
  methods: {
    color_svg(data) {
      let chart_data, low_color, high_color;
      if (data) {
        const { plotly_config } = this.display_data;
        const { colors } = { ...plotly_config };
        low_color = colors.low_color;
        high_color = colors.high_color;
        chart_data = data;
      } else {
        chart_data = this.chart_data;
        low_color = this.low_color;
        high_color = this.high_color;
      }

      const score = chart_data.scores[this.scoring_method];
      const paths = this.paths;
      const { data: expression } = chart_data;
      if (this.scoring_method === "gene" || this.scoring_method === "dataset") {
        const { min, max } = score;
        const color = d3
          .scaleLinear()
          .domain([min, max])
          .range([low_color, high_color]); // these colors should be stored in config

        const tissues = Object.keys(chart_data.data);

        paths.forEach((path) => {
          const tissue = path.node.className.baseVal;
          if (tissues.includes(tissue)) {
            path.attr("fill", color(expression[tissue]));
          }
        });
      }
    },
  },
};
</script>
