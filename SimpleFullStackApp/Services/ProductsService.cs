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
        Task AddProduct(Product product);
        Task UpdateProduct(int id, Product product);
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
                Total = total,
                PageNum = pageNum,
                PageSize = pageSize,
                Items = items
            };
        }

        public async Task<Product> GetProduct(int id)
        {
            var productData = await _dbContext.Products.FindAsync(id);

            if (productData == null)
                throw new KeyNotFoundException($"Can't find product with Id: {id}");

            return productData;
        }

        public async Task AddProduct(Product product)
        {
            if (product == null)
                throw new ArgumentNullException(nameof(product));

            product.CreatedAt = DateTime.UtcNow;
            
            var skuExists = await _dbContext.Products.AnyAsync(x => x.SKU == product.SKU);
            if (skuExists)
            {
                throw new InvalidDataException($"Product with SKU: {product.SKU} already exists.");
            }

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateProduct(int id, Product product)
        {
            if (product == null)
                throw new ArgumentNullException(nameof(product));

            var productData = await _dbContext.Products.FindAsync(id);
            if (productData == null)
                throw new KeyNotFoundException($"Can't find product with Id: {id}");

            // Check if SKU is being changed and if the new SKU already exists (excluding current product)
            if (productData.SKU != product.SKU)
            {
                var skuExists = await _dbContext.Products.AnyAsync(x => x.SKU == product.SKU && x.ProductId != id);
                if (skuExists)
                    throw new InvalidDataException($"Product with SKU: {product.SKU} already exists.");
            }

            productData.SKU = product.SKU;
            productData.Quantity = product.Quantity;
            productData.Price = product.Price;
            productData.Name = product.Name;
            productData.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteProduct(int id)
        {
            var productData = await _dbContext.Products.FindAsync(id);

            if (productData == null)
                throw new KeyNotFoundException($"Can't find product with Id: {id}");

            _dbContext.Products.Remove(productData);
            await _dbContext.SaveChangesAsync();
        }

    }
}
