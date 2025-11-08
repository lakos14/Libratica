using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email vagy felhasználónév kötelező")]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required(ErrorMessage = "Jelszó kötelező")]
        public string Password { get; set; } = string.Empty;
    }
}
