using SimpleFullStackApp.Models;
using System.Linq;

namespace SimpleFullStackApp.Dtos
{
    public class ProductsPagingDto
    {
        public int PageNum { get; set; }
        public int Total { get; set; } = 0;
        public int PageSize { get; set; }
        public IEnumerable<Product> Items { get; set; } = Enumerable.Empty<Product>();
    }
}

