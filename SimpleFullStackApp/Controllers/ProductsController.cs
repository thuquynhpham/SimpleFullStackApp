using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimpleFullStackApp.Models;
using SimpleFullStackApp.Services;

namespace SimpleFullStackApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
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
            var productsPagingDto = await _productService.GetAllProducts(q, minPrice, maxPrice, sort, dir, pageNum, pageSize);

            return Ok(productsPagingDto);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var productData = await _productService.GetProduct(id);
                return Ok(productData);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Post([FromBody] Product product)
        {
            try
            {
                await _productService.AddProduct(product);
                return StatusCode(StatusCodes.Status201Created);
            }
            catch (InvalidDataException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Put(int id, [FromBody] Product product)
        {
            try
            {
                await _productService.UpdateProduct(id, product);
                return Ok("Product has been updated");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidDataException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _productService.DeleteProduct(id);
                return Ok("Product has been deleted");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
