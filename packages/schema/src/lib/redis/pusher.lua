#!lua name=soketi_pusher

redis.register_function('pusher_socket_id_is_taken', function(keys, args)
  local pusher_socket_id = args[1];

  return redis.call('EXISTS', 'soketi:connections:' .. pusher_socket_id .. ':connection_id');
end)

redis.register_function('pusher_store_connection', function(keys, args)
  local connection_id = args[1];

  redis.call('SET', 'soketi:connections:' .. connection_id .. ':pusher:socket_id', connection_id);

  return 1;
end)

redis.register_function('pusher_get_socket_id_for', function(keys, args)
  local connection_id = args[1];

  return redis.call('GET', 'soketi:connections:' .. connection_id .. ':pusher_socket_id');
end)

redis.register_function('pusher_evict_connection', function(keys, args)
  local connection_id = args[1];

  -- Get the Pusher Socket ID for the AWS Connection ID.
  local pusher_socket_id = redis.call('FCALL', 'pusher_get_socket_id_for', connection_id, 0);

  -- Get the channels the AWS Connection ID is subscribed to.
  local channels = redis.call('FCALL', 'pusher_subscribed_channels', connection_id, 0);

  -- Remove the AWS Connection ID from the channels it is subscribed to.
  for _, channel in ipairs(channels) do
    redis.call('FCALL', 'pusher_unsubscribe_from_channel', connection_id, channel, 0);
  end

  -- Remove the AWS Connection ID and Pusher Socket ID references.
  redis.call('DEL', 'pusher:connections:' .. pusher_socket_id .. ':connection_id');
  redis.call('DEL', 'soketi:connections:' .. connection_id .. ':pusher_socket_id');

  return 1;
end)

redis.register_function('pusher_subscribe_to_channel', function(keys, args)
  local connection_id = args[1];
  local channel = args[2];

  local pusher_socket_id = redis.call('FCALL', 'pusher_get_socket_id_for', connection_id, 0);

  -- Add the channel to the AWS Connection subscribed channels list.
  redis.call('SADD', 'soketi:connections:' .. connection_id .. ':channels', channel);

  -- Add the AWS Connection to the channel set.
  redis.call('SADD', 'soketi:channels:' .. channel .. ':connections', connection_id);

  return 1;
end)

redis.register_function('pusher_unsubscribe_from_channel', function(keys, args)
  local connection_id = args[1];
  local channel = args[2];

  -- Remove the channel from the AWS connection subscribed channels list.
  redis.call('SREM', 'soketi:connections:' .. connection_id .. ':channels', channel);

  -- Remove the AWS Connection ID from the channel set.
  redis.call('SREM', 'soketi:channels:' .. channel .. ':connections', connection_id);

  -- Remove the member ID from the channel members list.
  local member_id = redis.call('GET', 'soketi:connections:' .. connection_id .. ':member_id');

  if (member_id ~= false) then
    redis.call('FCALL', 'pusher_remove_presence_member', connection_id, channel, member_id, 0);
  end

  return 1;
end)

redis.register_function('pusher_subscribed_channels', function(keys, args)
  local connection_id = args[1];

  -- Get the list of channels for the AWS Connection ID.
  return redis.call('SMEMBERS', 'soketi:connections:' .. connection_id .. ':channels');
end)

redis.register_function('pusher_store_presence_member', function(keys, args)
  local channel = args[2];
  local member_id = args[3];
  local member_info = args[4];

  -- Add the member ID to the channel members list.
  redis.call('SADD', 'soketi:channels:' .. channel .. ':members', member_id);

  -- Add the member info to the channel member info list.
  redis.call('SET', 'soketi:channels:' .. channel .. ':members:' .. member_id, member_info);

  -- Return the member ID and member info.
  return { member_id, member_info };
end)

redis.register_function('pusher_remove_presence_member', function(keys, args)
  local channel = args[2];
  local member_id = args[3];

  -- Remove the member ID from the channel members list.
  redis.call('SREM', 'soketi:channels:' .. channel .. ':members', member_id);

  -- Remove the member info from the channel member info list.
  redis.call('DEL', 'soketi:channels:' .. channel .. ':members:' .. member_id);

  -- Return the member ID.
  return member_id;
end)

redis.register_function('pusher_channel_socket_ids', function(keys, args)
  local channel = args[1];

  -- Get the list of AWS Connection IDs for the channel.
  local connection_ids = redis.call('FCALL', 'pusher_channel_connections', channel, 0);

  -- Retrieve all Pusher Socket IDs for the channel.
  local pusher_socket_ids = redis.call('MGET', unpack(connection_ids));

  -- Create a table to store the final socket IDs.
  local socket_ids = {}

  -- Merge AWS Connection IDs into Pusher Socket IDs.
  for i, connection_id in ipairs(connection_ids) do
    socket_ids[connection_id] = pusher_socket_ids[i];
  end

  -- Return the socket IDs.
  return socket_ids;
end)

redis.register_function('pusher_channel_connections', function(keys, args)
  local channel = args[1];

  -- Get the list of AWS Connection IDs for the channel.
  return redis.call('SMEMBERS', 'soketi:channels:' .. channel .. ':connections');
end)

redis.register_function('pusher_get_presence_members', function(keys, args)
  local channel = args[1];

  -- Get the list of member IDs for the channel.
  local member_ids = redis.call('SMEMBERS', 'soketi:channels:' .. channel .. ':members');

  -- Retrieve all member infos for the channel.
  local member_infos = redis.call('MGET', unpack(member_ids));

  -- Create a table to store the final members.
  local members = {}

  -- Merge member ids into member infos.
  for i, member_id in ipairs(member_ids) do
    members[member_id] = member_infos[i];
  end

  -- Return the members.
  return members;
end)

redis.register_function('pusher_process_ping_message', function(keys, args)
  local connection_id = args[1];

  -- Ping the AWS Connection ID.
  -- TODO: redis.call('SET', 'soketi:connections:' .. connection_id .. ':ping', '1', 'EX', 30);

  return false;
end)
