<?php
declare(strict_types=1);

// Conserva las comprobaciones de firma, EOF y código PHP con memoria acotada.
function valid_uploaded_pdf_contents(string $path): bool
{
    $stream = fopen($path, 'rb');
    if ($stream === false) return false;
    try {
        $header = fread($stream, 8);
        if ($header === false || !preg_match('/^%PDF-[12]\.[0-9]/', $header)) return false;
        rewind($stream);
        $tail = '';
        while (!feof($stream)) {
            $chunk = fread($stream, 1024 * 1024);
            if ($chunk === false || ($chunk === '' && !feof($stream))) return false;
            $window = $tail . $chunk;
            if (preg_match('/<\?(?:php|=)/i', $window)) return false;
            // Incluye solapamiento para detectar secuencias entre bloques.
            $tail = substr($window, -2048);
        }
        if (strpos($tail, '%%EOF') === false) return false;
        if (class_exists('finfo')) {
            $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($header);
            if ($mime !== 'application/pdf') return false;
        }
        return true;
    } finally {
        fclose($stream);
    }
}
