<template>
  <div id="display-order">
    <b-row>
      <b-col>
        <h4>Order</h4>
        <b-row v-for="dataseries in order" :key="dataseries.key">
          <b-col>
            <b-list-group class="mb-2">
              <h4>{{ dataseries.key }}</h4>
              <!-- plotly plots -->
              <draggable
                v-if="
                  !['tsne_static', 'umap_static', 'pca_static', 'svg'].includes(
                    plot_type
                  )
                "
                v-model="dataseries.value"
                @end="reorder_plotly_display"
              >
                <transition-group>
                  <b-list-group-item
                    v-for="elem in dataseries.value"
                    :key="elem"
                  >
                    {{ elem }}
                  </b-list-group-item>
                </transition-group>
              </draggable>
              <!-- scanpy plots -->
              <draggable
                v-else-if="
                  ['tsne_static', 'umap_static', 'pca_static'].includes(
                    plot_type
                  )
                "
                v-model="dataseries.value"
                @end="reorder_tsne_display"
              >
                <transition-group>
                  <b-list-group-item
                    v-for="elem in dataseries.value"
                    :key="elem"
                  >
                    {{ elem }}
                  </b-list-group-item>
                </transition-group>
              </draggable>
            </b-list-group>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
// display-order.vue

export const components={
  draggable: vuedraggable,
};
export function data() {
  return {
    order: [],
  };
}
export const computed={
  ...Vuex.mapState(["config", "plot_type", "dataset_id"]),
};
export function created() {
  // Needed for initial display after first plotting preview
  this.get_order();

  this.unsubscribe=this.$store.subscribe((mutation, state) => {
    if(mutation.type==="set_order") {
      this.get_order();
    }
  });
}
export function beforeDestroy() {
  // If not present, subscriber will not stop even after component is destroyed
  this.unsubscribe();
}
export const methods={
  ...Vuex.mapActions(["set_order", "fetch_plotly_data", "fetch_tsne_image"]),
  get_order() {
    const keys=Object.keys(this.config.order);
    const order=keys.map((key) => {
      return {
        key,
        value: [...this.config.order[key]],
      };
    });
    this.order=order;
  },
  reorder_plotly_display() {
    // Convert order from array of objects to a single object
    const order=this.order.reduce(
      (obj, item) => ((obj[item.key]=item.value), obj),
      {}
    );
    this.set_order(order);

    const config=this.config;
    const plot_type=this.plot_type;
    const dataset_id=this.dataset_id;

    this.fetch_plotly_data({ config, plot_type, dataset_id });
  },
  reorder_tsne_display() {
    // Convert order from array of objects to a single object
    const order=this.order.reduce(
      (obj, item) => ((obj[item.key]=item.value), obj),
      {}
    );
    this.set_order(order);

    const config=this.config;
    const plot_type=this.plot_type;
    const dataset_id=this.dataset_id;
    const analysis_id=this.config.analysis? this.config.analysis.id:null;

    this.fetch_tsne_image({ config, plot_type, dataset_id, analysis_id });
  },
};
</script>
