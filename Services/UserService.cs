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
    Task SendFriendRequestAsync(int requesterId, int addresseeId);
    Task RemoveFriendAsync(int userId, int friendId);
    Task<bool> AcceptFriendRequestAsync(int requesterId, int addresseeId);
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
        user.Password = BCrypt.Net.BCrypt.HashPassword(userToCreate.Password);
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
        var result = await _context.Users
                .Where(x => x.Id == id)
                .AsNoTracking()
                .ProjectToType<GetUserDTO>()
                .FirstOrDefaultAsync();
        return result;
        
    }

    public async Task<IEnumerable<GetUserDTO>> GetUsersAsync()
    {
        IEnumerable<GetUserDTO> users = await _context.Users
            .AsNoTracking()
            .ProjectToType<GetUserDTO>()
            .ToListAsync();
        return users;
    }

    public async Task UpdateUserAsync(UpdateUserDTO userToUpdate)
    {
        // 1. Find the user without AsNoTracking because we need to update it
        var user = await _context.Users.FindAsync(userToUpdate.Id);
        
        if (user == null)
        {
            return;
        }

        // 2. Map the basic text fields (FirstName, LastName, Bio, Username)
        userToUpdate.Adapt(user);

        // Hash the new password if one was provided
        if (!string.IsNullOrEmpty(userToUpdate.Password))
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(userToUpdate.Password);
        }

        // 3. Manually handle the Profile Picture URL
        // We only update the database if a new URL was actually generated in the controller
        if (!string.IsNullOrEmpty(userToUpdate.ProfilePictureUrl))
        {
            user.ProfilePictureUrl = userToUpdate.ProfilePictureUrl;
        }

        // 4. Persist changes to SQL Server
        await _context.SaveChangesAsync();
    }

    public async Task SendFriendRequestAsync(int requesterId, int addresseeId)
    {
        var existing = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == requesterId && f.AddresseeId == addresseeId) ||
                (f.RequesterId == addresseeId && f.AddresseeId == requesterId));

        if (existing != null) return;

        _context.Friendships.Add(new Friendship
        {
            RequesterId = requesterId,
            AddresseeId = addresseeId,
            Status = FriendshipStatus.Pending
        });
        await _context.SaveChangesAsync();
    }

    public async Task<bool> AcceptFriendRequestAsync(int requesterId, int addresseeId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                f.RequesterId == requesterId &&
                f.AddresseeId == addresseeId &&
                f.Status == FriendshipStatus.Pending);

        if (friendship == null) return false;

        friendship.Status = FriendshipStatus.Accepted;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task RemoveFriendAsync(int userId, int friendId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == userId && f.AddresseeId == friendId) ||
                (f.RequesterId == friendId && f.AddresseeId == userId));

        if (friendship != null)
        {
            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
        }
    }
}