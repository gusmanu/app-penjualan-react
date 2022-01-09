import React, { useState, useEffect } from "react";
import { TextField, Button } from "@material-ui/core";
import useStyles from "./styles";
import isURL from "validator/lib/isURL";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useSnackbar } from "notistack";
import { useDocument } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/appPageLoading";
import { Prompt } from "react-router-dom";

function Toko() {
  const classes = useStyles();
  const { firestore, user } = useFirebase();
  const tokoDoc = firestore.doc(`toko/${user.uid}`);
  const { enqueueSnackbar } = useSnackbar();
  const [snapshot, loading] = useDocument(tokoDoc);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    website: "",
  });

  const [error, setError] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    website: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);
  const [isSomethingChange, setSomethingChange] = useState(false);

  useEffect(() => {
    if (snapshot) {
      setForm(snapshot.data());
    }
  }, [snapshot]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError({
      [e.target.name]: "",
    });

    setSomethingChange(true);
  };

  const validate = () => {
    const newError = { ...error };
    if (!form.nama) {
      newError.nama = "nama website wajib diisi";
    }

    if (!form.alamat) {
      newError.alamat = "alamat website wajib diisi";
    }

    if (!form.telepon) {
      newError.telepon = "telepon website wajib diisi";
    }

    if (!form.website) {
      newError.website = "website website wajib diisi";
    } else if (!isURL(form.website)) {
      newError.website = "alamat website tidak valid";
    }

    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const findErrors = validate();
    if (Object.values(findErrors).some((err) => err !== "")) {
      setError(findErrors);
    } else {
      try {
        setSubmitting(true);
        await tokoDoc.set(form, { merge: true });
        enqueueSnackbar("Toko berhasil diperbarui", { variant: "success" });
        setSubmitting(false);
        setSomethingChange(false);
      } catch (e) {
        setSubmitting(false);
        console.log(e.message);
      }
    }
  };

  if (loading) {
    return <AppPageLoading></AppPageLoading>;
  }
  return (
    <div>
      <form
        className={classes.pengaturanPengguna}
        onSubmit={handleSubmit}
        noValidate
      >
        <TextField
          id="nama"
          name="nama"
          label="Nama Toko"
          margin="normal"
          required
          value={form.nama}
          onChange={handleChange}
          error={error.nama ? true : false}
          helperText={error.nama}
          disabled={isSubmitting}
        ></TextField>
        <TextField
          id="alamat"
          name="alamat"
          label="Alamat Toko"
          required
          margin="normal"
          multiline
          rowMax={3}
          value={form.alamat}
          onChange={handleChange}
          error={error.alamat ? true : false}
          helperText={error.alamat}
          disabled={isSubmitting}
        ></TextField>
        <TextField
          id="telepon"
          name="telepon"
          label="Telepon Toko"
          margin="normal"
          required
          value={form.telepon}
          onChange={handleChange}
          error={error.telepon ? true : false}
          helperText={error.telepon}
          disabled={isSubmitting}
        ></TextField>
        <TextField
          id="website"
          name="website"
          label="Website Toko"
          margin="normal"
          required
          value={form.website}
          onChange={handleChange}
          error={error.website ? true : false}
          helperText={error.website}
          disabled={isSubmitting}
        ></TextField>

        <Button
          className={classes.buttonSubmit}
          variant="constrained"
          color="primary"
          disabled={isSubmitting || !isSomethingChange}
          type="submit"
        >
          Submit
        </Button>
      </form>
      <Prompt
        when={isSomethingChange}
        message="terdapat perubahan yang belum disimpan, apakah anda yakin?"
      />
    </div>
  );
}

export default Toko;
