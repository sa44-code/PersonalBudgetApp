using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalBudgetApp.Data;
using PersonalBudgetApp.Models;
using System.Security.Claims;

namespace PersonalBudgetApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Transactions
        [HttpGet]
        public async Task<IEnumerable<Transaction>> GetTransactions()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        // POST: api/Transactions
        [HttpPost]
        public async Task<ActionResult<Transaction>> AddTransaction(Transaction transaction)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            transaction.UserId = userId!;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetTransactions),
                new { id = transaction.Id },
                transaction
            );
        }

        // DELETE: api/Transactions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Transactions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(
            int id,
            Transaction transaction)
        {
            if (id != transaction.Id)
                return BadRequest();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existing = await _context.Transactions
                .FirstOrDefaultAsync(
                    t => t.Id == id && t.UserId == userId);

            if (existing == null)
                return NotFound();

            existing.Description = transaction.Description;
            existing.Amount = transaction.Amount;
            existing.Category = transaction.Category;
            existing.Date = transaction.Date;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
