import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import useStyles from "./styles";
import { Paper, Typography, TextField, Grid } from "@material-ui/core";
import { Link, Redirect } from "react-router-dom";
import { useFirebase } from "../../components/FirebaseProvider";
import AppLoading from "../../components/appLoading";

function Registrasi() {
  const { auth, user, loading } = useFirebase();
  const classes = useStyles();
  const [form, setForm] = useState({
    email: "",
    password: "",
    ulangi_password: "",
  });

  const [isSubmitting, setIsSubmiting] = useState(false);

  const [validationError, setValidationError] = useState({
    email: "",
    password: "",
    ulangi_password: "",
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
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(String(email).toLowerCase());
  };

  const validate = () => {
    const newError = { ...validationError };

    if (!form.email) {
      newError.email = "email wajib diisi";
    } else if (!isEmail(form.email)) {
      newError.email = "email tidak valid";
    }

    if (!form.password) {
      newError.password = "password wajib diisi";
    }

    if (!form.ulangi_password) {
      newError.ulangi_password = "ulangi password wajib diisi";
    } else if (form.ulangi_password !== form.password) {
      newError.ulangi_password = "ulangi password tidak sama";
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
        await auth.createUserWithEmailAndPassword(form.email, form.password);
      } catch (e) {
        const newError = {};
        switch (e.code) {
          case "auth/email-already-in-use":
            newError.email = "email sudah terdaftar";
            break;
          case "auth/invalid-email":
            newError.email = "email tidak valid";
            break;
          case "auth/weak-password":
            newError.password = "password terlalu lemah";
            break;
          case "auth/operation-not-allowed":
            newError.email = "firebase auth belum diaktifkan";
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
          Registrasi
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
          <TextField
            id="password"
            type="password"
            name="password"
            margin="normal"
            label="masukkan password"
            fullWidth
            required
            value={form.password}
            onChange={handleChange}
            helperText={validationError.password}
            error={validationError.password ? true : false}
            disable={isSubmitting.toString()}
          ></TextField>
          <TextField
            id="ulangi_password"
            type="password"
            name="ulangi_password"
            margin="normal"
            label="ulangi password"
            fullWidth
            required
            value={form.ulangi_password}
            onChange={handleChange}
            helperText={validationError.ulangi_password}
            error={validationError.ulangi_password ? true : false}
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
                Daftar
              </Button>
            </Grid>
            <Grid item>
              <Typography component={Link} to="/login">
                Sudah punya akun? Login
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default Registrasi;
