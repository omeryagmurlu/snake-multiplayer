# Missing Functionality
- web/Game missing a game over screen, easy but I'm lazy
- flutter foreground linear gradient
<!-- - flutter styling -->

# Bugfix
- server/Room@ready should noop if inGame
<!-- - server/Game overall needs better leave mechanisms -->

# Definitely
<!-- - refactor server/Game to make use of ChannelManager # delaying this bit me in the bottom lol -->

# Maybe
- 'error' channel:
    sendErr func on server
    ErrorNotifier on clients
- delete a room with 0 members that is not ingame automatically
    no deleteChannel method, I don't want to implement access control

# Future
- make webapp more optimized for phone (future cause flutter exists)