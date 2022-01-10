import React, { useState, useEffect } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useDocument } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/appPageLoading";
import { useSnackbar } from "notistack";
import useStyles from "./styles/edit";

function EditProduk({ match }) {
  const { enqueueSnackbar } = useSnackbar();
  const { firestore, user, storage } = useFirebase();
  const classes = useStyles();
  const produkDoc = firestore.doc(
    `toko/${user.uid}/produk/${match.params.produkId}`
  );

  const produkStorageRef = storage.ref(`toko/${user.uid}/produk`);

  const [snapshot, loading] = useDocument(produkDoc);
  const [form, setForm] = useState({
    nama: "",
    sku: "",
    harga: 0,
    stok: 0,
    deskripsi: "",
  });

  const [error, setError] = useState({
    nama: "",
    sku: "",
    harga: "",
    stok: "",
    deskripsi: "",
    foto: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (snapshot) {
      setForm((currentForm) => ({
        ...currentForm,
        ...snapshot.data(),
      }));
    }
  }, [snapshot]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError({
      ...error,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const newError = { ...error };
    if (!form.nama) {
      newError.nama = "nama wajib diisi";
    }

    if (!form.harga) {
      newError.harga = "harga wajib diisi";
    }

    if (!form.stok) {
      newError.stok = "harga wajib diisi";
    }

    return newError;
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError((error) => ({
        ...error,
        foto: `Tipe file tidak didukung ${file.type}`,
      }));
    } else if (file.size >= 512000) {
      setError((error) => ({
        ...error,
        foto: `Ukuran file max 512kb`,
      }));
    } else {
      const reader = new FileReader();
      reader.onabort = () => {
        setError((error) => ({
          ...error,
          foto: `upload file dibatalkan`,
        }));
      };
      reader.onerror = () => {
        setError((error) => ({
          ...error,
          foto: `file tidak bisa dibaca`,
        }));
      };

      reader.onload = async () => {
        setError((error) => ({
          ...error,
          foto: ``,
        }));
        setSubmitting(true);
        try {
          const fotoExt = file.name.substring(file.name.lastIndexOf("."));
          const fotoRef = produkStorageRef.child(
            `${match.params.produkId}${fotoExt}`
          );
          const fotoSnapshot = await fotoRef.putString(
            reader.result,
            "data_url"
          );

          const fotoUrl = await fotoSnapshot.ref.getDownloadURL();
          setForm((currentForm) => ({
            ...currentForm,
            foto: fotoUrl,
          }));
        } catch (e) {
          setError((error) => ({
            ...error,
            foto: e.message,
          }));
        }
        setSubmitting(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const findError = validate();
    if (Object.values(findError).some((err) => err !== "")) {
      setError(findError);
      return;
    }
    try {
      setSubmitting(true);
      await produkDoc.set(form, { merge: true });
      enqueueSnackbar("Data berhasil diperbarui", { variant: "success" });
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      enqueueSnackbar(e.message, { variant: "error" });
    }
  };

  if (loading) {
    return <AppPageLoading />;
  }
  return (
    <div>
      <Typography variant="h5" component="h1">
        Edit Produk
      </Typography>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={6}>
          <form id="produk-form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="nama"
              name="nama"
              label="Nama Produk"
              margin="normal"
              fullWidth
              required
              onChange={handleChange}
              helperText={error.nama}
              value={form.nama}
              error={error.nama ? true : false}
              disabled={isSubmitting}
            ></TextField>
            <TextField
              id="sku"
              name="sku"
              label="Sku Produk"
              margin="normal"
              fullWidth
              onChange={handleChange}
              helperText={error.sku}
              value={form.sku}
              error={error.sku ? true : false}
              disabled={isSubmitting}
            ></TextField>
            <TextField
              id="harga"
              name="harga"
              label="Harga Produk"
              margin="normal"
              type="number"
              fullWidth
              required
              value={form.harga}
              onChange={handleChange}
              helperText={error.harga}
              error={error.harga ? true : false}
              disabled={isSubmitting}
            ></TextField>
            <TextField
              id="stok"
              name="stok"
              label="Stok Produk"
              margin="normal"
              type="number"
              required
              fullWidth
              value={form.stok}
              onChange={handleChange}
              helperText={error.stok}
              error={error.stok ? true : false}
              disabled={isSubmitting}
            ></TextField>
            <TextField
              id="deskripsi"
              name="deskripsi"
              label="Deskripsi Produk"
              margin="normal"
              fullWidth
              onChange={handleChange}
              value={form.deskripsi}
              helperText={error.deskripsi}
              error={error.deskripsi ? true : false}
              disabled={isSubmitting}
            ></TextField>
          </form>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className={classes.uploadFotoProduk}>
            {form.foto && (
              <img
                src={form.foto}
                alt={`foto produk ${form.nama}`}
                className={classes.previewFotoProduk}
              ></img>
            )}
            <input
              type="file"
              id="upload-foto-produk"
              accept="image/jpeg,image/png"
              className={classes.hideInputFile}
              onChange={handleUploadFile}
            ></input>
            <label htmlFor="upload-foto-produk">
              <Button
                variant="outlined"
                component="span"
                disabled={isSubmitting}
              >
                Upload Foto Produk
              </Button>
            </label>
            {error.foto && <Typography color="error">{error.foto}</Typography>}
          </div>
        </Grid>
        <Grid item xs={12}>
          <Button
            form="produk-form"
            type="submit"
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            Simpan
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default EditProduk;
