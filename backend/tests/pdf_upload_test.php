<?php
declare(strict_types=1);
require __DIR__ . '/../helpers/pdf_upload.php';

function check_pdf(string $path, bool $expected, string $label): void {
    $result = valid_uploaded_pdf_contents($path, $error);
    if ($result !== $expected || (!$result && !$error)) throw new RuntimeException($label . ': ' . ($error ?? 'resultado inesperado'));
    echo "OK: $label" . ($error ? " ($error)" : '') . PHP_EOL;
}

// PDF con una página y una imagen gris sin compresión que contiene bytes <?=.
function write_pdf(string $path, int $imageBytes): void {
    $out = fopen($path, 'wb');
    fwrite($out, "%PDF-1.7\n%\xE2\xE3\xCF\xD3\n");
    $offsets = [0];
    $objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
    ];
    foreach ($objects as $index => $body) {
        $offsets[] = ftell($out);
        fwrite($out, ($index + 1) . " 0 obj\n$body\nendobj\n");
    }
    $offsets[] = ftell($out);
    fwrite($out, "4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1024 /Height " . intdiv($imageBytes, 1024) . " /ColorSpace /DeviceGray /BitsPerComponent 8 /Length $imageBytes >>\nstream\n");
    $chunk = str_repeat("\x00<?=\xFF<?php ", 100000);
    for ($left = $imageBytes; $left > 0;) {
        $part = substr($chunk, 0, min($left, strlen($chunk)));
        fwrite($out, $part); $left -= strlen($part);
    }
    fwrite($out, "\nendstream\nendobj\n");
    $offsets[] = ftell($out);
    $content = 'q 100 0 0 100 0 0 cm /Im0 Do Q';
    fwrite($out, "5 0 obj\n<< /Length " . strlen($content) . " >>\nstream\n$content\nendstream\nendobj\n");
    $xref = ftell($out);
    fwrite($out, "xref\n0 6\n0000000000 65535 f \n");
    foreach (array_slice($offsets, 1) as $offset) fwrite($out, sprintf("%010d 00000 n \n", $offset));
    fwrite($out, "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n$xref\n%%EOF\n");
    fclose($out);
}

$path = tempnam(sys_get_temp_dir(), 'pdf-test-');
try {
    foreach (['800M' => 838860800, '820M' => 859832320, '64m' => 67108864, '1024K' => 1048576, '1G' => 1073741824, '0' => 0, '-1' => 0] as $input => $expected) {
        if (pdf_ini_bytes((string) $input) !== $expected) throw new RuntimeException('Límite PHP incorrecto: ' . $input);
    }
    echo 'OK: interpretación de límites PHP; efectivos: ' . json_encode(pdf_upload_limits()) . PHP_EOL;
    echo 'fileinfo: ' . (class_exists('finfo') ? 'disponible' : 'ausente (firma y estructura obligatorias)') . PHP_EOL;
    write_pdf($path, 1024);
    check_pdf($path, true, 'PDF pequeño');
    check_pdf(__DIR__ . '/fixtures/encrypted.pdf', true, 'PDF cifrado con contraseña (RC4, generado con jsPDF)');
    write_pdf($path, 1024 * 1024);
    check_pdf($path, true, 'Imagen PDF con etiquetas PHP en datos binarios');
    foreach ([
        'Archivo vacío' => '',
        'Imagen renombrada' => "\xFF\xD8\xFF\xE0JFIF",
        'PHP renombrado' => '<?php echo "attack"; ?>',
        'Cabecera falsa' => "%PDF-1.7\n<?php echo 'attack'; ?>\n%%EOF",
        'PDF truncado' => "%PDF-1.7\n1 0 obj\n<<>>\nendobj",
        'Referencia fuera del archivo' => "%PDF-1.7\n1 0 obj\n<<>>\nendobj\nstartxref\n999999\n%%EOF",
        'Contenido añadido después del cierre' => file_get_contents($path) . '<?php echo "attack"; ?>',
    ] as $label => $data) {
        $bad = $path . '.bad';
        try { file_put_contents($bad, $data); check_pdf($bad, false, $label); }
        finally { if (is_file($bad)) unlink($bad); }
    }
    foreach (glob(__DIR__ . '/../uploads/documents/*.pdf') as $pdf) check_pdf($pdf, true, basename($pdf));
    // Cierre con relleno permitido: no exigir EOF en los últimos 2 KiB.
    file_put_contents($path, str_repeat(" \n", 4096), FILE_APPEND);
    check_pdf($path, true, 'PDF con espacios después de EOF');
    if (in_array('--large', $argv, true)) {
        write_pdf($path, 799 * 1024 * 1024);
        check_pdf($path, true, 'PDF de imagen de 799 MB');
        echo 'Memoria pico: ' . round(memory_get_peak_usage(true) / 1048576, 1) . " MB\n";
    }
} finally { unlink($path); }
