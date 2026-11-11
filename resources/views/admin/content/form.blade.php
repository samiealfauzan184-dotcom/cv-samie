@extends('admin.layouts.app')
@section('title', ($item->exists ? 'Edit ' : 'Tambah ').$config['title'])
@section('content')
<header class="top"><div><p class="muted" style="margin:0 0 7px">{{ $config['title'] }}</p><h1>{{ $item->exists ? 'Edit data' : 'Tambah data' }}</h1></div><a class="button" href="{{ route('admin.content.index', $section) }}">← Kembali</a></header>
<section class="panel"><div class="bar">Form {{ $config['title'] }}</div><div class="pad"><form method="POST" action="{{ $item->exists ? route('admin.content.update', [$section, $item->id]) : route('admin.content.store', $section) }}">@csrf @if($item->exists) @method('PUT') @endif
@foreach($config['fields'] as $key => $label)
<label class="field"><span>{{ $label }}</span>
@if(in_array($key, ['description','note','points_text']))
<textarea name="{{ $key }}">{{ old($key, $item->{$key}) }}</textarea>
@else
<input name="{{ $key }}" value="{{ old($key, $item->{$key}) }}" @if(in_array($key, ['sort_order','level'])) type="number" min="0" @else type="text" @endif @if(in_array($key, ['institution','major','period_start','title','organization','name','stack','year','level'])) required @endif>
@endif
</label>
@error($key)<span class="error-text">{{ $message }}</span>@enderror
@endforeach
<hr class="dotted"><div class="actions" style="margin:0"><button class="button submit" type="submit">Simpan</button><a class="button" href="{{ route('admin.content.index', $section) }}">Batal</a></div></form></div></section>
@endsection
