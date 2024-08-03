/* eslint-disable no-underscore-dangle */

import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import appReducer from "./reducers";
import storage from "redux-persist/lib/storage";
import { useDispatch } from "react-redux";

const middleware = [thunk];

const persistConfig = {
  key: "root",
  storage,
  // blacklist: ["bitcoin", "settings"],
};

const rootReducer = (state: any, action: any) => {
  if (action.type === "LOG_OUT") {
    localStorage.removeItem("persist:root");
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  {},
  compose(applyMiddleware(...middleware))
);
export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
