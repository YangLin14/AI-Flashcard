"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { writeBatch, doc, collection, getDoc } from "firebase/firestore";
import Image from "next/image";
import { db } from "@/firebase";
import Link from "next/link";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return; // Prevents router usage if user is not signed in
    }
  }, [isLoaded, isSignedIn]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter some text for the flashcard.");
      return;
    }

    setLoading(true); // Set loading to true when starting to fetch
    fetch("/api/generate", {
      // Fixed the URL to include the leading slash
      method: "POST",
      body: text,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setFlashcards(data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        setLoading(false); // Ensure loading is false on error
        console.error("An error occurred while generating flashcards:", error);
        alert("An error occurred while generating flashcards.");
      });
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const saveFlashcards = async () => {
    if (!isSignedIn) {
      alert("Please sign in to save your flashcards.");
      return;
    }

    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "user"), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      if (collections.find((f) => f.name === name)) {
        alert("Flashcard collection with the same name already exists.");
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { flashcards: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }

    const colRef = collection(userDocRef, name);
    flashcards.forEach((flashcard) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocRef, flashcard);
    });

    await batch.commit();
    handleClose();
    router.push(`/flashcards`);
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#1e1e1e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image src="/flashy.jpeg" alt="Flashy Logo" width={40} height={40} />
          <h1 style={{ margin: 0, marginLeft: "0.5rem" }}>Flashy</h1>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e1e1e",
              padding: "0.5rem",
            }}
          >
            <div style={{ marginLeft: "1rem" }}>
              <button
                style={{
                  backgroundColor: "#3a3a3a",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={handleMenuClick}
              >
                Menu
              </button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{ color: "gray", marginLeft: "-1rem" }}
              >
                <MenuItem component="a" href="/">
                  <Typography sx={{ color: "#121212" }}>Home</Typography>
                </MenuItem>
                <MenuItem component="a" href="/generate">
                  <Typography sx={{ color: "#121212" }}>Generate</Typography>
                </MenuItem>
                <MenuItem component="a" href="/flashcards">
                  <Typography sx={{ color: "#121212" }}>Flashcards</Typography>
                </MenuItem>
              </Menu>
            </div>
            <SignedOut>
              <Link href="/sign-in" passHref>
                <button
                  style={{
                    marginRight: "1rem",
                    marginLeft: "3rem",
                    backgroundColor: "#3a3a3a",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Login
                </button>
              </Link>
              <Link href="/sign-up" passHref>
                <button
                  style={{
                    backgroundColor: "#3a3a3a",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <div style={{ marginLeft: "2rem" }}>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>
      <Grid
        container
        spacing={2}
        style={{ padding: "1rem", justifyContent: "center" }}
      >
        <Grid item xs={12}>
          <div
            style={{
              backgroundColor: "#121212",
              padding: "1rem",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <h2>Welcome to Flashy!</h2>
            <p>Start by entering the topic of your flashcards.</p>
          </div>
        </Grid>
      </Grid>
      <Container maxWidth="md">
        <Box
          sx={{
            mt: 4,
            mb: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#121212",
            color: "#ffffff",
            borderRadius: "4px",
            padding: "1rem",
          }}
        >
          <TextField
            label="Enter Flashcard Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            variant="outlined"
            autoFocus
            margin="dense"
            type="text"
            fullWidth
            sx={{
              backgroundColor: "#333333",
              "& .MuiInputBase-input": { color: "#ffffff" },
              "& .MuiInputLabel-root": { color: "#ffffff" },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ffffff",
              },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                { borderColor: "#ffffff" },
            }}
          />
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#3a3a3a" }}
          >
            Submit
          </Button>

          {loading && ( // Show loading animation when loading
            <Box sx={{ mt: 2 }}>
              <CircularProgress color="secondary" />
            </Box>
          )}

          {flashcards.length > 0 && (
            <Box
              sx={{
                mt: 4,
                width: "100%",
                overflowY: "auto",
                maxHeight: "450px",
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, ml: 2 }}>
                Flashcards Preview
              </Typography>
              <Grid container spacing={2}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card
                      sx={{
                        maxWidth: "100%",
                        backgroundColor: "#1e1e1e",
                      }}
                    >
                      <CardActionArea
                        onClick={() => {
                          setFlipped((prev) => {
                            const newFlipped = flashcards.map(() => false);
                            newFlipped[index] = !prev[index];
                            return newFlipped;
                          });
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              perspective: "1000px",
                              "& > div": {
                                transition: "transform 0.6s",
                                transformStyle: "preserve-3d",
                                position: "relative",
                                width: "100%",
                                height: "200px",
                                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                                transform: flipped[index]
                                  ? "rotateY(180deg)"
                                  : "rotateY(0deg)",
                              },
                              "& > div > div": {
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 2,
                                boxSizing: "border-box",
                                overflow: "auto",
                              },
                              "& > div > div:nth-of-type(2)": {
                                transform: "rotateY(180deg)",
                              },
                            }}
                          >
                            <div>
                              <div>
                                <Typography
                                  variant="h5"
                                  component="div"
                                  sx={{
                                    color: "#ffffff",
                                    fontSize: {
                                      xs: "1rem",
                                      sm: "1.25rem",
                                    },
                                  }}
                                >
                                  {flashcard.front}
                                </Typography>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems:
                                    flashcard.back.length > 200
                                      ? "flex-start"
                                      : "center", // Adjust alignment based on text length
                                  height: "100%",
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  component="div"
                                  sx={{
                                    color: "#ffffff",
                                    fontSize: {
                                      xs: "1rem",
                                      sm: "1.25rem",
                                    },
                                  }}
                                >
                                  {flashcard.back.startsWith(" ")
                                    ? flashcard.back.trim()
                                    : flashcard.back}
                                </Typography>
                              </div>
                            </div>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          {flashcards.length > 0 && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpen}
                sx={{ backgroundColor: "#3a3a3a" }}
              >
                Save
              </Button>
            </Box>
          )}

          <Dialog
            open={open}
            onClose={handleClose}
            sx={{ backdropFilter: "blur(5px)", bgcolor: "transparent" }}
          >
            <DialogTitle sx={{ color: "#ffffff", bgcolor: "black" }}>
              Save Flashcards
            </DialogTitle>
            <DialogContent sx={{ bgcolor: "black" }}>
              <DialogContentText sx={{ color: "#ffffff" }}>
                Please enter a name for your flashcards collection.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Collection Name"
                type="text"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: "#333333",
                  color: "#ffffff",
                  "& .MuiInputBase-input": { color: "#ffffff" },
                  "& .MuiInputLabel-root": { color: "#ffffff" },
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    { borderColor: "#ffffff" },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ bgcolor: "black" }}>
              <Button
                onClick={handleClose}
                sx={{ backgroundColor: "#3a3a3a", color: "#ffffff" }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveFlashcards}
                sx={{ backgroundColor: "#3a3a3a", color: "#ffffff" }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </div>
  );
}
