using System;

namespace PersonalBudgetApp.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string Category { get; set; } = string.Empty;

        public DateTime Date { get; set; }
    }
}
