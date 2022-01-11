# Bugfix
- server/Room@ready should noop if inGame

# Definitely
- refactor server/Game to make use of ChannelManager

# Maybe
- 'error' channel:
    sendErr func on server
    ErrorNotifier on clients
- delete a room with 0 members that is not ingame automatically
    no deleteChannel method, I don't want to implement access control

# Future