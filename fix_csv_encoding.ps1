# Fix CSV Encoding for Excel Compatibility
# This script adds a BOM (Byte Order Mark) to the seeds.csv file
# so that Excel correctly recognizes it as UTF-8 and parses headers.

$csvPath = "x:\ErraticDeckApp\web\public\seeds.csv"

if (Test-Path $csvPath) {
    Write-Host "Reading $csvPath..."
    $content = Get-Content -Path $csvPath -Raw
    
    Write-Host "Saving with UTF-8 BOM..."
    $content | Out-File -FilePath $csvPath -Encoding utf8
    
    Write-Host "Success! The CSV is now safe for Excel."
} else {
    Write-Error "File not found: $csvPath"
}
