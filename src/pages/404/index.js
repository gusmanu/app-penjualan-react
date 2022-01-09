import React from "react";

import { Container, Paper, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import useStyles from "./styles";

function NotFound() {
  const classes = useStyles();
  return (
    <Container maxWidth="xs">
      <Paper className={classes.paper}>
        <Typography variant="subtitle1">Halaman tidak ditemukan</Typography>
        <Typography variant="h3">404</Typography>
        <Typography component={Link} to="/">
          Kembali ke Home
        </Typography>
      </Paper>
    </Container>
  );
}

export default NotFound;
