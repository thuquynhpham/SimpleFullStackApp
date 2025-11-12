using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleFullStackApp.Data;
using SimpleFullStackApp.Dtos;
using SimpleFullStackApp.Models;

namespace SimpleFullStackApp.Services
{
    public interface IProductService
    {
        Task<ProductsPagingDto> GetAllProducts(
            string? q,
            decimal? minPrice,
            decimal? maxPrice,
            string? sort,
            string? dir,
            int pageNum = 1,
            int pageSize = 10);
        Task<Product> GetProduct(int id);
        void AddProduct([FromBody] Product product);
        Task UpdateProduct(int id, [FromBody] Product product);
        Task DeleteProduct(int id);
    }

    public class ProductsService : IProductService
    {
        private ApiDBContext _dbContext;
        public ProductsService(ApiDBContext apiDBContext)
        {
            _dbContext = apiDBContext;
        }

        public async Task<ProductsPagingDto> GetAllProducts(
            string? q,
            decimal? minPrice,
            decimal? maxPrice,
            string? sort,
            string? dir,
            int pageNum = 1,
            int pageSize = 10)
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

            return new ProductsPagingDto
            {
                TotalCount = total,
                PageNum = pageNum,
                PageSize = pageSize,
                Products = items
            };
        }

        public async Task<Product> GetProduct(int id)
        {
            var productData = await _dbContext.Products.FindAsync(id);

            if (productData == null)
                throw new KeyNotFoundException($"Can't find product with Id: {id}");

            return productData;
        }

        public void AddProduct([FromBody] Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            var productData = _dbContext.Products.Where(x => x.SKU == product.SKU);
            if (productData.Any())
            {
                throw new InvalidDataException($"Product with SKU: {product.SKU} already exists.");
            }

            _dbContext.Products.Add(product);
            _dbContext.SaveChanges();
        }

        public async Task UpdateProduct(int id, [FromBody] Product product)
        {
            var productData = await _dbContext.Products.FindAsync(id);
            if (productData == null)
                throw new KeyNotFoundException($"Can't find product with Id: {id}");

            if (_dbContext.Products.Any(x => x.SKU == product.SKU))
                throw new InvalidDataException($"Product with SKU: {product.SKU} already exists.");

            productData.SKU = product.SKU;
            productData.Quantity = product.Quantity;
            productData.Price = product.Price;
            productData.Name = product.Name;
            productData.UpdatedAt = DateTime.UtcNow;

            _dbContext.SaveChanges();
        }

        public async Task DeleteProduct(int id)
        {
            var productData = await _dbContext.Products.FindAsync(id);

            if (productData == null)
                throw new KeyNotFoundException($"Can't find product with Id: {id}");

            _dbContext.Products.Remove(productData);
            _dbContext.SaveChanges();
        }

    }
}
