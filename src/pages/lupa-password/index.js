import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import useStyles from "./styles";
import { Paper, Typography, TextField, Grid } from "@material-ui/core";
import { Link, Redirect } from "react-router-dom";
import { useFirebase } from "../../components/FirebaseProvider";
import AppLoading from "../../components/appLoading";
import { useSnackbar } from "notistack";

function LupaPassword() {
  const { auth, user, loading } = useFirebase();
  const classes = useStyles();
  const [form, setForm] = useState({
    email: "",
  });

  const [isSubmitting, setIsSubmiting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [validationError, setValidationError] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value,
    }));

    setValidationError((prevError) => ({
      ...prevError,
      [e.target.name]: "",
    }));
  };

  const isEmail = (email) => {
    const re =
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(String(email).toLowerCase());
  };

  const validate = () => {
    const newError = { ...validationError };

    if (!form.email) {
      newError.email = "email wajib diisi";
    } else if (!isEmail(form.email)) {
      newError.email = "email tidak valid";
    }

    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("halo");
    const findValidationError = validate();
    if (Object.values(findValidationError).some((err) => err !== "")) {
      setValidationError(findValidationError);
    } else {
      try {
        setIsSubmiting(true);
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
        };
        await auth.sendPasswordResetEmail(form.email, actionCodeSettings);
        enqueueSnackbar("cek kotak masuk / spam email untuk reset email", {
          variant: "success",
        });
        setIsSubmiting(false);
      } catch (e) {
        const newError = {};
        switch (e.code) {
          case "auth/user-not-found":
            newError.email = "user tidak ditemukan";
            break;
          case "auth/invalid-email":
            newError.email = "email tidak valid";
            break;
          default:
            newError.email = e.code;
        }
        setValidationError(newError);
        setIsSubmiting(false);
      }
    }
  };

  if (loading) {
    return <AppLoading />;
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <Container maxWidth="xs">
      <Paper className={classes.paper}>
        <Typography variant="h5" component="h1" className={classes.title}>
          Lupa Password
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="email"
            type="email"
            name="email"
            margin="normal"
            label="alamat email"
            fullWidth
            required
            value={form.email}
            onChange={handleChange}
            helperText={validationError.email}
            error={validationError.email ? true : false}
            disable={isSubmitting.toString()}
          ></TextField>

          <Grid container className={classes.regisfootercontainer}>
            <Grid item xs>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                size="large"
                disable={isSubmitting.toString()}
              >
                Kirim
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default LupaPassword;
