import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import ViewIcon from "@material-ui/icons/Visibility";

import { useFirebase } from "../../../components/FirebaseProvider";
import { useCollection } from "react-firebase-hooks/firestore";
import { currency } from "../../../utils/formatter";
import format from "date-fns/format";
import AppPageLoading from "../../../components/appPageLoading";
import useStyles from "./styles";
import DetailsDialog from "./details";

function Transaksi() {
  const classes = useStyles();
  const { firestore, user } = useFirebase();
  const transaksiCol = firestore.collection(`toko/${user.uid}/transaksi`);
  const [snapshot, loading] = useCollection(transaksiCol);
  const [transaksiItems, setTransaksiItems] = useState([]);
  const [details, setDetails] = useState({
    open: false,
    transaksi: {},
  });

  const handleCloseDetails = () => {
    setDetails({
      open: false,
      transaksi: {},
    });
  };

  const handleOpenDetails = (transaksiDoc) => (e) => {
    setDetails({
      open: true,
      transaksi: transaksiDoc.data(),
    });
  };

  useEffect(() => {
    if (snapshot) {
      setTransaksiItems(snapshot.docs);
    }
  }, [snapshot]);

  const handleDelete = (transaksiDoc) => async (e) => {
    if (window.confirm("apakah anda yakin?")) {
      const w = await firestore
        .collection(`toko/${user.uid}/transaksi`)
        .doc(transaksiDoc.id)
        .get();
      await w.ref.delete();
    }
  };
  if (loading) {
    return <AppPageLoading />;
  }
  return (
    <>
      <Typography component="h1" variant="h5" paragraph>
        Daftar Transaksi
      </Typography>
      {transaksiItems.length <= 0 && (
        <Typography>Belum ada transaksi</Typography>
      )}
      <Grid container spacing={3}>
        {transaksiItems.map((transaksiDoc) => {
          const transaksiData = transaksiDoc.data();
          return (
            <Grid item key={transaksiDoc.id} xs={12} sm={12} md={6} lg={4}>
              <Card className={classes.card}>
                <CardContent className={classes.transaksiSummary}>
                  <Typography variant="h5" noWrap>
                    NO: {transaksiData.no}
                  </Typography>
                  <Typography>
                    Total : {currency(transaksiData.total)}
                  </Typography>
                  <Typography>
                    Tanggal:
                    {format(
                      new Date(transaksiData.timestamp),
                      "dd-MM-yyyy HH:mm"
                    )}
                  </Typography>
                </CardContent>
                <CardActions className={classes.transaksiActions}>
                  <IconButton onClick={handleOpenDetails(transaksiDoc)}>
                    <ViewIcon></ViewIcon>
                  </IconButton>
                  <IconButton onClick={handleDelete(transaksiDoc)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <DetailsDialog
        open={details.open}
        handleClose={handleCloseDetails}
        transaksi={details.transaksi}
      />
    </>
  );
}

export default Transaksi;
