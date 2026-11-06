# Uploads only the PDFs listed in a text file (one full path per line, under Downloads\BeforeExams) to the papers
# host, in preview deployments of 200 files, so a dropped connection only loses one chunk. Afterwards a production
# deploy of the whole BeforeExams folder makes them live with almost nothing left to send.
# usage: upload_list.ps1 <list file> [files already done]
$host_dir = 'C:\Users\user\Downloads\BeforeExams'
$work = 'C:\Users\user\Downloads\be_chunk'
$fn = 'C:\Users\user\Downloads\BeforeExams-project\papers_fn'
$files = Get-Content $args[0] | Where-Object { $_ -and (Test-Path $_) } | Sort-Object -Unique
$first = [int]($args[1])
"listed files: $($files.Count)"
$size = 200
for ($start = $first; $start -lt $files.Count; $start += $size) {
  $part = $files[$start..([math]::Min($start + $size, $files.Count) - 1)]
  if (Test-Path $work) { Remove-Item -Recurse -Force $work }
  New-Item -ItemType Directory $work | Out-Null
  foreach ($f in $part) {
    $rel = $f.Substring($host_dir.Length + 1)
    $dst = Join-Path $work $rel
    New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
    New-Item -ItemType HardLink -Path $dst -Target $f | Out-Null
  }
  Set-Location $fn
  $ok = $false
  for ($try = 1; $try -le 15; $try++) {
    $o = cmd /c npx -y wrangler@4.158.0 pages deploy $work --project-name beforeexams-papers-03c3c7 --branch upload-chunks --commit-dirty=true --commit-message "fonts chunk $start" 2>&1 | ForEach-Object { "$_" }
    if (($o -join ' ') -match 'Deployment complete') { "chunk $start of $($files.Count) ok (try $try)"; $ok = $true; break }
    "chunk $start failed try $try"
  }
  if (-not $ok) { "chunk $start GAVE UP" }
}
Remove-Item -Recurse -Force $work
'ALL CHUNKS DONE'
