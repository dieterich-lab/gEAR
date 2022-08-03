import anndata
import pandas as pd
import os, sys
import scanpy as sc
import tarfile
sc.settings.verbosity = 0

from gear.datasetuploader import FileType
from pathlib import Path


class H5adUploader(FileType):
    
    """\
    H5ad format upload class.
    
    Attributes
    ----------
    adata
        AnnData object from input file.
    originalFile
        Original file.

    Methods
    -------
    _read_file
        Read input file.
    _write_to_h5ad
        Write to h5ad format.
    """

    def _read_file(self, filepath):
        
        """\
        Read input file.
        
        Parameters
        ----------
        filepath
            Path to input h5ad file.
        """
        
        filepath = Path(filepath)
        adata = sc.read_h5ad(filepath)
        
        # TODO: obs.columns

        self.adata = adata
        self.originalFile = str(filepath) # ... we don't know yet how this is handled elsewhere...
        return self


    def _write_to_h5ad(self, filepath=None):
        
        """\
        Write to h5ad format.
        
        Parameters
        ----------
        filepath
            Path to output h5ad file.
        """
        
        if self.adata is None:
            raise Exception("No AnnData object present to write to file.")
        if filepath is None:
            raise Exception("No destination file path given. Provide one to write file.")
        try:
            # instead of writing redundantly the h5ad file, we just rename it
            p = Path(self.originalFile)
            p.rename(Path(filepath))
        except Exception as err:
            raise Exception("Error occurred while writing to file: ", err)
        return self
