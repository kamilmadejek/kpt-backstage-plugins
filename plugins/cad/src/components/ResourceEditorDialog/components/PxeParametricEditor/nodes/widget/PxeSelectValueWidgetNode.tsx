/**
 * Copyright 2024 The Nephio Authors.
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

import React from 'react';
import { Select } from '../../../../../Controls';
import { PxeSelectValueWidgetEntry } from '../../types/PxeConfiguration.types';
import { withCurrentValues } from '../../utils/rendering/withCurrentValues';
import { generateValueLabel } from '../../utils/generateLabelsForWidgets';
import { PxeParametricEditorNodeProps } from '../../PxeParametricEditorNode';
import { useDiagnostics } from '../../PxeDiagnosticsContext';

const DEFAULT_VALUE = '__DEFAULT_VALUE__';

export const PxeSelectValueWidgetNode: React.FC<PxeParametricEditorNodeProps> = withCurrentValues(
  ({ configurationEntry, onResourceChangeRequest, currentValues: [currentValue] }) => {
    useDiagnostics(configurationEntry);

    const widgetEntry = configurationEntry as PxeSelectValueWidgetEntry;
    const [valueDescriptor] = widgetEntry.valueDescriptors;

    const selectItems = widgetEntry.options.map(({ value, label }) => ({
      value: value !== undefined ? value : DEFAULT_VALUE,
      label,
    }));

    return (
      <Select
        data-testid={`Select_${valueDescriptor.path}`}
        label={generateValueLabel(valueDescriptor)}
        items={selectItems}
        selected={(currentValue ?? DEFAULT_VALUE) as string}
        onChange={value => {
          onResourceChangeRequest({
            valueDescriptor,
            newValue: value !== DEFAULT_VALUE ? value : undefined,
          });
        }}
      />
    );
  },
);
