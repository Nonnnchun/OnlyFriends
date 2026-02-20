using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;

// using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using OnlyFriends.Services;
using OnlyFriends.Models.DTOS.EventDTOS;
using Mapster;
using OnlyFriends.Models;

namespace OnlyFriends.Controllers
{
    [Route("/api/event")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IEventService _activityService;
        private readonly ILogger<EventController> _logger;

        public EventController(IEventService activityService, ILogger<EventController> logger)
        {
            _activityService = activityService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AddEventAsync(CreateEventDTO activityToCreate)
        {
            try
            {
                var activity = await _activityService.AddEventAsync(activityToCreate);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventAsync(int id, UpdateEventDTO activityToUpdate)
        {
            if (id != activityToUpdate.Id)
            {
                return BadRequest($"id in parameter and id in body is different. id in parameter: {id}, id in body: {activityToUpdate.Id}");
            }
            try
            {
                GetEventDTO? activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound();
                }
                await _activityService.UpdateEventAsync(activityToUpdate);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventByIdAsync(int id)
        {
            try
            {
                GetEventDTO? activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound();
                }
                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetEventsAsync()
        {
            try
            {
                IEnumerable<GetEventDTO> activitys = await _activityService.GetEventsAsync();
                return Ok(activitys);
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
                GetEventDTO? activity = await _activityService.FindEventByIdAsync(id);
                if (activity == null)
                {
                    return NotFound();
                }
                await _activityService.DeleteEventAsync(activity.Adapt<Event>());
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