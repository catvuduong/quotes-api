export interface SeedQuote {
  text: string;
  author: string;
  category: string;
  language: string;
}

// Public-domain quotes: ancient sources, works published before 1929, and US government speeches.
// Attribution follows the original source; where a line is a translation, language is the
// language the quote is shown in.
export const QUOTE_SEED: SeedQuote[] = [
  // philosophy
  {
    text: 'The unexamined life is not worth living.',
    author: 'Socrates',
    category: 'philosophy',
    language: 'en',
  },
  { text: 'I think, therefore I am.', author: 'René Descartes', category: 'philosophy', language: 'en' },
  { text: 'Sapere aude.', author: 'Horace', category: 'philosophy', language: 'la' },
  { text: 'Que sais-je?', author: 'Michel de Montaigne', category: 'philosophy', language: 'fr' },
  {
    text: 'The life of man, solitary, poor, nasty, brutish, and short.',
    author: 'Thomas Hobbes',
    category: 'philosophy',
    language: 'en',
  },
  {
    text: 'Was mich nicht umbringt, macht mich stärker.',
    author: 'Friedrich Nietzsche',
    category: 'philosophy',
    language: 'de',
  },
  {
    text: 'Le cœur a ses raisons que la raison ne connaît point.',
    author: 'Blaise Pascal',
    category: 'philosophy',
    language: 'fr',
  },
  {
    text: 'A journey of a thousand miles begins with a single step.',
    author: 'Laozi',
    category: 'philosophy',
    language: 'en',
  },

  // science
  {
    text: 'If I have seen further it is by standing on the shoulders of giants.',
    author: 'Isaac Newton',
    category: 'science',
    language: 'en',
  },
  {
    text: 'I do not know what I may appear to the world; but to myself I seem to have been only like a boy playing on the sea-shore, and diverting myself in now and then finding a smoother pebble or a prettier shell than ordinary, whilst the great ocean of truth lay all undiscovered before me.',
    author: 'Isaac Newton',
    category: 'science',
    language: 'en',
  },
  { text: 'Knowledge is power.', author: 'Francis Bacon', category: 'science', language: 'en' },
  {
    text: 'Imagination is more important than knowledge.',
    author: 'Albert Einstein',
    category: 'science',
    language: 'en',
  },
  {
    text: 'In the fields of observation, chance favors only the prepared mind.',
    author: 'Louis Pasteur',
    category: 'science',
    language: 'en',
  },

  // literature
  {
    text: 'It was the best of times, it was the worst of times.',
    author: 'Charles Dickens',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    author: 'Jane Austen',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'All happy families are alike; each unhappy family is unhappy in its own way.',
    author: 'Leo Tolstoy',
    category: 'literature',
    language: 'en',
  },
  { text: 'Call me Ishmael.', author: 'Herman Melville', category: 'literature', language: 'en' },
  {
    text: 'To be, or not to be, that is the question.',
    author: 'William Shakespeare',
    category: 'literature',
    language: 'en',
  },
  {
    text: "All the world's a stage, and all the men and women merely players.",
    author: 'William Shakespeare',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'Cowards die many times before their deaths; the valiant never taste of death but once.',
    author: 'William Shakespeare',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'This above all: to thine own self be true.',
    author: 'William Shakespeare',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'Brevity is the soul of wit.',
    author: 'William Shakespeare',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'There is nothing either good or bad, but thinking makes it so.',
    author: 'William Shakespeare',
    category: 'literature',
    language: 'en',
  },
  {
    text: "Lasciate ogni speranza, voi ch'entrate.",
    author: 'Dante Alighieri',
    category: 'literature',
    language: 'it',
  },
  {
    text: 'Experience is the name everyone gives to their mistakes.',
    author: 'Oscar Wilde',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'We are all in the gutter, but some of us are looking at the stars.',
    author: 'Oscar Wilde',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'Training is everything. The peach was once a bitter almond; cauliflower is nothing but cabbage with a college education.',
    author: 'Mark Twain',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'A woman must have money and a room of her own if she is to write fiction.',
    author: 'Virginia Woolf',
    category: 'literature',
    language: 'en',
  },
  {
    text: 'Im Anfang war die Tat!',
    author: 'Johann Wolfgang von Goethe',
    category: 'literature',
    language: 'de',
  },
  {
    text: 'Es irrt der Mensch, solang er strebt.',
    author: 'Johann Wolfgang von Goethe',
    category: 'literature',
    language: 'de',
  },

  // poetry
  {
    text: '"Hope" is the thing with feathers – That perches in the soul –',
    author: 'Emily Dickinson',
    category: 'poetry',
    language: 'en',
  },
  { text: 'I am large, I contain multitudes.', author: 'Walt Whitman', category: 'poetry', language: 'en' },
  {
    text: 'Two roads diverged in a wood, and I took the one less traveled by.',
    author: 'Robert Frost',
    category: 'poetry',
    language: 'en',
  },
  { text: 'A thing of beauty is a joy for ever.', author: 'John Keats', category: 'poetry', language: 'en' },
  {
    text: 'The Child is father of the Man.',
    author: 'William Wordsworth',
    category: 'poetry',
    language: 'en',
  },
  {
    text: 'To see a World in a Grain of Sand, And a Heaven in a Wild Flower.',
    author: 'William Blake',
    category: 'poetry',
    language: 'en',
  },
  {
    text: "'Tis better to have loved and lost than never to have loved at all.",
    author: 'Alfred, Lord Tennyson',
    category: 'poetry',
    language: 'en',
  },
  {
    text: 'If Winter comes, can Spring be far behind?',
    author: 'Percy Bysshe Shelley',
    category: 'poetry',
    language: 'en',
  },
  {
    text: 'They also serve who only stand and wait.',
    author: 'John Milton',
    category: 'poetry',
    language: 'en',
  },
  {
    text: 'To err is human, to forgive divine.',
    author: 'Alexander Pope',
    category: 'poetry',
    language: 'en',
  },

  // politics
  {
    text: 'So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself.',
    author: 'Franklin D. Roosevelt',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'We hold these truths to be self-evident, that all men are created equal.',
    author: 'Thomas Jefferson',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'I have sworn upon the altar of God eternal hostility against every form of tyranny over the mind of man.',
    author: 'Thomas Jefferson',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.',
    author: 'Abraham Lincoln',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'A house divided against itself cannot stand.',
    author: 'Abraham Lincoln',
    category: 'politics',
    language: 'en',
  },
  {
    text: "With malice toward none, with charity for all, with firmness in the right as God gives us to see the right, let us strive on to finish the work we are in, to bind up the nation's wounds.",
    author: 'Abraham Lincoln',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'Give me liberty, or give me death!',
    author: 'Patrick Henry',
    category: 'politics',
    language: 'en',
  },
  {
    text: "These are the times that try men's souls.",
    author: 'Thomas Paine',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'The harder the conflict, the more glorious the triumph.',
    author: 'Thomas Paine',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety.',
    author: 'Benjamin Franklin',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'And so, my fellow Americans: ask not what your country can do for you—ask what you can do for your country.',
    author: 'John F. Kennedy',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'If there is no struggle, there is no progress.',
    author: 'Frederick Douglass',
    category: 'politics',
    language: 'en',
  },
  {
    text: 'I do not wish women to have power over men; but over themselves.',
    author: 'Mary Wollstonecraft',
    category: 'politics',
    language: 'en',
  },
  { text: 'Veni, vidi, vici.', author: 'Julius Caesar', category: 'politics', language: 'la' },
  {
    text: 'Man is born free, and everywhere he is in chains.',
    author: 'Jean-Jacques Rousseau',
    category: 'politics',
    language: 'en',
  },

  // wisdom
  {
    text: 'Early to bed and early to rise, makes a man healthy, wealthy, and wise.',
    author: 'Benjamin Franklin',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Three may keep a secret, if two of them are dead.',
    author: 'Benjamin Franklin',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Well done is better than well said.',
    author: 'Benjamin Franklin',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Lost time is never found again.',
    author: 'Benjamin Franklin',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'When a man is tired of London, he is tired of life; for there is in London all that life can afford.',
    author: 'Samuel Johnson',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Whoso would be a man must be a nonconformist.',
    author: 'Ralph Waldo Emerson',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Nothing great was ever achieved without enthusiasm.',
    author: 'Ralph Waldo Emerson',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Go confidently in the direction of your dreams! Live the life you have imagined.',
    author: 'Henry David Thoreau',
    category: 'wisdom',
    language: 'en',
  },
  {
    text: 'Reading maketh a full man; conference a ready man; and writing an exact man.',
    author: 'Francis Bacon',
    category: 'wisdom',
    language: 'en',
  },
];
