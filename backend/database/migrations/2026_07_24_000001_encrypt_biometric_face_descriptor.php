<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * El descriptor facial pasa a almacenarse cifrado (cast `encrypted:array`).
     * El payload cifrado de Laravel es una cadena base64, no JSON valido, por lo
     * que la columna debe dejar de ser `json` y pasar a `text`.
     */
    public function up(): void
    {
        Schema::table('biometric_profiles', function (Blueprint $table) {
            $table->text('face_descriptor')->nullable()->change();
        });

        // Cifra en su sitio los descriptores existentes en texto plano.
        foreach (DB::table('biometric_profiles')->whereNotNull('face_descriptor')->get() as $row) {
            // Si ya no es JSON en claro, se asume cifrado y se omite (idempotente).
            if (! is_array(json_decode($row->face_descriptor, true))) {
                continue;
            }

            DB::table('biometric_profiles')
                ->where('id', $row->id)
                ->update(['face_descriptor' => Crypt::encryptString($row->face_descriptor)]);
        }
    }

    public function down(): void
    {
        foreach (DB::table('biometric_profiles')->whereNotNull('face_descriptor')->get() as $row) {
            try {
                $plain = Crypt::decryptString($row->face_descriptor);
            } catch (\Throwable $e) {
                continue;
            }

            DB::table('biometric_profiles')
                ->where('id', $row->id)
                ->update(['face_descriptor' => $plain]);
        }

        Schema::table('biometric_profiles', function (Blueprint $table) {
            $table->json('face_descriptor')->nullable()->change();
        });
    }
};
