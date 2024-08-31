"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

import { useSearchParams } from "next/navigation";
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CardActionArea,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import Image from "next/image";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const searchParams = useSearchParams();
  const search = searchParams.get("id");

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;
      const colRef = collection(doc(collection(db, "user"), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
    }
    getFlashcard();
  }, [user, search]);

  const handleCardClick = (id) => {
    if (isEditing) {
      const selectedCard = flashcards.find((card) => card.id === id);
      setSelectedFlashcard(selectedCard);
      setNewFront(selectedCard.front);
      setNewBack(selectedCard.back);
      setIsDialogOpen(true);
    } else {
      setFlipped((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedFlashcard(null);
    setNewFront("");
    setNewBack("");
  };

  const handleSaveChanges = async () => {
    if (selectedFlashcard) {
      const updatedFlashcards = flashcards.map((card) =>
        card.id === selectedFlashcard.id
          ? { ...card, front: newFront, back: newBack }
          : card
      );
      setFlashcards(updatedFlashcards);

      // Update Firebase
      const docRef = doc(
        collection(doc(collection(db, "user"), user.id), search),
        selectedFlashcard.id
      );
      await updateDoc(docRef, { front: newFront, back: newBack });
    }
    handleDialogClose();
  };

  const handleDeleteFlashcard = async () => {
    if (selectedFlashcard) {
      const updatedFlashcards = flashcards.filter(
        (card) => card.id !== selectedFlashcard.id
      );
      setFlashcards(updatedFlashcards);

      // Delete from Firebase
      const docRef = doc(
        collection(doc(collection(db, "user"), user.id), search),
        selectedFlashcard.id
      );
      await deleteDoc(docRef);
    }
    handleDialogClose();
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#121212",
          color: "#ffffff",
        }}
      >
        <Typography variant="h5">
          Please sign in to view your flashcards.
        </Typography>
        <Link href="/sign-in" passHref>
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: "1rem" }}
          >
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

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
            <button
              style={{
                backgroundColor: isEditing ? "#ff4081" : "#3a3a3a",
                color: "#ffffff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={handleEditClick}
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
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
      <Grid container spacing={2} sx={{ maxWidth: "90%", margin: "0 auto" }}>
        {flashcards.length > 0 && (
          <Box
            sx={{
              mt: 4,
              width: "100%",
              maxHeight: "100%",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, ml: 3 }}>
              {"Flashcard"}
            </Typography>
            <Grid container spacing={2}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      maxWidth: "100%",
                      backgroundColor: isEditing ? "#2e2e2e" : "#1e1e1e",
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleCardClick(flashcard.id)}
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
                              transform: flipped[flashcard.id]
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
                                    : "center",
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
      </Grid>
      <Box sx={{ mb: 6 }} />
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Flashcard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Front"
            type="text"
            fullWidth
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Back"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteFlashcard} color="secondary">
            Delete
          </Button>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
