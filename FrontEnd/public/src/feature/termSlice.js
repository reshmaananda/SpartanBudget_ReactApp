import { createSlice } from "@reduxjs/toolkit";

export const termSlice = createSlice({
    name: "term",
    initialState: {
        month: "July",
        year: "2024",
        sideNav: "smartBudget",  // Open/close side navigation bar
    },
    reducers: {
        selectMonth: (state, action) => {
            state.month = action.payload;
        },
        selectYear: (state, action) => {
            state.year = action.payload;
        },
        focusSideNav: (state, action) => {
            state.sideNav = action.payload;
        },
        editBudget: (state, action) => {
            state.editBudget = action.payload;
        },
        editAccounts: (state, action) => {
            state.editAccounts = action.payload;
        },
    },
});

export const { selectMonth, selectYear, focusSideNav, editBudget, editAccounts} = termSlice.actions;

// Selectors
export const selectTermMonth = state => state.term.month;
export const selectTermYear = state => state.term.year;
export const focusSideNavigation = state => state.term.sideNav;
export const editingBudget = state => state.term.editBudget;
export const editingAccounts = state => state.term.editAccounts;

export default termSlice.reducer;
