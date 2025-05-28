**I. Core Technologies & Setup**

1.  **Nuxt 3 & TypeScript:** Initialize your Nuxt 3 project with TypeScript.
    ```bash
    npx nuxi@latest init my-calendar-app -t typescript
    cd my-calendar-app
    npm install # or yarn install
    ```
2.  **MongoDB:**
    - Set up a MongoDB instance accessible within your internal network.
    - Choose a MongoDB driver/ODM for Node.js:
      - **Mongoose:** Popular, provides schema validation, middleware, and makes interaction easier. Recommended for structure.
      - **Native MongoDB Driver:** More direct control, less boilerplate if you prefer.
    - Install your chosen library: `npm install mongoose` or `npm install mongodb`.
3.  **Authentication Library:**
    - Referencing our previous discussion, a library like **`nuxt/Auth` (or `nuxt-auth-utils`)** is a good fit for simplicity and Nuxt integration, using its credentials (username/password) provider.
    - You'll store user credentials and roles in MongoDB.
4.  **Calendar UI Library (Frontend):**
    - Since there's no internet access, CDNs are out. You need a library that can be installed via npm and bundled.
    - **FullCalendar.io (Vue 3 component):** Excellent choice, feature-rich (day/week/month views, event dragging, resizing). It has a Vue 3 component (`@fullcalendar/vue3`). Ensure you install all necessary plugins (`@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`, etc.).
      ```bash
      npm install @fullcalendar/core @fullcalendar/vue3 @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction
      ```
    - **Custom Solution:** If FullCalendar is too heavy or you need a very specific UI, you could build a simpler calendar grid with Vue components, but this is significantly more work.
5.  **State Management (Frontend):**
    - **Pinia:** The official state management library for Vue 3, integrates seamlessly with Nuxt 3.
      ```bash
      npm install pinia @pinia/nuxt
      ```
      Add `@pinia/nuxt` to your `nuxt.config.ts` modules.

**II. Data Models (MongoDB Schemas using Mongoose as an example)**

1.  **`User` Model (`server/models/User.model.ts`)**

    ```typescript
    import { Schema, model } from "mongoose";
    import bcrypt from "bcryptjs"; // For password hashing

    const userSchema = new Schema(
      {
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        displayName: { type: String },
        roles: [{ type: String, enum: ["admin", "user"], default: ["user"] }], // Simple role system
      },
      { timestamps: true },
    );

    // Password hashing middleware
    userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();
      this.password = await bcrypt.hash(this.password, 12);
      next();
    });

    userSchema.methods.comparePassword = function (candidatePassword: string) {
      return bcrypt.compare(candidatePassword, this.password);
    };

    export default model("User", userSchema);
    ```

2.  **`Calendar` Model (`server/models/Calendar.model.ts`)**

    ```typescript
    import { Schema, model, Types } from "mongoose";

    const calendarPermissionSchema = new Schema(
      {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        accessLevel: { type: String, enum: ["view", "edit"], required: true },
      },
      { _id: false },
    );

    const calendarSchema = new Schema(
      {
        name: { type: String, required: true, trim: true },
        category: { type: String, trim: true },
        ownerId: { type: Types.ObjectId, ref: "User" }, // Optional: who created it
        permissions: [calendarPermissionSchema], // User-specific permissions
        // You might also consider role-based default permissions if needed later
      },
      { timestamps: true },
    );

    export default model("Calendar", calendarSchema);
    ```

3.  **`Event` Model (`server/models/Event.model.ts`)**

    ```typescript
    import { Schema, model, Types } from "mongoose";

    const eventSchema = new Schema(
      {
        calendarId: { type: Types.ObjectId, ref: "Calendar", required: true, index: true },
        subject: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        startTime: { type: Date, required: true, index: true },
        endTime: { type: Date, required: true, index: true },
        allDay: { type: Boolean, default: false },
        createdBy: { type: Types.ObjectId, ref: "User", required: true },
        // Add other fields as needed: location, attendees (if complex), color, etc.
      },
      { timestamps: true },
    );

    export default model("Event", eventSchema);
    ```

**III. Backend Implementation (Nuxt 3 Server Engine - Nitro)**

- All API endpoints will be in `server/api/`.
- Use Mongoose (or native driver) to interact with MongoDB.
- Implement authentication and authorization checks for all relevant endpoints.

1.  **Authentication (`server/api/auth/`)**

    - `login.post.ts`: Authenticate user, create session (using `nuxt/Auth` helpers).
    - `register.post.ts` (Admin only, or self-registration if allowed): Create new user.
    - `logout.post.ts`: Destroy session.
    - `me.get.ts`: Get current authenticated user details.

2.  **User Management (Admin only - `server/api/users/`)**

    - `index.get.ts`: List users.
    - `[id].put.ts`: Update user (e.g., roles, displayName).
    - `[id].delete.ts`: Delete user.

3.  **Calendar Management (`server/api/calendars/`)**

    - `index.post.ts` (Admin only): Create a new calendar.
      - Input: `name`, `category`.
      - Logic: Save calendar, assign default owner/admin permissions.
    - `index.get.ts`: List calendars.
      - Admin: List all calendars.
      - User: List calendars they have `view` or `edit` permission for.
    - `[id].get.ts`: Get specific calendar details (check `view` permission).
    - `[id].put.ts` (Admin or user with `edit` permission on THIS calendar): Update calendar details (name, category).
    - `[id].delete.ts` (Admin only): Delete a calendar and its associated events (cascade delete).
    - `[id]/permissions.put.ts` (Admin only): Update permissions for a calendar (assign/revoke user access and levels).
      - Input: `userId`, `accessLevel`.

4.  **Event Management (`server/api/events/`)**
    - `index.post.ts`: Create a new event.
      - Input: `calendarId`, `subject`, `startTime`, `endTime`, `allDay`, etc.
      - Logic: Verify user has `edit` permission on the specified `calendarId`. Save event.
    - `calendar/[calendarId].get.ts`: Get all events for a specific calendar (check `view` permission on calendar).
      - Allow date range filtering (e.g., `?start=YYYY-MM-DD&end=YYYY-MM-DD`).
    - `aggregated.get.ts`: Get events for the "Aggregated Calendar".
      - Logic:
        1.  Find all `calendarId`s the current user has `view` or `edit` permission for.
        2.  Fetch events from these calendars within a given date range (passed as query params).
        3.  Apply additional filters if provided (e.g., category, event subject text search).
    - `[eventId].get.ts`: Get a specific event (check `view` permission on parent calendar).
    - `[eventId].put.ts`: Update an event (check `edit` permission on parent calendar).
    - `[eventId].delete.ts`: Delete an event (check `edit` permission on parent calendar).

**IV. Frontend Implementation (Nuxt 3 Pages, Components, Pinia Stores)**

1.  **Layouts (`layouts/`)**

    - `default.vue`: Main layout with navigation.
    - `auth.vue`: Layout for login/registration pages.

2.  **Pages (`pages/`)**

    - `login.vue`: Login form.
    - `index.vue` (Dashboard / Aggregated Calendar View):
      - Display FullCalendar component.
      - Fetch events from `/api/events/aggregated`.
      - Filter panel component.
    - `calendars/manage.vue` (Admin only):
      - List existing calendars.
      - UI to create new calendars.
      - UI to edit calendars and manage their permissions.
    - `calendars/[id].vue` (User view/edit for a specific calendar - if needed as a separate view from aggregated):
      - Display events for this specific calendar.
      - Allow adding/editing events if user has `edit` rights.
    - `users/manage.vue` (Admin only):
      - User listing and management UI.

3.  **Components (`components/`)**

    - `AppHeader.vue`, `AppSidebar.vue` (for navigation, filters).
    - `CalendarView.vue`: Wrapper for FullCalendar or your custom calendar logic.
      - Props: `events`, `initialView`, `callbacks` for event click/drop/resize.
    - `EventModal.vue`: Form for creating/editing events (subject, start/end times, allDay, etc.).
    - `FilterPanel.vue`:
      - Dropdowns/checkboxes to select calendars to show/hide (if not purely backend filtered initially).
      - Date range pickers.
      - Text search for event subjects.
    - `CalendarForm.vue` (Admin): For creating/editing calendar metadata.
    - `PermissionManager.vue` (Admin): UI to assign user permissions to calendars.

4.  **Pinia Stores (`stores/`)**

    - `auth.ts`: Manage user authentication state, user object, roles.

      ```typescript
      import { defineStore } from "pinia";

      export const useAuthStore = defineStore("auth", {
        state: () => ({
          user: null as User | null, // Define User type based on your model
          isAuthenticated: false,
        }),
        actions: {
          async login(credentials) {
            /* Call login API, update state */
          },
          async logout() {
            /* Call logout API, clear state */
          },
          async fetchUser() {
            /* Call /api/auth/me, update state */
          },
        },
        getters: {
          isAdmin: state => state.user?.roles?.includes("admin"),
        },
      });
      ```

    - `calendar.ts`: Manage calendar list, selected calendar, events.

      ```typescript
      import { defineStore } from "pinia";

      export const useCalendarStore = defineStore("calendar", {
        state: () => ({
          calendars: [], // list of calendars user has access to
          events: [], // events for the current view
          aggregatedEvents: [], // events for the aggregated view
          activeFilters: {},
          // ...
        }),
        actions: {
          async fetchAccessibleCalendars() {
            /* Call /api/calendars */
          },
          async fetchEventsForCalendar(calendarId, dateRange) {
            /* Call /api/events/calendar/:calendarId */
          },
          async fetchAggregatedEvents(filters, dateRange) {
            /* Call /api/events/aggregated */
          },
          async createEvent(eventData) {
            /* Call POST /api/events */
          },
          // ... other CRUD actions
        },
      });
      ```

**V. Permissions & Authorization**

1.  **Nuxt Middleware (`middleware/`)**

    - `auth.global.ts`: Checks if user is authenticated for protected routes. Redirects to `/login` if not.

      ```typescript
      export default defineNuxtRouteMiddleware(async to => {
        if (to.path === "/login") return; // Avoid redirect loop

        const authStore = useAuthStore(); // Assuming Pinia setup
        if (!authStore.isAuthenticated) {
          // Try to fetch user if page is reloaded and store is cleared
          // but cookie might still be valid
          await authStore.fetchUser();
          if (!authStore.isAuthenticated) {
            return navigateTo("/login");
          }
        }
      });
      ```

    - `admin.ts`: Checks if authenticated user has 'admin' role.
      ```typescript
      export default defineNuxtRouteMiddleware(to => {
        const authStore = useAuthStore();
        if (!authStore.isAdmin) {
          return abortNavigation("You don't have permission to access this page.");
          // Or return navigateTo('/unauthorized');
        }
      });
      ```
      Apply in pages:
      ```vue
      <script setup lang="ts">
      definePageMeta({ middleware: ["auth", "admin"] });
      </script>
      ```

2.  **Server-Side Checks:**
    - Crucially, **ALL API endpoints must re-verify permissions on the server-side**. Do not trust client-side checks alone.
    - Use the authenticated user's ID and roles (from the session, e.g., `event.context.auth.user` if using `nuxt/Auth`) to check against Calendar permissions or user roles before performing any database operation.

**VI. Implementation Steps (Iterative Approach)**

1.  **Phase 1: Core Setup & Authentication**
    - Nuxt project, MongoDB connection.
    - User model, basic auth API endpoints (register - maybe manually for admin first, login, logout, me).
    - Login page, basic Pinia auth store.
    - Global auth middleware.
2.  **Phase 2: Admin - Calendar Management**
    - Calendar model.
    - Admin APIs for CRUD on calendars and their permissions.
    - Admin frontend pages (`/calendars/manage`, `/users/manage`) to manage calendars and assign permissions.
3.  **Phase 3: User - Event Management & Basic Calendar View**
    - Event model.
    - APIs for CRUD on events (ensure calendar permission checks).
    - Basic single calendar view (maybe just a list of events first, then integrate FullCalendar).
    - Event creation/editing modal.
4.  **Phase 4: Aggregated View & Filtering**
    - Implement `/api/events/aggregated` endpoint.
    - Develop the main `index.vue` page with FullCalendar displaying aggregated events.
    - Implement the filter panel and connect it to the API and/or client-side filtering.
5.  **Phase 5: Refinements & Polish**
    - UI/UX improvements, error handling, notifications.
    - Date handling and timezones (consistent approach).
    - Input validation (frontend and backend).
    - Styling.

**VII. Key Considerations**

- **No Internet:** Ensure all assets (JS libraries, CSS, fonts) are served locally or bundled.
- **Error Handling:** Implement robust error handling on both client and server.
- **Security:**
  - Password hashing (bcrypt).
  - Input sanitization/validation to prevent XSS, NoSQL injection.
  - CSRF protection (Nuxt often handles this with server sessions).
  - Strict permission checks on all API routes.
- **Performance:**
  - Database indexing (on `calendarId`, `startTime`, `endTime` for events; `username` for users).
  - Efficient MongoDB queries, especially for the aggregated view.
  - Lazy loading components/pages where appropriate in Nuxt.
- **Date/Time Handling:** Be very consistent with how you store and display dates and times, especially if users might conceptually be in different (even if local) timezones or if `allDay` events are handled. Storing in UTC on the backend is generally a good practice. FullCalendar can help with local time display.
- **User Experience:**
  - Clear feedback for actions (saving, errors).
  - Intuitive navigation and calendar interaction.
  - Responsive design if accessed on different screen sizes within the internal network.

This detailed plan should provide a solid roadmap. Remember to break down tasks into smaller, manageable pieces and test frequently. Good luck!
