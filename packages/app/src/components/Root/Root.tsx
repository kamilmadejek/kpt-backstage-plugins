/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { PropsWithChildren } from 'react';
import { Link, makeStyles } from '@material-ui/core';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import { NavLink } from 'react-router-dom';
import { Settings as SidebarSettings, UserSettingsSignInAvatar } from '@backstage/plugin-user-settings';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link component={NavLink} to="/" underline="none" className={classes.link}>
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => {
  const configApi = useApi(configApiRef);

  const cadTitle = configApi.getOptionalString('configAsData.branding.title') || 'Config as Data';

  return (
    <SidebarPage>
      <Sidebar>
        <SidebarLogo />
        <SidebarDivider />
        <SidebarGroup label="Menu" icon={<MenuIcon />}>
          <SidebarScrollWrapper>
            <SidebarItem icon={LibraryBooks} to="config-as-data" text={cadTitle} />
          </SidebarScrollWrapper>
        </SidebarGroup>
        <SidebarSpace />
        <SidebarDivider />
        <SidebarGroup label="Settings" icon={<UserSettingsSignInAvatar />} to="/settings">
          <SidebarSettings />
        </SidebarGroup>
      </Sidebar>
      {children}
    </SidebarPage>
  );
};
