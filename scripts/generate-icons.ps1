# Regenerates public/icons/icon{16,48,128}.png by composing the MRV logomark (base, on a
# white rounded square) with the Adobe "A" mark as a bottom-right badge (= MRV + AJO).
#
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
# Sources live in scripts/icon-sources/ (mrv-mark.png, adobe-a.png).
Add-Type -AssemblyName System.Drawing

$icons = Join-Path (Split-Path $PSScriptRoot -Parent) 'public\icons'
$mrv = [System.Drawing.Image]::FromFile((Join-Path $PSScriptRoot 'icon-sources\mrv-mark.png'))
$adobe = [System.Drawing.Image]::FromFile((Join-Path $PSScriptRoot 'icon-sources\adobe-a.png'))

function RoundedRect($x, $y, $w, $h, $r) {
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2 * $r
  $gp.AddArc($x, $y, $d, $d, 180, 90)
  $gp.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $gp.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $gp.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $gp.CloseFigure()
  return $gp
}
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$adobeRed = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 15, 0))

foreach ($S in 16, 48, 128) {
  $bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $r = [int]($S * 0.22)
  $bg = RoundedRect 0 0 $S $S $r
  $g.SetClip($bg)
  $g.FillPath($white, $bg)
  $ms = [double]($S * 0.98); $mx = [double]($S * -0.05); $my = [double]($S * -0.07)
  $g.DrawImage($mrv, $mx, $my, $ms, $ms)
  $g.ResetClip()

  $bd = [double]($S * 0.44); $bx = $S - $bd - ($S * 0.01); $by = $S - $bd - ($S * 0.01)
  $ring = [double][Math]::Max(1.0, $S * 0.04)
  $g.FillEllipse($white, ($bx - $ring), ($by - $ring), ($bd + 2 * $ring), ($bd + 2 * $ring))
  $g.FillEllipse($adobeRed, $bx, $by, $bd, $bd)
  $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
  $clip.AddEllipse($bx, $by, $bd, $bd)
  $g.SetClip($clip)
  $ov = $bd * 0.06
  $g.DrawImage($adobe, ($bx - $ov / 2), ($by - $ov / 2), ($bd + $ov), ($bd + $ov))
  $g.ResetClip()

  $g.Dispose()
  $bmp.Save((Join-Path $icons "icon$S.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "wrote icon$S.png"
}
$mrv.Dispose(); $adobe.Dispose()