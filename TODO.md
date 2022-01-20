# Missing Functionality
- flutter app

# Bugfix
- server/Room@ready should noop if inGame
- server/Game overall needs leave mechanisms
- web/Game missing a game over screen, easy but I'm lazy

# Definitely
<!-- - refactor server/Game to make use of ChannelManager # delaying this bit me in the bottom lol -->

# Maybe
- 'error' channel:
    sendErr func on server
    ErrorNotifier on clients
- delete a room with 0 members that is not ingame automatically
    no deleteChannel method, I don't want to implement access control

# Future