<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\CvController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CvController::class, 'index'])->name('cv');

// URL admin tidak ditampilkan pada navigasi publik.
Route::prefix('panel-management')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/', [AuthController::class, 'create'])->name('login');
        Route::post('/login', [AuthController::class, 'store'])->name('login.store');
    });

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('/profile', [ContentController::class, 'profileEdit'])->name('profile.edit');
        Route::put('/profile', [ContentController::class, 'profileUpdate'])->name('profile.update');
        Route::get('/content/{section}', [ContentController::class, 'index'])->name('content.index');
        Route::get('/content/{section}/create', [ContentController::class, 'create'])->name('content.create');
        Route::post('/content/{section}', [ContentController::class, 'store'])->name('content.store');
        Route::get('/content/{section}/{id}/edit', [ContentController::class, 'edit'])->whereNumber('id')->name('content.edit');
        Route::put('/content/{section}/{id}', [ContentController::class, 'update'])->whereNumber('id')->name('content.update');
        Route::delete('/content/{section}/{id}', [ContentController::class, 'destroy'])->whereNumber('id')->name('content.destroy');
    });
});
