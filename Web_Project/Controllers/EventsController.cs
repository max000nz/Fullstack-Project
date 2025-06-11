using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web_Project.Services;
using Project.Models;
using Project.Repository;
using Web_Project.DTO;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Cors;

namespace Web_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors()]

    public class EventsController : ControllerBase
    {
        private readonly EventsServices _eventsServices;
        private readonly IMemoryCache _memoryCache;
        public EventsController(EventsServices eventsServices, IMemoryCache memoryCache)
        {
            _eventsServices = eventsServices;
            _memoryCache = memoryCache;
        }

        /// <summary>
        /// Create Event
        /// </summary>
        [HttpPost]
        public ActionResult<Event> CreateEvent([FromBody] Event newEvent)
        {
            _eventsServices.CreateEvent(newEvent);
            return Ok(newEvent);
        }

        /// <summary>
        /// Get all users of event
        /// </summary>
        [Route("event/{id}/registration")]
        [HttpGet]
        public ActionResult<List<User>> GetEventUsers(int id)
        {
            List<User> bro = _eventsServices.GetEventUsers(id);
            return Ok(bro);
        }

        /// <summary>
        /// Registration new user to event
        /// </summary>
        [Route("event/{id}/registration")]
        [HttpPost]
        public ActionResult<User> Registration(int id, [FromBody] User user)
        {
            _eventsServices.RegistationToE(id, user);
            return Ok("User registered to event");
        }

        /// <summary>
        /// Get Event
        /// </summary>
        [Route("event/{id}")]
        [HttpGet]
        public ActionResult<Event> GetEvent(int id)
        {
            Event nugga = _eventsServices.GetEvent(id);
            return Ok(nugga);
        }

        /// <summary>
        /// Update Event
        /// </summary>
        [Route("event/{id}")]
        [HttpPut]
        public ActionResult<Event> UpdateEvent(int id, [FromBody] Event newEvent)
        {
            _eventsServices.UpdateEvent(id, newEvent);
            return Ok("Event updated");
        }

        /// <summary>
        /// Delete Event
        /// </summary>
        [Route("event/{id}")]
        [HttpDelete]
        public ActionResult<Event> DeleteEvent(int id)
        {
            _eventsServices.DeleteEvent(id);
            return Ok("Event cancelled and all participants notified");
        }
        /// <summary>
        /// Weather
        /// </summary>
        [Route("event/{id}/weather")]
        [HttpGet]
        public ActionResult<WeatherDTO> WeatherEvent(int id)
        {
            Event myEvent = _eventsServices.GetEvent(id);
            if (myEvent == null) return NotFound();

            WeatherDTO cacheWeather = _memoryCache.Get<WeatherDTO>("weather-cache");
            string cacheLocation = _memoryCache.Get<string>("location");
            if(cacheWeather != null && cacheLocation == myEvent.Location) return Ok(cacheWeather);

            WeatherDTO weather = _eventsServices.WeatherEvent(id);
            var expTime = DateTimeOffset.Now.AddSeconds(30);
            _memoryCache.Set("weather-cache", weather, expTime);
            _memoryCache.Set("location", myEvent.Location, expTime);
            return Ok(weather);
        }
        /// <summary>
        /// Shcedule
        /// </summary>
        [Route("event/schedule")]
        [HttpGet]
        public ActionResult<List<Event>> GetEventsBetweenDates([FromQuery] DateTime fromDate, DateTime toDate)
        {
            var events = _eventsServices.GetEventsBetweenDates(fromDate, toDate);
            return Ok(events);
        }
    }
}
