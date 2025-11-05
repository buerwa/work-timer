# 确保 src/components 目录存在
$componentsDir = "src/components"
if (-not (Test-Path -Path $componentsDir)) {
  New-Item -ItemType Directory -Path $componentsDir
  Write-Host "已创建: $componentsDir"
}

Write-Host "正在 src/components/ 中创建组件文件..."

# 第 6 批和第 7 批的文件列表
$componentFiles = @(
  "src/components/Modal.tsx",
  "src/components/SettingsModal.tsx",
  "src/components/CalendarConfigModal.tsx",
  "src/components/ImportExportButtons.tsx",
  "src/components/Dashboard.tsx",
  "src/components/CountdownTimer.tsx",
  "src/components/TimeInput.tsx",
  "src/components/TimeInputRow.tsx",
  "src/components/TimeInputList.tsx"
)

# 循环创建空文件
foreach ($file in $componentFiles) {
  if (-not (Test-Path -Path $file)) {
    New-Item -ItemType File -Path $file
    Write-Host "已创建: $file"
  }
  else {
    Write-Host "已存在: $file"
  }
}

Write-Host "所有组件文件创建完毕！"

