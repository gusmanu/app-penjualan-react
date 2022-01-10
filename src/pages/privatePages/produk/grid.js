import React, { useState, useEffect } from "react";
import {
  Fab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
} from "@material-ui/core";

import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import useStyles from "./styles/grid";
import AddDialog from "./add";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useCollection } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/appPageLoading";
import ImageIcon from "@material-ui/icons/Image";
import { currency } from "../../../utils/formatter";
import { Link } from "react-router-dom";

function GridProduk() {
  const classes = useStyles();
  const { firestore, storage, user } = useFirebase();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const produkCol = firestore.collection(`toko/${user.uid}/produk`);
  const [produkItems, setProdukItems] = useState([]);
  const [snapshot, loading] = useCollection(produkCol);
  useEffect(() => {
    if (snapshot) {
      setProdukItems(snapshot.docs);
    }
  }, [snapshot]);
  const handleDelete = (produkDoc) => async (e) => {
    if (window.confirm("apakah anda yakin ingin menghapus produk ini?")) {
      const fotoURL = produkDoc.data().foto;
      const w = await firestore
        .collection(`toko/${user.uid}/produk`)
        .doc(produkDoc.id)
        .get();
      w.ref.delete();
      if (fotoURL) {
        storage.refFromURL(fotoURL).delete();
      }
    }
  };
  if (loading) {
    return <AppPageLoading />;
  }
  return (
    <>
      <Typography variant="h5" component="h1" paragraph>
        Daftar Produk
      </Typography>
      {produkItems.length <= 0 && <Typography>Belum ada produk</Typography>}
      <Grid container spacing={5}>
        {produkItems.map((produkDoc) => {
          const produkData = produkDoc.data();
          return (
            <Grid key={produkDoc.id} item={true} xs={12} sm={12} md={6} lg={4}>
              <Card className={classes.card}>
                {produkData.foto && (
                  <CardMedia
                    className={classes.foto}
                    image={produkData.foto}
                    title={produkData.name}
                  ></CardMedia>
                )}
                {!produkData.foto && (
                  <div className={classes.fotoPlaceholder}>
                    <ImageIcon size="large" color="disabled"></ImageIcon>
                  </div>
                )}
                <CardContent>
                  <Typography variant="h5" noWrap>
                    {produkData.nama}
                  </Typography>
                  <Typography variant="subtitle1">
                    Harga : {currency(produkData.harga)}
                  </Typography>
                  <Typography>Stok : {produkData.stok}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    component={Link}
                    to={`/produk/edit/${produkDoc.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleDelete(produkDoc)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Fab
        color="primary"
        className={classes.fab}
        onClick={(e) => {
          setOpenAddDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
      <AddDialog
        open={openAddDialog}
        handleClose={() => {
          setOpenAddDialog(false);
        }}
      />
    </>
  );
}

export default GridProduk;
