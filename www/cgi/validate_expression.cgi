#!/opt/bin/python3

import cgi
import json
import os, sys

# This has a huge dependency stack of libraries. Occasionally, one of them has methods
#  which prints debugging information on STDERR, killing this CGI.  So here we redirect
#  STDOUT until we need it.
original_stdout = sys.stdout
sys.stdout = open(os.devnull, 'w')

lib_path = os.path.abspath(os.path.join('..', '..', 'lib'))
sys.path.append(lib_path)
import geardb

from gear.datasetuploader import FileType, DatasetUploader

VALID_CLUSTER_COLUMN_NAMES = ['cluster', 'cell_type', 'cluster_label', 'subclass_label', 'joint_cluster_round4_annot']
VALID_TSNE_PAIRS = [['tSNE_1', 'tSNE_2'], ['tSNE1', 'tSNE2'], ['tsne1_combined', 'tsne2_combined'],
                    # These are all carlo's custom ones.  Need to resolve this a different way later
                    ['PC1%var6.14', 'PC2%var1.79']]
VALID_UMAP_PAIRS = [['uMAP_1', 'uMAP_2'], ['uMAP1', 'uMAP2'], 
                    ['UMAP_1', 'UMAP_2'], ['UMAP1', 'UMAP2']]

# This is another attempt to fix the STDOUT hack above in a cleaner way, but I couldn't
#  get it to actually change the loglevel of another imported module.
#import logging
#logging.getLogger("matplotlib").setLevel(logging.WARNING)

def main():
    user_upload_file_base = '../uploads/files'

    result = {'success':0, 'shape': {}, 'preview_gene': '', 'plots': [] }

    form = cgi.FieldStorage()
    filename = form.getvalue('filename')
    dataset_id = form.getvalue('dataset_id')

    # This means the PHP upload failed
    if filename is None:
        result['message'] = "File upload failed.  Try again and contact us if this continues."
        print_and_go(json.dumps(result))

    filepath = user_upload_file_base + "/" + filename
    h5_out_path = user_upload_file_base + "/" + filename.replace('.', '_') + '.h5ad'
    analysis_json_path = h5_out_path.replace('.h5ad', '.json')
    session_id = form.getvalue('session_id')

    user = geardb.get_user_from_session_id(session_id)

    if user is None:
        result['message'] = 'User ID not found. Please log in to continue.'
    else:
        # gEAR User found. Read and Validate expression file
        file_type = filename.rsplit('.', 1)[1]

        #Initize uploader for expression data (with factory)
        dsu = DatasetUploader()
        dataset_uploader = dsu.get_by_filetype(filetype=file_type, filepath=filepath)
        try:
            dataset_uploader._read_file(filepath)

            #Let's give the user some feedback on the shape of the dataset.
            rows_X, cols_X = dataset_uploader.adata.X.shape
            cols_obs, rows_obs = dataset_uploader.adata.obs.shape
            cols_var, rows_var = dataset_uploader.adata.var.shape

            add_primary_analysis(dataset_uploader.adata, analysis_json_path, dataset_id)

            dataset_uploader.adata.write(h5_out_path)

            result['success'] = 1
            result['message'] = 'File successfully read.'

            ## test
            # b5cfaedd-1594-a08c-1d0d-697acce81588 - has UMAP
            # e5692d96-7ea1-9f70-ed42-e6edb1637045 - 

            result['shape']['X'] = {'rows': str(rows_X), 'cols': str(cols_X)}
            result['shape']['obs'] = {'rows': str(rows_obs), 'cols': str(cols_obs)}
            result['shape']['var'] = {'rows': str(rows_var), 'cols': str(cols_var)}

        except Exception as err:
            result['message'] = str(err)

    print_and_go(json.dumps(result))

def add_primary_analysis(adata, json_path, dataset_id):
    with open("{0}/../data/analysis_pipeline_template.json".format(lib_path)) as json_in:
        analysis_json = json.load(json_in)

    #analysis = geardb.Analysis(id=dataset_id, dataset_id=dataset_id, type='primary', vetting='owner')

    # Analysis ID and dataset ID are the same for this type
    analysis_json["id"] = dataset_id
    analysis_json["type"] = "primary"
    analysis_json["label"] = "Primary analysis"
    analysis_json["dataset_id"] = dataset_id
    analysis_json["dataset"]["id"] = dataset_id

    h5ad_changes_made = False
    json_changes_made = False

    tsne_detected = detect_tsne(adata)
    if tsne_detected:
        json_changes_made = True

        analysis_json['tsne']['tsne_calculated'] = True
        analysis_json['tsne']['plot_tsne'] = 1
        add_tsne_analysis(adata)
        h5ad_changes_made = True

def add_tsne_analysis(adata):
    cols = adata.obs.columns.tolist()

    for pair in VALID_TSNE_PAIRS:
        if pair[0] in cols and pair[1] in cols:
            adata.obsm['X_tsne'] = adata.obs[[pair[0], pair[1]]].values
            return
        
def detect_tsne(adata):
    """
    Looks for the combination of pairs in VALID_TSNE_PAIRS
    """
    cols = adata.obs.columns.tolist()

    for pair in VALID_TSNE_PAIRS:
        if pair[0] in cols and pair[1] in cols:
            return True

    return False    

def print_and_go(content):
    sys.stdout = original_stdout
    print('Content-Type: application/json\n\n', flush=True)
    print(content)
    sys.exit(0)

if __name__ == '__main__':
    main()
