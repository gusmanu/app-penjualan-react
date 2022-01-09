import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(6),
  },
  regisfootercontainer: {
    marginTop: theme.spacing(3),
    alignItems: "center",
  },
}));

export default useStyles;
