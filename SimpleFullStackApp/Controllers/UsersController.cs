using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SimpleFullStackApp.Data;
using SimpleFullStackApp.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SimpleFullStackApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(IConfiguration configuration, ApiDBContext dbContext) : ControllerBase
    {
        private readonly ApiDBContext _dbContext = dbContext;
        private readonly IConfiguration _configuration = configuration;

        [HttpGet("get")]
        [Authorize]
        public async Task<IActionResult> Get()
        {
            var userClaims = HttpContext.User?.Claims;
            var content = userClaims?.FirstOrDefault(c => c.Type.Equals("sub", StringComparison.OrdinalIgnoreCase))?.Value;
            var user = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? userClaims?.FirstOrDefault(c => c.Type.Equals("sub", StringComparison.OrdinalIgnoreCase))?.Value;
            return Ok(content);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            var userData = await _dbContext.Users.Where(x => x.Email == user.Email).ToListAsync();
            if (userData.Any())
            {
                return Conflict($"User with email: {user.Email} already exists.");
            }

            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPost("signin")]
        public async Task<IActionResult> Login([FromBody] User user)
        {
            var existingUser = _dbContext.Users.Where(x => x.Email == user.Email);
            if (existingUser == null)
                return NotFound("User is not existed");

            var securityKey =  new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Key"]));
            var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: signingCredentials);

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(jwtToken);
        }

        //[HttpDelete("{id}")]
        //public async Task<IActionResult> Delete(int id)
        //{
        //    var productData = await _dbContext.Products.FindAsync(id);

        //    if (productData == null)
        //        return NotFound($"Can't find product with Id: {id}");

        //    _dbContext.Products.Remove(productData);
        //    _dbContext.SaveChanges();

        //    return Ok("Product has been deleted");
        //}
    }
}
