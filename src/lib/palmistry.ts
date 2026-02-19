const lifePaths = [
	'A winding road through mist-shrouded valleys awaits you. Something ancient stirs at the crossroads.',
	'The stars whisper of a great journey across dark waters. You shall arrive changed, but not unscathed.',
	'A stranger bearing violet flowers will alter the course of your destiny before the next eclipse.',
	'Your lifeline branches like lightning — two fates intertwined, one shadowed, one radiant.',
	'The spirits see wealth in your palm, though it may not be the kind you expect. Beware gifts from the left hand.',
	'A tower crumbles in your future, but from its ruins grows something magnificent and strange.',
	'You carry the mark of the nocturnal wanderer. Sleep will bring you more answers than waking ever could.',
	'The bones foretell a great love — consuming, transformative, and not entirely of this world.',
	'Your fate is written in a language even the dead have forgotten. This is either very good or very bad.',
	'A black cat will cross your path seven times. On the seventh, follow it.',
	'The veil between worlds thins around you. Expect unusual visitors during the hours of 3 and 4 AM.',
	'Your palm reveals the Serpent\'s Crown — a rare marking indicating dominion over small household appliances.',
	'An inheritance of peculiar nature approaches. It involves a key, a mirror, and something that hums.',
	'The moon line suggests you will find purpose in an unlikely place. Perhaps a swamp. Perhaps a library. Perhaps both.',
	'Your heart line splits into a trident — the mark of someone who will own exactly three meaningful hats.',
];

const loveFortunes = [
	'A dark and brooding presence enters your love life. They own too many candles. This is not a warning, merely an observation.',
	'Your romantic destiny involves someone who speaks to plants. The plants speak back. You will learn to accept this.',
	'Love arrives on a Wednesday, smelling of old books and thunderstorms.',
	'The cards reveal a partnership forged in mutual appreciation of gothic architecture and comfortable silence.',
	'Beware: your next significant other collects something unsettling. You will grow to find it charming.',
	'A love letter written in an extinct language will find you. You will understand every word.',
	'Your soulmate is currently arguing with a vending machine. The stars do not specify when you will meet.',
	'Romance blooms in a graveyard. This is more poetic than it sounds.',
];

const careerFortunes = [
	'Your professional destiny involves a dramatic career change. The spirits suggest: professional candle consultant.',
	'A promotion awaits, though it comes with a peculiar uniform and responsibilities involving fog.',
	'Your hands reveal entrepreneurial energy. Your future business involves something that glows.',
	'The fates see you mastering a forgotten craft. It involves hammers, moonlight, and excellent posture.',
	'Your career path leads through a door you haven\'t noticed yet. It is behind a bookshelf, naturally.',
	'Success comes to you in the form of a very specific spreadsheet. Guard it with your life.',
	'The spirits recommend you update your resume to include "communion with the void." Employers value this.',
	'A mysterious mentor appears in your professional life. They communicate exclusively through cryptic Post-it notes.',
];

const warnings = [
	'Avoid mirrors on Tuesdays.',
	'The number 7 follows you. This is neither curse nor blessing — merely persistent.',
	'Something you lost years ago will return. You will wish it hadn\'t.',
	'Beware of doors that open by themselves. Especially revolving ones.',
	'A raven watches your window. It is not judging you. It is simply disappointed.',
	'The moon enters your house of mystery. Also, you left a window open.',
	'Trust no one who offers you soup after midnight.',
	'Your shadow has been acting independently on Thursdays. This is normal. Probably.',
];

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function generateReading() {
	return {
		lifePath: pick(lifePaths),
		love: pick(loveFortunes),
		career: pick(careerFortunes),
		warning: pick(warnings),
	};
}

export function shouldWashHands(): { verdict: boolean; reason: string } {
	const wash = Math.random() > 0.35;

	const washReasons = [
		'The spirits detect a dark miasma clinging to your fingertips. Cleanse immediately.',
		'Your palms carry the residue of forgotten deeds. Water shall absolve you.',
		'The Hand Oracle senses impurity. A thorough washing with warm water and soap is demanded by the cosmos.',
		'Ancient hygiene runes glow upon your skin. The ritual of washing must commence.',
		'Something unspeakable lurks beneath your fingernails. The spirits implore you: WASH.',
		'The mystic enzymes on your hands are in disarray. Only the sacred waters of the sink can restore balance.',
		'Your aura is smudged. Specifically, your hand aura. Soap. Now.',
	];

	const cleanReasons = [
		'Your hands radiate an ethereal purity. The spirits nod approvingly.',
		'The Oracle detects no darkness upon your palms. You have washed recently, haven\'t you? Impressive.',
		'Your hands glow with an inner cleanliness. The ancient ones are satisfied.',
		'The cosmic hygiene index rates your hands: IMMACULATE. Well done, mortal.',
		'Your palms are as clean as a moonlit gravestone after rain. This is a compliment.',
	];

	return {
		verdict: wash,
		reason: wash ? pick(washReasons) : pick(cleanReasons),
	};
}
