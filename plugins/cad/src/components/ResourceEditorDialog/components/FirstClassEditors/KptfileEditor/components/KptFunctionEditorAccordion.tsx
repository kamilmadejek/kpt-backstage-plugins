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

import { SelectItem } from '@backstage/core-components';
import { Button, TextField } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import { Function } from '../../../../../../types/Function';
import { KptfileFunction } from '../../../../../../types/Kptfile';
import {
  getFunctionNameAndTagFromImage,
  getFunctionNameFromImage,
  getFunctionVersionFromImage,
  groupFunctionsByName,
} from '../../../../../../utils/function';
import { PackageResource } from '../../../../../../utils/packageRevisionResources';
import { sortByLabel } from '../../../../../../utils/selectItem';
import { Autocomplete } from '../../../../../Controls/Autocomplete';
import { Select } from '../../../../../Controls/Select';
import { KeyValueEditorAccordion } from '../../Controls';
import { AccordionState, EditorAccordion } from '../../Controls/EditorAccordion';
import { useEditorStyles } from '../../styles';

type OnUpdate = (newValue?: KptfileFunction) => void;

type kptFunctionEditorProps = {
  id: string;
  title: string;
  state: AccordionState;
  value: KptfileFunction;
  onUpdate: OnUpdate;
  allKptFunctions: Function[];
  packageResources: PackageResource[];
};

export const KptFunctionEditorAccordion = ({
  id,
  title,
  state: accordionState,
  value: kptFunction,
  onUpdate,
  allKptFunctions,
  packageResources,
}: kptFunctionEditorProps) => {
  const CUSTOM_IMAGE = 'use custom image';

  const functionConfigSelectItems: SelectItem[] = sortByLabel(
    packageResources.map(resource => ({
      label: `${resource.kind}: ${resource.name}`,
      value: resource.filename,
    })),
  );

  functionConfigSelectItems.unshift({ label: 'none', value: 'none' });

  if (kptFunction.configPath && !functionConfigSelectItems.find(item => item.value === kptFunction.configPath)) {
    functionConfigSelectItems.push({
      label: `${kptFunction.configPath} (config map not found)`,
      value: kptFunction.configPath,
    });
  }

  const [state, setState] = useState<KptfileFunction>(kptFunction);
  const [functionNameSelected, setFunctionNameSelected] = useState<string>(kptFunction.image ? CUSTOM_IMAGE : '');
  const previousFunctionNameSelected = usePrevious(functionNameSelected);

  const [functionVersionSelected, setFunctionVersionSelected] = useState<string>('');
  const [customImageName, setCustomImageName] = useState<string>(kptFunction.image);
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [functionVersions, setFunctionVersions] = useState<string[]>([]);
  const [configPathSelected, setConfigPathSelected] = useState<string>(kptFunction.configPath || 'none');
  const [sectionExpanded, setSectionExpanded] = useState<string>();

  const classes = useEditorStyles();
  const allKptFunctionsGroupedByName = useMemo(() => groupFunctionsByName(allKptFunctions), [allKptFunctions]);

  const stateImage = useRef(state.image);

  useEffect(() => {
    const allFunctionNames = Object.keys(allKptFunctionsGroupedByName);
    allFunctionNames.push(CUSTOM_IMAGE);
    setFunctionNames(allFunctionNames);

    if (stateImage.current) {
      const kptKnownFunction = allKptFunctions.find(fn => fn.spec.image === stateImage.current);

      if (kptKnownFunction) {
        const fnName = getFunctionNameFromImage(stateImage.current);
        const fnVersion = getFunctionVersionFromImage(stateImage.current);

        setFunctionNameSelected(fnName);
        setFunctionVersionSelected(fnVersion);
      }
    }
  }, [allKptFunctionsGroupedByName, allKptFunctions]);

  useEffect(() => {
    let imageValue = customImageName;

    if (functionNameSelected && functionNameSelected !== CUSTOM_IMAGE) {
      const selectedFunction = (allKptFunctionsGroupedByName[functionNameSelected] ?? []).find(
        fn => getFunctionVersionFromImage(fn.spec.image) === functionVersionSelected,
      );

      if (selectedFunction) {
        imageValue = selectedFunction.spec.image;
      }
    }

    setState(s => ({ ...s, image: imageValue }));
  }, [customImageName, functionNameSelected, functionVersionSelected, allKptFunctionsGroupedByName]);

  useEffect(() => {
    const versions = (allKptFunctionsGroupedByName[functionNameSelected] ?? []).map(fn =>
      getFunctionVersionFromImage(fn.spec.image),
    );

    setFunctionVersions(versions);

    if (functionNameSelected !== previousFunctionNameSelected && previousFunctionNameSelected !== CUSTOM_IMAGE) {
      setFunctionVersionSelected(versions.length > 0 ? versions[0] : '');
    }
  }, [functionNameSelected, allKptFunctionsGroupedByName, previousFunctionNameSelected]);

  useEffect(() => {
    const configPath = configPathSelected && configPathSelected !== 'none' ? configPathSelected : undefined;
    setState(s => ({ ...s, configPath }));
  }, [configPathSelected]);

  useEffect(() => {
    if (kptFunction !== state) {
      onUpdate(state);
    }
  }, [state, kptFunction, onUpdate]);

  const updateFunctionName = useCallback((functionName: string): void => setFunctionNameSelected(functionName), []);
  const updateFunctionVersion = useCallback((version: string): void => setFunctionVersionSelected(version), []);

  const description = state.image ? getFunctionNameAndTagFromImage(state.image) : 'none';

  const onAddConfig = (): void => {
    setState(s => ({ ...s, configMap: {} }));
  };

  return (
    <EditorAccordion id={id} title={title} description={description} state={accordionState}>
      <Fragment>
        <div className={classes.multiControlRow}>
          <Autocomplete
            label="Function Name"
            options={functionNames}
            onInputChange={updateFunctionName}
            value={functionNameSelected}
          />
          {functionVersions.length > 0 ? (
            <Autocomplete
              label="Version"
              options={functionVersions}
              onInputChange={updateFunctionVersion}
              value={functionVersionSelected}
            />
          ) : (
            <TextField label="Version" variant="outlined" disabled fullWidth value="Not applicable" />
          )}
        </div>
        {functionNameSelected === CUSTOM_IMAGE && (
          <TextField
            label="Image"
            variant="outlined"
            value={customImageName}
            onChange={e => setCustomImageName(e.target.value as string)}
            fullWidth
          />
        )}
        <Select
          label="Function Config"
          selected={configPathSelected}
          items={functionConfigSelectItems}
          onChange={value => setConfigPathSelected(value)}
        />

        {state.configMap !== undefined && (
          <KeyValueEditorAccordion
            id="configMap"
            title="Config Map"
            state={[sectionExpanded, setSectionExpanded]}
            keyValueObject={state.configMap || {}}
            onUpdatedKeyValueObject={configMap => setState(s => ({ ...s, configMap }))}
          />
        )}

        <div className={classes.buttonRow}>
          {state.configMap === undefined && (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onAddConfig()}>
              Add Config
            </Button>
          )}
          <Button variant="outlined" startIcon={<DeleteIcon />} onClick={() => onUpdate(undefined)}>
            Delete
          </Button>
        </div>
      </Fragment>
    </EditorAccordion>
  );
};
