"use client";
import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Grid, Button, Menu, MenuItem, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const handleSubmit = async () => {
    const checkoutSession = await fetch("/api/checkout_session", {
      method: "POST",
      headers: {
        origin: "https://flashyai.vercel.app/",
      },
    });

    const checkoutSessionJson = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };
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
          onClick={handleSubmit}
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
      <Grid
        container
        spacing={4}
        style={{
          padding: "3rem 1.5rem",
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
        }}
      >
        {/* Contact Form Section */}
        <Grid
          item
          xs={12}
          md={6}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem 2rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <Typography
              variant="h5"
              style={{
                marginBottom: "1.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Get in Touch
            </Typography>
            <form
              method="post"
              action="#"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent!");
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#333",
                    color: "#ffffff",
                  }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#333",
                    color: "#ffffff",
                  }}
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  rows="5"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#333",
                    color: "#ffffff",
                  }}
                ></textarea>
                <Button
                  variant="contained"
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#ffffff",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </Grid>

        {/* Contact Information Section */}
        <Grid
          item
          xs={12}
          md={6}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem 2rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <Typography
              variant="h5"
              style={{
                marginBottom: "1.5rem",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              Contact Information
            </Typography>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                textAlign: "left",
              }}
            >
              <Typography variant="body1">
                <strong>Address:</strong> 9500 Gilman Dr, La Jolla, CA, 92093
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:fongyu903@gmail.com"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  fongyu903@gmail.com
                </a>
              </Typography>
              <Typography variant="body1">
                <strong>Follow Me:</strong>
                <span style={{ verticalAlign: "middle", marginLeft: "1rem" }}>
                  <a
                    href="https://www.linkedin.com/in/yang-12a4c/"
                    target="_blank"
                    style={{ color: "#ffffff", marginRight: "1rem" }}
                  >
                    <img
                      src="/linkedin.webp"
                      alt="LinkedIn"
                      style={{
                        width: "28px",
                        height: "28px",
                        verticalAlign: "middle",
                      }}
                    />
                  </a>
                  <a
                    href="https://github.com/YangLin14"
                    target="_blank"
                    style={{ color: "#ffffff" }}
                  >
                    <img
                      src="/github.webp"
                      alt="GitHub"
                      style={{
                        width: "28px",
                        height: "28px",
                        verticalAlign: "middle",
                      }}
                    />
                  </a>
                </span>
              </Typography>
            </div>
          </div>
        </Grid>

        {/* Footer Section */}
        <Grid item xs={12} style={{ marginTop: "3rem", textAlign: "center" }}>
          <Typography variant="body2" style={{ color: "#d3d3d3" }}>
            &copy; {new Date().getFullYear()} Flashy.
          </Typography>
          <Typography variant="body2" style={{ color: "#d3d3d3" }}>
            Developed by{" "}
            <a
              href="https://www.yourportfolio.com"
              style={{ color: "#d3d3d3", textDecoration: "none" }}
            >
              Fong-Yu (Yang) Lin
            </a>
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}
