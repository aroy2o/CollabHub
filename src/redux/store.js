import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './reducers/themeReducer';
import authReducer from './reducers/authReducer';
// Import using the correct path - directly from the file, not through index
import userReducer from './features/userSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
