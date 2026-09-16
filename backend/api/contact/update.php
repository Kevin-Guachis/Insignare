<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/contact_settings.php';
require_method('POST');
$values=contact_settings_values(read_json_request());
contact_settings_get();
$assignments=implode(',',array_map(static fn($key)=>"$key=:$key",array_keys($values)));
get_database()->prepare("UPDATE contact_settings SET $assignments WHERE id=1")->execute($values);
success_response(contact_settings_get());
