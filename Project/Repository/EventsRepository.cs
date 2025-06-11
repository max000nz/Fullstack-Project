using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Project.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Project.Repository
{
    public class EventsRepository
    {
        EventsContext db = new EventsContext();
        
        public void Create(Event newEvent)
        {
            db.Events.Add(newEvent);
            db.SaveChanges();
        }


        public void UpdateE(int id, Event upEvent)
        {
            Event updateEvent = db.Events.FirstOrDefault(x => x.Id == id);
            updateEvent.MaxRegistrations = upEvent.MaxRegistrations;
            updateEvent.StartDate = upEvent.StartDate;
            updateEvent.EndDate = upEvent.EndDate;
            updateEvent.Name = upEvent.Name;
            updateEvent.Location = upEvent.Location;
            db.SaveChanges();
        }

        public void Delete(int id)
        {
            Event deleteEvent = db.Events.FirstOrDefault(x => x.Id == id);
            var eventUsersToDelete = db.EventUsers.Where(eu => eu.EventRef == id).ToList();
            db.EventUsers.RemoveRange(eventUsersToDelete);
            db.Events.Remove(deleteEvent);
            db.SaveChanges();
        }

        public Event GetEvent(int idEvent)
        {
            Event myIdEvent = db.Events.FirstOrDefault(x => x.Id == idEvent);
            return myIdEvent;
        }

        public List<User> GetEventUsers(int eventId)
        {
            Event myEvent = db.Events.Include(e => e.EventUsers).ThenInclude(eu => eu.UserRefNavigation).FirstOrDefault(e => e.Id == eventId);
            return myEvent.EventUsers.Select(u => new User { Id = u.UserRefNavigation.Id, Name = u.UserRefNavigation.Name, DateOfBirth = u.UserRefNavigation.DateOfBirth }).ToList();
        }

        public bool Registration(int idEvent, User user)
        {
            Event myIdEvent = db.Events.FirstOrDefault(x => x.Id == idEvent);
            if (myIdEvent == null) { return false; }

            db.Users.Add(user);
            db.SaveChanges();

            EventUser eventUser = new EventUser();
            eventUser.UserRef = user.Id;
            eventUser.EventRef = idEvent;
            eventUser.Creation = DateTime.Now;
            db.EventUsers.Add(eventUser);   
            db.SaveChanges();
            return true;
        }

        public Event WeatherEvent(int idEvent)
        {
            //api f6b0a8a6eca7f623244640fcecf981f4
            Event myIdEvent = db.Events.FirstOrDefault(x => x.Id == idEvent);
            return myIdEvent;
        }

        public List<Event> GetEventsBetweenDates(DateTime fromDate, DateTime toDate)
        {
            return db.Events
                .Where(e =>
                    (e.StartDate >= fromDate && e.StartDate <= toDate) ||
                    (e.EndDate >= fromDate && e.EndDate <= toDate) ||
                    (e.StartDate <= fromDate && e.EndDate >= toDate) 
                )
                .ToList();
        }

    }
}
 