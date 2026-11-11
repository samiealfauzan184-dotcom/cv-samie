@extends('admin.layouts.app')
@section('title', $config['title'])
@section('content')
<header class="top"><div><p class="muted" style="margin:0 0 7px">Kelola konten website CV</p><h1>{{ $config['title'] }}</h1></div><a class="button light" href="{{ route('admin.content.create', $section) }}">＋ Tambah data</a></header>
@if(session('success'))<div class="alert">{{ session('success') }}</div>@endif
<section class="panel"><div class="bar">Daftar {{ $config['title'] }}</div><div class="table-wrap"><table class="data"><thead><tr><th>ID</th>@foreach($config['fields'] as $label)<th>{{ $label }}</th>@endforeach<th>Aksi</th></tr></thead><tbody>
@forelse($items as $item)<tr><td>{{ $item->id }}</td>@foreach($config['fields'] as $key => $label)<td>{{ \Illuminate\Support\Str::limit((string)($item->{$key} ?? '—'), 90) }}</td>@endforeach<td><div class="actions" style="margin:0"><a class="button" href="{{ route('admin.content.edit', [$section, $item->id]) }}">Edit</a><form method="POST" action="{{ route('admin.content.destroy', [$section, $item->id]) }}" onsubmit="return confirm('Yakin ingin menghapus data ini?')">@csrf @method('DELETE')<button class="button danger" type="submit">Hapus</button></form></div></td></tr>@empty<tr><td colspan="{{ count($config['fields']) + 2 }}" class="muted">Belum ada data. Klik Tambah data untuk memulai.</td></tr>@endforelse
</tbody></table></div><div class="pad pager">{{ $items->links() }}</div></section>
@endsection
