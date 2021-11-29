import React, { createContext, useContext, useEffect, useState } from 'react';
import { UseAsyncReturn } from 'react-async-hook';
import { IAccessToken } from '@shared/interfaces/model';
import apiAxios, { useApiCallback } from '@admin/helpers/api';
import ExtendedSelection, { useSelection } from '@admin/helpers/selection';
import { ModelState, useModelState } from '@admin/helpers/hooks';

export interface IApiSecurityContext {
  selection: ExtendedSelection<IAccessToken>;
  accessTokensState: ModelState<IAccessToken>;
  selectedAccessTokens: IAccessToken[];
  listAccessTokens: UseAsyncReturn<IAccessToken[], []>;
  generateAccessToken: UseAsyncReturn<IAccessToken, [name: string]>;
  deleteAccessTokens: UseAsyncReturn<number[], [ids: number[]]>;
}

const ApiSecurityContext = createContext<IApiSecurityContext>({} as any);

export interface IApiSecurityContextProviderProps {}

const ApiSecurityContextProvider: React.FC<IApiSecurityContextProviderProps> =
  ({ children }) => {
    const [selectedAccessTokens, setSelectedAccessTokens] = useState<
      IAccessToken[]
    >([]);

    const selection = useSelection<IAccessToken>({
      onSelectionChanged: () => {
        setSelectedAccessTokens(selection.getSelection());
      },
      getKey: (backup) => backup.id,
    });

    const accessTokensState = useModelState<IAccessToken>([], (a, b) => {
      return b.id - a.id;
    });

    useEffect(() => {
      // Refresh selection
      selection.setItems(accessTokensState.arrayState, false);
      setSelectedAccessTokens(selection.getSelection());
    }, [accessTokensState.arrayState]);

    const listAccessTokens = useApiCallback(async () => {
      const response = await apiAxios.get('/access-tokens');
      accessTokensState.setArrayState(response.data);
      return response;
    });

    const generateAccessToken = useApiCallback(async (name: string) => {
      const accessToken = await apiAxios.post<any, IAccessToken>(
        `/access-tokens/generate`,
        {
          name,
        }
      );
      accessTokensState.create([accessToken]);
    });

    const deleteAccessTokens = useApiCallback(async (ids: number[]) => {
      await apiAxios.delete(`/backups`);
      accessTokensState.delete(ids);
      return ids;
    });

    return (
      <ApiSecurityContext.Provider
        value={{
          listAccessTokens,
          deleteAccessTokens,
          generateAccessToken,
          selection,
          accessTokensState,
          selectedAccessTokens,
        }}
      >
        {children}
      </ApiSecurityContext.Provider>
    );
  };

const useApiSecurity = () => useContext(ApiSecurityContext);

export { ApiSecurityContextProvider, useApiSecurity };
