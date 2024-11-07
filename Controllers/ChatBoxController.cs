using Microsoft.AspNetCore.Mvc;

namespace ChatWebApplication.Controllers
{
    public class ChatBoxController : Controller
    {
        private readonly IWebHostEnvironment _environment;

        public ChatBoxController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        // Action to render the chat view
        public IActionResult Index()
        {
            return View();
        }

        // Action to handle image uploads
        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image uploaded");

            // Validate file type
            if (!image.ContentType.StartsWith("image/"))
                return BadRequest("File must be an image");

            try
            {
                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");

                // Create uploads directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Save file
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                }

                // Return the URL to the uploaded image
                var imageUrl = $"/uploads/{fileName}";
                return Json(new { imageUrl });
            }
            catch (Exception)
            {
                return StatusCode(500, "Error uploading image");
            }
        }
    }
}
