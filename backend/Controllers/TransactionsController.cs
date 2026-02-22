using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalBudgetApp.Data;
using PersonalBudgetApp.Models;

namespace PersonalBudgetApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<Transaction>> GetTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }
        // POST
        [HttpPost]
        public async Task<ActionResult<Transaction>> AddTransaction(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTransactions), new { id = transaction.Id }, transaction);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
                return NotFound();

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpPut("{id}")]
public async Task<IActionResult> UpdateTransaction(int id, Transaction transaction)
{
    if (id != transaction.Id)
        return BadRequest();

    var existing = await _context.Transactions.FindAsync(id);
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
