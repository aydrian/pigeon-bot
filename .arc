@app
pigeon-bot

@http
get /         # displays Add to Slack
get /install  # saves a bot token and redirects back to /
post /events  # accepts events from Slack

@events
process-linear-mention

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
