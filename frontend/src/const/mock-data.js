// Mock data — replace with real API data when backend is ready

export const MOCK_CATEGORIES = [
  { _id: 'all', name: 'All' },
  { _id: 'veg', name: 'Veg' },
  { _id: 'non-veg', name: 'Non-Veg' },
  { _id: 'special', name: 'Chef Special' },
]

export const MOCK_PIZZAS = [
  {
    _id: '1',
    name: 'Margherita Classic',
    description: 'Fresh mozzarella, San Marzano tomatoes, fragrant basil and extra virgin olive oil on our signature crust.',
    category: 'veg',
    basePrice: 299,
    image: null,
    tags: ['bestseller'],
    rating: 4.8,
    totalRatings: 1240,
  },
  {
    _id: '2',
    name: 'BBQ Chicken Fiesta',
    description: 'Tender BBQ chicken, red onions, jalapeños, and smoky BBQ sauce with a mozzarella blend.',
    category: 'non-veg',
    basePrice: 449,
    image: null,
    tags: ['popular'],
    rating: 4.7,
    totalRatings: 980,
  },
  {
    _id: '3',
    name: 'Pepperoni Supreme',
    description: 'Double pepperoni, Italian sausage, black olives, and our house marinara on a thick crust.',
    category: 'non-veg',
    basePrice: 399,
    image: null,
    tags: ['popular'],
    rating: 4.9,
    totalRatings: 2100,
  },
  {
    _id: '4',
    name: 'Garden Veggie',
    description: 'Bell peppers, mushrooms, olives, red onions, spinach and sun-dried tomatoes on pesto base.',
    category: 'veg',
    basePrice: 349,
    image: null,
    tags: [],
    rating: 4.5,
    totalRatings: 560,
  },
  {
    _id: '5',
    name: 'Spicy Arrabbiata',
    description: 'Hot and spicy arrabbiata sauce, calabrian chillies, mozzarella and fresh basil. Not for the faint-hearted!',
    category: 'veg',
    basePrice: 329,
    image: null,
    tags: ['spicy'],
    rating: 4.6,
    totalRatings: 700,
  },
  {
    _id: '6',
    name: 'Butter Chicken Pizza',
    description: 'Indian-fusion special: creamy butter chicken, pickled onions, coriander on naan-style crust.',
    category: 'special',
    basePrice: 499,
    image: null,
    tags: ['chef-special', 'fusion'],
    rating: 4.9,
    totalRatings: 1800,
  },
  {
    _id: '7',
    name: 'Truffle Mushroom',
    description: 'Wild mushroom medley, truffle oil drizzle, parmesan shavings, fresh thyme on garlic cream base.',
    category: 'special',
    basePrice: 549,
    image: null,
    tags: ['chef-special', 'premium'],
    rating: 4.8,
    totalRatings: 430,
  },
  {
    _id: '8',
    name: 'Meat Lovers',
    description: 'Pepperoni, beef, chicken, sausage, bacon on our original tomato sauce — a carnivore\'s dream!',
    category: 'non-veg',
    basePrice: 529,
    image: null,
    tags: ['popular'],
    rating: 4.7,
    totalRatings: 1560,
  },
]

export const MOCK_TOPPINGS = [
  { _id: 't1', name: 'Extra Cheese', price: 49, icon: '🧀' },
  { _id: 't2', name: 'Mushrooms', price: 39, icon: '🍄' },
  { _id: 't3', name: 'Jalapeños', price: 29, icon: '🌶️' },
  { _id: 't4', name: 'Sweet Corn', price: 29, icon: '🌽' },
  { _id: 't5', name: 'Black Olives', price: 39, icon: '🫒' },
  { _id: 't6', name: 'Chicken Strips', price: 79, icon: '🍗' },
  { _id: 't7', name: 'Bacon Bits', price: 89, icon: '🥓' },
  { _id: 't8', name: 'Bell Peppers', price: 29, icon: '🫑' },
  { _id: 't9', name: 'Onions', price: 19, icon: '🧅' },
  { _id: 't10', name: 'Pineapple', price: 39, icon: '🍍' },
]

export const SIZE_OPTIONS = [
  { value: 'small', label: 'Small', size: '8"', multiplier: 0.75 },
  { value: 'medium', label: 'Medium', size: '10"', multiplier: 1.0 },
  { value: 'large', label: 'Large', size: '12"', multiplier: 1.35 },
]

export const CRUST_OPTIONS = [
  { value: 'thin', label: 'Thin Crust', description: 'Light & crispy' },
  { value: 'classic', label: 'Classic', description: 'Perfectly balanced' },
  { value: 'thick', label: 'Thick Crust', description: 'Doughy & filling' },
  { value: 'stuffed', label: 'Cheese Stuffed', description: '+₹69', extraPrice: 69 },
]

export const PIZZA_EMOJIS = ['🍕', '🍕', '🍅', '🧀', '🍖', '🫑', '🍕']
