/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { KubernetesResource } from '../../types/KubernetesResource';
import { getGroupVersionKind } from '../../utils/kubernetesResource';
import { loadYaml } from '../../utils/yaml';
import { YamlViewer } from '../Controls';
import { FirstClassViewerSelector } from './components/FirstClassViewerSelector';

type ResourceViewerProps = {
  open: boolean;
  onClose: () => void;
  yaml?: string;
  originalYaml?: string;
  showDiff?: boolean;
};

const useStyles = makeStyles({
  container: {
    width: '640px',
    minHeight: '340px',
    maxHeight: 'calc(80vh - 120px)',
    marginBottom: '10px',
    overflowY: 'scroll',
    whiteSpace: 'pre',
  },
});

export const ResourceViewerDialog = ({ open, onClose, yaml, originalYaml, showDiff }: ResourceViewerProps) => {
  const [showYamlView, setShowYamlView] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => {
    if (open) {
      setShowYamlView(false);
    }
  }, [open]);

  if (!yaml && !originalYaml) return <div />;

  const isDeleted = !yaml;

  const thisYaml = yaml || originalYaml || '';
  const resourceYaml = loadYaml(thisYaml) as KubernetesResource;

  const toggleView = (): void => {
    setShowYamlView(!showYamlView);
  };

  const kind = resourceYaml.kind;
  const resourceName = resourceYaml.metadata.name;
  const groupVersionKind = getGroupVersionKind(resourceYaml);

  const displayYamlHeight = (thisYaml.split('\n').length + 1) * 18;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>
        {kind} {resourceName} {isDeleted && '(Removed)'}
      </DialogTitle>
      <DialogContent>
        <Fragment>
          <div className={classes.container} style={{ height: `${displayYamlHeight}px` }}>
            {showYamlView ? (
              <YamlViewer value={thisYaml} original={originalYaml} showDiff={showDiff} />
            ) : (
              <FirstClassViewerSelector
                groupVersionKind={groupVersionKind}
                yaml={yaml}
                originalYaml={originalYaml}
                showDiff={showDiff}
              />
            )}
          </div>

          <Button variant="text" color="primary" onClick={toggleView}>
            Show {showYamlView ? 'Formatted View' : 'YAML View'}
          </Button>
        </Fragment>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
