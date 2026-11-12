param(
  [int]$Port = 0,
  [string]$Preview = '',
  [switch]$OpenPanel,
  [string]$TabName = 'chat'
)

$ErrorActionPreference = 'Stop'

$mutex = New-Object System.Threading.Mutex($false, 'Local\dsh-soul-pet-window')
if (-not $Preview) {
  if (-not $mutex.WaitOne(3000)) { exit 0 }
}

$logDir = Join-Path $env:USERPROFILE '.dsh-soul'
$logPath = Join-Path $logDir 'pet-window.log'
try { New-Item -ItemType Directory -Force -Path $logDir | Out-Null } catch { }

function Write-Log([string]$message) {
  try { Add-Content -Path $logPath -Value ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $message) -Encoding UTF8 } catch { }
}

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Win32Pet {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

function Convert-HslToRgb([double]$h, [double]$s, [double]$l) {
  $h = $h / 360.0; $s = $s / 100.0; $l = $l / 100.0
  $q = if ($l -lt 0.5) { $l * (1 + $s) } else { $l + $s - $l * $s }
  $p = 2 * $l - $q
  $hue2rgb = {
    param($p, $q, $t)
    if ($t -lt 0) { $t += 1 }
    if ($t -gt 1) { $t -= 1 }
    if ($t -lt (1.0 / 6.0)) { return $p + ($q - $p) * 6 * $t }
    if ($t -lt 0.5) { return $q }
    if ($t -lt (2.0 / 3.0)) { return $p + ($q - $p) * (2.0 / 3.0 - $t) * 6 }
    return $p
  }
  $r = & $hue2rgb $p $q ($h + 1.0 / 3.0)
  $g = & $hue2rgb $p $q $h
  $b = & $hue2rgb $p $q ($h - 1.0 / 3.0)
  [System.Windows.Media.Color]::FromRgb([byte][Math]::Round($r * 255), [byte][Math]::Round($g * 255), [byte][Math]::Round($b * 255))
}

function Brush([string]$hex, [double]$opacity = 1.0) {
  $c = [System.Windows.Media.ColorConverter]::ConvertFromString($hex)
  $b = New-Object System.Windows.Media.SolidColorBrush $c
  $b.Opacity = $opacity
  return $b
}

function Get-SoulState {
  if ($Port -le 0) { return $null }
  try { return Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/soul-api/state" -f $Port) -TimeoutSec 3 } catch { return $null }
}

function Post-Soul([string]$path, $body) {
  if ($Port -le 0) { return $null }
  $json = if ($null -eq $body) { '{}' } else { $body | ConvertTo-Json -Compress -Depth 6 }
  try {
    $result = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/soul-api/{1}" -f $Port, $path) -Method Post -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 20
    if ($result -ne $null -and $result.ok -eq $false) {
      $script:lastError = [string]$result.error
    } else {
      $script:lastError = ''
    }
    return $result
  } catch {
    $message = $_.Exception.Message
    try {
      $stream = $_.Exception.Response.GetResponseStream()
      if ($stream -ne $null) {
        $reader = New-Object System.IO.StreamReader($stream)
        $text = $reader.ReadToEnd()
        $parsed = $text | ConvertFrom-Json
        if ($parsed.error) { $message = [string]$parsed.error }
      }
    } catch { }
    $script:lastError = $message
    Write-Log ("POST {0} failed: {1}" -f $path, $message)
    return $null
  }
}

# ---------------- orb visual (64x64 design box) ----------------
function New-OrbVisual {
  $canvas = New-Object System.Windows.Controls.Canvas
  $canvas.Width = 64; $canvas.Height = 64
  $canvas.Background = [System.Windows.Media.Brushes]::Transparent

  $ball = New-Object System.Windows.Shapes.Ellipse
  $ball.Width = 52; $ball.Height = 52
  [System.Windows.Controls.Canvas]::SetLeft($ball, 6)
  [System.Windows.Controls.Canvas]::SetTop($ball, 6)
  $grad = New-Object System.Windows.Media.RadialGradientBrush
  $grad.Center = New-Object System.Windows.Point(0.34, 0.25)
  $grad.GradientOrigin = New-Object System.Windows.Point(0.34, 0.25)
  $grad.RadiusX = 0.8; $grad.RadiusY = 0.8
  $grad.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.Color]::FromRgb(255, 244, 250)), 0.0)) | Out-Null
  $grad.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.Color]::FromRgb(200, 120, 220)), 0.34)) | Out-Null
  $grad.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.Color]::FromRgb(160, 80, 200)), 1.0)) | Out-Null
  $ball.Fill = $grad
  $canvas.Children.Add($ball) | Out-Null

  $ring1 = New-Object System.Windows.Shapes.Ellipse
  $ring1.Width = 62; $ring1.Height = 24
  [System.Windows.Controls.Canvas]::SetLeft($ring1, 1)
  [System.Windows.Controls.Canvas]::SetTop($ring1, 20)
  $ring1.Stroke = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(200, 120, 220))
  $ring1.StrokeThickness = 1.6; $ring1.Opacity = 0.85
  $ring1.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
  $ring1.RenderTransform = New-Object System.Windows.Media.RotateTransform(-22)
  $canvas.Children.Add($ring1) | Out-Null

  $ring2 = New-Object System.Windows.Shapes.Ellipse
  $ring2.Width = 56; $ring2.Height = 19
  [System.Windows.Controls.Canvas]::SetLeft($ring2, 4)
  [System.Windows.Controls.Canvas]::SetTop($ring2, 22.5)
  $ring2.Stroke = [System.Windows.Media.Brushes]::White
  $ring2.StrokeThickness = 0.9; $ring2.Opacity = 0.35
  $ring2.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
  $ring2.RenderTransform = New-Object System.Windows.Media.RotateTransform(27)
  $canvas.Children.Add($ring2) | Out-Null

  $eyeGroup = New-Object System.Windows.Controls.Canvas
  $eyeGroup.Width = 64; $eyeGroup.Height = 64
  foreach ($x in 24, 40) {
    $eye = New-Object System.Windows.Shapes.Ellipse
    $eye.Width = 4.3; $eye.Height = 4.3
    [System.Windows.Controls.Canvas]::SetLeft($eye, $x - 2.15)
    [System.Windows.Controls.Canvas]::SetTop($eye, 30.5 - 2.15)
    $eye.Fill = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(74, 24, 54))
    $eyeGroup.Children.Add($eye) | Out-Null
  }
  foreach ($x in 24.7, 40.7) {
    $hl = New-Object System.Windows.Shapes.Ellipse
    $hl.Width = 1.44; $hl.Height = 1.44
    [System.Windows.Controls.Canvas]::SetLeft($hl, $x - 0.72)
    [System.Windows.Controls.Canvas]::SetTop($hl, 29.8 - 0.72)
    $hl.Fill = [System.Windows.Media.Brushes]::White
    $eyeGroup.Children.Add($hl) | Out-Null
  }
  $canvas.Children.Add($eyeGroup) | Out-Null

  $closed = New-Object System.Windows.Controls.Canvas
  $closed.Width = 64; $closed.Height = 64
  foreach ($cx in 24, 40) {
    $fig = New-Object System.Windows.Media.PathFigure
    $fig.StartPoint = New-Object System.Windows.Point(($cx - 2.5), 30.5)
    $seg = New-Object System.Windows.Media.QuadraticBezierSegment
    $seg.Point1 = New-Object System.Windows.Point($cx, 32.4)
    $seg.Point2 = New-Object System.Windows.Point(($cx + 2.5), 30.5)
    $fig.Segments.Add($seg)
    $geo = New-Object System.Windows.Media.PathGeometry
    $geo.Figures.Add($fig)
    $p = New-Object System.Windows.Shapes.Path
    $p.Data = $geo
    $p.Stroke = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(74, 24, 54))
    $p.StrokeThickness = 1.8
    $p.StrokeStartLineCap = 'Round'; $p.StrokeEndLineCap = 'Round'
    $closed.Children.Add($p) | Out-Null
  }
  $closed.Visibility = 'Collapsed'
  $canvas.Children.Add($closed) | Out-Null

  $mouth = New-Object System.Windows.Shapes.Path
  $mouth.Stroke = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(74, 24, 54))
  $mouth.StrokeThickness = 1.8
  $mouth.StrokeStartLineCap = 'Round'; $mouth.StrokeEndLineCap = 'Round'
  $canvas.Children.Add($mouth) | Out-Null

  $blush = New-Object System.Windows.Controls.Canvas
  $blush.Width = 64; $blush.Height = 64
  foreach ($x in 19.5, 44.5) {
    $b = New-Object System.Windows.Shapes.Ellipse
    $b.Width = 6.2; $b.Height = 6.2
    [System.Windows.Controls.Canvas]::SetLeft($b, $x - 3.1)
    [System.Windows.Controls.Canvas]::SetTop($b, 37.5 - 3.1)
    $b.Fill = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 127, 174))
    $b.Opacity = 0.3
    $blush.Children.Add($b) | Out-Null
  }
  $canvas.Children.Add($blush) | Out-Null

  $sparkle = New-Object System.Windows.Shapes.Ellipse
  $sparkle.Width = 3; $sparkle.Height = 3
  [System.Windows.Controls.Canvas]::SetLeft($sparkle, 21.5); [System.Windows.Controls.Canvas]::SetTop($sparkle, 16.5)
  $sparkle.Fill = [System.Windows.Media.Brushes]::White; $sparkle.Opacity = 0.8
  $canvas.Children.Add($sparkle) | Out-Null

  [pscustomobject]@{
    Canvas = $canvas; Gradient = $grad; Ring1 = $ring1
    Eyes = $eyeGroup; Closed = $closed; Mouth = $mouth; Blush = $blush
  }
}

function Set-MouthShape($mouth, [double]$mood) {
  $ctrl = 35 + ($mood / 100.0) * 9
  $fig = New-Object System.Windows.Media.PathFigure
  $fig.StartPoint = New-Object System.Windows.Point(25, 39)
  $seg = New-Object System.Windows.Media.QuadraticBezierSegment
  $seg.Point1 = New-Object System.Windows.Point(32, $ctrl)
  $seg.Point2 = New-Object System.Windows.Point(39, 39)
  $fig.Segments.Add($seg)
  $geo = New-Object System.Windows.Media.PathGeometry
  $geo.Figures.Add($fig)
  $mouth.Data = $geo
}

function Update-Orb($orb, $state) {
  $mood = 50.0; $energy = 90.0; $status = 'idle'
  if ($state -ne $null -and $state.state -ne $null) {
    if ($null -ne $state.state.moodScore) { $mood = [double]$state.state.moodScore }
    if ($null -ne $state.state.energy) { $energy = [double]$state.state.energy }
    if ($null -ne $state.state.status) { $status = [string]$state.state.status }
  }
  $hue = 205 + $mood * 1.22
  $sat = 52 + $energy * 0.38
  $colA = Convert-HslToRgb $hue $sat 74
  $colB = Convert-HslToRgb ($hue + 22) $sat $(if ($energy -lt 28) { 48 } else { 60 })
  $colSoft = Convert-HslToRgb $hue ([Math]::Max(30, $sat - 30)) 62
  $orb.Gradient.GradientStops[1].Color = $colA
  $orb.Gradient.GradientStops[2].Color = $colB
  $orb.Ring1.Stroke = New-Object System.Windows.Media.SolidColorBrush $colSoft
  Set-MouthShape $orb.Mouth $mood
  $orb.Blush.Visibility = if ($mood -gt 55) { 'Visible' } else { 'Collapsed' }
  $sleeping = ($status -eq 'sleeping') -or ($energy -lt 12)
  $orb.Eyes.Visibility = if ($sleeping) { 'Collapsed' } else { 'Visible' }
  $orb.Closed.Visibility = if ($sleeping) { 'Visible' } else { 'Collapsed' }
  return @{ Sleeping = $sleeping; Mood = $mood; Energy = $energy; Status = $status }
}

if ($Preview) {
  $orb = New-OrbVisual
  Update-Orb $orb (Get-SoulState) | Out-Null
  $root = New-Object System.Windows.Controls.Viewbox
  $root.Child = $orb.Canvas
  $root.Width = 160; $root.Height = 160
  $hostGrid = New-Object System.Windows.Controls.Grid
  $hostGrid.Width = 160; $hostGrid.Height = 160
  $hostGrid.Children.Add($root) | Out-Null
  $hostGrid.Measure((New-Object System.Windows.Size 160, 160))
  $hostGrid.Arrange((New-Object System.Windows.Rect 0, 0, 160, 160))
  $hostGrid.UpdateLayout()
  $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap 160, 160, 96, 96, ([System.Windows.Media.PixelFormats]::Pbgra32)
  $rtb.Render($hostGrid)
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
  $fs = [System.IO.File]::Create($Preview)
  $enc.Save($fs); $fs.Close()
  try { $mutex.ReleaseMutex() } catch { }
  exit 0
}

# ---------------- UI helpers ----------------
function New-Text([string]$text, [double]$size = 12, [string]$color = '#FF1C212B') {
  $tb = New-Object System.Windows.Controls.TextBlock
  $tb.Text = $text
  $tb.FontSize = $size
  $tb.Foreground = Brush $color
  $tb.TextWrapping = 'Wrap'
  return $tb
}

function New-PanelBox([double]$radius = 14, [string]$bg = '#FFFFFFFF') {
  $b = New-Object System.Windows.Controls.Border
  $b.CornerRadius = New-Object System.Windows.CornerRadius $radius
  $b.Background = Brush $bg
  $b.BorderBrush = Brush '#FFE4E7EF'
  $b.BorderThickness = New-Object System.Windows.Thickness 1
  return $b
}

function New-Chip([string]$text, [double]$size = 11.5) {
  $border = New-Object System.Windows.Controls.Border
  $border.CornerRadius = New-Object System.Windows.CornerRadius 10
  $border.Background = Brush '#FFF4F5F8'
  $border.BorderBrush = Brush '#FFE1E4EC'
  $border.BorderThickness = New-Object System.Windows.Thickness 1
  $border.Padding = New-Object System.Windows.Thickness(10, 6, 10, 6)
  $border.Margin = New-Object System.Windows.Thickness(0, 0, 6, 0)
  $border.Cursor = [System.Windows.Input.Cursors]::Hand
  $border.HorizontalAlignment = 'Left'
  $border.Child = New-Text $text $size '#FF3B4250'
  $border.Child.TextAlignment = 'Center'
  $border.Child.VerticalAlignment = 'Center'
  $border.Add_MouseLeftButtonDown({ param($s, $e) $s.Opacity = 0.7 })
  $border.Add_MouseLeftButtonUp({ param($s, $e) $s.Opacity = 1 })
  $border.Add_MouseLeave({ param($s, $e) $s.Opacity = 1 })
  return $border
}

function New-Tag([string]$text) {
  $border = New-Object System.Windows.Controls.Border
  $border.CornerRadius = New-Object System.Windows.CornerRadius 7
  $border.Background = Brush '#FFF2F4F9'
  $border.BorderThickness = New-Object System.Windows.Thickness 0
  $border.Padding = New-Object System.Windows.Thickness(7, 1, 7, 1)
  $border.Margin = New-Object System.Windows.Thickness(0, 0, 5, 4)
  $border.Cursor = [System.Windows.Input.Cursors]::Arrow
  $border.IsHitTestVisible = $false
  $border.HorizontalAlignment = 'Left'
  $border.Child = New-Text $text 9.5 '#FF5A6272'
  $border.Child.TextAlignment = 'Center'
  $border.Child.VerticalAlignment = 'Center'
  return $border
}

function Set-ChipText($chip, [string]$text) { $chip.Child.Text = $text }

function New-BarTrack([string]$color, [double]$maximum = 100) {
  $pb = New-Object System.Windows.Controls.ProgressBar
  $pb.Minimum = 0
  $pb.Maximum = $maximum
  $pb.Value = 0
  $pb.Height = 6
  $pb.MinHeight = 6
  $pb.Foreground = Brush $color
  $pb.Background = Brush '#FFEDEFF4'
  $pb.BorderThickness = New-Object System.Windows.Thickness 0
  return @{ Track = $pb; Fill = $pb }
}

function New-SettingRow([string]$title, [string]$hint, $control) {
  $row = New-Object System.Windows.Controls.Grid
  $row.Margin = New-Object System.Windows.Thickness(16, 10, 16, 10)
  $c0 = New-Object System.Windows.Controls.ColumnDefinition
  $c0.Width = [System.Windows.GridLength]::new(1, [System.Windows.GridUnitType]::Star)
  $row.ColumnDefinitions.Add($c0) | Out-Null
  $c1 = New-Object System.Windows.Controls.ColumnDefinition
  $c1.Width = [System.Windows.GridLength]::Auto
  $row.ColumnDefinitions.Add($c1) | Out-Null
  $left = New-Object System.Windows.Controls.StackPanel
  $left.Children.Add((New-Text $title 12.5 '#FF1C212B')) | Out-Null
  if ($hint) { $left.Children.Add((New-Text $hint 10.5 '#FF6F7788')) | Out-Null }
  [System.Windows.Controls.Grid]::SetColumn($left, 0)
  $row.Children.Add($left) | Out-Null
  [System.Windows.Controls.Grid]::SetColumn($control, 1)
  $row.Children.Add($control) | Out-Null
  return $row
}

# ---------------- ball window ----------------
$orb = New-OrbVisual
$petSize = 124
$ballSize = 96

$window = New-Object System.Windows.Window
$window.WindowStyle = 'None'
$window.AllowsTransparency = $true
$window.Background = [System.Windows.Media.Brushes]::Transparent
$window.Topmost = $true
$window.ShowInTaskbar = $false
$window.ResizeMode = 'NoResize'
$window.Width = $petSize; $window.Height = $petSize
$window.Title = '大肥鱼桌宠'
$window.ShowActivated = $false

$work = [System.Windows.SystemParameters]::WorkArea
$posPath = Join-Path $logDir 'pet-window.json'
$saved = $null
if (Test-Path $posPath) { try { $saved = Get-Content $posPath -Raw | ConvertFrom-Json } catch { } }
if ($saved -ne $null -and $null -ne $saved.left -and $null -ne $saved.top) {
  $window.Left = [Math]::Min([Math]::Max([double]$saved.left, 0), $work.Right - $petSize)
  $window.Top = [Math]::Min([Math]::Max([double]$saved.top, 0), $work.Bottom - $petSize)
} else {
  $window.Left = $work.Right - $petSize - 24
  $window.Top = $work.Bottom - $petSize - 24
}

$orbHost = New-Object System.Windows.Controls.Viewbox
$orbHost.Child = $orb.Canvas
$orbHost.Width = $ballSize; $orbHost.Height = $ballSize
$orbHost.Stretch = 'Uniform'

$petGrid = New-Object System.Windows.Controls.Grid
$petGrid.Background = [System.Windows.Media.Brushes]::Transparent
$petGrid.Children.Add($orbHost) | Out-Null

$zzz = New-Text 'z z Z' 12 '#EEFFFFFF'
$zzz.FontWeight = 'Bold'
$zzz.HorizontalAlignment = 'Right'; $zzz.VerticalAlignment = 'Top'
$zzz.Margin = New-Object System.Windows.Thickness(0, 8, 6, 0)
$zzz.Visibility = 'Collapsed'
$petGrid.Children.Add($zzz) | Out-Null

$window.Content = $petGrid

$float = New-Object System.Windows.Media.TranslateTransform
$orbHost.RenderTransform = $float
$anim = New-Object System.Windows.Media.Animation.DoubleAnimation
$anim.From = 0; $anim.To = -7
$anim.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(2.75))
$anim.AutoReverse = $true
$anim.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$anim.EasingFunction = New-Object System.Windows.Media.Animation.SineEase
$anim.EasingFunction.EasingMode = 'EaseInOut'
$float.BeginAnimation([System.Windows.Media.TranslateTransform]::YProperty, $anim)

function Save-PetPosition {
  try { @{ left = [double]$window.Left; top = [double]$window.Top } | ConvertTo-Json | Set-Content -Path $posPath -Encoding UTF8 } catch { }
}

function Focus-Dsh {
  $procs = Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }
  $p = $procs | Select-Object -First 1
  if ($p -ne $null) {
    [Win32Pet]::ShowWindow($p.MainWindowHandle, 9) | Out-Null
    [Win32Pet]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  }
}

function Format-When($at) {
  if ($null -eq $at -or [double]$at -le 0) { return '' }
  try { return [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$at).ToLocalTime().ToString('MM-dd HH:mm') } catch { return '' }
}

function Format-Ago($at) {
  if ($null -eq $at -or [double]$at -le 0) { return '' }
  $minutes = [Math]::Max(0, [int](([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - [double]$at) / 60000))
  if ($minutes -lt 1) { return '刚刚' }
  if ($minutes -lt 60) { return "$minutes 分钟前" }
  return ("{0} 小时前" -f [Math]::Floor($minutes / 60))
}

$script:stateCache = $null
$script:lastError = ''
$script:renderedHobbies = ''
$script:stateDirty = $false
$panel = $null
$views = @{}
$tab = 'chat'
$renderedMessages = ''
$renderedDiary = ''
$lastPersonaKey = ''

function Build-Panel {
  $script:panel = New-Object System.Windows.Window
  $script:panel.WindowStyle = 'None'
  $script:panel.AllowsTransparency = $true
  $script:panel.Background = [System.Windows.Media.Brushes]::Transparent
  $script:panel.Topmost = $true
  $script:panel.ShowInTaskbar = $false
  $script:panel.ResizeMode = 'NoResize'
  $script:panel.Width = 420
  $script:panel.Height = 640
  $script:panel.Title = '大肥鱼'

  $shell = New-PanelBox 18 '#FFFFFFFF'
  $shell.Effect = New-Object System.Windows.Media.Effects.DropShadowEffect
  $shell.Effect.BlurRadius = 28
  $shell.Effect.ShadowDepth = 6
  $shell.Effect.Opacity = 0.18
  $rootGrid = New-Object System.Windows.Controls.Grid
  $rd0 = New-Object System.Windows.Controls.RowDefinition
  $rd0.Height = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
  $rootGrid.RowDefinitions.Add($rd0) | Out-Null
  $rdNotice = New-Object System.Windows.Controls.RowDefinition
  $rdNotice.Height = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
  $rootGrid.RowDefinitions.Add($rdNotice) | Out-Null
  $rd1 = New-Object System.Windows.Controls.RowDefinition
  $rd1.Height = [System.Windows.GridLength]::new(1, [System.Windows.GridUnitType]::Star)
  $rootGrid.RowDefinitions.Add($rd1) | Out-Null

  $header = New-Object System.Windows.Controls.Grid
  $header.Margin = New-Object System.Windows.Thickness(18, 14, 14, 10)
  $hc0 = New-Object System.Windows.Controls.ColumnDefinition
  $hc0.Width = [System.Windows.GridLength]::Auto
  $header.ColumnDefinitions.Add($hc0) | Out-Null
  $hc1 = New-Object System.Windows.Controls.ColumnDefinition
  $hc1.Width = [System.Windows.GridLength]::new(1, [System.Windows.GridUnitType]::Star)
  $header.ColumnDefinitions.Add($hc1) | Out-Null
  $hc2 = New-Object System.Windows.Controls.ColumnDefinition
  $hc2.Width = [System.Windows.GridLength]::Auto
  $header.ColumnDefinitions.Add($hc2) | Out-Null

  $miniOrb = New-OrbVisual
  $miniView = New-Object System.Windows.Controls.Viewbox
  $miniView.Child = $miniOrb.Canvas
  $miniView.Width = 34; $miniView.Height = 34
  $miniView.Stretch = 'Uniform'
  [System.Windows.Controls.Grid]::SetColumn($miniView, 0)
  $header.Children.Add($miniView) | Out-Null

  $headText = New-Object System.Windows.Controls.StackPanel
  $headText.Margin = New-Object System.Windows.Thickness(8, 0, 0, 0)
  $nameText = New-Text '大肥鱼' 14.5 '#FF141922'
  $nameText.FontWeight = 'SemiBold'
  $statusText = New-Text '…' 10.5 '#FF6F7788'
  $headText.Children.Add($nameText) | Out-Null
  $headText.Children.Add($statusText) | Out-Null
  [System.Windows.Controls.Grid]::SetColumn($headText, 1)
  $header.Children.Add($headText) | Out-Null

  $actions = New-Object System.Windows.Controls.StackPanel
  $actions.Orientation = 'Horizontal'
  $retryBtn = New-Chip '重试' 11
  $retryBtn.Margin = New-Object System.Windows.Thickness(0, 0, 6, 0)
  $retryBtn.Visibility = 'Collapsed'
  $settingsBtn = New-Chip '设置' 11
  $settingsBtn.Width = 58
  $settingsBtn.Padding = New-Object System.Windows.Thickness(0, 6, 0, 6)
  $settingsBtn.Margin = New-Object System.Windows.Thickness(0, 0, 6, 0)
  $closeBtn = New-Chip '×' 13
  $closeBtn.Width = 34
  $closeBtn.Padding = New-Object System.Windows.Thickness(0, 6, 0, 6)
  $actions.Children.Add($retryBtn) | Out-Null
  $actions.Children.Add($settingsBtn) | Out-Null
  $actions.Children.Add($closeBtn) | Out-Null
  [System.Windows.Controls.Grid]::SetColumn($actions, 2)
  $header.Children.Add($actions) | Out-Null

  [System.Windows.Controls.Grid]::SetRow($header, 0)
  $rootGrid.Children.Add($header) | Out-Null

  $notice = New-Text '' 10.5 '#FFB45309'
  $notice.Margin = New-Object System.Windows.Thickness(16, 0, 16, 6)
  $notice.Visibility = 'Collapsed'
  [System.Windows.Controls.Grid]::SetRow($notice, 1)
  $rootGrid.Children.Add($notice) | Out-Null

  $body = New-Object System.Windows.Controls.Grid
  [System.Windows.Controls.Grid]::SetRow($body, 2)
  $rootGrid.Children.Add($body) | Out-Null
  $shell.Child = $rootGrid
  $script:panel.Content = $shell

  # home view: vitals + tabs + content + input
  $homeView = New-Object System.Windows.Controls.Grid
  $c0 = New-Object System.Windows.Controls.RowDefinition
  $c0.Height = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
  $homeView.RowDefinitions.Add($c0) | Out-Null
  $c1 = New-Object System.Windows.Controls.RowDefinition
  $c1.Height = [System.Windows.GridLength]::new(1, [System.Windows.GridUnitType]::Star)
  $homeView.RowDefinitions.Add($c1) | Out-Null
  $c2 = New-Object System.Windows.Controls.RowDefinition
  $c2.Height = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
  $homeView.RowDefinitions.Add($c2) | Out-Null

  $vitals = New-Object System.Windows.Controls.StackPanel
  $vitals.Margin = New-Object System.Windows.Thickness(0)
  $moodBar = New-BarTrack '#FFB06AE0' 100
  $energyBar = New-BarTrack '#FF4FBF8B' 90
  $affBar = New-BarTrack '#FFFF4D78' 100
  $valueLabels = @{}
  $statusLabels = @{}
  foreach ($spec in @(
    @{ label = '心情'; bar = $moodBar; key = 'mood' },
    @{ label = '精力'; bar = $energyBar; key = 'energy' },
    @{ label = '好感'; bar = $affBar; key = 'aff' }
  )) {
    $row = New-Object System.Windows.Controls.Grid
    $row.Margin = New-Object System.Windows.Thickness(0, 3, 0, 3)
    $rc0 = New-Object System.Windows.Controls.ColumnDefinition
    $rc0.Width = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
    $row.ColumnDefinitions.Add($rc0) | Out-Null
    $rc1 = New-Object System.Windows.Controls.ColumnDefinition
    $rc1.Width = [System.Windows.GridLength]::new(72, [System.Windows.GridUnitType]::Pixel)
    $row.ColumnDefinitions.Add($rc1) | Out-Null
    $rc2 = New-Object System.Windows.Controls.ColumnDefinition
    $rc2.Width = [System.Windows.GridLength]::new(1, [System.Windows.GridUnitType]::Star)
    $row.ColumnDefinitions.Add($rc2) | Out-Null
    $rc3 = New-Object System.Windows.Controls.ColumnDefinition
    $rc3.Width = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
    $row.ColumnDefinitions.Add($rc3) | Out-Null
    $lbl = New-Text $spec.label 10.5 '#FF6F7788'
    $lbl.Width = 34
    [System.Windows.Controls.Grid]::SetColumn($lbl, 0)
    $row.Children.Add($lbl) | Out-Null
    $status = New-Text '' 10 '#FF6F7788'
    $status.Width = 72
    $status.TextTrimming = 'CharacterEllipsis'
    $status.Margin = New-Object System.Windows.Thickness(0, 0, 6, 0)
    [System.Windows.Controls.Grid]::SetColumn($status, 1)
    $row.Children.Add($status) | Out-Null
    [System.Windows.Controls.Grid]::SetColumn($spec.bar.Track, 2)
    $row.Children.Add($spec.bar.Track) | Out-Null
    $val = New-Text '0.0' 10 '#FF4A5164'
    $val.MinWidth = 58
    $val.TextAlignment = 'Right'
    $val.TextWrapping = 'NoWrap'
    $val.HorizontalAlignment = 'Right'
    $val.Margin = New-Object System.Windows.Thickness(6, 0, 0, 0)
    [System.Windows.Controls.Grid]::SetColumn($val, 3)
    $row.Children.Add($val) | Out-Null
    $statusLabels[$spec.key] = $status
    $valueLabels[$spec.key] = $val
    $vitals.Children.Add($row) | Out-Null
  }
  $thoughtText = New-Text '' 11.5 '#FF3A4150'
  $thoughtText.Margin = New-Object System.Windows.Thickness(0, 6, 0, 0)
  $activityText = New-Text '' 10.5 '#FF6F7788'
  $activityText.Margin = New-Object System.Windows.Thickness(0, 3, 0, 0)
  $vitals.Children.Add($thoughtText) | Out-Null
  $vitals.Children.Add($activityText) | Out-Null
  $hobbyPanel = New-Object System.Windows.Controls.WrapPanel
  $hobbyPanel.Margin = New-Object System.Windows.Thickness(0, 5, 0, 0)
  $vitals.Children.Add($hobbyPanel) | Out-Null

  $tabsPanel = New-Object System.Windows.Controls.StackPanel
  $tabsPanel.Orientation = 'Horizontal'
  $tabsPanel.Margin = New-Object System.Windows.Thickness(16, 10, 16, 8)
  $tabChat = New-Chip '聊天' 11.5
  $tabDiary = New-Chip '日记' 11.5
  $tabNew = New-Chip '新对话' 11.5
  $tabsPanel.Children.Add($tabChat) | Out-Null
  $tabsPanel.Children.Add($tabDiary) | Out-Null
  $tabsPanel.Children.Add($tabNew) | Out-Null

  $headStack = New-Object System.Windows.Controls.StackPanel
  $vitalsCard = New-Object System.Windows.Controls.Border
  $vitalsCard.CornerRadius = New-Object System.Windows.CornerRadius 14
  $vitalsCard.Background = Brush '#FFF8F9FC'
  $vitalsCard.BorderBrush = Brush '#FFF0F2F7'
  $vitalsCard.BorderThickness = New-Object System.Windows.Thickness 1
  $vitalsCard.Padding = New-Object System.Windows.Thickness(12, 10, 12, 10)
  $vitalsCard.Margin = New-Object System.Windows.Thickness(16, 2, 16, 4)
  $vitalsCard.Child = $vitals
  $headStack.Children.Add($vitalsCard) | Out-Null
  $headStack.Children.Add($tabsPanel) | Out-Null
  [System.Windows.Controls.Grid]::SetRow($headStack, 0)
  $homeView.Children.Add($headStack) | Out-Null

  $contentHost = New-Object System.Windows.Controls.Grid
  $scroll = New-Object System.Windows.Controls.ScrollViewer
  $scroll.VerticalScrollBarVisibility = 'Auto'
  $scroll.HorizontalScrollBarVisibility = 'Disabled'
  $scroll.Margin = New-Object System.Windows.Thickness(14, 0, 14, 8)
  $chatStack = New-Object System.Windows.Controls.StackPanel
  $scroll.Content = $chatStack
  $contentHost.Children.Add($scroll) | Out-Null

  $diaryScroll = New-Object System.Windows.Controls.ScrollViewer
  $diaryScroll.VerticalScrollBarVisibility = 'Auto'
  $diaryScroll.Margin = New-Object System.Windows.Thickness(12, 0, 12, 8)
  $diaryStack = New-Object System.Windows.Controls.StackPanel
  $diaryScroll.Content = $diaryStack
  $diaryScroll.Visibility = 'Collapsed'
  $contentHost.Children.Add($diaryScroll) | Out-Null

  [System.Windows.Controls.Grid]::SetRow($contentHost, 1)
  $homeView.Children.Add($contentHost) | Out-Null

  $inputRow = New-Object System.Windows.Controls.Grid
  $inputRow.Margin = New-Object System.Windows.Thickness(14, 0, 14, 14)
  $ic0 = New-Object System.Windows.Controls.ColumnDefinition
  $ic0.Width = [System.Windows.GridLength]::new(1, [System.Windows.GridUnitType]::Star)
  $inputRow.ColumnDefinitions.Add($ic0) | Out-Null
  $ic1 = New-Object System.Windows.Controls.ColumnDefinition
  $ic1.Width = [System.Windows.GridLength]::new(0, [System.Windows.GridUnitType]::Auto)
  $inputRow.ColumnDefinitions.Add($ic1) | Out-Null
  $input = New-Object System.Windows.Controls.TextBox
  $input.FontSize = 12.5
  $input.Padding = New-Object System.Windows.Thickness(10, 8, 10, 8)
  $input.Background = Brush '#FFFFFFFF'
  $input.Foreground = Brush '#FF1C212B'
  $input.BorderBrush = Brush '#FFE1E4EC'
  $input.CaretBrush = Brush '#FF1C212B'
  $input.ToolTip = '回车发送，Shift+回车换行'
  $input.TextWrapping = 'Wrap'
  $input.AcceptsReturn = $true
  $input.MinHeight = 62
  $input.MaxHeight = 62
  $input.VerticalContentAlignment = 'Top'
  $input.VerticalScrollBarVisibility = 'Auto'
  [System.Windows.Controls.Grid]::SetColumn($input, 0)
  $inputRow.Children.Add($input) | Out-Null
  $send = New-Chip '发送' 11.5
  $send.Margin = New-Object System.Windows.Thickness(8, 0, 0, 2)
  $send.VerticalAlignment = 'Bottom'
  $send.Background = Brush '#FF6C5CE7'
  $send.Child.Foreground = Brush '#FFFFFFFF'
  [System.Windows.Controls.Grid]::SetColumn($send, 1)
  $inputRow.Children.Add($send) | Out-Null
  [System.Windows.Controls.Grid]::SetRow($inputRow, 2)
  $homeView.Children.Add($inputRow) | Out-Null

  # settings view
  $settingsView = New-Object System.Windows.Controls.Grid
  $settingsScroll = New-Object System.Windows.Controls.ScrollViewer
  $settingsScroll.VerticalScrollBarVisibility = 'Auto'
  $settingsScroll.Margin = New-Object System.Windows.Thickness(0, 0, 0, 8)
  $settingsStack = New-Object System.Windows.Controls.StackPanel
  $settingsScroll.Content = $settingsStack
  $settingsView.Children.Add($settingsScroll) | Out-Null

  $body.Children.Add($homeView) | Out-Null
  $body.Children.Add($settingsView) | Out-Null
  $settingsView.Visibility = 'Collapsed'

  $script:views = @{
    home = $homeView; settings = $settingsView
    name = $nameText; status = $statusText; mini = $miniOrb
    chatStack = $chatStack; scroll = $scroll; input = $input; send = $send; inputRow = $inputRow
    chatScroll = $scroll; diaryScroll = $diaryScroll
    diaryStack = $diaryStack; settingsStack = $settingsStack
    mood = $moodBar; energy = $energyBar; affection = $affBar
    moodValue = $valueLabels['mood']; energyValue = $valueLabels['energy']; affValue = $valueLabels['aff']
    moodStatus = $statusLabels['mood']; energyStatus = $statusLabels['energy']; affStatus = $statusLabels['aff']
    thought = $thoughtText; activity = $activityText; hobbies = $hobbyPanel
    tabChat = $tabChat; tabDiary = $tabDiary; tabNew = $tabNew
    settingsBtn = $settingsBtn; closeBtn = $closeBtn; retryBtn = $retryBtn
    notice = $notice
    extras = @{}
  }

  # ---- settings content (built once) ----
  $personaTitle = New-Text '人格' 11 '#FF6F7788'
  $personaTitle.Margin = New-Object System.Windows.Thickness(16, 14, 16, 6)
  $settingsStack.Children.Add($personaTitle) | Out-Null
  $personaRow = New-Object System.Windows.Controls.StackPanel
  $personaRow.Orientation = 'Horizontal'
  $personaRow.Margin = New-Object System.Windows.Thickness(16, 3, 16, 6)
  $settingsStack.Children.Add($personaRow) | Out-Null
  $customChip = New-Chip '自定义人格' 11
  $personaRow.Children.Add($customChip) | Out-Null

  $customPanel = New-Object System.Windows.Controls.StackPanel
  $customPanel.Visibility = 'Collapsed'
  $customPanel.Margin = New-Object System.Windows.Thickness(16, 2, 16, 6)
  $customPanel.Children.Add((New-Text '名字' 10 '#FF6F7788')) | Out-Null
  $customName = New-Object System.Windows.Controls.TextBox
  $customName.Width = 160
  $customName.Margin = New-Object System.Windows.Thickness(0, 2, 0, 4)
  $customName.Background = Brush '#FFF7F8FB'
  $customName.Foreground = Brush '#FF1C212B'
  $customName.BorderBrush = Brush '#FFCBD1DD'
  $customName.BorderThickness = New-Object System.Windows.Thickness 1
  $customName.Padding = New-Object System.Windows.Thickness(5, 3, 5, 3)
  $customName.ToolTip = '自定义人格名字'
  $customPanel.Children.Add($customName) | Out-Null
  $personaLabel = New-Text '人设' 10 '#FF6F7788'
  $personaLabel.Margin = New-Object System.Windows.Thickness(0, 4, 0, 0)
  $customPanel.Children.Add($personaLabel) | Out-Null
  $customText = New-Object System.Windows.Controls.TextBox
  $customText.Height = 76
  $customText.AcceptsReturn = $true
  $customText.TextWrapping = 'Wrap'
  $customText.Background = Brush '#FFF7F8FB'
  $customText.Foreground = Brush '#FF1C212B'
  $customText.BorderBrush = Brush '#FFCBD1DD'
  $customText.BorderThickness = New-Object System.Windows.Thickness 1
  $customText.Padding = New-Object System.Windows.Thickness(5, 3, 5, 3)
  $customText.Margin = New-Object System.Windows.Thickness(0, 2, 0, 6)
  $customText.ToolTip = '自定义人格设定'
  $customPanel.Children.Add($customText) | Out-Null
  $customApply = New-Chip '应用自定义人格' 11
  $customApply.Margin = New-Object System.Windows.Thickness(0, 0, 0, 4)
  $customPanel.Children.Add($customApply) | Out-Null
  $settingsStack.Children.Add($customPanel) | Out-Null

  $openDiaries = New-Chip '打开' 11
  $settingsStack.Children.Add((New-SettingRow '打开日记文件夹' '每个人格一个 .md' $openDiaries)) | Out-Null
  $autonomyChip = New-Chip '开' 11
  $settingsStack.Children.Add((New-SettingRow '自主活动' '让 TA 有自己的生活' $autonomyChip)) | Out-Null
  $intervalChip = New-Chip '30 分钟' 11
  $settingsStack.Children.Add((New-SettingRow '独处间隔' '多久自己待一会儿' $intervalChip)) | Out-Null
  $nightChip = New-Chip '开' 11
  $settingsStack.Children.Add((New-SettingRow '夜里休息' '23:00–08:00 不打扰' $nightChip)) | Out-Null
  $approvalChip = New-Chip '询问' 11
  $settingsStack.Children.Add((New-SettingRow '工具审批' '动手前先问 / 直接动手' $approvalChip)) | Out-Null
  $petChip = New-Chip '开' 11
  $settingsStack.Children.Add((New-SettingRow '桌宠窗口' '就是现在这个' $petChip)) | Out-Null

  $impulse = New-Chip '戳一下 TA' 11.5
  $impulse.Margin = New-Object System.Windows.Thickness(16, 10, 16, 6)
  $settingsStack.Children.Add($impulse) | Out-Null
  $info = New-Text '' 10 '#FF9AA1B0'
  $info.Margin = New-Object System.Windows.Thickness(16, 6, 16, 14)
  $settingsStack.Children.Add($info) | Out-Null

  $script:views.extras = @{
    personaRow = $personaRow; customName = $customName; customText = $customText; customApply = $customApply
    customPanel = $customPanel; customChip = $customChip
    openDiaries = $openDiaries; autonomy = $autonomyChip; interval = $intervalChip
    night = $nightChip; approval = $approvalChip; pet = $petChip; impulse = $impulse; info = $info
    personasBuilt = $false; personaChips = @{}
  }

  # ---- wire ----
  $settingsBtn.Add_MouseLeftButtonUp({
    if ($script:tab -eq 'settings') { Show-View 'chat' } else { Show-View 'settings' }
  })
  $retryBtn.Add_MouseLeftButtonUp({
    Post-Soul 'retry' @{} | Out-Null
    Sync-PanelNow
  })
  $closeBtn.Add_MouseLeftButtonUp({ $script:panel.Hide() })
  $tabChat.Add_MouseLeftButtonUp({ Show-View 'chat' })
  $tabDiary.Add_MouseLeftButtonUp({ Show-View 'diary' })
  $tabNew.Add_MouseLeftButtonUp({
    $answer = [System.Windows.MessageBox]::Show('清空聊天记录，开始新对话？日记和状态会保留。', '大肥鱼', 'YesNo', 'Question')
    if ($answer -eq 'Yes') {
      Post-Soul 'new-chat' @{} | Out-Null
      $script:renderedMessages = ''
      Sync-PanelNow
    }
  })

  $script:sendAction = {
    $text = $script:views.input.Text.Trim()
    if ($text.Length -eq 0) { return }
    $script:views.input.Text = ''
    Post-Soul 'chat' @{ text = $text } | Out-Null
    Sync-PanelNow
  }
  $send.Add_MouseLeftButtonUp($script:sendAction)
  $input.Add_KeyDown({ param($s, $e) if ($e.Key -eq 'Enter' -and -not ($e.KeyboardDevice.Modifiers -band [System.Windows.Input.ModifierKeys]::Shift)) { $e.Handled = $true; & $script:sendAction } })

  $openDiaries.Add_MouseLeftButtonUp({ Post-Soul 'open-diaries' @{} | Out-Null })
  $autonomyChip.Add_MouseLeftButtonUp({
    $on = -not ($script:stateCache.state.config.autonomy -ne $false)
    Set-ChipText $script:views.extras.autonomy $(if ($on) { '开' } else { '关' })
    Post-Soul 'config' @{ autonomy = $on } | Out-Null
    Sync-PanelNow
  })
  $intervalChip.Add_MouseLeftButtonUp({
    $values = @(10, 20, 30, 60, 120)
    $cur = [int]$script:stateCache.state.config.heartbeatMinutes
    $idx = [Array]::IndexOf($values, $cur)
    $next = $values[($idx + 1) % $values.Count]
    Set-ChipText $script:views.extras.interval ("{0} 分钟" -f $next)
    Post-Soul 'config' @{ heartbeatMinutes = $next } | Out-Null
    Sync-PanelNow
  })
  $nightChip.Add_MouseLeftButtonUp({
    $on = -not ($script:stateCache.state.config.nightRest -ne $false)
    Set-ChipText $script:views.extras.night $(if ($on) { '开' } else { '关' })
    Post-Soul 'config' @{ nightRest = $on } | Out-Null
    Sync-PanelNow
  })
  $approvalChip.Add_MouseLeftButtonUp({
    $next = if ($script:stateCache.state.config.approval -eq 'never') { 'ask' } else { 'never' }
    Set-ChipText $script:views.extras.approval $(if ($next -eq 'never') { '不问' } else { '询问' })
    Post-Soul 'config' @{ approval = $next } | Out-Null
    Sync-PanelNow
  })
  $petChip.Add_MouseLeftButtonUp({
    $on = -not ($script:stateCache.state.config.petWindow -ne $false)
    Set-ChipText $script:views.extras.pet $(if ($on) { '开' } else { '关' })
    Post-Soul 'config' @{ petWindow = $on } | Out-Null
    Sync-PanelNow
  })
  $impulse.Add_MouseLeftButtonUp({ Post-Soul 'impulse' @{} | Out-Null })
  $customChip.Add_MouseLeftButtonUp({
    $x = $script:views.extras
    if ($x.customPanel.Visibility -eq 'Visible') { $x.customPanel.Visibility = 'Collapsed' }
    else { $x.customPanel.Visibility = 'Visible'; $x.customName.Focus() | Out-Null }
  })

  $customApply.Add_MouseLeftButtonUp({
    $n = $script:views.extras.customName.Text.Trim()
    $p = $script:views.extras.customText.Text.Trim()

    if ($n -and $p) {
      Post-Soul 'persona' @{ name = $n; persona = $p } | Out-Null
      $script:views.extras.customPanel.Visibility = 'Collapsed'
      $script:stateDirty = $true
    }
  })

  Show-View 'chat'
}

function Show-View([string]$name) {
  $v = $script:views
  if ($v.Count -eq 0) { return }
  $script:tab = $name
  $settingsMode = ($name -eq 'settings')
  $v.home.Visibility = if ($settingsMode) { 'Collapsed' } else { 'Visible' }
  $v.settings.Visibility = if ($settingsMode) { 'Visible' } else { 'Collapsed' }
  if (-not $settingsMode) {
    $chatMode = ($name -eq 'chat')
    $v.chatScroll.Visibility = if ($chatMode) { 'Visible' } else { 'Collapsed' }
    $v.diaryScroll.Visibility = if ($chatMode) { 'Collapsed' } else { 'Visible' }
    $v.inputRow.Visibility = if ($chatMode) { 'Visible' } else { 'Collapsed' }
  }
  $active = ($name -eq 'chat')
  $v.tabChat.Background = if ($active) { Brush '#FFEDE9FF' } else { Brush '#FFF4F5F8' }
  $v.tabChat.Child.Foreground = if ($active) { Brush '#FF5B4BD6' } else { Brush '#FF6F7788' }
  $active = ($name -eq 'diary')
  $v.tabDiary.Background = if ($active) { Brush '#FFEDE9FF' } else { Brush '#FFF4F5F8' }
  $v.tabDiary.Child.Foreground = if ($active) { Brush '#FF5B4BD6' } else { Brush '#FF6F7788' }
  $v.settingsBtn.Background = if ($settingsMode) { Brush '#FFEDE9FF' } else { Brush '#FFF4F5F8' }
  if ($settingsMode) { Set-ChipText $v.settingsBtn '返回' } else { Set-ChipText $v.settingsBtn '设置' }
  if ($script:stateCache -ne $null) {
    if ($settingsMode) { Refresh-Panel $script:stateCache }
    elseif ($name -eq 'diary') { Render-Diary $script:stateCache }
    elseif ($name -eq 'chat') { Render-Chat $script:stateCache }
  }
}

function Render-Chat($state) {
  $v = $script:views
  if ($state -eq $null -or $null -eq $state.messages) { return }
  $messages = @($state.messages)
  $key = if ($messages.Count -gt 0) { "{0}:{1}" -f $messages.Count, $messages[$messages.Count - 1].seq } else { '0' }
  if ($key -eq $script:renderedMessages) { return }
  $script:renderedMessages = $key
  $v.chatStack.Children.Clear()
  if ($messages.Count -eq 0) {
    $empty = New-Text 'TA 还没开口。说句话，或者等 TA 一会儿。' 11 '#FF9AA1B0'
    $empty.Margin = New-Object System.Windows.Thickness(6, 24, 6, 0)
    $empty.TextAlignment = 'Center'
    $v.chatStack.Children.Add($empty) | Out-Null
    $v.scroll.ScrollToEnd()
    return
  }
  $tail = $messages
  if ($tail.Count -gt 60) { $tail = $tail[($tail.Count - 60)..($tail.Count - 1)] }
  foreach ($m in $tail) {
    $isUser = ($m.role -eq 'user')
    $bubble = New-Object System.Windows.Controls.Border
    $bubble.CornerRadius = New-Object System.Windows.CornerRadius 12
    $bubble.Padding = New-Object System.Windows.Thickness(12, 9, 12, 9)
    $bubble.Margin = New-Object System.Windows.Thickness(0, 3, 0, 3)
    $bubble.MaxWidth = 292
    $bubble.HorizontalAlignment = if ($isUser) { 'Right' } else { 'Left' }
    $bubble.Background = if ($isUser) { Brush '#FFE9ECFF' } else { Brush '#FFF3F4F7' }
    $wrap = New-Object System.Windows.Controls.StackPanel
    if ($m.proactive) {
      $badge = New-Text '主动' 8.5 '#FFB45309'
      $badge.HorizontalAlignment = 'Left'
      $wrap.Children.Add($badge) | Out-Null
    }
    $wrap.Children.Add((New-Text ([string]$m.text) 12 '#FF1C212B')) | Out-Null
    $when = Format-When $m.at
    if ($when) {
      $meta = New-Text $when 9 '#FF9AA1B0'
      $meta.HorizontalAlignment = if ($isUser) { 'Right' } else { 'Left' }
      $wrap.Children.Add($meta) | Out-Null
    }
    $bubble.Child = $wrap
    $v.chatStack.Children.Add($bubble) | Out-Null
  }
  $v.scroll.ScrollToEnd()
}

function Render-Diary($state) {
  $v = $script:views
  if ($state -eq $null -or $null -eq $state.state) { return }
  $entries = @($state.state.diary)
  $memory = [string]$state.state.memory
  $hobbies = (@($state.state.hobbies) -join ' · ')
  $key = "$($entries.Count):$(if ($entries.Count -gt 0) { $entries[0].at } else { 0 }):${memory}:${hobbies}"
  if ($key -eq $script:renderedDiary) { return }
  $script:renderedDiary = $key
  $v.diaryStack.Children.Clear()

  $memoryCard = New-PanelBox 12 '#FFF8F9FC'
  $memoryCard.Margin = New-Object System.Windows.Thickness(4, 3, 4, 3)
  $memoryCard.Padding = New-Object System.Windows.Thickness(12, 9, 12, 9)
  $memoryStack = New-Object System.Windows.Controls.StackPanel
  $memoryLabel = New-Text 'TA记得' 9.5 '#FF6F7788'
  $memoryLabel.FontWeight = 'SemiBold'
  $memoryStack.Children.Add($memoryLabel) | Out-Null
  $memoryStack.Children.Add((New-Text $(if ($memory) { $memory } else { 'TA还没有写下长期记忆。' }) 11.5 '#FF2A3040')) | Out-Null
  $memoryCard.Child = $memoryStack
  $v.diaryStack.Children.Add($memoryCard) | Out-Null

  $hobbyCard = New-PanelBox 12 '#FFF8F9FC'
  $hobbyCard.Margin = New-Object System.Windows.Thickness(4, 3, 4, 3)
  $hobbyCard.Padding = New-Object System.Windows.Thickness(12, 9, 12, 9)
  $hobbyStack = New-Object System.Windows.Controls.StackPanel
  $hobbyLabel = New-Text '喜欢' 9.5 '#FF6F7788'
  $hobbyLabel.FontWeight = 'SemiBold'
  $hobbyStack.Children.Add($hobbyLabel) | Out-Null
  $hobbyStack.Children.Add((New-Text $(if ($hobbies) { $hobbies } else { '—' }) 11.5 '#FF2A3040')) | Out-Null
  $hobbyCard.Child = $hobbyStack
  $v.diaryStack.Children.Add($hobbyCard) | Out-Null

  if ($entries.Count -eq 0) {
    $v.diaryStack.Children.Add((New-Text '还没有日记。' 11.5 '#FF9AA1B0')) | Out-Null
    return
  }
  foreach ($entry in ($entries | Sort-Object { $_.at } -Descending)) {
    $card = New-PanelBox 12 '#FFFFFFFF'
    $card.Margin = New-Object System.Windows.Thickness(4, 3, 4, 3)
    $card.Padding = New-Object System.Windows.Thickness(12, 9, 12, 9)
    $stack = New-Object System.Windows.Controls.StackPanel
    $stack.Children.Add((New-Text (Format-When $entry.at) 9.5 '#FF6F7788')) | Out-Null
    $stack.Children.Add((New-Text ([string]$entry.text) 12 '#FF2A3040')) | Out-Null
    $card.Child = $stack
    $v.diaryStack.Children.Add($card) | Out-Null
  }
}

function Refresh-Panel($state) {
  $v = $script:views
  if ($v.Count -eq 0 -or $state -eq $null -or $state.state -eq $null) { return }
  $s = $state.state
  $v.name.Text = [string]$s.name
  $statusValue = switch ([string]$state.status) {
    'sleeping' { '睡着了' }
    'thinking' { '在想事情' }
    'working' { '在忙' }
    default { '在发呆' }
  }
  if ($state.starting) { $statusValue = '正在醒…' }
  if (-not $state.ready) { $statusValue = '还没醒' }
  if ($s.personaTagline) { $statusValue = "$statusValue · $($s.personaTagline)" }
  $v.status.Text = $statusValue

  $v.mood.Fill.Value = [Math]::Max(0, [Math]::Min(100, [double]$s.moodScore))
  $v.energy.Fill.Value = [Math]::Max(0, [Math]::Min(90, [double]$s.energy))
  $v.affection.Fill.Value = [Math]::Max(0, [Math]::Min(100, [double]$s.affection))
  $v.moodStatus.Text = if ($s.mood) { [string]$s.mood } else { '—' }
  $v.moodValue.Text = ([double]$s.moodScore).ToString('0.0')
  $energy = [double]$s.energy
  $energyLabel = if (($s.status -eq 'sleeping') -or ($energy -lt 12)) { '睡觉中' } elseif ($energy -lt 25) { '很困' } elseif ($energy -lt 50) { '有点累' } elseif ($energy -lt 75) { '还行' } else { '精神' }
  $v.energyStatus.Text = $energyLabel
  $v.energyValue.Text = $energy.ToString('0.0')
  $affection = [double]$s.affection
  $affLabel = if ($affection -ge 80) { '很黏你' } elseif ($affection -ge 60) { '亲近' } elseif ($affection -ge 40) { '有点熟了' } elseif ($affection -ge 20) { '还在观察' } else { '有点疏远' }
  $v.affStatus.Text = $affLabel
  $v.affValue.Text = $affection.ToString('0.0')
  $v.thought.Text = if ($s.thought) { '"' + $s.thought + '"' } else { '' }
  $ago = Format-Ago $s.lastChatAt
  $v.activity.Text = if ($s.activity) { "$($s.activity)" + $(if ($ago) { " · 上次说话 $ago" } else { '' }) } else { '' }

  $hobbyKey = (@($s.hobbies) -join ',')
  if ($hobbyKey -ne $script:renderedHobbies) {
    $script:renderedHobbies = $hobbyKey
    $v.hobbies.Children.Clear()
    foreach ($h in @($s.hobbies)) {
      if (-not $h) { continue }
      $chip = New-Tag ([string]$h)
      $chip.Margin = New-Object System.Windows.Thickness(0, 0, 5, 4)
      $chip.Padding = New-Object System.Windows.Thickness(7, 2, 7, 2)
      $v.hobbies.Children.Add($chip) | Out-Null
    }
  }

  Update-Orb $v.mini $state | Out-Null

  $x = $v.extras
  if (-not $x.personasBuilt -and $state.personas) {
    foreach ($p in $state.personas) {
      $chip = New-Chip $p.name 11
      $chip.ToolTip = if ($p.description) { [string]$p.description } else { [string]$p.tagline }
      $id = $p.id
      $chip.Add_MouseLeftButtonUp({
        Post-Soul 'persona' @{ presetId = $id } | Out-Null
        $script:views.extras.customPanel.Visibility = 'Collapsed'
        $script:stateDirty = $true
      }.GetNewClosure())
      $x.personaRow.Children.Insert([Math]::Max(0, $x.personaRow.Children.Count - 1), $chip)
      $x.personaChips[$id] = $chip
    }
    $x.personasBuilt = $true
  }
  foreach ($personaKey in $x.personaChips.Keys) {
    $chip = $x.personaChips[$personaKey]
    $active = ($s.personaId -eq $personaKey)
    $chip.Background = if ($active) { Brush '#FFEDE9FF' } else { Brush '#FFF4F5F8' }
    $chip.Child.Foreground = if ($active) { Brush '#FF5B4BD6' } else { Brush '#FF3B4250' }
  }
  $customActive = ([string]$s.personaKey).StartsWith('custom:')
  $x.customChip.Background = if ($customActive) { Brush '#FFEDE9FF' } else { Brush '#FFF4F5F8' }
  $x.customChip.Child.Foreground = if ($customActive) { Brush '#FF5B4BD6' } else { Brush '#FF3B4250' }

  $config = $s.config
  Set-ChipText $x.autonomy $(if ($config.autonomy -ne $false) { '开' } else { '关' })
  Set-ChipText $x.interval ("{0} 分钟" -f [int]$config.heartbeatMinutes)
  Set-ChipText $x.night $(if ($config.nightRest -ne $false) { '开' } else { '关' })
  Set-ChipText $x.approval $(if ($config.approval -eq 'never') { '不问' } else { '询问' })
  Set-ChipText $x.pet $(if ($config.petWindow -ne $false) { '开' } else { '关' })
  $modelText = if ($state.model) { "$($state.model.provider)/$($state.model.model)" } else { '—' }
  $x.info.Text = "会话 $($state.sessionId)
模型 $modelText
房间 $($state.home)
数据 $($state.dataDir)
日记 $($state.diaryDir)"

  $v.retryBtn.Visibility = if ((-not $state.ready) -or $state.error) { 'Visible' } else { 'Collapsed' }
  $noticeText = ''
  if ($state.error) { $noticeText = [string]$state.error }
  elseif ($script:lastError) { $noticeText = [string]$script:lastError }
  if ($noticeText) {
    $v.notice.Text = $noticeText
    $v.notice.Visibility = 'Visible'
  } else {
    $v.notice.Visibility = 'Collapsed'
  }

  if ($script:tab -eq 'chat') { Render-Chat $state }
  if ($script:tab -eq 'diary') { Render-Diary $state }
}

function Sync-PanelNow {
  $s = Get-SoulState
  if ($s -ne $null) {
    $script:stateCache = $s
    if ($null -ne $script:panel -and $script:panel.IsVisible) { Refresh-Panel $s }
  }
}

function Show-Panel {
  if ($null -eq $script:panel) { Build-Panel }
  $p = $script:panel
  if ($p.IsVisible) { $p.Hide(); return }
  $p.Left = [Math]::Max($work.Left + 8, [Math]::Min($window.Left - 432, $work.Right - 428))
  $p.Top = [Math]::Max($work.Top + 8, [Math]::Min($window.Top - 508, $work.Bottom - 648))
  $p.Show()
  $p.Activate() | Out-Null
  $state = Get-SoulState
  if ($state -ne $null) { $script:stateCache = $state; Refresh-Panel $state }
}

# ---------------- ball interactions ----------------
$drag = @{ down = $false; pressed = $false; moved = $false; sx = 0.0; sy = 0.0; wx = 0.0; wy = 0.0 }
$petGrid.Add_MouseLeftButtonDown({
  param($s, $e)
  $script:drag.down = $true; $script:drag.pressed = $true; $script:drag.moved = $false
  $p = [System.Windows.Forms.Cursor]::Position
  $script:drag.sx = $p.X; $script:drag.sy = $p.Y
  $script:drag.wx = $window.Left; $script:drag.wy = $window.Top
  $petGrid.CaptureMouse() | Out-Null
})
$petGrid.Add_MouseMove({
  param($s, $e)
  if (-not $script:drag.down) { return }
  $p = [System.Windows.Forms.Cursor]::Position
  $dx = $p.X - $script:drag.sx
  $dy = $p.Y - $script:drag.sy
  if ([Math]::Abs($dx) + [Math]::Abs($dy) -gt 3) { $script:drag.moved = $true }
  if ($script:drag.moved) { $window.Left = $script:drag.wx + $dx; $window.Top = $script:drag.wy + $dy }
})
$petGrid.Add_MouseLeftButtonUp({
  param($s, $e)
  $script:drag.down = $false
  $petGrid.ReleaseMouseCapture()
  if (-not $script:drag.pressed) { return }
  $script:drag.pressed = $false
  if ($script:drag.moved) { Save-PetPosition } else { Show-Panel }
})

$menu = New-Object System.Windows.Controls.ContextMenu
$miChat = New-Object System.Windows.Controls.MenuItem
$miChat.Header = '打开面板'
$miChat.Add_Click({ Show-Panel })
$menu.Items.Add($miChat) | Out-Null
$miTop = New-Object System.Windows.Controls.MenuItem
$miTop.Header = '总在最前'
$miTop.IsCheckable = $true; $miTop.IsChecked = $true
$miTop.Add_Click({ $window.Topmost = $miTop.IsChecked; if ($null -ne $script:panel) { $script:panel.Topmost = $miTop.IsChecked } })
$menu.Items.Add($miTop) | Out-Null
$miDsh = New-Object System.Windows.Controls.MenuItem
$miDsh.Header = '切到 DSH 窗口'
$miDsh.Add_Click({ Focus-Dsh })
$menu.Items.Add($miDsh) | Out-Null
$miQuit = New-Object System.Windows.Controls.MenuItem
$miQuit.Header = '退出桌宠'
$miQuit.Add_Click({ $window.Close() })
$menu.Items.Add($miQuit) | Out-Null
$petGrid.ContextMenu = $menu
$petGrid.ToolTip = '大肥鱼 · 单击打开面板，拖动移动，右键菜单'

# ---------------- timers ----------------
$script:misses = 0
$stateTimer = New-Object System.Windows.Threading.DispatcherTimer
$stateTimer.Interval = [TimeSpan]::FromSeconds(1.5)
$stateTimer.Add_Tick({
  $state = Get-SoulState
  if ($state -eq $null) {
    $script:misses++
    if ($script:misses -ge 10) { $window.Close(); return }
  } else {
    $script:misses = 0
    $r = Update-Orb $orb $state
    $zzz.Visibility = if ($r.Sleeping) { 'Visible' } else { 'Collapsed' }
    $script:stateCache = $state
    if ($null -ne $script:panel -and $script:panel.IsVisible) { Refresh-Panel $state }
  }
  if ($script:stateDirty) {
    $script:stateDirty = $false
    $s2 = Get-SoulState
    if ($s2 -ne $null) {
      $script:stateCache = $s2
      if ($null -ne $script:panel -and $script:panel.IsVisible) { Refresh-Panel $s2 }
    }
  }
})
$stateTimer.Start()

$window.Add_Closed({
  $stateTimer.Stop()
  Save-PetPosition
  if ($null -ne $script:panel) { try { $script:panel.Close() } catch { } }
  try { $mutex.ReleaseMutex() } catch { }
})
$window.Add_Loaded({
  try {
    if ($OpenPanel) {
      Show-Panel
      if ($TabName -ne 'chat') { Show-View $TabName; if ($script:stateCache) { Refresh-Panel $script:stateCache } }
    }
  } catch {
    Write-Log ("panel open failed: {0}" -f $_.Exception.Message)
  }
})

Update-Orb $orb (Get-SoulState) | Out-Null

$app = New-Object System.Windows.Application
$app.Add_DispatcherUnhandledException({ param($s, $e) Write-Log ("UI error: {0}" -f $e.Exception.Message); $e.Handled = $true })
$app.Run($window) | Out-Null
