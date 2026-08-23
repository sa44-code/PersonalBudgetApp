import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import Login from "./Login";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  // Check if a JWT already exists
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [alert, setAlert] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  // Get JWT token
  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch transactions for logged-in user
  const fetchTransactions = () => {
    const token = getToken();

    if (!token) {
      return;
    }

    axios
      .get("http://localhost:5204/api/Transactions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          setLoggedIn(false);
        }
      });
  };

  // Fetch transactions after login
  useEffect(() => {
    if (loggedIn) {
      fetchTransactions();
    }
  }, [loggedIn]);

  // Validation
  const validateInput = (desc, amt, cat) => {
    if (!desc || !amt || !cat) {
      setAlert("All fields are required!");
      return false;
    }

    if (isNaN(amt)) {
      setAlert("Amount must be a number!");
      return false;
    }

    setAlert("");
    return true;
  };

  // Add transaction
  const addTransaction = () => {
    if (!validateInput(description, amount, category)) {
      return;
    }

    const token = getToken();

    axios
      .post(
        "http://localhost:5204/api/Transactions",
        {
          description,
          amount: parseFloat(amount),
          category,
          date: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        setDescription("");
        setAmount("");
        setCategory("");

        fetchTransactions();
      })
      .catch((err) => {
        console.error("Error adding transaction:", err);
      });
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    const token = getToken();

    axios
      .delete(`http://localhost:5204/api/Transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        fetchTransactions();
      })
      .catch((err) => {
        console.error("Error deleting transaction:", err);
      });
  };

  // Open edit dialog
  const openEdit = (transaction) => {
    setEditTransaction(transaction);
    setEditOpen(true);
  };

  // Save edited transaction
  const saveEdit = () => {
    if (
      !validateInput(
        editTransaction.description,
        editTransaction.amount,
        editTransaction.category
      )
    ) {
      return;
    }

    const token = getToken();

    axios
      .put(
        `http://localhost:5204/api/Transactions/${editTransaction.id}`,
        editTransaction,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        setEditOpen(false);
        setEditTransaction(null);

        fetchTransactions();
      })
      .catch((err) => {
        console.error("Error updating transaction:", err);
      });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setTransactions([]);
    setLoggedIn(false);
  };

  // If user is not logged in, show Login page
  if (!loggedIn) {
    return (
      <Login
        onLogin={() => {
          setLoggedIn(true);
        }}
      />
    );
  }

  // Calculate total balance
  const totalBalance = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  // Get categories
  const categories = [
    ...new Set(transactions.map((transaction) => transaction.category))
  ];

  // Chart data
  const chartData = {
    labels: categories,

    datasets: [
      {
        label: "Expenses by Category",

        data: categories.map((cat) =>
          transactions
            .filter((transaction) => transaction.category === cat)
            .reduce((sum, transaction) => sum + transaction.amount, 0)
        ),

        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40"
        ]
      }
    ]
  };

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3
        }}
      >
        <Typography variant="h3">
          Personal Expense Budget App
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {alert}
        </Alert>
      )}

      {/* Add Transaction */}
      <Paper sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h5">
          Add Transaction
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            marginTop: 2
          }}
        >
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
          </TextField>

          <Button
            variant="contained"
            color="primary"
            onClick={addTransaction}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* Total Balance */}
      <Typography variant="h5" gutterBottom>
        Total Balance:{" "}
        <span
          style={{
            color: totalBalance >= 0 ? "green" : "red"
          }}
        >
          ${totalBalance.toFixed(2)}
        </span>
      </Typography>

      {/* Transactions */}
      <Paper sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h5">
          Transactions
        </Typography>

        <List>
          {transactions.map((transaction) => (
            <ListItem
              key={transaction.id}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    onClick={() => openEdit(transaction)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    edge="end"
                    onClick={() =>
                      deleteTransaction(transaction.id)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={
                  <span
                    style={{
                      color:
                        transaction.amount >= 0
                          ? "green"
                          : "red"
                    }}
                  >
                    {transaction.description} - $
                    {transaction.amount}
                  </span>
                }
                secondary={transaction.category}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Pie Chart */}
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Expenses by Category
        </Typography>

        {transactions.length > 0 ? (
          <Pie data={chartData} />
        ) : (
          <Typography>
            No transactions yet.
          </Typography>
        )}
      </Paper>

      {/* Edit Dialog */}
      {editTransaction && (
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
        >
          <DialogTitle>
            Edit Transaction
          </DialogTitle>

          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1
            }}
          >
            <TextField
              label="Description"
              value={editTransaction.description}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  description: e.target.value
                })
              }
            />

            <TextField
              label="Amount"
              type="number"
              value={editTransaction.amount}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  amount: parseFloat(e.target.value)
                })
              }
            />

            <TextField
              select
              label="Category"
              value={editTransaction.category}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  category: e.target.value
                })
              }
            >
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </TextField>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setEditOpen(false);
                setEditTransaction(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={saveEdit}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}

export default App;