import React, { useRef, useState } from "react";
import { TextField } from "@material-ui/core";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useSnackbar } from "notistack";
import useStyles from "./styles";
import { Button, Typography } from "@material-ui/core";

function Pengguna() {
  const classes = useStyles();
  const displayNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { auth } = useFirebase();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isError, setError] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const isEmail = (email) => {
    const re =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(String(email).toLowerCase());
  };

  const saveDisplayName = async (e) => {
    const displayName = displayNameRef.current.value;
    console.log(displayName);

    if (!displayName) {
      setError({
        displayName: "Nama wajib diisi",
      });
    } else if (displayName !== auth.currentUser.displayName) {
      setError({
        displayName: "",
      });
      setSubmitting(true);
      await auth.currentUser.updateProfile({
        displayName: displayName,
      });
      setSubmitting(false);
      enqueueSnackbar("Nama berhasil diperbarui", { variant: "success" });
    } else {
    }
  };

  const saveEmail = async (e) => {
    const email = emailRef.current.value;
    if (!email) {
      setError({
        email: "Email wajib diisi",
      });
    } else if (!isEmail(email)) {
      setError({
        email: "Masukkan email yang valid",
      });
    } else if (email !== auth.currentUser.email) {
      setError({
        email: "",
      });
      try {
        setSubmitting(true);
        await auth.currentUser.updateEmail(email);
        setSubmitting(false);
        enqueueSnackbar("Email berhasil diperbarui", { variant: "success" });
      } catch (e) {
        setSubmitting(false);
        setError({
          email: e.code,
        });
      }
    }
  };

  const sendEmailVerification = async (e) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
    };
    setSubmitting(true);
    await auth.currentUser.sendEmailVerification(actionCodeSettings);
    enqueueSnackbar(
      `Email verifikasi telah dikirim ke ${emailRef.current.value}`,
      { variant: "success" }
    );
    setSubmitting(false);
  };

  const updatePassword = async (e) => {
    const password = passwordRef.current.value;
    if (!password) {
      setError({
        password: "Password wajib diisi",
      });
    } else {
      try {
        setSubmitting(true);
        await auth.currentUser.updatePassword(password);
        enqueueSnackbar("Password telah diperbarui", { variant: "success" });
        setSubmitting(false);
      } catch (e) {
        setSubmitting(false);
        setError({
          password: e.code,
        });
      }
    }
  };
  return (
    <div className={classes.pengaturanPengguna}>
      <TextField
        id="displayName"
        name="displayName"
        label="Nama"
        margin="normal"
        defaultValue={auth.currentUser.displayName}
        inputProps={{
          ref: displayNameRef,
          onBlur: saveDisplayName,
        }}
        disabled={isSubmitting}
        helperText={isError.displayName}
        error={isError.displayName ? true : false}
      ></TextField>
      <TextField
        id="email"
        name="email"
        label="Email"
        margin="normal"
        type="email"
        defaultValue={auth.currentUser.email}
        inputProps={{
          ref: emailRef,
          onBlur: saveEmail,
        }}
        disabled={isSubmitting}
        helperText={isError.email}
        error={isError.email ? true : false}
      ></TextField>
      {auth.currentUser.emailVerified ? (
        <Typography color="primary">Email sudah terverifikasi</Typography>
      ) : (
        <Button
          variant="outlined"
          onClick={sendEmailVerification}
          disabled={isSubmitting}
        >
          Kirim email verifikasi
        </Button>
      )}

      <TextField
        name="password"
        id="password"
        label="Password"
        type="password"
        margin="normal"
        autoComplete="new-password"
        inputProps={{
          ref: passwordRef,
          onBlur: updatePassword,
        }}
        disabled={isSubmitting}
        helperText={isError.password}
        error={isError.password ? true : false}
      ></TextField>
    </div>
  );
}

export default Pengguna;
