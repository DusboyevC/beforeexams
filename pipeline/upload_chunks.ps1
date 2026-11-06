# Uploads the cleaned topical and year PDFs to the papers host in small preview deployments (not production),
# 200 files at a time, so a dropped connection only loses one chunk. Cloudflare keeps every uploaded file, so the
# production deploy afterwards has almost nothing left to send.
$host_dir = 'C:\Users\user\Downloads\BeforeExams'
$work = 'C:\Users\user\Downloads\be_chunk'
$fn = 'C:\Users\user\Downloads\BeforeExams-project\papers_fn'
$files = Get-ChildItem $host_dir -Recurse -File -Filter *.pdf | Where-Object { $_.FullName -like '*\Topicals\*' }
"topical files: $($files.Count)"
$size = 200
$first = [int]($args[0])   # resume: number of files already uploaded
for ($start = $first; $start -lt $files.Count; $start += $size) {
  $part = $files[$start..([math]::Min($start + $size, $files.Count) - 1)]
  if (Test-Path $work) { Remove-Item -Recurse -Force $work }
  New-Item -ItemType Directory $work | Out-Null
  foreach ($f in $part) {
    $rel = $f.FullName.Substring($host_dir.Length + 1)
    $dst = Join-Path $work $rel
    New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
    New-Item -ItemType HardLink -Path $dst -Target $f.FullName | Out-Null
  }
  Set-Location $fn
  $ok = $false
  for ($try = 1; $try -le 15; $try++) {
    $o = cmd /c npx -y wrangler@4.158.0 pages deploy $work --project-name beforeexams-papers-03c3c7 --branch upload-chunks --commit-dirty=true --commit-message "clean chunk $start" 2>&1 | ForEach-Object { "$_" }
    if (($o -join ' ') -match 'Deployment complete') { "chunk $start of $($files.Count) ok (try $try)"; $ok = $true; break }
    "chunk $start failed try $try"
  }
  if (-not $ok) { "chunk $start GAVE UP" }
}
Remove-Item -Recurse -Force $work
'ALL CHUNKS DONE'
