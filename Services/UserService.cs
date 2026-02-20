using OnlyFriends.Models;
using OnlyFriends.Models.DTOS.UserDTOS;
using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace OnlyFriends.Services;

public interface IUserService
{
    Task<GetUserDTO> AddUserAsync(CreateUserDTO userToCreate);
    Task UpdateUserAsync(UpdateUserDTO userToUpdate);
    Task DeleteUserAsync(User user);
    Task<GetUserDTO?> FindUserByIdAsync(int id);
    Task<IEnumerable<GetUserDTO>> GetUsersAsync();
}
public sealed class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetUserDTO> AddUserAsync(CreateUserDTO userToCreate)
    {
        User user = userToCreate.Adapt<User>();
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user.Adapt<GetUserDTO>();
    }

    public async Task DeleteUserAsync(User user)
    {
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    public async Task<GetUserDTO?> FindUserByIdAsync(int id)
    {
        User? user = await _context.Users.Where(x => x.Id == id).AsNoTracking().FirstOrDefaultAsync();
        if (user == null)
        {
            return null;
        }
        return user.Adapt<GetUserDTO>();
    }

    public async Task<IEnumerable<GetUserDTO>> GetUsersAsync()
    {
        IEnumerable<GetUserDTO> users = await _context.Users.AsNoTracking().ProjectToType<GetUserDTO>().ToListAsync();
        return users;
    }

    public async Task UpdateUserAsync(UpdateUserDTO userToUpdate)
    {
        User user = userToUpdate.Adapt<User>();
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}