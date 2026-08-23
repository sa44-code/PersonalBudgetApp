import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Alert } from "@mui/material";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5204/login",
        {
          email,
          password
        }
      );

      // Save JWT token
      localStorage.setItem(
        "accessToken",
        response.data.accessToken
      );

      // Tell App.js that login succeeded
      onLogin();

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>
    </Container>
  );
}

export default Login;
