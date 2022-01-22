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

export const props={
  chart_data: {
    type: Object,
    default: null,
  },
  low_color: {
    type: String,
    default: "",
  },
  mid_color: {
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
};
export function data() {
  return {
    loading: false,
    paths: [],
    svg: {},
    scoring_method: "gene",
    success: 0,
    message: "",
  };
}
export const computed={
  ...Vuex.mapState(["dataset_id"]),
};
export const watch={
  async svg(svg) {
    this.paths=svg.selectAll("path, circle");
    svg.select("svg").attr({
      width: "100%",
      height: this.display_data? "200px":"",
    });
    const snap=Snap(this.$refs.chart);
    snap.append(svg);

    if(this.display_data) {
      const { plotly_config }=this.display_data;
      const payload={ ...plotly_config };
      const { gene_symbol }=payload;
      const { data }=await axios.get(
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
  mid_color() {
    this.color_svg();
  },
  high_color() {
    this.color_svg();
  },
  chart_data() {
    this.color_svg();
    this.success=this.chart_data.success;
    this.message=this.chart_data.message;
  },
};
export async function created() {
  const svg_path=`datasets_uploaded/${this.dataset_id}.svg`;
  Snap.load(svg_path, (svg) => {
    this.svg=svg;
  });

  if(this.display_data) {
    const { plotly_config }=this.display_data;
    const { gene_symbol }={ ...plotly_config };
    const { data }=await axios.get(
      `/api/plot/${this.dataset_id}/svg?gene=${gene_symbol}`
    );
    this.color_svg(data);
  }
}
export const methods={
  color_svg(data) {
    let chart_data, low_color, mid_color, high_color;
    if(data) {
      const { plotly_config }=this.display_data;
      const { colors }={ ...plotly_config };
      low_color=colors.low_color;
      mid_color=colors.mid_color;
      high_color=colors.high_color;
      chart_data=data;
    } else {
      chart_data=this.chart_data;
      low_color=this.low_color;
      mid_color=this.mid_color;
      high_color=this.high_color;
    }

    const score=chart_data.scores[this.scoring_method];
    const paths=this.paths;
    const { data: expression }=chart_data;
    if(this.scoring_method==="gene"||this.scoring_method==="dataset") {
      const { min, max }=score;
      let color = null;
      // are we doing a three- or two-color gradient?
      if (mid_color) {
          if (min >= 0) {
              // All values greater than 0, do right side of three-color
              color = d3
                  .scaleLinear()
                  .domain([min, max])
                  .range([mid_color, high_color]);
          } else if (max <= 0) {
              // All values under 0, do left side of three-color
              color = d3
                  .scaleLinear()
                  .domain([min, max])
                  .range([low_color, mid_color]);
          } else {
              // We have a good value range, do the three-color
              color = d3
                  .scaleLinear()
                  .domain([min, 0, max])
                  .range([low_color, mid_color, high_color]);
          }
      } else {
          color = d3
              .scaleLinear()
              .domain([min, max])
              .range([low_color, high_color]);
      }
      const tissues=Object.keys(chart_data.data);

      paths.forEach((path) => {
        const tissue=path.node.className.baseVal;
        if(tissues.includes(tissue)) {
          path.attr("fill", color(expression[tissue]));
        }
      });
    }
  },
};
</script>
