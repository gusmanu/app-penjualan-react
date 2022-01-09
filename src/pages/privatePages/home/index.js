import React from "react";
import { Button } from "@material-ui/core";
import { useFirebase } from "../../../components/FirebaseProvider";

function Home() {
  const { auth } = useFirebase();
  return (
    <>
      <Button
        onClick={() => {
          auth.signOut();
        }}
      >
        Sign Out
      </Button>
      <h1>Halaman Home</h1>
    </>
  );
}

export default Home;
