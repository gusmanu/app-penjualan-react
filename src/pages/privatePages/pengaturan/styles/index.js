import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  tabContent: {
    padding: theme.spacing(2),
  },
  pengaturanPengguna: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
  },
  buttonSubmit: {
    marginTop: "20px",
  },
}));

export default useStyles;
