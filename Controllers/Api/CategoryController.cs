using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;

// using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOS.CategoryDTOS;
using Mapster;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    [Route("/api/category")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(ICategoryService categoryService, ILogger<CategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AddCategoryAsync(CreateCategoryDTO categoryToCreate)
        {
            try
            {
                var category = await _categoryService.AddCategoryAsync(categoryToCreate);
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategoryAsync(int id, UpdateCategoryDTO categoryToUpdate)
        {
            if (id != categoryToUpdate.Id)
            {
                return BadRequest($"id in parameter and id in body is different. id in parameter: {id}, id in body: {categoryToUpdate.Id}");
            }
            try
            {
                GetCategoryDTO? category = await _categoryService.FindCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound();
                }
                await _categoryService.UpdateCategoryAsync(categoryToUpdate);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryByIdAsync(int id)
        {
            try
            {
                GetCategoryDTO? category = await _categoryService.FindCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound();
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCategoriesAsync()
        {
            try
            {
                IEnumerable<GetCategoryDTO> categorys = await _categoryService.GetCategoriesAsync();
                return Ok(categorys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(int id)
        {
            try
            {
                GetCategoryDTO? category = await _categoryService.FindCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound();
                }
                await _categoryService.DeleteCategoryAsync(category.Adapt<Category>());
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

    }
}