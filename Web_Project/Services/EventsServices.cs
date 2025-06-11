using Project.Models;
using Project.Repository;
using System.Net;
using System;
using System.Text.Json;
using Web_Project.DTO;
namespace Web_Project.Services
{
    public class EventsServices
    {
        private readonly EventsRepository _eventsRepository;

        public EventsServices(EventsRepository eventsRepository)
        {
        _eventsRepository = eventsRepository; 
        }

        public void CreateEvent(Event newEvent)
        {
            _eventsRepository.Create(newEvent);
        }

        public void UpdateEvent(int id, Event newEvent)
        {
            _eventsRepository.UpdateE(id, newEvent);
        }

        public void DeleteEvent(int id)
        {
            _eventsRepository.Delete(id);
        }

        public Event GetEvent(int idEvent)
        {
            return _eventsRepository.GetEvent(idEvent);
        }

        public List<User> GetEventUsers(int idEvent)
        {
            return _eventsRepository.GetEventUsers(idEvent);
        }


        public void RegistationToE(int idEvent, User user)
        {
            _eventsRepository.Registration(idEvent, user);
        }

        public WeatherDTO WeatherEvent(int idEvent)
        {
            Event myidEvent = _eventsRepository.WeatherEvent(idEvent);
            string city = myidEvent.Location;
            string url = $"http://api.weatherstack.com/current?access_key=f6b0a8a6eca7f623244640fcecf981f4&query={city}";
            string json = (new WebClient()).DownloadString(url);

            using JsonDocument doc = JsonDocument.Parse(json);
            var current = doc.RootElement.GetProperty("current");
            var result = new WeatherDTO
            {
                temperature = current.GetProperty("temperature").GetInt32(),
                weather_description = current.GetProperty("weather_descriptions")[0].GetString()
            };
            return result;

        }

        public List<Event> GetEventsBetweenDates(DateTime fromDate, DateTime toDate)
        {
            return _eventsRepository.GetEventsBetweenDates(fromDate, toDate);
        }
    }
}
