import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
	if (supabase) return supabase;

	const url = import.meta.env.VITE_SUPABASE_URL;
	const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!url || !key) {
		console.warn('Supabase credentials not set. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
		return null;
	}

	supabase = createClient(url, key);
	return supabase;
}

export async function uploadHandImage(imageBlob: Blob): Promise<string | null> {
	const client = getClient();
	if (!client) return null;

	const fileName = `hand_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;

	const { error } = await client.storage.from('hands').upload(fileName, imageBlob, {
		contentType: 'image/jpeg',
		cacheControl: '3600'
	});

	if (error) {
		console.error('Upload error:', error);
		return null;
	}

	const {
		data: { publicUrl }
	} = client.storage.from('hands').getPublicUrl(fileName);

	return publicUrl;
}

export async function getAllHandImages(): Promise<string[]> {
	const client = getClient();
	if (!client) {
		console.warn('[collage] No Supabase client');
		return [];
	}

	const { data, error } = await client.storage.from('hands').list('', {
		limit: 200,
		sortBy: { column: 'created_at', order: 'desc' }
	});

	console.log('[collage] list response:', { data, error });

	if (error) {
		console.error('[collage] List error:', error.message);
		return [];
	}

	if (!data || data.length === 0) {
		console.warn('[collage] Empty result. Add a SELECT policy for anon on the hands bucket.');
		return [];
	}

	const images = data
		.filter((f) => {
			const keep = f.name && !f.name.startsWith('.') && f.id;
			return keep;
		})
		.map((f) => {
			const {
				data: { publicUrl }
			} = client.storage.from('hands').getPublicUrl(f.name);
			return publicUrl;
		});

	console.log('[collage] resolved URLs:', images);
	return images;
}
