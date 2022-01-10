import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  produkList: {
    backgroundColor: theme.palette.background.paper,
    maxHeight: 500,
    overflow: "auto",
  },
  inputJumlah: {
    maxWidth: "35px",
  },
}));

export default useStyles;
