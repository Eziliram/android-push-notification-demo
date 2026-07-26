# My experience moving from React to Angular

## A bit of context

My background is mainly in React and web development. Before this assessment, I had not worked with Angular, Ionic,
Capacitor, or Android Studio.

There was quite a lot to learn at once. I had to get familiar with Angular's syntax and patterns, understand how Ionic
and Capacitor fit into the app, and then work out how Braze connects the push notification and Content Card flow.

Although the tools were new to me, the underlying frontend concepts were not. Once I could relate the Angular patterns
back to things I already knew from React, the project started to feel much more manageable.

## What felt familiar

### Components and data flow

Angular components are structured differently from React components, but they serve the same purpose. I still tried to
keep components focused and give each part of the app a clear responsibility.

For example:

- `MmCardComponent` displays a card and emits the user's actions.
- `InboxPage` handles navigation and the dismissal confirmation.
- `BrazeService` handles the Braze integration and owns the inbox state.

The mental mapping I used was:

| React                  | Angular                        |
| ---------------------- | ------------------------------ |
| Function component     | Standalone component           |
| JSX                    | HTML template                  |
| Props                  | `input()`                      |
| Callback props         | `output()`                     |
| State                  | `signal()`                     |
| Derived state          | `computed()`                   |
| Context or shared hook | Injected service               |
| React Router           | Angular Router                 |
| `useEffect`            | `effect()` or a lifecycle hook |

### State updates

I followed the same immutable update approach that I would use in React. Cards are updated with `map()` and removed
with `filter()` instead of changing the existing array directly.

The writable inbox signal is also kept private inside `BrazeService`. The rest of the app gets a readonly version, so
components can react to changes but cannot update the inbox themselves.

### Testing external dependencies

Angular's dependency injection was new to me, but the reason for using it was familiar. The Capacitor push plugin is
provided through an injection token, which means the real native plugin can be replaced with a spy in the unit tests.

This was especially useful because the browser test environment cannot run native push notification functionality.

## What was new to me

### Angular signals

Signals took a little time to get used to because they are read by calling them like functions. In this project:

- `signal()` stores the inbox cards.
- `asReadonly()` prevents other parts of the app from changing that state.
- `computed()` works out whether there are unread cards.
- `effect()` starts the bell animation when the unread state changes.

They ended up feeling similar to React state and derived values, just with a different API.

### Ionic lifecycle

One important difference was learning that Ionic may keep a page in the DOM when navigating away from it. This means
`ngOnInit` is not guaranteed to run every time the user returns to a page.

I used `ionViewDidEnter` for card impressions because it runs when the inbox becomes visible, which is closer to the
behaviour I needed.

### Capacitor and Android

Capacitor is the bridge between the Angular app and native Android features. For this project, the notification flow is:

```text
Android push notification
        ↓
Capacitor Push Notifications
        ↓
PushNotificationService
        ↓
BrazeService
        ↓
Inbox UI
```

I also had to get used to having two debugging environments. The Angular app runs in a WebView and can be inspected
through Chrome, while native Android issues show up in Android Studio and Logcat.

### Braze

Braze was another new part of the stack. The app sends the `INBOX_MESSAGE_TEST` event, receives the resulting push
notification, and refreshes the Content Cards when the push payload has an inbox type.

The app then filters the cards, displays them in the inbox, and reports impressions, clicks, and dismissals back to
Braze.

## A few decisions I made

I kept the Braze calls in a service so the pages and components do not need to know the SDK API. It also gives the app
one place to manage the inbox state and card updates.

Push notification setup is idempotent because registering the listeners more than once could cause duplicate fetches
or analytics events.

Push payloads are treated as untrusted data. TypeScript types only help at compile time, so the payload is checked at
runtime before the app uses its `type` value.

Deep links are also checked before navigation. A click is only logged after the URL has been accepted as a route the
app supports.

The tests focus mainly on the parts where the app makes its own decisions: notification permissions, listener setup,
push payload validation, card filtering, state changes, deep links, and dismissal confirmation.

## What I would add next

With more time, I would focus on a few production essentials:

- Better loading, error, and retry handling.
- More complete deep-link support.
- End-to-end testing on Android.
- Automated CI checks.
- A fixed Braze SDK version for more predictable builds.

## Final thoughts

This assessment was a learning curve because almost the whole stack was new to me. The most useful approach was
to connect each unfamiliar Angular or mobile concept to something I already understood from React, and then confirm
the differences through the documentation and tests.

I would not say that I now know every part of Angular or native Android development, but I am much more comfortable
with how the pieces fit together. More importantly, I was able to take an unfamiliar codebase and SDK, break the work
down, and build a working solution.

Overall, this was a really fun assessment and I thoroughly enjoyed completing it. I love learning new tech and tools, and I enjoy jumping into something unfamiliar and figuring out how all the pieces fit together.
