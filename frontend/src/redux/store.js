import { configureStore } from '@reduxjs/toolkit'
import titleSlice from './slices/titleSlice.js';
import searchCategorySlice from './slices/searchCategorySlice.js';
import loginSlice from './slices/loginSlice.js';

export default configureStore({
  reducer: {
    title: titleSlice,
    category: searchCategorySlice,
    login: loginSlice
  }
})