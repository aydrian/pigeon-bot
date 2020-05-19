@app
begin-app

@http
get /
post /events

@events
process-linear-mention

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
