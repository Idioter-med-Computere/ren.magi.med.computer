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
	if (!client) return [];

	const { data, error } = await client.storage.from('hands').list('', {
		limit: 200,
		sortBy: { column: 'created_at', order: 'desc' }
	});

	if (error || !data) {
		console.error('List error:', error);
		return [];
	}

	return data
		.filter((f) => f.name.endsWith('.jpg') || f.name.endsWith('.png'))
		.map((f) => {
			const {
				data: { publicUrl }
			} = client.storage.from('hands').getPublicUrl(f.name);
			return publicUrl;
		});
}
