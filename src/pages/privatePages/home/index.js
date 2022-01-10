import React, { useState, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  ListSubheader,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Typography,
  Grid,
  Avatar,
  TextField,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useCollection } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/appPageLoading";
import useStyles from "./styles";
import { useSnackbar } from "notistack";
import { currency } from "../../../utils/formatter";
import format from "date-fns/format";

function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const todayDateString = format(new Date(), "yyyy-MM-dd");
  const { firestore, user } = useFirebase();
  const produkCol = firestore.collection(`toko/${user.uid}/produk`);
  const transaksiCol = firestore.collection(`toko/${user.uid}/transaksi`);
  const [snapshotTransaksi, loadingTransaksi] = useCollection(
    transaksiCol.where("tanggal", "==", todayDateString)
  );
  const [snapshotProduk, loadingProduk] = useCollection(produkCol);
  const [produkItems, setProdukItems] = useState([]);
  const [filterProduk, setFilterProduk] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const initialTransaksi = {
    no: "",
    items: {},
    total: 0,
    tanggal: todayDateString,
  };
  const [transaksi, setTransaksi] = useState(initialTransaksi);

  const addItem = (produkDoc) => (e) => {
    let newItem = { ...transaksi.items[produkDoc.id] };
    const produkData = produkDoc.data();

    if (newItem.jumlah) {
      newItem.jumlah = newItem.jumlah + 1;
      newItem.subtotal = produkData.harga * newItem.jumlah;
    } else {
      newItem.jumlah = 1;
      newItem.harga = produkData.harga;
      newItem.subtotal = produkData.harga;
      newItem.nama = produkData.nama;
    }

    const newItems = {
      ...transaksi.items,
      [produkDoc.id]: newItem,
    };
    if (newItem.jumlah > produkData.stok) {
      enqueueSnackbar("jumlah melebihi stok", { variant: "error" });
    } else {
      setTransaksi((transaksi) => ({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce((total, k) => {
          const item = newItems[k];
          return total + parseInt(item.subtotal);
        }, 0),
      }));
    }
  };

  const handleChangeJumlah = (k) => (e) => {
    let newItem = {
      ...transaksi.items[k],
    };

    newItem.jumlah = parseInt(e.target.value);

    newItem.subtotal = newItem.harga * newItem.jumlah;

    const newItems = {
      ...transaksi.items,
      [k]: newItem,
    };

    if (newItem.jumlah <= 0) {
      delete newItems[k];
      setTransaksi((transaksi) => ({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce((total, k) => {
          const item = newItems[k];
          return total + parseInt(item.subtotal);
        }, 0),
      }));
      return;
    }
    const produkDoc = produkItems.find((item) => item.id === k);
    const produkData = produkDoc.data();
    if (newItem.jumlah > produkData.stok) {
      enqueueSnackbar("jumlah melebihi stok", { variant: "error" });
    } else {
      setTransaksi((transaksi) => ({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce((total, k) => {
          const item = newItems[k];
          return total + parseInt(item.subtotal);
        }, 0),
      }));
    }
  };

  const simpanTransaksi = async () => {
    if (Object.keys(transaksi.items).length <= 0) {
      enqueueSnackbar("Tambahkan produk terlebih dahulu", { variant: "error" });
      return;
    }
    try {
      setSubmitting(true);
      await transaksiCol.add({
        ...transaksi,
        timestamp: Date.now(),
      });
      await firestore.runTransaction((transaction) => {
        const produkIDs = Object.keys(transaksi.items);
        return Promise.all(
          produkIDs.map((produkId) => {
            const produkRef = firestore.doc(
              `toko/${user.uid}/produk/${produkId}`
            );
            return transaction.get(produkRef).then((produkDoc) => {
              if (!produkDoc.exists) {
                throw new Error(`produk ${produkId} tidak ada`);
              }
              let newStok =
                parseInt(produkDoc.data().stok) -
                parseInt(transaksi.items[produkId].jumlah);
              if (newStok < 0) {
                newStok = 0;
              }
              transaction.update(produkRef, { stok: newStok });
            });
          })
        );
      });
      enqueueSnackbar("Transaksi sukses ditambahkan", { variant: "success" });
      setTransaksi((transaksi) => ({
        ...initialTransaksi,
        no: transaksi.no,
      }));
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      enqueueSnackbar(e.message, { variant: "error" });
    }
  };

  useEffect(() => {
    if (snapshotTransaksi) {
      setTransaksi((transaksi) => ({
        ...transaksi,
        no: `${transaksi.tanggal}/${snapshotTransaksi.docs.length + 1}`,
      }));
    } else {
      setTransaksi((transaksi) => ({
        ...transaksi,
        no: `${transaksi.tanggal}/1`,
      }));
    }
  }, [snapshotTransaksi]);
  useEffect(() => {
    if (snapshotProduk) {
      setProdukItems(
        snapshotProduk.docs.filter((produkDoc) => {
          if (filterProduk) {
            return produkDoc
              .data()
              .nama.toLowerCase()
              .includes(filterProduk.toLowerCase());
          }

          return true;
        })
      );
    }
  }, [snapshotProduk, filterProduk]);

  if (loadingProduk || loadingTransaksi) {
    return <AppPageLoading />;
  }

  return (
    <>
      <Typography variant="h5" component="h1">
        Buat Transaksi Baru
      </Typography>
      <Grid container spacing={5}>
        <Grid item xs>
          <TextField
            label="Nomor Transaksi"
            value={transaksi.no}
            inputProps={{
              readOnly: true,
            }}
          ></TextField>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={simpanTransaksi}
            disabled={isSubmitting}
          >
            Simpan
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={5}>
        <Grid item xs={12} md={8}>
          <Table>
            <TableHead>
              <TableCell>Item</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableHead>
            <TableBody>
              {Object.keys(transaksi.items).map((k) => {
                const item = transaksi.items[k];
                return (
                  <TableRow key={k}>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>
                      <TextField
                        className={classes.inputJumlah}
                        value={item.jumlah}
                        type="number"
                        onChange={handleChangeJumlah(k)}
                        disabled={isSubmitting}
                      ></TextField>
                    </TableCell>
                    <TableCell>{currency(item.harga)}</TableCell>
                    <TableCell>{currency(item.subtotal)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="subtitle2">Total</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">
                    {currency(transaksi.total)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={12} md={4}>
          <List
            className={classes.produkList}
            component="nav"
            subheader={
              <ListSubheader component="div">
                <TextField
                  autoFocus
                  label="Cari produk"
                  fullwidth
                  margin="normal"
                  onChange={(e) => {
                    setFilterProduk(e.target.value);
                  }}
                ></TextField>
              </ListSubheader>
            }
          >
            {produkItems.map((produkDoc) => {
              const produkData = produkDoc.data();
              return (
                <ListItem
                  key={produkDoc.id}
                  button
                  disabled={!produkData.stok || isSubmitting}
                  onClick={addItem(produkDoc)}
                >
                  {produkData.foto ? (
                    <ListItemAvatar>
                      <Avatar
                        src={produkData.foto}
                        alt={produkData.nama}
                      ></Avatar>
                    </ListItemAvatar>
                  ) : (
                    <ListItemIcon>
                      <ImageIcon />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={produkData.nama}
                    secondary={`stok: ${produkData.stok || 0}`}
                  ></ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Grid>
      </Grid>
    </>
  );
}

export default Home;
