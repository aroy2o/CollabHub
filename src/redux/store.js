import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './reducers/themeReducer';
import authReducer from './reducers/authReducer';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
  },
});

export default store;
