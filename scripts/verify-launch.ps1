$ErrorActionPreference = "Continue"

$Domain = "clientbureau.com"
$WwwDomain = "www.clientbureau.com"
$ExpectedIp = "5.78.231.192"

function Write-Check($Label, $Ok, $Detail) {
  $status = if ($Ok) { "PASS" } else { "CHECK" }
  Write-Host "[$status] $Label - $Detail"
}

$rootA = Resolve-DnsName $Domain -Type A -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress } |
  Select-Object -ExpandProperty IPAddress
$wwwA = Resolve-DnsName $WwwDomain -Type A -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress } |
  Select-Object -ExpandProperty IPAddress

Write-Check "Root DNS" ($rootA -contains $ExpectedIp) "$Domain -> $($rootA -join ', ')"
Write-Check "WWW DNS" ($wwwA -contains $ExpectedIp) "$WwwDomain -> $($wwwA -join ', ')"

foreach ($port in 22, 80, 443) {
  $result = Test-NetConnection $ExpectedIp -Port $port -WarningAction SilentlyContinue
  Write-Check "VPS port $port" $result.TcpTestSucceeded "${ExpectedIp}:$port"
}

try {
  $robots = Invoke-WebRequest -Uri "https://$Domain/robots.txt" -UseBasicParsing -TimeoutSec 15
  Write-Check "HTTPS robots" ($robots.StatusCode -eq 200) "HTTP $($robots.StatusCode)"
} catch {
  Write-Check "HTTPS robots" $false $_.Exception.Message
}

try {
  $sitemap = Invoke-WebRequest -Uri "https://$Domain/sitemap.xml" -UseBasicParsing -TimeoutSec 15
  Write-Check "HTTPS sitemap" ($sitemap.StatusCode -eq 200) "HTTP $($sitemap.StatusCode)"
} catch {
  Write-Check "HTTPS sitemap" $false $_.Exception.Message
}
