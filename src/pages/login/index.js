import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import useStyles from "./styles";
import { Paper, Typography, TextField, Grid } from "@material-ui/core";
import { Link, Redirect } from "react-router-dom";
import { useFirebase } from "../../components/FirebaseProvider";
import AppLoading from "../../components/appLoading";

function Login(props) {
  const { location } = props;
  const { auth, user, loading } = useFirebase();
  const classes = useStyles();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmiting] = useState(false);

  const [validationError, setValidationError] = useState({
    email: "",
    password: "",
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
        await auth.signInWithEmailAndPassword(form.email, form.password);
      } catch (e) {
        const newError = {};
        switch (e.code) {
          case "auth/invalid-email":
            newError.email = "email tidak valid";
            break;
          case "auth/user-disabled":
            newError.email = "user dinonaktifkan";
            break;
          case "auth/user-not-found":
            newError.email = "user tidak ditemukan";
            break;
          case "auth/wrong-password":
            newError.password = "password salah";
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
    const redirectTo =
      location.state && location.state.from && location.state.from.pathname
        ? location.state.from.pathname
        : "/";
    return <Redirect to={redirectTo} />;
  }
  return (
    <Container maxWidth="xs">
      <Paper className={classes.paper}>
        <Typography variant="h5" component="h1" className={classes.title}>
          Login
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

          <Grid container className={classes.regisfootercontainer}>
            <Grid item xs>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                size="large"
                disable={isSubmitting.toString()}
              >
                Login
              </Button>
            </Grid>
            <Grid item>
              <Typography component={Link} to="/registrasi">
                Belum punya akun? Daftar
              </Typography>
            </Grid>
          </Grid>
          <Typography
            component={Link}
            className={classes.lupapassword}
            to="/lupa-password"
          >
            Lupa Password ?
          </Typography>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
