using onlyfriends.Models;
using onlyfriends.Models.DTOS.UserDTOS;
using onlyfriends.Data;
using Microsoft.EntityFrameworkCore;


namespace onlyfriends.Services;

public interface IUserService
{
    Task<GetUserDTO> AddUserAsync(CreateUserDTO UserToCreate);
    Task UpdateUserAsync(UpdateUserDTO UserToUpdate);
    Task DeleteUserAsync(User User);
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

    public async Task<GetUserDTO> AddUserAsync(CreateUserDTO UserToCreate)
    {
        User User = CreateUserDTO.ToUser(UserToCreate);
        _context.Users.Add(User);
        await _context.SaveChangesAsync();
        return User.ToGetUserDTO(User);
    }

    public async Task DeleteUserAsync(User User)
    {
        _context.Users.Remove(User);
        await _context.SaveChangesAsync();
    }

    public async Task<GetUserDTO?> FindUserByIdAsync(int id)
    {
        User? User = await _context.Users.Where(x => x.Id == id).AsNoTracking().FirstOrDefaultAsync();
        if (User == null)
        {
            return null;
        }
        return User.ToGetUserDTO(User);
    }

    public async Task<IEnumerable<GetUserDTO>> GetUsersAsync()
    {
        IEnumerable<User> Users = await _context.Users.AsNoTracking().ToListAsync();
        return Users.Select(User.ToGetUserDTO);
    }

    public async Task UpdateUserAsync(UpdateUserDTO UserToUpdate)
    {
        User User = UpdateUserDTO.ToUser(UserToUpdate);
        _context.Users.Update(User);
        await _context.SaveChangesAsync();
    }
}