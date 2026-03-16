<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TalentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TalentExportController extends Controller
{
    public function csv(): StreamedResponse
    {
        $records = $this->buildRecords();
        $filename = 'facecard-talentos-'.now()->format('Ymd-His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $columns = [
            'talent_id',
            'name_id',
            'nombre',
            'edad',
            'categoria',
            'ciudad',
            'especialidad',
            'tarifa_dia',
            'tarifa_sesion',
            'disponibilidad',
            'destacado_activo',
            'bio',
            'email_usuario',
            'portfolio_items',
            'profile_image',
            'cover_image',
            'created_at',
            'updated_at',
        ];

        return response()->streamDownload(function () use ($records, $columns): void {
            $stream = fopen('php://output', 'wb');

            if (! $stream) {
                return;
            }

            fputs($stream, "\xEF\xBB\xBF");
            fputcsv($stream, $columns);

            foreach ($records as $record) {
                fputcsv($stream, $record);
            }

            fclose($stream);
        }, $filename, $headers);
    }

    public function json(): JsonResponse
    {
        $records = array_values($this->buildRecords());

        return response()->json([
            'generated_at' => now()->toIso8601String(),
            'total' => count($records),
            'records' => $records,
        ], 200, [
            'Content-Disposition' => 'attachment; filename="facecard-talentos-'.now()->format('Ymd-His').'.json"',
        ]);
    }

    private function buildRecords(): array
    {
        return TalentProfile::query()
            ->with(['user:id,email'])
            ->withCount('portfolioItems')
            ->orderBy('category')
            ->orderBy('city')
            ->orderBy('stage_name')
            ->get()
            ->map(function (TalentProfile $profile): array {
                $nameId = Str::slug($profile->stage_name);

                return [
                    'talent_id' => $profile->id,
                    'name_id' => $nameId,
                    'nombre' => $profile->stage_name,
                    'edad' => $profile->age,
                    'categoria' => $profile->category,
                    'ciudad' => $profile->city,
                    'especialidad' => $profile->category,
                    'tarifa_dia' => (string) $profile->day_rate,
                    'tarifa_sesion' => (string) $profile->session_rate,
                    'disponibilidad' => $profile->availability_text,
                    'destacado_activo' => $profile->is_featured,
                    'bio' => $profile->bio,
                    'email_usuario' => $profile->user?->email,
                    'portfolio_items' => $profile->portfolio_items_count,
                    'profile_image' => $profile->profile_image,
                    'cover_image' => $profile->cover_image,
                    'created_at' => optional($profile->created_at)->toDateTimeString(),
                    'updated_at' => optional($profile->updated_at)->toDateTimeString(),
                ];
            })
            ->toArray();
    }
}
