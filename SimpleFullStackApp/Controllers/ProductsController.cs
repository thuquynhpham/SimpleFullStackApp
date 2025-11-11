using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleFullStackApp.Data;
using SimpleFullStackApp.Models;

namespace SimpleFullStackApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApiDBContext _dbContext;

        public ProductsController(ApiDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? q,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sort,
            [FromQuery] string? dir,
            [FromQuery] int pageNum = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _dbContext.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var pattern = $"%{q.Trim()}%";
                query = query.Where(p =>
                    EF.Functions.Like(p.SKU, pattern) ||
                    EF.Functions.Like(p.Name, pattern));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            var sortKey = string.IsNullOrWhiteSpace(sort) ? "createdat" : sort.Trim().ToLowerInvariant();
            var sortDir = string.IsNullOrWhiteSpace(dir) ? "asc" : dir.Trim().ToLowerInvariant();
            var descending = sortDir == "desc";

            query = sortKey switch
            {
                "price" => descending
                    ? query.OrderByDescending(p => p.Price)
                    : query.OrderBy(p => p.Price),
                "name" => descending
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name),
                "createdat" => descending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.CreatedAt),
                _ => descending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.CreatedAt)
            };

            const int maxAllowedPageSize = 100;
            if (pageNum < 1) pageNum = 1;
            if (pageSize < 1) pageSize = 10;
            pageSize = Math.Min(pageSize, maxAllowedPageSize);

            var total = await query.CountAsync();
            var items = await query
                .Skip((pageNum - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                total,
                pageNum,
                pageSize,
                items
            });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var productData = await _dbContext.Products.FindAsync(id);

            if (productData == null)
                return NotFound($"Can't find product with Id: {id}");

            return Ok(productData);
        }

        [HttpPost]
        [Authorize]
        public IActionResult Post([FromBody] Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            var productData = _dbContext.Products.Where(x => x.SKU == product.SKU);
            if (productData.Any())
            {
                return Conflict($"Product with SKU: {product.SKU} already exists.");
            }

            _dbContext.Products.Add(product);
            _dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Put(int id, [FromBody] Product product)
        {
            var productData = await _dbContext.Products.FindAsync(id);
            if (productData == null)
                return NotFound($"Can't find product with Id: {id}");

            if(_dbContext.Products.Any(x => x.SKU == product.SKU))
                return Conflict($"Product with SKU: {product.SKU} already exists.");

            productData.SKU = product.SKU;
            productData.Quantity = product.Quantity;
            productData.Price = product.Price;
            productData.Name = product.Name;
            productData.UpdatedAt = DateTime.UtcNow;

            _dbContext.SaveChanges();

            return Ok("Product has been updated");
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var productData = await _dbContext.Products.FindAsync(id);

            if (productData == null)
                return NotFound($"Can't find product with Id: {id}");

            _dbContext.Products.Remove(productData);
            _dbContext.SaveChanges();

            return Ok("Product has been deleted");
        }
    }
}
