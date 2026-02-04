<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    private string $disk = 'public';

    public function upload(UploadedFile $file, string $folder = 'uploads'): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, $this->disk);

        return $path;
    }

    public function uploadMultiple(array $files, string $folder = 'uploads'): array
    {
        $paths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = $this->upload($file, $folder);
            }
        }

        return $paths;
    }

    public function delete(string $path): bool
    {
        if (Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->delete($path);
        }

        return false;
    }

    public function deleteMultiple(array $paths): void
    {
        foreach ($paths as $path) {
            if ($path) {
                $this->delete($path);
            }
        }
    }

    public function getUrl(string $path): string
    {
        return Storage::disk($this->disk)->url($path);
    }

    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    public function getSize(string $path): int
    {
        return Storage::disk($this->disk)->size($path);
    }

    public function getMimeType(string $path): ?string
    {
        return Storage::disk($this->disk)->mimeType($path);
    }
}
