<template>
  <b-input-group size="sm" prepend="x =">
    <b-form-input
      type="number"
      v-model="vl_pos"
      @keyup="$emit('update:vl_pos', vl_pos)"
    >
    </b-form-input>
    <b-input-group-append>
      <b-form-select
        size="sm"
        :options="options"
        v-model="vl_style"
        @change="$emit('update:vl_style', vl_style)"
      >
      </b-form-select>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
// vertical-line.vue

export const props={
  vl: Object,
};
export function data() {
  return {
    vl_pos: null,
    vl_style: "solid",
    options: [
      { value: "solid", text: "Solid" },
      { value: "dash", text: "Dashed" },
      { value: "dot", text: "Dotted" },
      { value: "dashdot", text: "Dash/Dot" },
    ],
  };
}
</script>
