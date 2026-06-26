# ==========================================================
# Generate_Audit_Manifests.ps1
# Generates:
# 1. PROJECT_TREE.txt
# 2. BACKEND_MANIFEST.txt
# 3. ADMIN_MANIFEST.txt
# 4. DOCS_MANIFEST.txt
# ==========================================================

$ErrorActionPreference = "SilentlyContinue"

$OutputFolder = ".\Audit_Output"

if (!(Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder | Out-Null
}

$TreeFile = Join-Path $OutputFolder "PROJECT_TREE.txt"
$BackendManifest = Join-Path $OutputFolder "BACKEND_MANIFEST.txt"
$AdminManifest = Join-Path $OutputFolder "ADMIN_MANIFEST.txt"
$DocsManifest = Join-Path $OutputFolder "DOCS_MANIFEST.txt"

Remove-Item $TreeFile,$BackendManifest,$AdminManifest,$DocsManifest -Force -ErrorAction SilentlyContinue

# ==========================================================
# EXCLUSIONS
# ==========================================================

$ExcludedFolders = @(
    "node_modules",
    ".next",
    ".git",
    ".turbo",
    ".vercel",
    "dist",
    "build",
    "coverage",
    "storybook-static",
    "playwright-report",
    "test-results",
    "android",
    "ios",
    "uploads",
    "tmp",
    "temp",
    ".idea",
    ".vscode"
)

function Test-IsExcluded {
    param([string]$Path)

    foreach ($folder in $ExcludedFolders) {
        if ($Path -match [regex]::Escape("\$folder\")) {
            return $true
        }
    }

    return $false
}

# ==========================================================
# PROJECT TREE
# ==========================================================

Write-Host "Generating PROJECT_TREE..."

"==========================================================" | Out-File $TreeFile
"PROJECT TREE" | Add-Content $TreeFile
"==========================================================" | Add-Content $TreeFile
"" | Add-Content $TreeFile

Get-ChildItem -Recurse |
Where-Object {
    -not (Test-IsExcluded $_.FullName)
} |
ForEach-Object {
    $_.FullName
} | Out-File -Append $TreeFile

# ==========================================================
# BACKEND MANIFEST
# ==========================================================

Write-Host "Generating BACKEND_MANIFEST..."

"==========================================================" | Out-File $BackendManifest
"BACKEND MANIFEST" | Add-Content $BackendManifest
"==========================================================" | Add-Content $BackendManifest
"" | Add-Content $BackendManifest

Get-ChildItem -Recurse -File -Include *.ts |
Where-Object {
    $_.FullName -match "\\Backend\\src\\" -and
    -not (Test-IsExcluded $_.FullName)
} |
ForEach-Object {

    $File = $_

    $Content = Get-Content $File.FullName -Raw

    "==========================================================" | Add-Content $BackendManifest
    "FILE: $($File.FullName)" | Add-Content $BackendManifest
    "==========================================================" | Add-Content $BackendManifest

    $Classes = [regex]::Matches(
        $Content,
        'export\s+class\s+([A-Za-z0-9_]+)'
    )

    if ($Classes.Count -gt 0) {
        "CLASSES:" | Add-Content $BackendManifest

        foreach ($Class in $Classes) {
            " - $($Class.Groups[1].Value)" | Add-Content $BackendManifest
        }
    }

    $Routes = [regex]::Matches(
        $Content,
        '@(Get|Post|Put|Patch|Delete)\('
    )

    if ($Routes.Count -gt 0) {

        "ROUTES:" | Add-Content $BackendManifest

        foreach ($Route in $Routes) {
            " - $($Route.Value)" | Add-Content $BackendManifest
        }
    }

    $Methods = [regex]::Matches(
        $Content,
        'async\s+([A-Za-z0-9_]+)\('
    )

    if ($Methods.Count -gt 0) {

        "METHODS:" | Add-Content $BackendManifest

        foreach ($Method in $Methods) {
            " - $($Method.Groups[1].Value)" | Add-Content $BackendManifest
        }
    }

    "" | Add-Content $BackendManifest
}

# ==========================================================
# ADMIN MANIFEST
# ==========================================================

Write-Host "Generating ADMIN_MANIFEST..."

"==========================================================" | Out-File $AdminManifest
"ADMIN MANIFEST" | Add-Content $AdminManifest
"==========================================================" | Add-Content $AdminManifest
"" | Add-Content $AdminManifest

Get-ChildItem -Recurse -File -Include *.ts,*.tsx |
Where-Object {
    $_.FullName -match "\\admin-panel\\" -and
    -not (Test-IsExcluded $_.FullName)
} |
ForEach-Object {

    $File = $_
    $Content = Get-Content $File.FullName -Raw

    "==========================================================" | Add-Content $AdminManifest
    "FILE: $($File.FullName)" | Add-Content $AdminManifest
    "==========================================================" | Add-Content $AdminManifest

    if ($File.Name -match "page\.tsx$") {
        "TYPE: PAGE" | Add-Content $AdminManifest
    }

    if ($File.Name -match "columns\.tsx$") {
        "TYPE: TABLE" | Add-Content $AdminManifest
    }

    if ($File.Name -match "Drawer") {
        "TYPE: DRAWER" | Add-Content $AdminManifest
    }

    $Exports = [regex]::Matches(
        $Content,
        'export\s+(function|const|class|interface|type)\s+([A-Za-z0-9_]+)'
    )

    if ($Exports.Count -gt 0) {

        "EXPORTS:" | Add-Content $AdminManifest

        foreach ($Export in $Exports) {
            " - $($Export.Groups[2].Value)" | Add-Content $AdminManifest
        }
    }

    "" | Add-Content $AdminManifest
}

# ==========================================================
# DOCS MANIFEST
# ==========================================================

Write-Host "Generating DOCS_MANIFEST..."

"==========================================================" | Out-File $DocsManifest
"DOCS MANIFEST" | Add-Content $DocsManifest
"==========================================================" | Add-Content $DocsManifest
"" | Add-Content $DocsManifest

Get-ChildItem -Recurse -File -Include *.md |
Where-Object {
    $_.FullName -match "\\docs\\"
} |
ForEach-Object {

    "FILE: $($_.FullName)" | Add-Content $DocsManifest

    $Headings = Select-String `
        -Path $_.FullName `
        -Pattern '^#'

    foreach ($Heading in $Headings) {
        " - $($Heading.Line)" | Add-Content $DocsManifest
    }

    "" | Add-Content $DocsManifest
}

# ==========================================================
# COMPLETE
# ==========================================================

Write-Host ""
Write-Host "=========================================="
Write-Host "AUDIT FILES GENERATED"
Write-Host "=========================================="
Write-Host $TreeFile
Write-Host $BackendManifest
Write-Host $AdminManifest
Write-Host $DocsManifest
Write-Host ""
Write-Host "Done."