import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const BASE_URI = process.env.MONGO_URI;
if (!BASE_URI) { console.error('Set MONGO_URI in .env'); process.exit(1); }

// Build per-database URIs by inserting the db name before the ?
const makeURI = (dbName) => BASE_URI.includes('?')
  ? BASE_URI.replace('?', `${dbName}?`)
  : `${BASE_URI}${dbName}`;

console.log('Auth URI:', makeURI('auth-service'));
console.log('Community URI:', makeURI('community-service'));
console.log('Business URI:', makeURI('business-events-service'));

const userSchema = new mongoose.Schema({ username: String, email: String, password: String, role: String, neighborhood: String, interests: [String] }, { timestamps: true });
const postSchema = new mongoose.Schema({ title: String, content: String, category: String, authorId: String, authorName: String, neighborhood: String, likes: Number, comments: [{ authorId: String, authorName: String, content: String, createdAt: Date }] }, { timestamps: true });
const helpSchema = new mongoose.Schema({ title: String, description: String, category: String, authorId: String, authorName: String, neighborhood: String, status: String, volunteers: [{ userId: String, userName: String, offeredAt: Date }] }, { timestamps: true });
const alertSchema = new mongoose.Schema({ title: String, description: String, type: String, authorId: String, authorName: String, neighborhood: String, resolved: Boolean }, { timestamps: true });
const businessSchema = new mongoose.Schema({ name: String, description: String, category: String, ownerId: String, ownerName: String, neighborhood: String, address: String, phone: String, website: String }, { timestamps: true });
const dealSchema = new mongoose.Schema({ title: String, description: String, discount: String, businessId: String, businessName: String, ownerId: String, expiresAt: Date, active: Boolean }, { timestamps: true });
const reviewSchema = new mongoose.Schema({ businessId: String, authorId: String, authorName: String, rating: Number, content: String, ownerReply: String }, { timestamps: true });
const eventSchema = new mongoose.Schema({ title: String, description: String, category: String, organizerId: String, organizerName: String, neighborhood: String, location: String, date: Date, maxAttendees: Number, attendees: [{ userId: String, userName: String, joinedAt: Date }], volunteers: [{ userId: String, userName: String, skills: [String], joinedAt: Date }] }, { timestamps: true });

const authConn     = mongoose.createConnection(makeURI('auth-service'));
const communityConn = mongoose.createConnection(makeURI('community-service'));
const businessConn  = mongoose.createConnection(makeURI('business-events-service'));

const User          = authConn.model('User', userSchema);
const Post          = communityConn.model('Post', postSchema);
const HelpRequest   = communityConn.model('HelpRequest', helpSchema);
const EmergencyAlert = communityConn.model('EmergencyAlert', alertSchema);
const Business      = businessConn.model('Business', businessSchema);
const Deal          = businessConn.model('Deal', dealSchema);
const Review        = businessConn.model('Review', reviewSchema);
const Event         = businessConn.model('Event', eventSchema);

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function seed() {
  console.log('Waiting for connections...');
  await wait(3000);

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    HelpRequest.deleteMany({}),
    EmergencyAlert.deleteMany({}),
    Business.deleteMany({}),
    Deal.deleteMany({}),
    Review.deleteMany({}),
    Event.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash('password123', 12);

  console.log('Seeding users...');
  const [resident1, resident2, resident3, bizOwner1, bizOwner2, organizer1] = await User.insertMany([
    { username: 'Sarah Chen', email: 'sarah@test.com', password: hashedPassword, role: 'resident', neighborhood: 'Riverdale', interests: ['pet_care', 'gardening', 'community'] },
    { username: 'Marcus Webb', email: 'marcus@test.com', password: hashedPassword, role: 'resident', neighborhood: 'Danforth', interests: ['tutoring', 'tech', 'volunteering'] },
    { username: 'Priya Nair', email: 'priya@test.com', password: hashedPassword, role: 'resident', neighborhood: 'Leslieville', interests: ['moving', 'sustainability', 'food'] },
    { username: 'Tom Hargrove', email: 'tom@test.com', password: hashedPassword, role: 'business_owner', neighborhood: 'Riverdale', interests: ['local business', 'food'] },
    { username: 'Amara Osei', email: 'amara@test.com', password: hashedPassword, role: 'business_owner', neighborhood: 'Danforth', interests: ['cycling', 'fitness', 'community'] },
    { username: 'Jordan Kim', email: 'jordan@test.com', password: hashedPassword, role: 'community_organizer', neighborhood: 'Leslieville', interests: ['events', 'volunteering', 'environment'] },
  ]);

  console.log('Seeding posts...');
  const posts = await Post.insertMany([
    { title: 'Park cleanup draws record turnout this weekend', content: 'Over 80 residents showed up Saturday morning to clean up Withrow Park. Volunteers collected more than 40 bags of litter and replanted three garden beds near the splash pad. The neighbourhood association is proposing a monthly stewardship group — sign up at the community board near the east entrance. A huge thank you to everyone who donated gloves and garbage bags.', category: 'news', authorId: resident1._id.toString(), authorName: resident1.username, neighborhood: 'Riverdale', likes: 34, comments: [{ authorId: resident1._id.toString(), authorName: resident1.username, content: 'This was such a great event, my kids loved it!', createdAt: new Date() }, { authorId: resident2._id.toString(), authorName: resident2.username, content: 'Count me in for next month.', createdAt: new Date() }] },
    { title: 'Traffic calming petition near Danforth Public School', content: 'Parents have been raising concerns about speeding on Bowden St during school drop-off hours. A petition with 200+ signatures has been submitted to the city asking for a crosswalk attendant and speed bumps. City council has acknowledged receipt and will review at the next transportation committee meeting.', category: 'discussion', authorId: resident2._id.toString(), authorName: resident2.username, neighborhood: 'Danforth', likes: 21, comments: [{ authorId: resident3._id.toString(), authorName: resident3.username, content: 'Signed! This has been an issue for years.', createdAt: new Date() }] },
    { title: 'New community fridge installed on Gerrard St', content: 'A community fridge has been set up outside the Gerrard St Community Centre. Anyone can take food and anyone can donate. It is stocked weekly by local volunteers. Hours of access are 7am to 9pm daily.', category: 'announcement', authorId: organizer1._id.toString(), authorName: organizer1.username, neighborhood: 'Leslieville', likes: 57, comments: [] },
    { title: 'Anyone know a good local plumber?', content: 'Had a pipe burst last night — looking for recommendations for a reliable plumber in the Riverdale area. Preferably someone available on short notice.', category: 'discussion', authorId: resident1._id.toString(), authorName: resident1.username, neighborhood: 'Riverdale', likes: 3, comments: [{ authorId: resident2._id.toString(), authorName: resident2.username, content: 'Try Mike at East End Plumbing — very fast.', createdAt: new Date() }] },
  ]);

  console.log('Seeding help requests...');
  await HelpRequest.insertMany([
    { title: 'Need a pet sitter for the long weekend', description: 'Looking for someone to check in on my two cats Friday evening through Monday morning. They are very low maintenance — just feeding and a quick play session.', category: 'pet_care', authorId: resident1._id.toString(), authorName: resident1.username, neighborhood: 'Riverdale', status: 'open', volunteers: [{ userId: resident2._id.toString(), userName: resident2.username, offeredAt: new Date() }] },
    { title: 'Help needed moving a couch this Saturday', description: 'I have a large sectional couch I need to move from my 2nd floor apartment to a moving truck. Looking for 2-3 people. Pizza and drinks provided!', category: 'moving', authorId: resident3._id.toString(), authorName: resident3.username, neighborhood: 'Leslieville', status: 'open', volunteers: [] },
    { title: 'Snow shoveling help for elderly neighbour', description: 'My neighbour Mrs. Kowalski is 82 and cannot shovel her driveway. She lives on Pape Ave near Danforth. Would anyone be willing to help out this winter?', category: 'other', authorId: resident2._id.toString(), authorName: resident2.username, neighborhood: 'Danforth', status: 'in_progress', volunteers: [{ userId: organizer1._id.toString(), userName: organizer1.username, offeredAt: new Date() }] },
    { title: 'Math tutoring for Grade 10 student', description: 'My daughter is struggling with Grade 10 math, especially quadratics. Looking for a patient tutor, ideally once or twice a week after school.', category: 'tutoring', authorId: resident1._id.toString(), authorName: resident1.username, neighborhood: 'Riverdale', status: 'open', volunteers: [] },
  ]);

  console.log('Seeding emergency alerts...');
  await EmergencyAlert.insertMany([
    { title: 'Missing golden retriever — Withrow Park area', description: 'Buddy, a 3-year-old golden retriever, went missing near Withrow Park around 3pm. Red collar with tags. Call 416-555-0192 if spotted.', type: 'missing_pet', authorId: resident1._id.toString(), authorName: resident1.username, neighborhood: 'Riverdale', resolved: false },
    { title: 'Water main break on Broadview Ave', description: 'City crews responding to a water main break at Broadview and Danforth. Expect road closures and reduced water pressure for the next 4-6 hours.', type: 'infrastructure', authorId: organizer1._id.toString(), authorName: organizer1.username, neighborhood: 'Danforth', resolved: false },
    { title: 'Suspicious vehicle reported near school', description: 'A dark SUV has been idling outside Leslieville Public School for over an hour. No plates visible. Call non-emergency police at 416-808-2222 if you see anything.', type: 'safety', authorId: resident3._id.toString(), authorName: resident3.username, neighborhood: 'Leslieville', resolved: false },
  ]);

  console.log('Seeding businesses...');
  const [biz1, biz2, biz3] = await Business.insertMany([
    { name: 'Harvest Table Cafe', description: 'A cozy neighbourhood cafe serving locally sourced breakfast and lunch. Known for friendly staff, excellent pour-over coffee, and weekend brunch specials. Family and dog-friendly patio open seasonally.', category: 'restaurant', ownerId: bizOwner1._id.toString(), ownerName: bizOwner1.username, neighborhood: 'Riverdale', address: '412 Danforth Ave', phone: '416-555-0134', website: 'harvesttablecafe.ca' },
    { name: 'Northside Bikes', description: 'Your local cycling shop for sales, repairs, and tune-ups. We stock commuter bikes, kids bikes, and accessories. Staff are passionate cyclists always happy to give route advice.', category: 'retail', ownerId: bizOwner2._id.toString(), ownerName: bizOwner2.username, neighborhood: 'Danforth', address: '88 Pape Ave', phone: '416-555-0278', website: 'northsidebikes.ca' },
    { name: 'The Bookshelf', description: 'Independent bookstore specializing in Canadian fiction, local history, and childrens books. Monthly author readings and kids story hour every Saturday morning. Supporting local authors since 2003.', category: 'retail', ownerId: bizOwner1._id.toString(), ownerName: bizOwner1.username, neighborhood: 'Leslieville', address: '221 Queen St E', phone: '416-555-0321', website: 'thebookshelfto.ca' },
  ]);

  console.log('Seeding deals...');
  await Deal.insertMany([
    { title: '20% off community breakfast every Saturday', description: 'Show your neighbourhood app profile at the counter and get 20% off every Saturday morning. Valid for dine-in only.', discount: '20% off', businessId: biz1._id.toString(), businessName: biz1.name, ownerId: bizOwner1._id.toString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), active: true },
    { title: 'Free safety check with spring tune-up', description: 'Book your spring bike tune-up and receive a complimentary full safety inspection. Limited spots available.', discount: 'Free safety check', businessId: biz2._id.toString(), businessName: biz2.name, ownerId: bizOwner2._id.toString(), expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), active: true },
    { title: 'Buy 2 books get 1 free — local authors', description: 'Buy any two books from our local authors section and choose a third one free. In-store only.', discount: 'Buy 2 get 1 free', businessId: biz3._id.toString(), businessName: biz3.name, ownerId: bizOwner1._id.toString(), expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), active: true },
  ]);

  console.log('Seeding reviews...');
  await Review.insertMany([
    { businessId: biz1._id.toString(), authorId: resident1._id.toString(), authorName: resident1.username, rating: 5, content: 'Absolutely love this place. The staff are so warm and welcoming, and the coffee is the best in the neighbourhood. The avocado toast is incredible. Will be back every weekend!', ownerReply: 'Thank you Sarah, we love having you! See you Saturday!' },
    { businessId: biz1._id.toString(), authorId: resident2._id.toString(), authorName: resident2.username, rating: 4, content: 'Great atmosphere and delicious food. Gets a bit busy on weekend mornings so expect a short wait, but absolutely worth it. Staff always remember your name.', ownerReply: '' },
    { businessId: biz2._id.toString(), authorId: resident3._id.toString(), authorName: resident3.username, rating: 5, content: 'Brought my bike in for a tune-up and they did an amazing job. Super knowledgeable, honest pricing, and had it ready same day.', ownerReply: 'Thanks Priya! Glad we could get you back on the road quickly.' },
    { businessId: biz2._id.toString(), authorId: resident1._id.toString(), authorName: resident1.username, rating: 3, content: 'Good shop and friendly people but wait times can be long during busy season. The work itself was solid though.', ownerReply: '' },
    { businessId: biz3._id.toString(), authorId: resident2._id.toString(), authorName: resident2.username, rating: 5, content: 'A gem of a bookstore. Staff actually read the books they recommend. Found three books I never would have discovered otherwise.', ownerReply: '' },
  ]);

  console.log('Seeding events...');
  await Event.insertMany([
    { title: 'Neighbourhood Tech Workshop', description: 'Learn basics of online safety, setting up email, and using smartphones confidently. Free workshop designed for seniors and newcomers. Laptops provided. Refreshments included.', category: 'workshop', organizerId: organizer1._id.toString(), organizerName: organizer1.username, neighborhood: 'Riverdale', location: 'Riverdale Library, 370 Broadview Ave', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), maxAttendees: 30, attendees: [{ userId: resident1._id.toString(), userName: resident1.username, joinedAt: new Date() }, { userId: resident2._id.toString(), userName: resident2.username, joinedAt: new Date() }], volunteers: [{ userId: resident2._id.toString(), userName: resident2.username, skills: ['tech', 'tutoring'], joinedAt: new Date() }] },
    { title: 'Community Garden Kickoff', description: 'Official opening of the Leslieville Community Garden. Learn how to claim a plot, composting tips, and meet your fellow gardeners. Kids welcome — junior planting station set up.', category: 'social', organizerId: organizer1._id.toString(), organizerName: organizer1.username, neighborhood: 'Leslieville', location: 'Greenwood Park, off Greenwood Ave', date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), maxAttendees: 60, attendees: [{ userId: resident1._id.toString(), userName: resident1.username, joinedAt: new Date() }, { userId: resident3._id.toString(), userName: resident3.username, joinedAt: new Date() }], volunteers: [] },
    { title: 'Danforth Avenue Cleanup Drive', description: 'Help keep Danforth looking its best! Walk from Pape to Woodbine picking up litter and reporting broken infrastructure. Gloves and bags provided. Meet at Pape and Danforth.', category: 'cleanup', organizerId: organizer1._id.toString(), organizerName: organizer1.username, neighborhood: 'Danforth', location: 'Pape Ave & Danforth Ave', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), maxAttendees: null, attendees: [{ userId: resident2._id.toString(), userName: resident2.username, joinedAt: new Date() }], volunteers: [{ userId: organizer1._id.toString(), userName: organizer1.username, skills: ['event coordination'], joinedAt: new Date() }] },
    { title: 'Local Business Networking Meetup', description: 'Connect with local business owners and community leaders over drinks and light food. Share challenges, opportunities, and ideas for strengthening our neighbourhood economy.', category: 'meetup', organizerId: organizer1._id.toString(), organizerName: organizer1.username, neighborhood: 'Riverdale', location: 'Harvest Table Cafe, 412 Danforth Ave', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), maxAttendees: 25, attendees: [{ userId: bizOwner1._id.toString(), userName: bizOwner1.username, joinedAt: new Date() }, { userId: bizOwner2._id.toString(), userName: bizOwner2.username, joinedAt: new Date() }], volunteers: [] },
  ]);

  console.log('\n✅ All data seeded successfully!\n');
  console.log('Test accounts (all use password: password123)');
  console.log('─────────────────────────────────────────────');
  console.log('Resident:           sarah@test.com');
  console.log('Resident:           marcus@test.com');
  console.log('Business Owner:     tom@test.com');
  console.log('Business Owner:     amara@test.com');
  console.log('Community Org.:     jordan@test.com');
  console.log('─────────────────────────────────────────────\n');

  await authConn.close();
  await communityConn.close();
  await businessConn.close();
  process.exit(0);
}

seed().catch((err) => { console.error('Seed failed:', err.message); process.exit(1); });