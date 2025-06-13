<template>
  <div class="calendar-view">
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
      @event-click="handleEventClick"
      @event-drag-stop="handleEventDrop"
      @event-resize-stop="handleEventResize"
      @date-select="handleDateSelect"
    />
  </div>
</template>

<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarOptions, DateSelectArg, EventDropArg, EventApi } from "@fullcalendar/core";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    description?: string;
    calendarId: string;
    calendarName: string;
    createdBy?: {
      id: string;
      username: string;
      displayName?: string;
    };
  };
}

interface Props {
  events?: CalendarEvent[];
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
  height?: string | number;
  editable?: boolean;
  selectable?: boolean;
  columnCount?: number;
  paddingPx?: number;
}

interface Emits {
  (e: "eventClick", event: CalendarEvent): void;
  (e: "eventDrop" | "eventResize", eventId: string, newStart: Date, newEnd: Date): void;
  (e: "dateSelect", start: Date, end: Date, allDay: boolean): void;
  (e: "viewChange", view: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  initialView: "dayGridMonth",
  height: "auto",
  editable: true,
  selectable: true,
  columnCount: 1,
  paddingPx: 0,
});

const emit = defineEmits<Emits>();

const calendarRef = ref<InstanceType<typeof FullCalendar>>();

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: props.initialView,
  height: props.height,
  events: props.events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay || false,
    backgroundColor: event.backgroundColor || "#3B82F6",
    borderColor: event.borderColor || "#3B82F6",
    extendedProps: event.extendedProps || {},
  })),
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
    //right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  },
  editable: props.editable,
  selectable: props.selectable,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  eventDisplay: "block",
  displayEventTime: true,
  eventTimeFormat: {
    hour: "numeric",
    minute: "2-digit",
    omitZeroMinute: false,
    meridiem: "short",
  },
  slotLabelFormat: {
    hour: "numeric",
    minute: "2-digit",
    omitZeroMinute: false,
    meridiem: "short",
  },
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: "08:00",
    endTime: "18:00",
  },
  nowIndicator: true,
  navLinks: true,
  eventClick: (info: { event: EventApi }) => {
    handleEventClick(info);
  },
  eventDrop: (info: EventDropArg) => {
    handleEventDrop(info);
  },
  eventResize: (info: { event: EventApi }) => {
    handleEventResize(info);
  },
  select: (info: DateSelectArg) => {
    handleDateSelect(info);
  },
  viewDidMount: (info: { view: { type: string } }) => {
    emit("viewChange", info.view.type);
  },
}));

const handleEventClick = (info: { event: EventApi }) => {
  const event = info.event;
  const calendarEvent: CalendarEvent = {
    id: event.id,
    title: event.title,
    start: event.start!,
    end: event.end!,
    allDay: event.allDay,
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor,
    extendedProps: {
      description: event.extendedProps?.description,
      calendarId: event.extendedProps?.calendarId || "",
      calendarName: event.extendedProps?.calendarName || "",
      createdBy: event.extendedProps?.createdBy,
    },
  };
  emit("eventClick", calendarEvent);
};

const handleEventDrop = (info: EventDropArg) => {
  const event = info.event;
  emit("eventDrop", event.id, event.start!, event.end!);
};

const handleEventResize = (info: { event: EventApi }) => {
  const event = info.event;
  emit("eventResize", event.id, event.start!, event.end!);
};

const handleDateSelect = (info: DateSelectArg) => {
  emit("dateSelect", info.start, info.end, info.allDay);
  // Clear the selection
  const calendarApi = calendarRef.value?.getApi();
  calendarApi?.unselect();
};

// Expose methods for parent components
const getCalendarApi = () => {
  return calendarRef.value?.getApi();
};

const changeView = (viewName: string) => {
  const calendarApi = getCalendarApi();
  calendarApi?.changeView(viewName);
};

const goToDate = (date: Date | string) => {
  const calendarApi = getCalendarApi();
  calendarApi?.gotoDate(date);
};

const refetchEvents = () => {
  const calendarApi = getCalendarApi();
  calendarApi?.refetchEvents();
};

defineExpose({
  getCalendarApi,
  changeView,
  goToDate,
  refetchEvents,
});
</script>

<style scoped>
.calendar-view {
  width: 100%;
  height: 100%;
}

/* FullCalendar styling overrides */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1rem;
}

:deep(.fc-toolbar-chunk) {
  display: flex;
}

:deep(.fc-button) {
  border-radius: 4px;
  text-transform: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.fc-button .fc-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

:deep(.fc-button-primary) {
  background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}

:deep(.fc-button-primary:hover) {
  background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  opacity: 0.8;
}

:deep(.fc-today-button) {
  background-color: rgb(var(--v-theme-secondary));
  border-color: rgb(var(--v-theme-secondary));
}

:deep(.fc-daygrid-event) {
  border-radius: 4px;
  padding: 2px 4px;
}

:deep(.fc-timegrid-event) {
  border-radius: 4px;
  padding: 2px 4px;
}

:deep(.fc-prev-button .fc-icon),
:deep(.fc-next-button .fc-icon) {
  font-size: 14px;
  line-height: 1;
}
</style>
