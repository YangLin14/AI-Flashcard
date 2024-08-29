"use client";

import { useState, useEffect } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
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
} from "@mui/material";
import Image from "next/image";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

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
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    // Implement navigation logic here
    console.log(`Navigating to ${path}`);
    handleMenuClose();
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
    </div>
  );
}
