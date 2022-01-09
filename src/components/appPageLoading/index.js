import React from "react";

import { CircularProgress } from "@material-ui/core";
import useStyles from "./styles";

function AppPageLoading() {
  const classes = useStyles();
  return (
    <div className={classes.loadingBox}>
      <CircularProgress></CircularProgress>
    </div>
  );
}

export default AppPageLoading;
