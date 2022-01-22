<template>
      <b-row class='mt-4 justify-content-md-center'>
        <div class='col-12'>
          <h5 class=''>Owner's Displays</h5>
          <div class='row'>
            <div
              v-for="display_data in owner_displays"
              :key='display_data.id'
              class='display-card m-2'
            >
              <b-card
                class='display-card elevation border-0'
                footer-bg-variant="white"
                header-bg-variant="white"
                body-class='border-0 p-0 col'
                header-class='border-0 pb-0'
                footer-class='border-0 pt-0'
              >
                <div slot='header'>
                <p class='float-right'>
                  <b-badge
                    pill
                    class='purple'
                    variant="dark">{{ display_data.plotly_config.gene_symbol }}
                  </b-badge>
                  <b-badge
                    pill
                    class='purple'
                    v-if='display_data.is_default' variant="dark">Default
                  </b-badge>
                </p>
                </div>
                <template v-if="display_data.plot_type === 'svg'">
                  <svg-chart :display_data='display_data'></svg-chart>
                </template>
                <template v-else-if="is_type_tsne(display_data)">
                  <tsne-chart
                    :display_data='display_data'
                    :preconfigured=true
                  ></tsne-chart>
                </template>
                <template v-else>
                  <plotly-chart :display_data='display_data' :img='true'></plotly-chart>
                </template>
                <div slot='footer' class='text-right'>
                  <b-button
                    size='sm'
                    variant='link'
                    style='color:#562a6f'
                    @click='save_as_default(display_data.id)'
                  >Make Default
                  </b-button>
                </div>
              </b-card>
            </div>
          </div>
        </div>
      </b-row>
</template>

<script>
// owner-displays.vue

const plotlyChart = httpVueLoader("./plotly-chart.vue");
const svgChart = httpVueLoader("./svg-chart.vue");
const tsneChart = httpVueLoader("./tsne-chart.vue");

export const components={
  plotlyChart,
  svgChart,
  tsneChart,
};
export function data() {
  return {
    loading: false,
  };
}
export const computed={
  ...Vuex.mapState([
    'user',
    'owner_id',
    'dataset_id',
    'default_display_id',
    'config'
  ]),
  ...Vuex.mapGetters(['is_user_owner', 'owner_displays']),
};
export const methods={
  ...Vuex.mapActions([
    'fetch_owner_displays',
    'fetch_user_displays',
    'fetch_default_display',
    'update_default_display_id',
  ]),
  async save_as_default(display_id) {
    const payload={
      display_id,
      user_id: this.user.id,
      dataset_id: this.dataset_id,
    };

    await $.ajax({
      url: '/cgi/save_default_display.cgi',
      type: 'POST',
      data: payload,
      dataType: 'json',
    });

    this.update_default_display_id({ display_id });
  },
  is_type_tsne(display_data) {
    return (
      display_data.plot_type==='tsne_static'||
      display_data.plot_type==='umap_static'||
      display_data.plot_type==='pca_static'||
      display_data.plot_type==='tsne'
    );
  },
};
export function created() {
  if(this.dataset_id) {
    const owner_id=this.owner_id;
    const dataset_id=this.dataset_id;

    this.fetch_owner_displays({ owner_id, dataset_id });
  }
}
</script>