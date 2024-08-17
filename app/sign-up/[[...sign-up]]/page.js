import { SignIn, SignUp } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function SignUpPage() {
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
        <Link href="/" passHref>
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <Image
              src="/flashy.jpeg"
              alt="Flashy Logo"
              width={40}
              height={40}
            />
            <h1
              style={{
                margin: 0,
                marginLeft: "0.5rem",
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              Flashy
            </h1>
          </div>
        </Link>
        <div>
          <SignedOut>
            <Link href="/sign-in" passHref>
              <button
                style={{
                  marginRight: "1rem",
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
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{ marginTop: "20px" }}
      >
        <Typography variant="h4">Sign Up</Typography>
        <SignUp />
      </Box>
    </div>
  );
}
