import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';

const Calendar = ({ currentDate, onDateClick, events = [] }) => {
  const [calendar, setCalendar] = useState([]);
  
  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarDays = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(year, month, day)
      });
    }
    
    // Next month days
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    setCalendar(calendarDays);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDayClick = (dayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    onDateClick(dayInfo.date);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>
      
      <div className="calendar-grid">
        {calendar.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={index}
              className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} 
                ${isToday(dayInfo.date) ? 'today' : ''} 
                ${isPast(dayInfo.date) ? 'past' : ''}
                ${hasEvents && dayInfo.isCurrentMonth ? 'has-events' : ''}`}
              onClick={() => handleDayClick(dayInfo)}
            >
              <span className="day-number">{dayInfo.day}</span>
              {hasEvents && dayInfo.isCurrentMonth && (
                <div className="event-count">
                  {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
