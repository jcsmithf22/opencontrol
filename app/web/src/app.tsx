/// <reference types="vite-plugin-pages/client-solid" />

import { Router } from '@solidjs/router';
import routes from '~solid-pages';
import "./ui/style/index.css"
import { MetaProvider } from '@solidjs/meta';
import { OpenAuthProvider } from "@openauthjs/solid"
import { AccountProvider } from './components/context-account';
import { DialogProvider } from './ui/context-dialog';
import { DialogString } from './ui/dialog-string';
import { DialogSelect } from './ui/dialog-select';
import { ThemeProvider } from './components/context-theme';

export function App(props: { url?: string }) {
  return (
    <ThemeProvider>
      <DialogProvider>
        <DialogString />
        <DialogSelect />
        <OpenAuthProvider clientID="web" issuer={import.meta.env.VITE_AUTH_URL}>
          <AccountProvider>
            <MetaProvider>
              <Router
                children={routes}
                url={props.url}
                root={props => {
                  return <div data-color-mode="dark">
                    {props.children}
                  </div>
                }}
              />
            </MetaProvider>
          </AccountProvider>
        </OpenAuthProvider>
      </DialogProvider>
    </ThemeProvider>
  );
}
