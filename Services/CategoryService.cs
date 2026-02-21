using OnlyFriends.Models;
using OnlyFriends.Models.DTOS.CategoryDTOS;
using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace OnlyFriends.Services;

public interface ICategoryService
{
    Task<GetCategoryDTO> AddCategoryAsync(CreateCategoryDTO categoryToCreate);
    Task UpdateCategoryAsync(UpdateCategoryDTO categoryToUpdate);
    Task DeleteCategoryAsync(Category category);

    Task<GetCategoryDTO?> FindCategoryByIdAsync(int id);
    Task<IEnumerable<GetCategoryDTO>> GetCategoriesAsync();
}
public sealed class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetCategoryDTO> AddCategoryAsync(CreateCategoryDTO categoryToCreate)
    {
        Category category = categoryToCreate.Adapt<Category>();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category.Adapt<GetCategoryDTO>();
    }

    public async Task DeleteCategoryAsync(Category category)
    {
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    public async Task<GetCategoryDTO?> FindCategoryByIdAsync(int id)
    {
        Category? category = await _context.Categories.Where(x => x.Id == id).AsNoTracking().FirstOrDefaultAsync();
        if (category == null)
        {
            return null;
        }
        return category.Adapt<GetCategoryDTO>();
    }

    public async Task<IEnumerable<GetCategoryDTO>> GetCategoriesAsync()
    {
        IEnumerable<GetCategoryDTO> categorys = await _context.Categories.AsNoTracking().ProjectToType<GetCategoryDTO>().ToListAsync();
        return categorys;
    }

    public async Task UpdateCategoryAsync(UpdateCategoryDTO categoryToUpdate)
    {
        Category category = categoryToUpdate.Adapt<Category>();
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }
}