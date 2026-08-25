import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/';

export const getCategories = createAsyncThunk('menu/getCategories', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL + 'categories');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const getFoods = createAsyncThunk('menu/getFoods', async (queryParams = '', thunkAPI) => {
  try {
    const response = await axios.get(API_URL + 'foods' + queryParams);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

const initialState = {
  categories: [],
  foods: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getFoods.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFoods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foods = action.payload;
      })
      .addCase(getFoods.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default menuSlice.reducer;
