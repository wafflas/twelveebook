// Each mutation runs atomically: rate checks, run consumption and ranking updates
// cannot race with another request. Keys are isolated from likes and inbox data.
export const MUTATE = `
local action = ARGV[1]
local now = tonumber(redis.call('TIME')[1])
if redis.call('GET', KEYS[1]) == '1' then return {'disabled'} end
if redis.call('EXISTS', KEYS[2]) == 1 then return {'blocked'} end

local function allowed(key, limit)
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, 60) end
  return count <= limit
end
local ipLimit = action == 'start' and 60 or (action == 'submit' and 30 or 10)
local playerLimit = action == 'start' and 10 or 5
if not allowed(KEYS[3], ipLimit) then return {'limited'} end
if not allowed(KEYS[4], playerLimit) then return {'limited'} end

if action == 'session' then return {'ok'} end
if action == 'start' then
  redis.call('SET', KEYS[5], cjson.encode({token=ARGV[2], started=now}), 'EX', 3600)
  return {'ok'}
end

local rawRun = redis.call('GET', KEYS[5])
if not rawRun then return {'expired'} end
local run = cjson.decode(rawRun)
if run.token ~= ARGV[2] then return {'expired'} end
local score = tonumber(ARGV[3])
-- MAX_SPEED can overshoot 13 by one ACCELERATION step (0.001).
-- Distance is speed * elapsedMs / (1000/60); displayed score uses 0.025.
-- Two seconds allow for request latency and timestamp rounding.
local maximum = math.ceil((now - run.started + 2) * 13.001 * 60 * 0.025) + 1
redis.call('DEL', KEYS[5])
if score > maximum then return {'invalid_score'} end

local entries = cjson.decode(redis.call('GET', KEYS[6]) or '[]')
local player = ARGV[5]
for i, entry in ipairs(entries) do
  if entry.player == player then
    if score <= entry.score then return {'not_improved'} end
    table.remove(entries, i)
    break
  end
end
if #entries >= 12 and score <= entries[12].score then return {'not_qualified'} end
local entry = {player=player, nickname=ARGV[4], score=score, achieved=now}
local position = #entries + 1
for i, existing in ipairs(entries) do
  if score > existing.score then position = i break end
end
table.insert(entries, position, entry)
while #entries > 12 do table.remove(entries) end
redis.call('SET', KEYS[6], cjson.encode(entries))
return {'ok'}
`;

export const MODERATE = `
local entries = cjson.decode(redis.call('GET', KEYS[1]) or '[]')
for i = #entries, 1, -1 do
  if entries[i].player == ARGV[1] then table.remove(entries, i) end
end
if #entries == 0 then redis.call('DEL', KEYS[1])
else redis.call('SET', KEYS[1], cjson.encode(entries)) end
if ARGV[2] == 'block' then
  redis.call('SET', KEYS[2], '1', 'EX', 7776000)
  redis.call('DEL', KEYS[3])
end
return 1
`;
