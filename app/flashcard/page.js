"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

import { useSearchParams } from "next/navigation";
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
} from "@mui/material";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);

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

  if (!isLoaded || !isSignedIn) {
    return <></>;
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
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
      <Container maxWidth="100vw">
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {flashcards.length > 0 && (
            <Box
              sx={{
                mt: 4,
                width: "100%",
                maxHeight: "100%",
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, ml: 2 }}>
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
      </Container>
    </div>
  );
}
