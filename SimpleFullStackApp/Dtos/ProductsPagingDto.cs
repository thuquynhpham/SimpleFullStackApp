using SimpleFullStackApp.Models;

namespace SimpleFullStackApp.Dtos
{
    public class ProductsPagingDto
    {
        public int PageNum { get; set; }
        public int TotalCount { get; set; } = 0;
        public int PageSize { get; set; }

        public IEnumerable<Product> Products { get; set; }

    }
}

