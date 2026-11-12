# Claude Code hook (Stop + Notification): sends the "Notify the assistant" post from CLAUDE.md.
# Reads the hook JSON on stdin. Never blocks: short timeout, always exit 0, silent unless it fails.
# Secrets come from C:\Users\owner\.grokbot\claude-hook.env at run time and are never printed.
# Test switches: NOTIFY_DRY_RUN=1 prints status/summary and does not post; NOTIFY_TEST_SUMMARY overrides the summary.
$ErrorActionPreference = 'Stop'
try {
    $raw = [Console]::In.ReadToEnd()
    $in = if ($raw -and $raw.Trim()) { $raw | ConvertFrom-Json } else { $null }
    if (-not $in) { exit 0 }

    $event = [string]$in.hook_event_name
    $stamp = Join-Path $env:TEMP 'chem-notify-last.txt'
    $status = $null; $summary = $null

    if ($event -eq 'Stop') {
        if ($in.stop_hook_active -eq $true) { exit 0 }   # never loop
        if ([string]$in.permission_mode -eq 'plan') { $status = 'question'; $summary = 'plan ready for review' }
        else { $status = 'done'; $summary = 'Finished; waiting for your next instruction.' }
    }
    elseif ($event -eq 'Notification') {
        switch ([string]$in.notification_type) {
            'permission_prompt' { $status = 'permission'; $summary = 'Waiting for your permission.' }
            'idle_prompt' {
                # idle_prompt follows a Stop; skip it if a Stop post went out in the last 10 minutes
                if ((Test-Path $stamp) -and ((Get-Date) - (Get-Item $stamp).LastWriteTime).TotalMinutes -lt 10) { exit 0 }
                $status = 'question'; $summary = 'Waiting for your input.'
            }
        }
    }
    if (-not $status) { exit 0 }
    if ($env:NOTIFY_TEST_SUMMARY) { $summary = $env:NOTIFY_TEST_SUMMARY }

    if ($env:NOTIFY_DRY_RUN -eq '1') { Write-Output "dry-run: status=$status summary=$summary"; exit 0 }

    $kv = @{}
    $envFile = 'C:\Users\owner\.grokbot\claude-hook.env'
    if (-not (Test-Path $envFile)) { [Console]::Error.WriteLine('notify-hook: settings file missing'); exit 0 }
    Get-Content $envFile | ForEach-Object { if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)$') { $kv[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'") } }
    if (-not $kv.HOOK_URL -or -not $kv.HOOK_KEY -or -not $kv.HOOK_AUTH_HEADER) { [Console]::Error.WriteLine('notify-hook: settings value empty'); exit 0 }
    $auth = $kv.HOOK_AUTH_HEADER -replace '^\s*Authorization:\s*', ''

    $cwd = if ($in.cwd) { [string]$in.cwd } else { (Get-Location).Path }
    $branch = ''; $commit = ''
    try { $branch = (& git -C $cwd rev-parse --abbrev-ref HEAD 2>$null | Select-Object -First 1) } catch {}
    try { $commit = (& git -C $cwd rev-parse --short HEAD 2>$null | Select-Object -First 1) } catch {}

    $body = @{ project = 'chem-practice'; session = ''; status = $status; summary = $summary; branch = [string]$branch; commit = [string]$commit } | ConvertTo-Json
    try {
        $code = (Invoke-WebRequest -Method Post -UseBasicParsing -TimeoutSec 8 -Uri $kv.HOOK_URL -ContentType 'application/json' -Headers @{ Authorization = $auth } -Body $body).StatusCode
        if ($event -eq 'Stop') { Set-Content -Path $stamp -Value (Get-Date -Format o) }
        if ($env:NOTIFY_TEST_SUMMARY) { Write-Output "HTTP $code" }
    }
    catch {
        $c = $null
        try { $c = $_.Exception.Response.StatusCode.value__ } catch {}
        if ($c) { [Console]::Error.WriteLine("notify-hook: HTTP $c") } else { [Console]::Error.WriteLine('notify-hook: post failed') }
    }
}
catch { try { [Console]::Error.WriteLine('notify-hook: post failed') } catch {} }
exit 0
