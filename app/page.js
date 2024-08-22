"use client";
import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Grid, Button, Menu, MenuItem, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#ffffff",
        minHeight: "100vh",
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
            <h1>Welcome to Flashy!</h1>
            <p>Get ready to create your personalized flashcards.</p>
            <Link href="/generate" passHref>
              <Button
                variant="contained"
                sx={{ mt: 2, backgroundColor: "#3a3a3a" }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </Grid>

        {/* Top three boxes with explanations */}
        <Grid item xs={12} md={4}>
          <div
            style={{
              backgroundColor: "#121212",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <h2>Features</h2>
            <p>Leverage AI to enhance your learning experience.</p>
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <div
            style={{
              backgroundColor: "#121212",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <h2>Easy to Use</h2>
            <p>Our platform is user-friendly and intuitive.</p>
          </div>
        </Grid>

        <Grid item xs={12} md={4}>
          <div
            style={{
              backgroundColor: "#121212",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <h2>AI-Powered</h2>
            <p>Leverage AI to enhance your learning experience.</p>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div
            style={{
              backgroundColor: "#121212",
              padding: "1rem",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <h2>Pricing Plans</h2>
            <p>Select the plan that suits you best!</p>
          </div>
        </Grid>

        {/* Bottom three boxes with pricing */}
        <Grid
          item
          xs={12}
          md={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundImage: "url('moon.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "1rem",
              borderRadius: "50%",
              width: "200px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <h2>Basic</h2>
            <div style={{ margin: "0.3rem 0" }}></div>
            <p>$5 / month</p>
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundImage: "url('sun.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "1rem",
              borderRadius: "50%",
              width: "300px",
              height: "300px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <h2>Expert</h2>
            <div style={{ margin: "0.3rem 0" }}></div>
            <p>$15 / month</p>
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundImage: "url('earth.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "1rem",
              borderRadius: "50%",
              width: "255px",
              height: "250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <h2>Advance</h2>
            <div style={{ margin: "0.3rem 0" }}></div>
            <p>$10 / month</p>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
