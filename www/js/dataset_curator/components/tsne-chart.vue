<template>
     <div>
        <div v-if='is_loading' class='elevation border-0 mb-5 sticky-chart'>
          <img class='ml-5 m-5' style="width:50px;height:50px;" src='/img/loading_search.gif'/>
        </div>
        <template v-if='plot_params_ready || preconfigured'>
          <img :id="preview_id"/>
          <template v-if='success > 1 && !preconfigured'>
            <b-card bg-variant="warning" title="Warning">
            <p class='card-text'>{{ message }}</p>
            </b-card>
          </template>
        </template>
      </div>
</template>

<script>
// tsne-chart.vue

export const props={
  preconfigured: {
    type: Boolean,
    default: false,
  },
  display_data: {
    type: Object
  }
};
export function data() {
  return {
    // local variables to consolidate Vuex version of these, and user/owner versions
    display_tsne_is_loading: true,
    display_image_data: null,
    // stolen from https://gist.github.com/gordonbrander/2230317
    preview_id: 'tsne_preview_'+Math.random().toString(36).substr(2, 9)
  };
}
export const computed={
  ...Vuex.mapState(['dataset_id', 'analysis', 'config', 'image_data', 'success', 'message', 'tsne_is_loading']),
  is_loading() {
    if((this.preconfigured&&this.display_tsne_is_loading==true)
      ||this.tsne_is_loading) {
      return true;
    } else {
      return false;
    }
  },
  plot_params_ready() {
    if(this.config.x_axis&&this.config.y_axis) {
      return true;
    } else {
      return false;
    }
  }
};
export function created() {
  if(this.preconfigured) {
    this.display_tsne_is_loading=this.tsne_is_loading;
    this.display_image_data=this.image_data;
    this.draw_image();
  }
}
export const watch={
  //TODO: Redo all this
  display_image_data() {
    if(this.display_image_data) {
      // applies to tSNE plots within user/owner display previews
      $("#"+this.preview_id).addClass('img-fluid');
    }
    $('#'+this.preview_id).css({ 'max-height': '205px' });
    $("#"+this.preview_id).attr('src', "data:image/png;base64,"+this.display_image_data);
  },
  // This is the Vuex store and is for tsne plots within the DatasetDisplay component
  image_data() {
    if(!this.preconfigured&&this.image_data) {
      $("#"+this.preview_id).addClass('img-fluid');
      $("#"+this.preview_id).attr('src', "data:image/png;base64,"+this.image_data);
    }
  }
};
export const methods={
  ...Vuex.mapActions(['fetch_tsne_image',]),

  // This will only be called when this.preconfigured is true.
  // Otherwise fetch_tsne_image from Vuex store is used.
  get_image_data() {
    const config=this.display_data.plotly_config;
    if(this.gene_symbol) {
      config.gene_symbol=this.gene_symbol;
    }
    const dataset_id=this.dataset_id;
    const plot_type=this.display_data.plot_type;
    // safeguard to load legacy tsne plots (there is config.analysis.id in other code areas in case this needs to be expanded)
    const analysis_id=(this.display_data.plotly_config.analysis_id? this.display_data.plotly_config.analysis_id:this.analysis);

    // then craziness: https://stackoverflow.com/a/48980526
    // shift this out when the fetch_tsne_image method is done in Vuex
    return axios.get(`/api/plot/${dataset_id}/tsne`, {
      params: {
        gene: config.gene_symbol,
        analysis: analysis_id,
        colorize_by: config.colorize_legend_by,
        skip_gene_plot: config.skip_gene_plot,
        plot_by_group: config.plot_by_group,
        max_columns: config.max_columns,
        x_axis: config.x_axis,
        y_axis: config.y_axis,
        plot_type: plot_type,
        analysis_owner_id: this.display_data.user_id,
        colors: config.colors,
        order: config.order,
        // helps stop caching issues
        timestamp: new Date().getTime()
      }
    }).then(
      response => { return response.data; }
    );
  },
  draw_image() {
    this.get_image_data().then(
      data => {
        this.display_tsne_is_loading=false;
        this.display_image_data=data.image;
      }
    );
  }
};
</script>