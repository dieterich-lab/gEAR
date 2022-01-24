# Dataset curator notes

The dataset curator page is a Vue.JS app and here are a collection of notes that can aid in the development and troubleshooting of the codebase.

I wanted to make a chart of this, but LucidCharts has an entity limit :-(

## General notes

* The app uses a Vuex store to manage state for the app.
* Certain components will call /api scripts to retrieve some data.  In some cases it is mysql database data and in others it is h5ad data.
* Each plot's arguments are stored in the mysql database as JSON.  This is so the plot can be recreated outside of the Vue app, such as in the gene search display panel.
* Plotly plots are returned as JSON and drawn.  SVG and tSNE plots are returned as SVG format and base64-encoded PNG strings respectively.
* All Vue components use vue-bootstrap
* Plotly arguments uses vee-validate for validation purposes in a few areas
* Any references to files, images, etc. are relative to the path of the script calling the reference

## Component Hierarchy

### Stuff outside the app

* Login controls
* Header
* Footer

### Top-level app

* app
  * datasetCurator
    * routes (from vue-router)
      * /
        * datasetDisplays
          * userDisplays
          * ownerDisplays
            * addDisplayBtn
      * /edit
        * datasetDisplay
      * /new
        * newDisplay

* Common components shared between newDisplay, datasetDisplay, userDisplays, ownerDisplays
  * plotlyChart
  * svgChart
  * tsneChart

### Route to create a brand new plot through arguments

* newDisplay
  * configurationPanel
    * primaryConfig
      * chooseDisplayType
      * plotlyDisplay
        * barDisplay
          * displayNameInput
          * displayColors
          * displayOrder
          * displayPalettes
          * geneSymbolInput (uses vue-bootstrap-typeahead)
          * saveDisplayBtn
          * plotlyArguments (uses vee-validate)
            * verticalLine
        * contourDisplay (extends barDisplay)
        * lineDisplay (extends barDisplay)
        * scatterDisplay (extends barDisplay)
        * tsnePlotlyDisplay(extends scatterDisplay)
        * violinDisplay (extends barDisplay)
      * svgDisplay
        * displayNameInput
        * geneSymbolInput (uses vue-bootstrap-typeahead)
        * saveDisplayBtn
      * tsneDisplay
        * displayNameInput
        * displayColors (uses vueDraggable)
        * geneSymbolInput (uses vue-bootstrap-typeahead)
        * saveDisplayBtn
        * tsneArguments
    * storedAnalysisConfig (also calls primaryConfig)
      * chooseStoredAnalysis

## Loading single-file-components (SFC)

### Vue2

Normally when loading .vue files, a bundler like Browserify or Webpack are required to bundle the files into a .js format that is accessible by the main javascript code.  However, most bundlers tend to use a client that will build a project area and (worse) install lots of node-modules.  Fortunately there is a tool called http-vue-loader  that assists in loading .vue files directly into the html/js environment.  This tool is found here https://github.com/FranckFreiburger/http-vue-loader and will be utilized to load our SFC files.

Some things that are needed to utilize this:

* There are many ways to register a Vue component under http-vue-loader, but I prefer to use `const myComponent = httpVueLoader("./my-component.vue");` and use the variable where a component is needed.
* The above syntax also goes for situations inside of .vue components where you would normally "import" the variable from another path.
* Each .vue component file is renderend in a "\[VM\]-XXXX" file in the Chrome devtools but the .vue script can also be viewed in the "Network section of the devtools tabs.  It can be difficult to tell which .vue file you are actively looking at, so I like to comment the name of the .vue file inside of the "script" tags for easy identification.

### Vue3

NOTE: Not implemented yet.  Will be when or if we upgrade from Vue2 to Vue3

Normally when loading .vue files, a bundler like Browserify or Webpack are required to bundle the files into a .js format that is accessible by the main javascript code.  However, most bundlers tend to use a client that will build a project area and (worse) install lots of node-modules.  Fortunately there is a tool called vue3-sfc-loader that assists in loading .vue files directly into the html/js environment.  This tool is found here https://github.com/FranckFreiburger/vue3-sfc-loader and will be utilized to load our SFC files.

## Vuex Store Organization

I plan on having a nested Vuex store object based on the context of the component calling it.

* Global store (applies to all user and owner displays for the dataset to be curated)
  * Dataset display store (properties common for each plot type)
    * plotly store
    * scanpy store (tsne/umap/pca take same args)
    * svg store
