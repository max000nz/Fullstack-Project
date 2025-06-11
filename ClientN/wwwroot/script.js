const API_BASE_URL = 'http://localhost:5245';

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else if (response.status === 204) {
                openNewWindow("Success", { message: "Operation completed successfully (No Content)." });
                return null;
            } else {
                const textData = await response.text();
                openNewWindow("Success", { message: "Operation completed successfully.", details: textData });
                return textData;
            }
        } else {
            const errorBody = await response.text();
            let errorMessage = errorBody;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.message || JSON.stringify(errorJson, null, 2);
            } catch (e) {
            }
            openNewWindow("Error", {
                status: response.status,
                message: `HTTP error! Status: ${response.status}`,
                details: errorMessage || "Something went wrong"
            });
            return null;
        }
    } catch (error) {
        openNewWindow("Error", {
            message: "Failed to fetch data (network error or CORS issue).",
            details: error.message
        });
        return null;
    }
}

const formatToLocalYYYYMMDDHHMM = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

function openNewWindow(title, content) {
    const newWindow = window.open("", title, "width=700,height=500,scrollbars=yes");

    if (newWindow) {
        let contentHtml = '';

        if (title === "Event Details" && content && typeof content === 'object') {
            const eventId = content.id || 'N/A';
            const eventName = content.name || 'N/A';
            const startDate = formatToLocalYYYYMMDDHHMM(content.startDate);
            const endDate = formatToLocalYYYYMMDDHHMM(content.endDate);
            const maxRegistrations = content.maxRegistrations !== undefined ? content.maxRegistrations : 'N/A';
            const location = content.location || 'N/A';
            const eventUsers = content.eventUsers && Array.isArray(content.eventUsers) ? content.eventUsers : [];
            const mapLink = content.mapLink || '';

            contentHtml = `
                <p><strong>ID:</strong> ${eventId}</p>
                <p><strong>Name:</strong> ${eventName}</p>
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
                <p><strong>Max Registrations:</strong> ${maxRegistrations}</p>
                <p><strong>Location:</strong> ${location}</p>
            `;

            if (mapLink) {
                contentHtml += `<p><a href="${mapLink}" target="_blank">View on Google Maps</a></p>`;
            }
        }

        else if (title === "Event Updated" && content && typeof content === 'object') {
            const updatedEventId = content.id || 'N/A';
            const updatedEventName = content.name || 'N/A';
            const updatedStartDate = formatToLocalYYYYMMDDHHMM(content.startDate);
            const updatedEndDate = formatToLocalYYYYMMDDHHMM(content.endDate);
            const updatedMaxRegistrations = content.maxRegistrations !== undefined ? content.maxRegistrations : 'N/A';
            const updatedLocation = content.location || 'N/A';

            contentHtml = `
                <p><strong>Event Successfully Updated!</strong></p>
                <p><strong>ID:</strong> ${updatedEventId}</p>
                <p><strong>Name:</strong> ${updatedEventName}</p>
                <p><strong>Start Date:</strong> ${updatedStartDate}</p>
                <p><strong>End Date:</strong> ${updatedEndDate}</p>
                <p><strong>Max Registrations:</strong> ${updatedMaxRegistrations}</p>
                <p><strong>Location:</strong> ${updatedLocation}</p>
            `;
            if (mapLink) {
                contentHtml += `<p><a href="${mapLink}" target="_blank">View on Google Maps</a></p>`;
            }
        }

        else if (title === "User Registration Result" && content && typeof content === 'object') {
            contentHtml = `
                <p><strong>Message:</strong> ${content.message || 'N/A'}</p>
                ${content.id ? `<p><strong>User ID:</strong> ${content.id}</p>` : ''}
                ${content.name ? `<p><strong>Name:</strong> ${content.name}</p>` : ''}
                ${content.dateOfBirth ? `<p><strong>Date of Birth:</strong> ${content.dateOfBirth}</p>` : ''}
            `;
        }

        else if (title.includes("Weather") && content && typeof content === 'object') {
            const getWeatherEmoji = (description) => {
                if (!description) return '❓';

                const lowerDescription = description.toLowerCase();
                if (lowerDescription.includes('sunny') || lowerDescription.includes('clear')) {
                    return '☀️';
                } else if (lowerDescription.includes('cloud') || lowerDescription.includes('overcast')) {
                    return '☁️';
                } else if (lowerDescription.includes('rain') || lowerDescription.includes('drizzle')) {
                    return '🌧️';
                } else if (lowerDescription.includes('snow')) {
                    return '❄️';
                } else if (lowerDescription.includes('thunder') || lowerDescription.includes('storm')) {
                    return '⛈️';
                } else if (lowerDescription.includes('wind')) {
                    return '🌬️';
                } else if (lowerDescription.includes('fog') || lowerDescription.includes('mist')) {
                    return '🌫️';
                }
                return '🌍';
            };

            const weatherEmoji = getWeatherEmoji(content.weather_description);
            const temperature = content.temperature !== undefined ? content.temperature : 'N/A';

            contentHtml = `
        <h3>${weatherEmoji} Weather Details:</h3>
        <p><strong>Description:</strong> ${content.weather_description || 'N/A'}</p>
        <p><strong>Temperature:</strong> ${temperature}°C</p>
        `;
        }

        else if (title.includes("Registered Users") && content && content.users && Array.isArray(content.users)) {
            if (content.users.length > 0) {
                contentHtml = `<h3>Registered Users:</h3><ul>`;
                content.users.forEach(user => {
                    contentHtml += `<li><strong>ID:</strong> ${user.id || 'N/A'}, <strong>Name:</strong> ${user.name || 'N/A'}, <strong>Date of Birth:</strong> ${user.dateOfBirth || 'N/A'}</li>`;
                });
                contentHtml += `</ul>`;
            } else {
                contentHtml = `<p>No users registered for this event.</p>`;
            }
        }

        else if (title.includes("Event Schedule") && content && content.events && Array.isArray(content.events)) {
            if (content.events.length > 0) {
                contentHtml = `<h3>Events:</h3>`;
                content.events.forEach(event => {
                    const startDate = formatToLocalYYYYMMDDHHMM(event.startDate);
                    const endDate = formatToLocalYYYYMMDDHHMM(event.endDate);
                    contentHtml += `
                <div style="border: 1px solid #dee2e6; padding: 10px; margin-bottom: 10px; border-radius: 5px; background-color: #fcfcfc;">
                    <p><strong>ID:</strong> ${event.id || 'N/A'}</p>
                    <p><strong>Name:</strong> ${event.name || 'N/A'}</p>
                    <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                    <p><strong>Dates:</strong> ${startDate} - ${endDate}</p>
                    <p><strong>Max Registrations:</strong> ${event.maxRegistrations !== undefined ? event.maxRegistrations : 'N/A'}</p>
                </div>
            `;
                });
            } else {
                contentHtml = `<p>${content.message || 'No events available in the schedule for the selected dates.'}</p>`;
            }
        }

        else if (content && typeof content === 'object' && content.message) {
            contentHtml = `<p><strong>Message:</strong> ${content.message}</p>`;
            if (content.details) {
                contentHtml += `<p><strong>Details:</strong> <pre>${JSON.stringify(content.details, null, 2)}</pre></p>`;
            }
            if (content.status) {
                contentHtml += `<p><strong>Status:</strong> ${content.status}</p>`;
            }
        } else {
            contentHtml = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
        }


        newWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        h3 { margin-top: 20px; color: #555; }
        p { margin-bottom: 5px; }
        ul { list-style-type: disc; margin-left: 20px; }
        li { margin-bottom: 3px; }
        strong { color: #007bff; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;}
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div>${contentHtml}</div>
</body>
</html>`);
        newWindow.document.close();
    } else {
        alert("Your browser blocked the pop-up window. Please allow pop-ups for this site to see the details.");
        console.warn("Pop-up blocked. Content was:", { title, content });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // Get Event
    document.getElementById('getEventBtn').addEventListener('click', async () => {
        const id = prompt("Enter Event ID to get:");
        if (!id) return;
        try {
            const eventData = await fetchData(`${API_BASE_URL}/api/Events/event/${id}`);
            if (eventData) {
                let mapLink = '';
                if (eventData.location) {
                    const encodedLocation = encodeURIComponent(eventData.location);
                    mapLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                }
                openNewWindow("Event Details", { ...eventData, mapLink });
            }
        } catch (error) {
            openNewWindow("Error", { message: "An unexpected error occurred", details: error.message });
        }
    });

    // Delete Event
    document.getElementById('deleteEventBtn').addEventListener('click', async () => {
        const id = prompt("Enter Event ID to delete:");
        if (!id) return;
        if (!confirm(`Are you sure you want to delete event with ID: ${id}?`)) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/Events/event/${id}`, {
                method: 'DELETE'
            });
            const data = await response.text();
            if (response.ok) {
                openNewWindow("Delete Event Result", { message: data });
            } else {
                const errorData = data || await response.text();
                openNewWindow("Error deleting event", { status: response.status, message: errorData || "Something went wrong" });
            }
        } catch (error) {
            openNewWindow("Error", { message: error.message });
        }
    });

    // Get Users registered to event
    document.getElementById('getEventUsersBtn').addEventListener('click', async () => {
        const id = prompt("Enter Event ID to get registered users:");
        if (!id) return;

        try {
            const users = await fetchData(`${API_BASE_URL}/api/Events/event/${id}/registration`); // Проверьте этот URL на API: /api/Events/event/{id}/registration

            if (users && Array.isArray(users)) {
                if (users.length > 0) {
                    openNewWindow(`Registered Users for Event ID: ${id}`, { users: users });
                } else {
                    openNewWindow(`Registered Users for Event ID: ${id}`, { message: "No users registered for this event yet." });
                }
            } else if (users === null) {
                openNewWindow(`Registered Users for Event ID: ${id}`, { message: "No users found or server responded with no content." });
            }
        } catch (error) {
            openNewWindow("Error", { message: "An unexpected error occurred while fetching registered users", details: error.message });
        }
    });

    // Get Schedule
    document.getElementById('getScheduleBtn').addEventListener('click', async () => {
        const fromDateStr = prompt("Enter 'From' Date (YYYY-MM-DD):");
        if (!fromDateStr) return;
        const toDateStr = prompt("Enter 'To' Date (YYYY-MM-DD):");
        if (!toDateStr) return;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDateStr) || !dateRegex.test(toDateStr)) {
            openNewWindow("Input Error", { message: "Invalid date format. Please use YYYY-MM-DD." });
            return;
        }

        try {
            const fromDate = new Date(fromDateStr);
            const toDate = new Date(toDateStr);

            if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                openNewWindow("Input Error", { message: "Invalid date provided. Please enter a valid date." });
                return;
            }

            const url = `${API_BASE_URL}/api/Events/event/schedule?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`; // Проверьте этот URL на API!

            const events = await fetchData(url);

            if (events && Array.isArray(events)) {
                if (events.length > 0) {
                    openNewWindow(`Event Schedule from ${fromDateStr} to ${toDateStr}`, { events: events });
                } else {
                    openNewWindow(`Event Schedule from ${fromDateStr} to ${toDateStr}`, { message: `No events found between ${fromDateStr} and ${toDateStr}.` });
                }
            } else if (events === null) {
                openNewWindow(`Event Schedule from ${fromDateStr} to ${toDateStr}`, { message: "No events found or server responded with no content." });
            }
        } catch (error) {
            openNewWindow("Error", { message: "An unexpected error occurred while fetching schedule", details: error.message });
        }
    });

    // Get Event Weather
    document.getElementById('getEventWeatherBtn').addEventListener('click', async () => {
        const id = prompt("Enter Event ID to get weather:");
        if (!id) return;

        try {
            const weatherData = await fetchData(`${API_BASE_URL}/api/Events/event/${id}/weather`);

            if (weatherData) {
                openNewWindow(`Weather for Event ID: ${id}`, weatherData);
            } else if (weatherData === null) {
                openNewWindow(`Weather for Event ID: ${id}`, { message: "No weather data available for this event." });
            }
        } catch (error) {
            openNewWindow("Error", { message: "An unexpected error occurred while fetching weather", details: error.message });
        }
    });

    // Create New Event
    document.getElementById('createNewEventBtn').addEventListener('click', async () => {
        const eventName = prompt("Enter Event Name:");
        if (eventName === null || eventName.trim() === '') {
            openNewWindow("Input Error", { message: "Event Name is required." });
            return;
        }

        const eventLocation = prompt("Enter Event Location:");
        if (eventLocation === null || eventLocation.trim() === '') {
            openNewWindow("Input Error", { message: "Event Location is required." });
            return;
        }

        const startDateStr = prompt("Enter Start Date (YYYY-MM-DD HH:MM):");
        if (startDateStr === null || startDateStr.trim() === '') {
            openNewWindow("Input Error", { message: "Start Date is required." });
            return;
        }

        const endDateStr = prompt("Enter End Date (YYYY-MM-DD HH:MM):");
        if (endDateStr === null || endDateStr.trim() === '') {
            openNewWindow("Input Error", { message: "End Date is required." });
            return;
        }

        const maxRegistrationsStr = prompt("Enter Max Registrations (number, leave empty for no limit):");
        let maxRegistrations = 0;
        if (maxRegistrationsStr !== null && maxRegistrationsStr.trim() !== '') {
            maxRegistrations = parseInt(maxRegistrationsStr, 10);
            if (isNaN(maxRegistrations)) {
                openNewWindow("Input Error", { message: "Invalid input for Max Registrations. Please enter a number." });
                return;
            }
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            openNewWindow("Input Error", { message: "Invalid date format. Please use Букмекерлар-MM-DD HH:MM." });
            return;
        }

        const newEvent = {
            name: eventName,
            location: eventLocation,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),     
            maxRegistrations: maxRegistrations
        };

        try {
            const result = await fetchData(`${API_BASE_URL}/api/Events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEvent)
            });

            if (result && result.id) {
                openNewWindow("Event Created Successfully", { message: `Event "${result.name}" (ID: ${result.id}) created! Now fetching details...` });

                setTimeout(async () => {
                    const fetchedEvent = await fetchData(`${API_BASE_URL}/api/Events/event/${result.id}`);
                    if (fetchedEvent) {
                        let mapLink = '';
                        if (fetchedEvent.location) {
                            const encodedLocation = encodeURIComponent(fetchedEvent.location);
                            mapLink = `http://maps.google.com/maps?q=${encodedLocation}`;
                        }
                        openNewWindow("Event Details", { ...fetchedEvent, mapLink });
                    }
                }, 1000);
            } else if (result === null) {
                openNewWindow("Event Created", { message: "Event created successfully (no content response, cannot fetch details)." });
            } else {
                openNewWindow("Event Created", result);
            }
        } catch (error) {
            openNewWindow("Error", { message: "An unexpected error occurred during event creation", details: error.message });
        }
    });

    // Register new user to event
    document.getElementById('registerUserToEventBtn').addEventListener('click', async () => {
        const eventId = prompt("Enter Event ID to register user:");
        if (!eventId) {
            alert("Registration Canceled: Event ID is required.");
            return;
        }

        const userName = prompt("Enter User Name (e.g., John Doe):");
        if (!userName) {
            alert("Registration Canceled: User Name is required.");
            return;
        }

        const userDateOfBirth = prompt("Enter User Date of Birth (YYYY-MM-DD):");
        if (!userDateOfBirth) {
            alert("Registration Canceled: User Date of Birth is required.");
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(userDateOfBirth)) {
            alert("Invalid Input: Date of Birth must be in YYYY-MM-DD format.");
            return;
        }

        const newUser = {
            name: userName, 
            dateOfBirth: userDateOfBirth 
        };

        const url = `${API_BASE_URL}/api/Events/event/${eventId}/registration`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                const data = await response.json().catch(() => ({ message: "Registration successful" }));
                openNewWindow("User Registration Result", data);
            } else {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`, details: response.statusText }));
                openNewWindow("Error registering user", { status: response.status, message: errorData.message || "Something went wrong", details: errorData.details || "No further details" });
            }
        } catch (error) {
            console.error('Fetch error during user registration:', error);
            openNewWindow("Error", { message: "Failed to register user (network or CORS issue)", details: error.message });
        }
    });

    // Update Event
    document.getElementById('updateEventBtn').addEventListener('click', async () => {
        const id = prompt("Enter Event ID to update:");
        if (!id) return;

        const currentEventResponse = await fetch(`${API_BASE_URL}/api/Events/event/${id}`);
        if (!currentEventResponse.ok) {
            openNewWindow("Error", { message: "Could not fetch current event details for update." });
            return;
        }
        const currentEvent = await currentEventResponse.json();

        const eventName = prompt(`Enter new Event Name (current: ${currentEvent.name || currentEvent.eventName}):`, currentEvent.name || currentEvent.eventName);
        if (eventName === null) return;
        const eventLocation = prompt(`Enter new Event Location (current: ${currentEvent.location || currentEvent.eventLocation}):`, currentEvent.location || currentEvent.eventLocation);
        if (eventLocation === null) return;

        const startDateStr = prompt(`Enter new Start Date (YYYY-MM-DD HH:MM, current: ${new Date(currentEvent.startDate || currentEvent.eventDate).toLocaleString()}):`, new Date(currentEvent.startDate || currentEvent.eventDate).toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/,/, ''));
        if (startDateStr === null) return;
        const endDateStr = prompt(`Enter new End Date (YYYY-MM-DD HH:MM, current: ${new Date(currentEvent.endDate || currentEvent.eventDate).toLocaleString()}):`, new Date(currentEvent.endDate || currentEvent.eventDate).toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/,/, ''));
        if (endDateStr === null) return;

        const maxRegistrationsStr = prompt(`Enter new Max Registrations (current: ${currentEvent.maxRegistrations}):`, currentEvent.maxRegistrations);
        let maxRegistrations = 0;
        if (maxRegistrationsStr) {
            maxRegistrations = parseInt(maxRegistrationsStr, 10);
            if (isNaN(maxRegistrations)) {
                openNewWindow("Input Error", { message: "Invalid input for Max Registrations. Please enter a number." });
                return;
            }
        }

        const updatedEvent = {
            name: eventName,
            location: eventLocation,
            startDate: new Date(startDateStr).toISOString(),
            endDate: new Date(endDateStr).toISOString(),
            maxRegistrations: maxRegistrations
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/Events/event/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedEvent)
            });
            const data = await response.text();
            if (response.ok) {
                openNewWindow("Update Event Result", { message: data });
            } else {
                const errorData = data || await response.text();
                openNewWindow("Error updating event", { status: response.status, message: errorData || "Something went wrong" });
            }
        } catch (error) {
            openNewWindow("Error", { message: error.message });
        }
    });
});