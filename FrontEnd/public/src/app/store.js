import { configureStore } from "@reduxjs/toolkit";
import termReducer from "../feature/termSlice";

export default configureStore({
    reducer: {
        term : termReducer,
    },
});

