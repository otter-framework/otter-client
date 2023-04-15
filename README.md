# Otter Web App 

## React App for P2P video calling leveraging the WebRTC API and Otter infrastructure

### Features 
- audio/video calling
- mute/unmute media streams
- file sharing
- instant messaging

## Screenshots

### Local peer view as a Remote peer joins the call
<img width="1430" alt="Screenshot 2023-04-15 at 2 19 13 PM" src="https://user-images.githubusercontent.com/37469965/232253660-8968a524-e7a1-4b28-ad8f-74a363ebe584.png">

### Entering full screen view after Remote peer joins
<img width="1425" alt="Screenshot 2023-04-15 at 2 19 29 PM" src="https://user-images.githubusercontent.com/37469965/232253673-53a2bacf-a512-4517-8ce4-6944814179b6.png">

### Viewing chat box. Remote peer sent a message.
<img width="1421" alt="Screenshot 2023-04-15 at 2 19 59 PM" src="https://user-images.githubusercontent.com/37469965/232253679-8c522d0f-7b96-4d13-a7fd-ff3bef1c66b3.png">

### Upload a file to share to remote peer.
<img width="1421" alt="Screenshot 2023-04-15 at 2 20 37 PM" src="https://user-images.githubusercontent.com/37469965/232253681-8b87a274-105a-495a-ad3b-85770291432e.png">

### File shared with peer. About to leave and end the call session.
<img width="1422" alt="Screenshot 2023-04-15 at 2 21 52 PM" src="https://user-images.githubusercontent.com/37469965/232253691-d7e0d9bc-13f3-4905-8803-e40efb8f2467.png">

### Otter Fin display page after a call is terminated.
<img width="1431" alt="Screenshot 2023-04-15 at 2 22 19 PM" src="https://user-images.githubusercontent.com/37469965/232253695-5e4a60ec-2fa0-4ef7-9db1-24f462aa31a0.png">

### To Install

run `npm i` then `npm run dev`

### Future Work
- close connections/streams/etc to free up memory and resources
- screen share:
  - currently makes page load infinitely (too much bandwidth demand)
  - merge into only one screen share and limit bandwidth
