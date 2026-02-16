using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;

// using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using onlyfriends.Services;
using onlyfriends.Models.DTOS.UserDTOS;

namespace OnlyFriends.Controllers
{
    [Route("/api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> AddUserAsync(CreateUserDTO userToCreate)
    {
        try
        {
            var user = await _userService.AddUserAsync(userToCreate);
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUserAsync(int id, UpdateUserDTO userToUpdate)
    {
        if (id != userToUpdate.Id)
        {
            return BadRequest($"id in parameter and id in body is different. id in parameter: {id}, id in body: {userToUpdate.Id}");
        }
        try
        {
            GetUserDTO? user = await _userService.FindUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            await _userService.UpdateUserAsync(userToUpdate);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserByIdAsync(int id)
    {
        try
        {
            GetUserDTO? user = await _userService.FindUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetPeopleAsync()
    {
        try
        {
            IEnumerable<GetUserDTO> peoples = await _userService.GetUsersAsync();
            return Ok(peoples);
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
            GetUserDTO? user = await _userService.FindUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            await _userService.DeleteUserAsync(GetUserDTO.ToUser(user));
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