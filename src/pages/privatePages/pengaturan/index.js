import React from "react";
import { Tabs, Tab, Paper } from "@material-ui/core";
import { Route, Switch, Redirect } from "react-router-dom";
import Pengguna from "./pengguna";
import Toko from "./toko";
import useStyles from "./styles";

function Pengaturan(props) {
  const { location, history } = props;
  const classes = useStyles();
  const handleChangeTab = (event, value) => {
    history.push(value);
  };
  return (
    <Paper square>
      <Tabs
        value={location.pathname}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChangeTab}
      >
        <Tab label="Pengguna" value="/pengaturan/pengguna"></Tab>
        <Tab label="Toko" value="/pengaturan/toko"></Tab>
      </Tabs>
      <div className={classes.tabContent}>
        <Switch>
          <Route path="/pengaturan/pengguna" component={Pengguna} />
          <Route path="/pengaturan/toko" component={Toko} />
          <Redirect to="/pengaturan/pengguna" />
        </Switch>
      </div>
    </Paper>
  );
}

export default Pengaturan;
