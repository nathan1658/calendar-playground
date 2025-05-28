// FullCalendar plugins and configuration
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

export default defineNuxtPlugin(() => {
  // Register FullCalendar component globally
  return {
    provide: {
      fullCalendar: {
        component: FullCalendar,
        plugins: {
          dayGrid: dayGridPlugin,
          timeGrid: timeGridPlugin,
          list: listPlugin,
          interaction: interactionPlugin,
        },
      },
    },
  };
});
