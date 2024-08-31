"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFlashcardName, setNewFlashcardName] = useState("");

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "user"), user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        console.log(collections);
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

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

  const handleCardClick = (id) => {
    if (isEditing) {
      setSelectedFlashcard(flashcards.find((card) => card.name === id));
      setNewFlashcardName(id);
      setIsDialogOpen(true);
    } else {
      router.push(`/flashcard?id=${id}`);
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
    setNewFlashcardName("");
  };

  const handleSaveChanges = async () => {
    if (selectedFlashcard) {
      const updatedFlashcards = flashcards.map((card) =>
        card.name === selectedFlashcard.name
          ? { ...card, name: newFlashcardName }
          : card
      );

      try {
        // Update Firebase
        const docRef = doc(collection(db, "user"), user.id);
        await updateDoc(docRef, { flashcards: updatedFlashcards });

        // Update local state only after successful Firebase update
        setFlashcards(updatedFlashcards);
      } catch (error) {
        console.error("Error updating flashcard:", error);
        // Show an error message to the user
      }
    }
    handleDialogClose();
  };

  const handleDeleteFlashcard = async () => {
    if (selectedFlashcard) {
      const updatedFlashcards = flashcards.filter(
        (card) => card.name !== selectedFlashcard.name
      );

      try {
        // Update the user's document to remove the flashcard from the list
        const userDocRef = doc(collection(db, "user"), user.id);
        await updateDoc(userDocRef, { flashcards: updatedFlashcards });

        // Delete the entire collection associated with the flashcard
        const flashcardCollectionRef = collection(
          db,
          "user",
          user.id,
          selectedFlashcard.name
        );
        const querySnapshot = await getDocs(flashcardCollectionRef);

        // Delete all documents in the collection
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);

        // Update local state
        setFlashcards(updatedFlashcards);
        console.log("Flashcard and its collection deleted successfully");
      } catch (error) {
        console.error("Error deleting flashcard and its collection:", error);
        // Show an error message to the user
      }
    }
    handleDialogClose();
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
      <Container
        maxWidth="100vw"
        sx={{ backgroundColor: "#121212", color: "#ffffff" }}
      >
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backgroundColor: isEditing ? "#2e2e2e" : "#1e1e1e",
                  color: "#ffffff",
                  border: "1px solid #333",
                }}
              >
                <CardActionArea
                  onClick={() => {
                    handleCardClick(flashcard.name);
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{flashcard.name}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Flashcard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Flashcard Name"
            type="text"
            fullWidth
            value={newFlashcardName}
            onChange={(e) => setNewFlashcardName(e.target.value)}
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
