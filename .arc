@app
begin-app

@http
get /
post /events

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
