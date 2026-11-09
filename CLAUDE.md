## Notify the assistant

Whenever Claude finishes a task or round, gets blocked, needs Yishi's input or a decision, or is waiting on a permission prompt, POST a short JSON message to the assistant's webhook.

- Settings file: `C:\Users\owner\.grokbot\claude-hook.env`, with lines `HOOK_URL`, `HOOK_KEY`, `HOOK_AUTH_HEADER`.
- Secrets: read them only when sending. Never print, log, commit, copy or paste the values, never move the file into the repo, and don't look for the values elsewhere.
- Request: POST to `HOOK_URL` with header `Authorization` = `HOOK_AUTH_HEADER` (if the value starts with "Authorization:", use the part after it, trimmed) and `Content-Type: application/json`, via PowerShell `Invoke-RestMethod`/`Invoke-WebRequest` or curl.
- Body: `{"project":"chem-practice","session":"<the current Claude Code session link>","status":"done|blocked|question|permission","summary":"<one or two plain sentences>","branch":"<branch>","commit":"<short sha or empty>"}`
- Keep the summary short; never put secrets, tokens or file contents in it. Show only the HTTP status when reporting a post.
- If the file is missing, a value is empty, or the post fails, stop and tell Yishi.

```powershell
$kv=@{}; Get-Content 'C:\Users\owner\.grokbot\claude-hook.env' | ForEach-Object { if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)$') { $kv[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'") } }
$auth = $kv.HOOK_AUTH_HEADER -replace '^\s*Authorization:\s*',''
$json = @{project='chem-practice'; session='<session link>'; status='done'; summary='<short>'; branch='<branch>'; commit='<sha>'} | ConvertTo-Json
try { (Invoke-WebRequest -Method Post -UseBasicParsing -Uri $kv.HOOK_URL -ContentType 'application/json' -Headers @{Authorization=$auth} -Body $json).StatusCode }
catch { $_.Exception.Response.StatusCode.value__ }   # print only the status code
```
