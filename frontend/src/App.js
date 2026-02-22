import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Container, Typography, TextField, MenuItem ,Button, List, ListItem, ListItemText, IconButton, Paper, Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert 
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [alert, setAlert] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  const fetchTransactions = () => {
    axios.get("http://localhost:5204/api/Transactions")
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => fetchTransactions(), []);

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

  const addTransaction = () => {
    if (!validateInput(description, amount, category)) return;

    axios.post("http://localhost:5204/api/Transactions", {
      description,
      amount: parseFloat(amount),
      category,
      date: new Date()
    }).then(() => {
      setDescription("");
      setAmount("");
      setCategory("");
      fetchTransactions();
    });
  };

  const deleteTransaction = (id) => {
    axios.delete(`http://localhost:5204/api/Transactions/${id}`)
      .then(() => fetchTransactions());
  };

  const openEdit = (transaction) => {
    setEditTransaction(transaction);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!validateInput(editTransaction.description, editTransaction.amount, editTransaction.category)) return;

    axios.put(`http://localhost:5204/api/Transactions/${editTransaction.id}`, editTransaction)
      .then(() => {
        setEditOpen(false);
        setEditTransaction(null);
        fetchTransactions();
      });
  };

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  const categories = [...new Set(transactions.map(t => t.category))];
  const chartData = {
    labels: categories,
    datasets: [{
      label: 'Expenses by Category',
      data: categories.map(cat => 
        transactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
      ),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ]
    }]
  };

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      <Typography variant="h3" gutterBottom>Finance Tracker</Typography>

      {alert && <Alert severity="warning" sx={{ mb: 2 }}>{alert}</Alert>}

      <Paper sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h5">Add Transaction</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 2 }}>
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <TextField label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
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
          <Button variant="contained" color="primary" onClick={addTransaction}>Add</Button>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom>Total Balance: 
        <span style={{ color: totalBalance >= 0 ? 'green' : 'red' }}> ${totalBalance}</span>
      </Typography>

      <Paper sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h5">Transactions</Typography>
        <List>
          {transactions.map(t => (
            <ListItem
              key={t.id}
              secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => openEdit(t)}><EditIcon /></IconButton>
                  <IconButton edge="end" onClick={() => deleteTransaction(t.id)}><DeleteIcon /></IconButton>
                </>
              }
            >
              <ListItemText 
                primary={<span style={{ color: t.amount >=0 ? 'green' : 'red' }}>{t.description} - ${t.amount}</span>} 
                secondary={t.category} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>Expenses by Category</Typography>
        <Pie data={chartData} />
      </Paper>

      {/* Edit Dialog */}
      {editTransaction && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Description" 
              value={editTransaction.description} 
              onChange={e => setEditTransaction({ ...editTransaction, description: e.target.value })}
            />
            <TextField 
              label="Amount" 
              type="number"
              value={editTransaction.amount} 
              onChange={e => setEditTransaction({ ...editTransaction, amount: parseFloat(e.target.value) })}
            />
            <TextField 
              label="Category" 
              value={editTransaction.category} 
              onChange={e => setEditTransaction({ ...editTransaction, category: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveEdit}>Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}

export default App;
