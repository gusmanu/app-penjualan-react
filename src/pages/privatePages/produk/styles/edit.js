import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  hideInputFile: {
    display: "none",
  },
  uploadFotoProduk: {
    textAlign: "center",
    padding: theme.spacing(3),
  },
  previewFotoProduk: {
    width: "100%",
    height: "auto",
  },
}));

export default useStyles;
