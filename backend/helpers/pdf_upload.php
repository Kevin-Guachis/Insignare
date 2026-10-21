<?php
declare(strict_types=1);

const PDF_UPLOAD_MAX_BYTES = 800 * 1024 * 1024;

// PHP interpreta K/M/G en potencias de 1024; cero representa ausencia de límite.
function pdf_ini_bytes(string $value): int
{
    $value = trim($value);
    if ($value === '' || (float) $value <= 0) return 0;
    $unit = strtolower(substr($value, -1));
    $factor = ['k' => 1024, 'm' => 1048576, 'g' => 1073741824][$unit] ?? 1;
    return (int) min(PHP_INT_MAX, (float) $value * $factor);
}

function pdf_upload_limits(): array
{
    return [
        'application_max_bytes' => PDF_UPLOAD_MAX_BYTES,
        'upload_max_bytes' => pdf_ini_bytes((string) ini_get('upload_max_filesize')),
        'post_max_bytes' => pdf_ini_bytes((string) ini_get('post_max_size')),
    ];
}

function pdf_limit_label(int $bytes): string
{
    return rtrim(rtrim(number_format($bytes / 1048576, 2, '.', ''), '0'), '.') . ' MB';
}

// Las etiquetas PHP pueden aparecer en streams binarios legítimos. La seguridad
// de ejecución depende del bloqueo HTTP de uploads/documents y de servir con readfile.
function valid_uploaded_pdf_contents(string $path, ?string &$error = null): bool
{
    $error = null;
    $fail = static function (string $message) use (&$error): bool {
        $error = $message;
        return false;
    };
    $stream = @fopen($path, 'rb');
    if ($stream === false) return $fail('No se pudo leer el archivo PDF temporal.');
    try {
        $header = fread($stream, 8);
        if ($header === false || !preg_match('/^%PDF-[12]\.[0-9]/', $header)) return $fail('La cabecera del archivo no corresponde a un PDF.');
        rewind($stream);
        $sample = fread($stream, 8192);
        if ($sample === false) return $fail('No se pudo leer el contenido del PDF.');
        // fileinfo es complementario. Un resultado genérico no invalida la firma
        // y estructura; un tipo contradictorio o un fallo real sí se informa.
        if (class_exists('finfo')) {
            try {
                $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($sample);
            } catch (Throwable $exception) {
                return $fail('El servidor no pudo comprobar el tipo MIME del PDF.');
            }
            if ($mime === false) return $fail('El servidor no pudo comprobar el tipo MIME del PDF.');
            if (!in_array($mime, ['application/pdf', 'application/x-pdf', 'application/octet-stream'], true)) return $fail('El tipo MIME detectado no corresponde a un PDF.');
        }
        // Sin fileinfo siguen siendo obligatorias la firma, objetos y cierre PDF.
        // No se interpretan streams: admite fotografías, cifrado y xref comprimido.
        if (!preg_match('/\b[0-9]+\s+[0-9]+\s+obj\b/', $sample)) return $fail('El archivo no contiene una estructura inicial de objetos PDF reconocible.');
        $stat = fstat($stream);
        if ($stat === false) return $fail('No se pudo consultar el tamaño del PDF.');
        $size = $stat['size'];
        // Lecturas acotadas, independientes del tamaño total (máximo 72 KiB).
        if (fseek($stream, max(0, $size - 65536)) !== 0) return $fail('No se pudo leer el cierre del PDF.');
        $tail = stream_get_contents($stream);
        if ($tail === false || !preg_match('/startxref\s+([0-9]+)\s+%%EOF[\x00\x09\x0a\x0c\x0d\x20]*\z/', $tail, $match)) return $fail('La estructura del PDF está incompleta: falta startxref o el cierre %%EOF válido.');
        $offset = (int) $match[1];
        if ($offset < 8 || $offset >= $size - strlen($match[0])) return $fail('La referencia startxref del PDF está fuera del contenido del documento.');
        return true;
    } finally {
        fclose($stream);
    }
}
