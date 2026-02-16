$csvPath = "public\seeds.csv"
$lines = Get-Content $csvPath
$header = $lines[0]
$dataRows = $lines | Select-Object -Skip 1

$batchSize = 50
$batchCount = 1
$inserts = @()

foreach ($i in 0..($dataRows.Count - 1)) {
    $line = $dataRows[$i].Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    # Simple CSV parse: remove quotes
    $values = $line.Split(',') | ForEach-Object { 
        $v = $_.Trim().Trim('"')
        if ($v -eq "") { "NULL" } else { $v }
    }
    
    $day = $i + 1
    $seed = "'$($values[0])'"
    $rest = $values[1..($values.Count-1)] -join ", "
    
    $valueStr = "($day, $seed, $rest)"
    $inserts += $valueStr
    
    if ($inserts.Count -ge $batchSize) {
        $outFile = "seeds_final_$batchCount.sql"
        $sql = "INSERT INTO DailySeeds VALUES `n" + ($inserts -join ",`n") + ";"
        Set-Content -Path $outFile -Value $sql
        Write-Host "Created $outFile"
        $inserts = @()
        $batchCount++
    }
}

# Remaining
if ($inserts.Count -gt 0) {
    $outFile = "seeds_final_$batchCount.sql"
    $sql = "INSERT INTO DailySeeds VALUES `n" + ($inserts -join ",`n") + ";"
    Set-Content -Path $outFile -Value $sql
    Write-Host "Created $outFile"
}
