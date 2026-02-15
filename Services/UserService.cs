using onlyfriends.Models;
using onlyfriends.Models.DTO;
using onlyfriends.Data;
using Microsoft.EntityFrameworkCore;


namespace DotnetApiPostgres.Api.Services;

public interface IUserService
{
    Task<GetUserDto> AddUserAsync(CreateUserDTO UserToCreate);
    Task UpdateUserAsync(UpdateUserDTO UserToUpdate);
    Task DeleteUserAsync(User User);
    Task<GetUserDto?> FindUserByIdAsync(int id);
    Task<IEnumerable<GetUserDto>> GetUsersAsync();
}
public sealed class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetUserDto> AddUserAsync(CreateUserDTO UserToCreate)
    {
        User User = CreateUserDTO.ToUser(UserToCreate);
        _context.Users.Add(User);
        await _context.SaveChangesAsync();
        return User.ToGetUserDto(User);
    }

    public async Task DeleteUserAsync(User User)
    {
        _context.Users.Remove(User);
        await _context.SaveChangesAsync();
    }

    public async Task<GetUserDto?> FindUserByIdAsync(int id)
    {
        User? User = await _context.Users.Where(x => x.Id == id).AsNoTracking().FirstOrDefaultAsync();
        if (User == null)
        {
            return null;
        }
        return User.ToGetUserDto(User);
    }

    public async Task<IEnumerable<GetUserDto>> GetUsersAsync()
    {
        IEnumerable<User> Users = await _context.Users.AsNoTracking().ToListAsync();
        return Users.Select(User.ToGetUserDto);
    }

    public async Task UpdateUserAsync(UpdateUserDTO UserToUpdate)
    {
        User User = UpdateUserDTO.ToUser(UserToUpdate);
        _context.Users.Update(User);
        await _context.SaveChangesAsync();
    }
}