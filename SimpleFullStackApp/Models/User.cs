using System.ComponentModel.DataAnnotations;

namespace SimpleFullStackApp.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
