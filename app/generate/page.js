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
import React from "react";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAIGenerate, setIsAIGenerate] = useState(true);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
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
        setLoading(false);
        console.error("Detailed error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        alert(
          "An error occurred while generating flashcards. Check console for details."
        );
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

  const ToggleSwitch = ({ id, checked, onChange }) => {
    const styles = {
      canToggle: {
        position: "relative",
      },
      input: {
        opacity: 0,
        position: "absolute",
        top: 0,
        left: 0,
      },
      label: {
        userSelect: "none",
        position: "relative",
        display: "flex",
        alignItems: "center",
      },
      switch: {
        position: "relative",
        flex: "0 0 240px",
        height: "36px",
        borderRadius: "18px",
        transition: "background-color 0.3s ease-in-out",
        backgroundColor: checked ? "#3a3a3a" : "#3a3a3a",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 4px",
        cursor: "pointer",
      },
      switchText: {
        fontSize: "14px",
        fontWeight: "bold",
        textTransform: "uppercase",
        zIndex: 1,
        padding: "0 10px",
        transition: "color 0.3s ease-in-out",
      },
      leftText: {
        color: checked ? "rgba(255, 255, 255, 0.5)" : "white",
      },
      rightText: {
        color: checked ? "white" : "rgba(255, 255, 255, 0.5)",
      },
      switchSlider: {
        position: "absolute",
        top: "2px",
        width: "118px",
        height: "32px",
        backgroundColor: "white",
        borderRadius: "16px",
        transition:
          "transform 0.3s ease-in-out, background-color 0.3s ease-in-out",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      },
    };

    return (
      <div className="can-toggle demo-rebrand-1" style={styles.canToggle}>
        <input
          id={id}
          type="checkbox"
          style={styles.input}
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={id} style={styles.label}>
          <div style={styles.switch}>
            <span style={{ ...styles.switchText, ...styles.leftText }}>
              Self Create
            </span>
            <span style={{ ...styles.switchText, ...styles.rightText }}>
              AI Generate
            </span>
            <div
              style={{
                ...styles.switchSlider,
                transform: checked
                  ? "translate3d(116px,0,0)"
                  : "translate3d(0,0,0)",
                backgroundColor: checked ? "#1976d2" : "#1976d2",
              }}
            />
          </div>
        </label>
      </div>
    );
  };

  const saveFlashcard = async () => {
    if (!front.trim() || !back.trim()) {
      alert("Please fill out both the front and back of the flashcard.");
      return;
    }

    const flashcard = {
      front: front.trim(),
      back: back.trim(),
    };

    setFlashcards((prev) => [...prev, flashcard]);
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
            <p>Choose your flashcard generation method:</p>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <ToggleSwitch
                id="generate-toggle"
                checked={isAIGenerate}
                onChange={() => setIsAIGenerate(!isAIGenerate)}
              />
            </Box>
          </div>
        </Grid>
      </Grid>

      {isAIGenerate ? (
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
              <>
                <Typography
                  variant="h5"
                  sx={{ mb: 0, ml: 0, mt: 2, textAlign: "left" }}
                >
                  Flashcards Preview
                </Typography>
                <Box
                  sx={{
                    mt: 4,
                    width: "100%",
                    overflowY: "auto",
                    maxHeight: "450px",
                  }}
                >
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
              </>
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
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                      {
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
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            maxWidth: "90%",
            margin: "0 auto",
          }}
        >
          <Grid item xs={12} sm={6}>
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
                    newFlipped[flashcards.length - 1] =
                      !prev[flashcards.length - 1];
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
                        transform: flipped[flashcards.length - 1]
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
                          {front || "Front (Question)"}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            back.length > 200 ? "flex-start" : "center",
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
                          {back.startsWith(" ")
                            ? back.trim()
                            : back || "Back (Answer)"}
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Front (Question)"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              fullWidth
              multiline
              rows={4}
              sx={{ backgroundColor: "#333333", color: "#ffffff", mb: 2 }}
              InputLabelProps={{ style: { color: "#ffffff" } }}
              InputProps={{ style: { color: "#ffffff" } }}
            />
            <TextField
              label="Back (Answer)"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              fullWidth
              multiline
              rows={4}
              sx={{ backgroundColor: "#333333", color: "#ffffff" }}
              InputLabelProps={{ style: { color: "#ffffff" } }}
              InputProps={{ style: { color: "#ffffff" } }}
            />
            <Button
              variant="contained"
              onClick={() => {
                saveFlashcard();
                setFront("");
                setBack("");
              }}
              sx={{ mt: 2, backgroundColor: "#3a3a3a" }}
            >
              Save Flashcard
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2, ml: 2 }}>
              Flashcards Preview
            </Typography>
            <Box
              sx={{
                mt: 4,
                width: "100%",
                overflowY: "auto",
                maxHeight: "450px",
              }}
            >
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

            {flashcards.length > 0 && (
              <Box
                sx={{ mt: 4, mb: 6, display: "flex", justifyContent: "center" }}
              >
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
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                      {
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
          </Grid>
        </Grid>
      )}
    </div>
  );
}
