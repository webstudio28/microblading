<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Vary: Origin");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Method not allowed"]);
    exit;
}

/**
 * Keep sensitive keys outside public_html.
 * Example file path on cPanel:
 *   /home/<cpanel-user>/cal-booking-config.php
 */
function load_private_config(): array
{
    $config = [
        "CAL_API_BASE_URL" => getenv("CAL_API_BASE_URL") ?: "https://api.cal.eu",
        "CAL_API_VERSION" => getenv("CAL_API_VERSION") ?: "2024-08-13",
        "CAL_API_KEY" => getenv("CAL_API_KEY") ?: "",
        "CAL_EVENT_TYPE_SLUG" => getenv("CAL_EVENT_TYPE_SLUG") ?: "",
        "CAL_USERNAME" => getenv("CAL_USERNAME") ?: "",
        "CAL_TEAM_SLUG" => getenv("CAL_TEAM_SLUG") ?: "",
        "CAL_ORGANIZATION_SLUG" => getenv("CAL_ORGANIZATION_SLUG") ?: "",
        "CAL_DEFAULT_TIMEZONE" => getenv("CAL_DEFAULT_TIMEZONE") ?: "Europe/Sofia",
        "CAL_ATTENDEE_LANGUAGE" => getenv("CAL_ATTENDEE_LANGUAGE") ?: "bg"
    ];

    $candidateFiles = [];

    $explicitPath = trim((string)(getenv("CAL_BOOKING_CONFIG_PATH") ?: ""));
    if ($explicitPath !== "") {
        $candidateFiles[] = $explicitPath;
    }

    // Local/dev convenience (project root)
    $candidateFiles[] = dirname(__DIR__, 2) . "/cal-booking-config.php";

    // cPanel variants:
    // - deployment rooted at /home/<user>/microblading
    // - deployment rooted at /home/<user>/public_html/microblading
    // We try both level-2 and level-3 parents to support both layouts.
    $candidateFiles[] = dirname(__DIR__, 2) . "/backend-functions/cal-booking-config.php";
    $candidateFiles[] = dirname(__DIR__, 3) . "/backend-functions/cal-booking-config.php";
    $candidateFiles[] = dirname(__DIR__, 2) . "/cal-booking-config.php";
    $candidateFiles[] = dirname(__DIR__, 3) . "/cal-booking-config.php";

    foreach ($candidateFiles as $privateFile) {
        if (!is_readable($privateFile)) {
            continue;
        }

        $fileConfig = include $privateFile;
        if (is_array($fileConfig)) {
            $config = array_merge($config, $fileConfig);
            break;
        }
    }

    return $config;
}

function respond_json(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents("php://input");
$input = json_decode($rawBody ?: "", true);
if (!is_array($input)) {
    respond_json(400, ["ok" => false, "error" => "Invalid JSON body"]);
}

$slotStartIso = trim((string)($input["slotStartIso"] ?? ""));
$fullName = trim((string)($input["fullName"] ?? ""));
$email = trim((string)($input["email"] ?? ""));
$phone = trim((string)($input["phone"] ?? ""));
$serviceLabel = trim((string)($input["serviceLabel"] ?? ""));
$dateValue = trim((string)($input["date"] ?? ""));
$timeValue = trim((string)($input["time"] ?? ""));
$sourceValue = trim((string)($input["source"] ?? "valeto-site"));

if ($slotStartIso === "" || $fullName === "" || $email === "") {
    respond_json(400, ["ok" => false, "error" => "Missing required booking fields"]);
}

$config = load_private_config();
if (trim((string)$config["CAL_API_KEY"]) === "") {
    respond_json(500, ["ok" => false, "error" => "Server is missing CAL_API_KEY"]);
}

$eventTypeSlug = trim((string)($input["eventTypeSlug"] ?? $config["CAL_EVENT_TYPE_SLUG"]));
$username = trim((string)($input["username"] ?? $config["CAL_USERNAME"]));
$teamSlug = trim((string)($input["teamSlug"] ?? $config["CAL_TEAM_SLUG"]));
$organizationSlug = trim((string)($input["organizationSlug"] ?? $config["CAL_ORGANIZATION_SLUG"]));

if ($eventTypeSlug === "") {
    respond_json(500, ["ok" => false, "error" => "Server is missing CAL_EVENT_TYPE_SLUG"]);
}
if ($username === "" && $teamSlug === "") {
    respond_json(500, ["ok" => false, "error" => "Server needs CAL_USERNAME or CAL_TEAM_SLUG"]);
}

$attendeeTimeZone = trim((string)($input["timeZone"] ?? $config["CAL_DEFAULT_TIMEZONE"]));
$attendeeLanguage = trim((string)($input["language"] ?? $config["CAL_ATTENDEE_LANGUAGE"]));
$attendeePhone = $phone !== "" ? $phone : null;
$bookingPayload = [
    "start" => $slotStartIso,
    "eventTypeSlug" => $eventTypeSlug,
    "attendee" => [
        "name" => $fullName,
        "email" => $email,
        "timeZone" => $attendeeTimeZone,
        "language" => $attendeeLanguage
    ],
    "metadata" => [
        "source" => $sourceValue,
        "phone" => $phone,
        "serviceLabel" => $serviceLabel,
        "preferredDate" => $dateValue,
        "preferredTime" => $timeValue
    ]
];

if ($attendeePhone !== null) {
    $bookingPayload["attendee"]["phoneNumber"] = $attendeePhone;
}

if ($username !== "") {
    $bookingPayload["username"] = $username;
}
if ($teamSlug !== "") {
    $bookingPayload["teamSlug"] = $teamSlug;
}
if ($organizationSlug !== "") {
    $bookingPayload["organizationSlug"] = $organizationSlug;
}

$apiBaseUrl = rtrim((string)$config["CAL_API_BASE_URL"], "/");
$endpoint = $apiBaseUrl . "/v2/bookings";

$curl = curl_init($endpoint);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "cal-api-version: " . (string)$config["CAL_API_VERSION"],
        "Authorization: Bearer " . (string)$config["CAL_API_KEY"]
    ],
    CURLOPT_POSTFIELDS => json_encode($bookingPayload, JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT => 30
]);

$responseBody = curl_exec($curl);
$curlError = curl_error($curl);
$statusCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($responseBody === false) {
    respond_json(502, ["ok" => false, "error" => "Cal API request failed: " . $curlError]);
}

$calResponse = json_decode($responseBody, true);
if ($statusCode < 200 || $statusCode >= 300) {
    $errorMessage = "Cal booking failed";
    if (is_array($calResponse) && isset($calResponse["error"]["message"])) {
        $errorMessage = (string)$calResponse["error"]["message"];
    }
    respond_json(400, [
        "ok" => false,
        "error" => $errorMessage,
        "calStatusCode" => $statusCode
    ]);
}

$bookingUid = "";
if (is_array($calResponse) && isset($calResponse["data"]["uid"])) {
    $bookingUid = (string)$calResponse["data"]["uid"];
}

respond_json(200, [
    "ok" => true,
    "bookingUid" => $bookingUid
]);
