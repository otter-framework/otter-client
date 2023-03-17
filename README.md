# Otter Client Front End

TODOS:
- useLocation vs useRef to pass RoomId param to WebRTCService
  - switch to useRef and instantiate WebRTCService object inside component
- call to getCredentials to load endpoints/config
  - switch guard clause in handleNegotiationNeeded event handler
- close connections/streams/etc to free up memory and resources
- screen share:
  - currently makes page load infinitely (too much bandwidth demand)
  - merge into only one screen share and limit bandwidth
