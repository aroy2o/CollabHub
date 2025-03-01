import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './reducers/themeReducer';
import authReducer from './reducers/authReducer';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
