// src/context/ApiContext.js

import React, { createContext, useContext } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const LOCAL_API = 'http://192.168.1.5:5000/api';
  const PROD_API = 'https://pickyourground.com/api';

  const BASE_URL = __DEV__ ? LOCAL_API : PROD_API;

  return (
    <ApiContext.Provider value={{ BASE_URL }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
