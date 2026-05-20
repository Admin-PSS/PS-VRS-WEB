# export-seed-data.ps1
# Exports reference tables from VRS_3MDG_V2_2019.accdb to CSV files in public/seed/
# Run this script once (or when reference data changes) before seeding the web app.
#
# Usage:  .\export-seed-data.ps1

param(
    [string]$DbPath = "..\VRS_3MDG_V2_2019.accdb",
    [string]$OutDir = "public\seed"
)

$conn = New-Object System.Data.OleDb.OleDbConnection
$conn.ConnectionString = "Provider=Microsoft.ACE.OLEDB.16.0;Data Source=$DbPath"
$conn.Open()

function Export-Table([string]$TableName, [string]$FileName) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT * FROM [$TableName]"
    $adapter = New-Object System.Data.OleDb.OleDbDataAdapter $cmd
    $ds = New-Object System.Data.DataSet
    $adapter.Fill($ds) | Out-Null

    $rows = $ds.Tables[0].Rows
    $cols = $ds.Tables[0].Columns | ForEach-Object { $_.ColumnName }
    $header = $cols -join ","

    $lines = @($header)
    foreach ($row in $rows) {
        $values = $cols | ForEach-Object {
            $val = $row[$_]
            if ($val -is [DBNull]) { "" }
            elseif ($val -is [bool]) { if ($val) { "true" } else { "false" } }
            elseif ($val -is [DateTime]) { $val.ToString("yyyy-MM-dd") }
            else { "`"$($val.ToString().Replace('"','""'))`"" }
        }
        $lines += ($values -join ",")
    }

    $outPath = Join-Path $OutDir $FileName
    $lines | Set-Content -Path $outPath -Encoding UTF8
    Write-Host "Exported $TableName → $outPath ($($rows.Count) rows)"
}

New-Item -ItemType Directory -Force $OutDir | Out-Null

# Geo/HW tables use the *1 variants — those hold the master reference data.
# The plain tblSys_* tables are staging/sync buffers and are normally empty.
Export-Table "tblSys_Township1"  "sys_township.csv"
Export-Table "tblSys_RHC1"       "sys_rhc.csv"
Export-Table "tblSys_SRHC1"      "sys_srhc.csv"
Export-Table "tblSys_Village1"   "sys_village.csv"
Export-Table "tblSys_CHWAMW1"    "sys_chwamw.csv"
Export-Table "tblSys_Org"        "sys_org.csv"
Export-Table "tblSys_Drug"       "sys_drug.csv"
Export-Table "tblSys_LookUp"     "sys_lookup.csv"
Export-Table "tblSys_LookUpMain" "sys_lookupMain.csv"
Export-Table "tblSys_UserLevel"  "sys_userLevel.csv"
Export-Table "tblSys_User"       "sys_user.csv"

$conn.Close()
Write-Host "`nDone. CSV files written to $OutDir"
Write-Host "Now run 'npm run dev' and open the app — it will auto-seed on first load."
