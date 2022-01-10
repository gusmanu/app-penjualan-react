import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "absolute",
    botton: theme.spacing(2),
    right: theme.spacing(2),
  },
  card: {
    display: "flex",
  },
  foto: {
    width: 150,
  },
  fotoPlaceholder: {
    width: 150,
    alignSelf: "center",
    textAlign: "center",
  },
}));

export default useStyles;
