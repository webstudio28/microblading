# Booking Backend Setup (cPanel + Cal.com)

This project now includes a tiny backend endpoint:

- `src/api/book.php` -> deployed to `public_html/api/book.php`

It receives the modal payload and creates the booking in Cal via `POST /v2/bookings`.

## 1) Create private config on cPanel

Create this file **outside** `public_html`:

- `/home/<cpanel-user>/cal-booking-config.php`

Use `cal-booking-config.example.php` from this repo as template.

Required values:

- `CAL_API_KEY`
- `CAL_EVENT_TYPE_SLUG`
- `CAL_USERNAME` (or `CAL_TEAM_SLUG`)

## 2) Keep frontend endpoint enabled

In `src/_data/home.json`:

- `booking.submitEndpoint` should be `/api/book.php`
- `booking.calBookingUrl` can stay set for availability loading

## 3) Build and upload

Run:

- `npm run build`

Upload `_site` contents to `public_html`.

Because `.eleventy.js` now passthrough-copies `src/api`, your API file is included at:

- `public_html/api/book.php`

## 4) Test flow

1. Open modal
2. Pick service/date/time
3. Submit personal info
4. Booking should be finalized directly (no Cal redirect fallback path)

## Notes

- If server returns an error, the modal now shows backend error text.
- If you get authentication errors, re-check `CAL_API_KEY`.
- If you get event lookup errors, re-check `CAL_EVENT_TYPE_SLUG` and `CAL_USERNAME`.
