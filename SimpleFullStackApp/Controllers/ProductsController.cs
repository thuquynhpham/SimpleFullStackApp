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
        public async Task<IActionResult> GetAll()
        {
            var products = await _dbContext.Products.ToListAsync();
            return Ok(products);
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
